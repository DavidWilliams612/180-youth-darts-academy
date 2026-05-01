"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";
import { useRole } from "@/app/dashboard/RoleContext";

// ⭐ Create ONE client for the entire module
const supabase = createClientBrowser();

export function useIncomingChallenges() {
  const role = useRole();
  const [invite, setInvite] = useState(null);
  const [session, setSession] = useState(null);
  const [playerId, setPlayerId] = useState(null);

  // ⭐ 0️⃣ STOP EVERYTHING if the user is NOT a player
  // Parents, coaches, admins should NOT run this hook
  if (role !== "player") {
    return null;
  }

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

  // 2️⃣ Fetch player ID once session is ready
  useEffect(() => {
    if (!session?.user) return;

    async function loadPlayer() {
      const { data: player, error } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("❌ Error loading player:", error);
        return;
      }

      if (player) {
        console.log("🎯 Player ID loaded:", player.id);
        setPlayerId(player.id);
      } else {
        console.log("❌ No player record found");
      }
    }

    loadPlayer();
  }, [session]);

  // 3️⃣ Subscribe once everything is ready
  useEffect(() => {
    if (!session?.user) return;
    if (!playerId) return;

    console.log("📡 Subscribing to invites for:", playerId);

    const channel = supabase
      .channel(`incoming-invites-${playerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_invites",
          filter: `to_player_id=eq.${playerId}`,
        },
        (payload) => {
          console.log("🔥 Incoming invite payload:", payload);
          setInvite(payload.new);
        }
      )
      .subscribe((status) => {
        console.log("📡 Channel status:", status);
      });

    return () => {
      console.log("🛑 Unsubscribing from incoming invites");
      supabase.removeChannel(channel);
    };
  }, [session, playerId]);

  return invite;
}
