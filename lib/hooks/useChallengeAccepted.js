"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";
import { useRole } from "@/app/dashboard/RoleContext";

export function useChallengeAccepted() {
  const supabase = createClientBrowser();
  const role = useRole();
  const [session, setSession] = useState(null);

  // ⭐ 0️⃣ HARD GUARD — do NOT run this hook unless role is loaded AND is player
  if (!role) return;          // wait for role to load
  if (role !== "player") return; // parents, coaches, admins skip entirely

  // 1️⃣ Track session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // 2️⃣ Subscribe ONLY when session + role are ready
  useEffect(() => {
    if (!session?.user) {
      console.log("🔒 No session — skipping challenge listener");
      return;
    }

    let channel;

    async function setup() {
      console.log("⏱ Starting challenge listener (role:", role, ")");

      const user = session.user;

      // Fetch player record
      const { data: player } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!player) {
        console.log("❌ No player record found in useChallengeAccepted");
        return;
      }

      console.log("👤 Current player ID:", player.id);

      channel = supabase
        .channel(`challenge-accepted-${player.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "game_invites",
          },
          async (payload) => {
            const invite = payload.new;

            if (
              invite.to_player_id !== player.id &&
              invite.from_player_id !== player.id
            ) {
              return;
            }

            if (invite.status !== "accepted") return;

            // Receiver creates the session
            if (invite.to_player_id === player.id) {
              const { data: session, error } = await supabase
                .from("game_sessions")
                .insert({
                  invite_id: invite.id,
                  player1_id: invite.from_player_id,
                  player2_id: invite.to_player_id,
                  game_type: invite.game_type,
                  legs: invite.legs,
                  status: "active",
                  current_player_id: invite.from_player_id,
                })
                .select()
                .single();

              if (error) return;

              window.location.href = `/dashboard/game/${session.id}`;
              return;
            }

            // Sender waits for the session
            if (invite.from_player_id === player.id) {
              for (let attempt = 1; attempt <= 10; attempt++) {
                const { data: session } = await supabase
                  .from("game_sessions")
                  .select("id")
                  .eq("invite_id", invite.id)
                  .maybeSingle();

                if (session) {
                  window.location.href = `/dashboard/game/${session.id}`;
                  return;
                }

                await new Promise((resolve) => setTimeout(resolve, 500));
              }
            }
          }
        )
        .subscribe();

      console.log("📡 Subscribed to challenge listener");
    }

    setup();

    return () => {
      if (channel) {
        console.log("🧹 Cleaning up challenge listener");
        supabase.removeChannel(channel);
      }
    };
  }, [session, role]);
}
