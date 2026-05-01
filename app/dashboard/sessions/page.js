"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function PlayerSessionsPage() {
  const [pending, setPending] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [declined, setDeclined] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPending([]);
      setAccepted([]);
      setDeclined([]);
      localStorage.setItem("pendingSessions", 0);
      window.dispatchEvent(new Event("pending-sessions-updated"));
      setLoading(false);
      return;
    }

    const { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!player) {
      setPending([]);
      setAccepted([]);
      setDeclined([]);
      localStorage.setItem("pendingSessions", 0);
      window.dispatchEvent(new Event("pending-sessions-updated"));
      setLoading(false);
      return;
    }

    // ⭐ FIXED: Explicitly select max_attendees + invited list
    const { data } = await supabase
      .from("session_invited_players")
      .select(`
        *,
        training_sessions:training_sessions!fk_session(
          id,
          date,
          start_time,
          end_time,
          location,
          notes,
          invite_mode,
          group_id,
          max_attendees,
          invited:session_invited_players!fk_session(status)
        )
      `)
      .eq("player_id", player.id);

    const sorted = (data || []).sort((a, b) => {
      const da = new Date(a.training_sessions?.date);
      const db = new Date(b.training_sessions?.date);
      return da - db;
    });

    // ⭐ FIXED: remaining is now always a real number
    const withCapacity = sorted.map((s) => {
      const invited = s.training_sessions?.invited || [];
      const acceptedCount = invited.filter(i => i.status === "accepted").length;

      const max = s.training_sessions?.max_attendees ?? 50;
      const remaining = Math.max(max - acceptedCount, 0);

      return {
        ...s,
        acceptedCount,
        remaining,
        max_attendees: max,
      };
    });

    setPending(withCapacity.filter((s) => s.status === "pending"));
    setAccepted(withCapacity.filter((s) => s.status === "accepted"));
    setDeclined(withCapacity.filter((s) => s.status === "declined"));

    // Update global badge count
    const pendingCount = withCapacity.filter((s) => s.status === "pending").length;
    localStorage.setItem("pendingSessions", pendingCount);
    window.dispatchEvent(new Event("pending-sessions-updated"));

    setLoading(false);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);

    const day = date.getDate();
    const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
    const month = date.toLocaleDateString("en-GB", { month: "long" });
    const year = date.getFullYear();

    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";

    return `${weekday} ${day}${suffix} ${month} ${year}`;
  }

  function formatTime(timeString) {
    if (!timeString) return "";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-180 text-white px-8 py-10">
        <p className="text-white/70">Loading sessions…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-180 text-white">
      <div className="px-8 py-10">

        <h1 className="text-3xl font-bold mb-6 text-brand drop-shadow-[var(--brand-glow)]">
          My Sessions
        </h1>

        <div className="h-px bg-white/10 mb-10"></div>

        <SessionSection
          title="Pending"
          items={pending}
          formatDate={formatDate}
          formatTime={formatTime}
        />

        <SessionSection
          title="Accepted"
          items={accepted}
          formatDate={formatDate}
          formatTime={formatTime}
        />

        <SessionSection
          title="Declined"
          items={declined}
          formatDate={formatDate}
          formatTime={formatTime}
        />

      </div>
    </div>
  );
}

function SessionSection({ title, items, formatDate, formatTime }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold text-brand-light mb-4">
        {title}
      </h2>

      {items.length === 0 ? (
        <p className="text-white/60">No {title.toLowerCase()} sessions.</p>
      ) : (
        <div className="space-y-4">
          {items.map((s) => (
            <Link
              key={s.id}
              href={`/dashboard/sessions/${s.session_id}`}
              className="
                block p-4
                bg-black/20
                border border-brand/40
                rounded-xl
                shadow-md shadow-black/30
                backdrop-blur-sm
                hover:bg-black/30 hover:shadow-lg hover:translate-y-[-2px]
                transition
              "
            >
              <p className="text-lg font-semibold text-white">
                {formatDate(s.training_sessions?.date)}
              </p>

              <p className="text-white/60">
                {formatTime(s.training_sessions?.start_time)} – {formatTime(s.training_sessions?.end_time)}
              </p>

              <p className="text-white/60">
                {s.training_sessions?.location}
              </p>

              {/* ⭐ Capacity Badge — now always shows a number */}
              <div className="mt-2">
                {s.remaining === 0 ? (
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                    Full
                  </span>
                ) : s.remaining <= 5 ? (
                  <span className="bg-[#ff4b4b] text-black text-xs px-2 py-1 rounded-full shadow-[0_0_6px_rgba(255,75,75,0.6)]">
                    {s.remaining} spaces left
                  </span>
                ) : (
                  <span className="bg-brand text-black text-xs px-2 py-1 rounded-full shadow-[var(--brand-glow)]">
                    {s.remaining} spaces left
                  </span>
                )}
              </div>

              <StatusBadge status={s.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    accepted: "text-green-400",
    declined: "text-red-400",
    pending: "text-yellow-400",
  };

  return (
    <p className={`mt-3 font-semibold ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </p>
  );
}
