"use client";

import { useEffect, useState, useRef } from "react";
import { createClientBrowser } from "@/lib/supabase/client";
import ChallengeModal from "../_components/ChallengeModal";
import Avatar from "../_components/Avatar";

export default function PlayOnlinePage() {
  const supabase = createClientBrowser();

  const [players, setPlayers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [pendingChallenges, setPendingChallenges] = useState({});

  const isRefreshing = useRef(false);

  useEffect(() => {
    async function loadOnline() {
      if (!isRefreshing.current) {
        setInitialLoading(true);
      }

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
        console.error("🟥 SUPABASE ERROR:", error);
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
    <div className="min-h-screen w-full bg-180 text-white p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold drop-shadow-[var(--brand-glow)]">
          Play Online
        </h1>
        <p className="text-white/70">See who’s online and ready to play.</p>
      </div>

      {initialLoading ? (
        <p className="text-white/70">Loading online players…</p>
      ) : players.length === 0 ? (
        <p className="text-white/60">No players are online right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {players.map((p) => {
            const isPending = pendingChallenges[p.player_id];

            return (
              <div
                key={p.player_id}
                className="p-4 bg-black/40 border border-white/10 rounded-lg flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={p.full_name} photo={p.photo} size={40} />

                  <div>
                    <p className="font-semibold text-white">{p.full_name}</p>
                    <p className="text-xs text-white/60 mt-1">
                      Status:{" "}
                      <span className="text-brand-light">
                        {p.status === "online" ? "Available" : p.status}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPlayer(p)}
                  disabled={p.status !== "online" || isPending}
                  className={`mt-4 px-3 py-2 rounded-md text-sm font-semibold ${
                    isPending
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : p.status === "online"
                      ? "bg-brand text-black hover:bg-brand-dark transition"
                      : "bg-white/10 text-white/40 cursor-not-allowed"
                  }`}
                >
                  {isPending ? "Challenge Sent" : "Challenge"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedPlayer && (
        <ChallengeModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onSent={(id) =>
            setPendingChallenges((prev) => ({ ...prev, [id]: true }))
          }
        />
      )}
    </div>
  );
}
