"use client";

import { createClientBrowser } from "@/lib/supabase/client";

export default function IncomingChallengeModal({ invite, onClose }) {
  // Use the shared authenticated client
  const supabase = createClientBrowser();

  async function accept() {
    // ⭐ DEBUG: Check if the client has a session
    const sessionResult = await supabase.auth.getSession();
    console.log("SESSION CHECK (ACCEPT):", sessionResult);

    const { error } = await supabase
      .from("game_invites")
      .update({ status: "accepted" })
      .eq("id", invite.id);

    if (error) {
      console.error("❌ Accept failed:", error);
      return;
    }

    onClose();
  }

  async function decline() {
    // ⭐ DEBUG: Check if the client has a session
    const sessionResult = await supabase.auth.getSession();
    console.log("SESSION CHECK (DECLINE):", sessionResult);

    const { error } = await supabase
      .from("game_invites")
      .update({ status: "declined" })
      .eq("id", invite.id);

    if (error) {
      console.error("❌ Decline failed:", error);
      return;
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-180 border border-white/10 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">
          New Challenge!
        </h2>

        <p className="text-white mb-4">
          You’ve been challenged to play <strong>{invite.game_type}</strong>{" "}
          (Best of {invite.legs})
        </p>

        <button
          onClick={accept}
          className="w-full bg-brand text-black font-semibold py-2 rounded hover:bg-brand-dark transition"
        >
          Accept
        </button>

        <button
          onClick={decline}
          className="w-full mt-3 bg-white/10 text-white font-semibold py-2 rounded hover:bg-white/20 transition"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
