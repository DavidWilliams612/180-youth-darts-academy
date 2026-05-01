"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createClientBrowser } from "@/lib/supabase/client";
import Avatar from "./Avatar";

export default function OnlinePlayersWidget() {
  const supabase = createClientBrowser();
  const [players, setPlayers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const isRefreshing = useRef(false);

  useEffect(() => {
    async function loadOnline() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setPlayers([]);
        setInitialLoading(false);
        return;
      }

      // Get my player_id
      const { data: me } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const myPlayerId = me?.id;

      // ⭐ NEW: Query the view instead of online_status
      const { data, error } = await supabase
        .from("online_status_view")
        .select("player_id, status, last_seen, full_name")
        .neq("status", "offline");

      if (error) {
        console.error("Error loading online players:", error);
        setPlayers([]);
        setInitialLoading(false);
        return;
      }

      // ⭐ NEW: Map from the view (no nested players object)
      const mapped = data
        .map((row) => ({
          player_id: row.player_id,
          status: row.status,
          full_name: row.full_name ?? "Player",
          photo: null, // no avatar column exists in your schema
        }))
        .filter((p) => p.player_id !== myPlayerId);

      setPlayers(mapped);
      setInitialLoading(false);
      isRefreshing.current = true;
    }

    loadOnline();
    const interval = setInterval(loadOnline, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black/40 border border-white/10 rounded-xl p-5">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-white">Who’s Online</h2>

        <Link
          href="/dashboard/play-online"
          className="text-brand-light text-sm hover:underline"
        >
          View all →
        </Link>
      </div>

      {initialLoading ? (
        <p className="text-white/60 text-sm">Checking online players…</p>
      ) : players.length === 0 ? (
        <p className="text-white/60 text-sm">No players online right now.</p>
      ) : (
        <ul className="space-y-2">
          {players.map((p) => (
            <li
              key={p.player_id}
              className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-md"
            >
              <div className="flex items-center gap-3">
                <Avatar name={p.full_name} photo={p.photo} size={32} />
                <span className="text-white">{p.full_name}</span>
              </div>

              <span className="text-brand-light text-xs">Online</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
