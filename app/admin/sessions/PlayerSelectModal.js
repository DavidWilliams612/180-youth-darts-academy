"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";   // ✅ Shared client

export default function PlayerSelectModal({ onClose, onSave, selectedPlayers }) {

  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set(selectedPlayers || []));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    setLoading(true);

    const { data } = await supabase
      .from("players")
      .select("id, full_name, email")
      .order("full_name", { ascending: true });

    setPlayers(data || []);
    setLoading(false);
  }

  function togglePlayer(id) {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }

  function toggleSelectAll() {
    if (selected.size === players.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(players.map((p) => p.id)));
    }
  }

  const filteredPlayers = players.filter((p) =>
    p.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-white/10 rounded-lg p-6 w-full max-w-xl shadow-xl max-h-[80vh] overflow-y-auto">

        <h2 className="text-2xl font-bold mb-4 text-brand drop-shadow-[var(--brand-glow)]">
          Select Players
        </h2>

        <input
          type="text"
          placeholder="Search players…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-black/40 border border-white/20 text-white"
        />

        <button
          onClick={toggleSelectAll}
          className="mb-4 px-3 py-1 bg-brand text-black rounded-md font-semibold hover:bg-brand-dark transition cursor-pointer"
        >
          {selected.size === players.length ? "Deselect All" : "Select All"}
        </button>

        {loading ? (
          <p className="text-white/70">Loading players…</p>
        ) : (
          <div className="space-y-2">
            {filteredPlayers.map((player) => (
              <label
                key={player.id}
                className="flex items-center justify-between p-3 bg-black/30 border border-white/10 rounded cursor-pointer"
              >
                <div>
                  <p className="font-medium">{player.full_name}</p>
                  {player.email && (
                    <p className="text-sm text-white/50">{player.email}</p>
                  )}
                </div>

                <input
                  type="checkbox"
                  checked={selected.has(player.id)}
                  onChange={() => togglePlayer(player.id)}
                />
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white/70 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={() => onSave(Array.from(selected))}
            className="px-4 py-2 bg-brand text-black rounded-lg font-semibold hover:bg-brand-dark transition shadow-md shadow-black/40 cursor-pointer"
          >
            Save Selection
          </button>
        </div>
      </div>
    </div>
  );
}
