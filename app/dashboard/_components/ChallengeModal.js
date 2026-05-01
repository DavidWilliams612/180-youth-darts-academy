"use client";

import { useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

export default function ChallengeModal({ player, onClose, onSent }) {
  const supabase = createClientBrowser();
  const [loading, setLoading] = useState(false);

  async function sendChallenge() {
    setLoading(true);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get current user's player record
    const { data: me } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!me) return;

    // Insert challenge
    await supabase.from("game_invites").insert({
      from_player_id: me.id,
      to_player_id: player.player_id,
      game_type: "501",
      legs: 3,
      status: "pending",
    });

    // Notify parent page
    onSent(player.player_id);

    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
      <div className="bg-black/80 border border-white/10 p-6 rounded-xl max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">
          Challenge {player.full_name}?
        </h2>

        <button
          onClick={sendChallenge}
          disabled={loading}
          className="w-full bg-brand text-black font-semibold py-2 rounded mb-3 hover:bg-brand-dark transition"
        >
          {loading ? "Sending..." : "Send Challenge"}
        </button>

        <button
          onClick={onClose}
          className="w-full bg-white/10 text-white py-2 rounded hover:bg-white/20 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
