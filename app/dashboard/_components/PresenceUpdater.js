"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";
import { useRole } from "@/app/dashboard/RoleContext";

const supabase = createClientBrowser();

export default function PresenceUpdater() {
  const role = useRole();
  const [playerId, setPlayerId] = useState(null);

  // ❌ Parents, coaches, admins do NOT have presence
  if (role !== "player") return null;

  // 1️⃣ Load player ID
  useEffect(() => {
    async function loadPlayer() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: player } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (player) setPlayerId(player.id);
    }

    loadPlayer();
  }, []);

  // 2️⃣ Heartbeat every 20 seconds
  useEffect(() => {
    if (!playerId) return;

    async function heartbeat() {
      await supabase.from("online_status").upsert({
        player_id: playerId,
        status: "online",
        last_seen: new Date().toISOString(),
      });
    }

    // Run immediately
    heartbeat();

    // Then every 20 seconds
    const interval = setInterval(heartbeat, 20000);

    return () => clearInterval(interval);
  }, [playerId]);

  // 3️⃣ Clean logout
  useEffect(() => {
    const handleLogout = async () => {
      if (!playerId) return;

      await supabase
        .from("online_status")
        .update({ status: "offline" })
        .eq("player_id", playerId);
    };

    window.addEventListener("beforeunload", handleLogout);

    return () => window.removeEventListener("beforeunload", handleLogout);
  }, [playerId]);

  return null;
}
