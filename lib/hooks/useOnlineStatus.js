"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";
import { useRole } from "@/app/dashboard/RoleContext";

export default function useOnlineStatus() {
  const supabase = createClientBrowser();
  const role = useRole(); // ⭐ NEW — wait for role
  const [session, setSession] = useState(null);
  const [playerId, setPlayerId] = useState(null);

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

  // 2️⃣ Presence updater — only runs when session + role are ready
  useEffect(() => {
    if (!session?.user) {
      console.log("🔒 No session — skipping presence update");
      return;
    }

    if (!role) {
      console.log("⏳ Role not ready — waiting before presence update");
      return;
    }

    if (role !== "player") {
      console.log("🚫 Not a player — presence tracking disabled");
      return;
    }

    async function updatePresence() {
      console.log("🔥 updatePresence called. Session:", session);

      const user = session.user;

      // Fetch player row
      const { data: player, error: playerError } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      console.log("🔥 Player lookup:", { player, playerError });

      if (!player) {
        console.log("⚠️ No player row found for this user");
        return;
      }

      setPlayerId(player.id);

      // Upsert online status
      const { data, error } = await supabase
        .from("online_status")
        .upsert(
          {
            player_id: player.id,
            status: "online",
            last_seen: new Date().toISOString(),
          },
          { onConflict: "player_id" }
        );

      console.log("🔥 Upsert result:", { data, error });
    }

    updatePresence();
  }, [session, role]); // ⭐ re-run when role becomes available

  // 3️⃣ Cleanup — only runs when playerId exists
  useEffect(() => {
    if (!playerId) {
      console.log("⚠️ Cleanup effect: No playerId yet");
      return;
    }

    const handleOffline = async () => {
      console.log("🔥 Marking offline for player:", playerId);

      const { data, error } = await supabase
        .from("online_status")
        .update({
          status: "offline",
          last_seen: new Date().toISOString(),
        })
        .eq("player_id", playerId);

      console.log("🔥 Offline update result:", { data, error });
    };

    window.addEventListener("beforeunload", handleOffline);

    return () => {
      console.log("🔥 Cleanup: marking offline before unmount");
      handleOffline();
      window.removeEventListener("beforeunload", handleOffline);
    };
  }, [playerId]);
}
