"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SessionDetails({ params }) {
  const router = useRouter();
  const { id: sessionId } = use(params);

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [declineReason, setDeclineReason] = useState("");
  const [saving, setSaving] = useState(false);

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(timeString) {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(hours, minutes);

    return date
      .toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  }

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!player) return;

    // ⭐ FIXED: Correct relationship + correct columns
    const { data, error } = await supabase
      .from("session_invited_players")
      .select(`
        *,
        training_sessions:training_sessions!session_id(
          id,
          date,
          start_time,
          end_time,
          location,
          notes,
          invite_mode,
          group_id,
          max_attendees,
          invited:session_invited_players(status)
        )
      `)
      .eq("session_id", sessionId)
      .eq("player_id", player.id);

    if (error) console.error(error);

    const row = data?.[0];
    if (!row) return;

    // ⭐ Capacity logic
    const invited = row.training_sessions?.invited || [];
    const acceptedCount = invited.filter(i => i.status === "accepted").length;

    const max = row.training_sessions?.max_attendees ?? 50;
    const remaining = Math.max(max - acceptedCount, 0);

    setSession({
      ...row,
      acceptedCount,
      remaining,
      max_attendees: max,
    });

    setLoading(false);
  }

  async function updateStatus(newStatus) {
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!player) return;

    const { error } = await supabase
      .from("session_invited_players")
      .update({
        status: newStatus,
        reason: newStatus === "declined" ? declineReason : null,
      })
      .eq("id", session.id);

    if (error) console.error("Update error:", error);

    const { data: allSessions } = await supabase
      .from("session_invited_players")
      .select("status")
      .eq("player_id", player.id);

    const pending = allSessions.filter((s) => s.status === "pending").length;
    localStorage.setItem("pendingSessions", pending);

    router.push("/dashboard/sessions");
  }

  if (loading || !session) {
    return <div className="text-white/70">Loading session…</div>;
  }

  const ts = session.training_sessions;

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold text-brand drop-shadow-[var(--brand-glow)]">
        Session Details
      </h1>

      <div className="
        bg-black/20 
        border border-brand/40 
        rounded-xl 
        p-6 
        shadow-md shadow-black/30 
        backdrop-blur-sm 
        space-y-4
      ">

        <p className="text-lg font-semibold text-white">
          {formatDate(ts.date)}
        </p>

        <p className="text-white/70">
          {formatTime(ts.start_time)} – {formatTime(ts.end_time)}
        </p>

        <p className="text-white/70">{ts.location}</p>

        {/* ⭐ Coach Notes */}
        {ts.notes && (
          <div className="bg-black/30 border border-white/10 rounded-lg p-3">
            <p className="text-white/80 font-semibold mb-1">Coach’s Notes</p>
            <p className="text-white/70 whitespace-pre-line">{ts.notes}</p>
          </div>
        )}

        {/* ⭐ Capacity Badge */}
        <div className="mt-2">
          {session.remaining === 0 ? (
            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
              Full
            </span>
          ) : session.remaining <= 5 ? (
            <span className="bg-[#ff4b4b] text-black text-xs px-2 py-1 rounded-full shadow-[0_0_6px_rgba(255,75,75,0.6)]">
              {session.remaining} spaces left
            </span>
          ) : (
            <span className="bg-brand text-black text-xs px-2 py-1 rounded-full shadow-[var(--brand-glow)]">
              {session.remaining} spaces left
            </span>
          )}
        </div>

        <p className="text-white/80">
          <span className="font-semibold">Status:</span> {session.status}
        </p>

        <div className="flex flex-col gap-4 mt-4">

          <button
            onClick={() => updateStatus("accepted")}
            disabled={saving}
            className="bg-brand text-black font-semibold py-2 rounded-lg hover:bg-brand/80 transition"
          >
            Accept
          </button>

          <textarea
            placeholder="Reason for declining (optional)"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-lg p-3 text-white placeholder-white/40"
          />

          <button
            onClick={() => updateStatus("declined")}
            disabled={saving}
            className="bg-red-500/80 text-white font-semibold py-2 rounded-lg hover:bg-red-500 transition"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
