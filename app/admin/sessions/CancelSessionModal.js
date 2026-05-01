"use client";

import { supabase } from "@/lib/supabaseClient";   // ✅ Use shared client

export default function CancelSessionModal({ session, onClose, onCancelled }) {

  async function cancelSession() {
    const { error } = await supabase
      .from("training_sessions")
      .delete()
      .eq("id", session.id);

    if (!error) {
      onCancelled();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-white/10 rounded-lg p-6 w-full max-w-md shadow-xl">

        <h2 className="text-2xl font-bold mb-4 text-red-500 drop-shadow-[var(--brand-glow)]">
          Cancel Session?
        </h2>

        <p className="text-white/80 mb-6">
          Are you sure you want to cancel the session on{" "}
          <span className="text-brand-light">{session.date}</span>?  
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white/70 hover:text-white transition cursor-pointer"
          >
            Keep Session
          </button>

          <button
            onClick={cancelSession}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition cursor-pointer"
          >
            Cancel Session
          </button>
        </div>

      </div>
    </div>
  );
}
