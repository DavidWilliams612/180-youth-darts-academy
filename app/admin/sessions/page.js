"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import CreateSessionModal from "./CreateSessionModal";
import EditSessionModal from "./EditSessionModal";
import CancelSessionModal from "./CancelSessionModal";

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setLoading(true);

    const { data, error } = await supabase
      .from("training_sessions")
      .select(`
        *,
        invited:session_invited_players!fk_session(status)
      `)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error loading sessions:", error);
      setSessions([]);
      setLoading(false);
      return;
    }

    const withCounts = (data || []).map((session) => {
      const invited = session.invited || [];
      const acceptedCount =
        invited.filter((i) => i && i.status === "accepted").length || 0;

      const max = session.max_attendees ?? 50;
      const remaining = Math.max(max - acceptedCount, 0);

      return {
        ...session,
        acceptedCount,
        remaining,
        max_attendees: max,
      };
    });

    setSessions(withCounts);
    setLoading(false);
  }

  function sortSessions() {
    if (!sessions || sessions.length === 0) {
      return { active: [], upcoming: [], past: [] };
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const active = [];
    const upcoming = [];
    const past = [];

    sessions.forEach((session) => {
      if (!session?.date || !session?.start_time || !session?.end_time) {
        past.push(session);
        return;
      }

      const sessionDate = session.date;
      const start = new Date(`${session.date}T${session.start_time}`);
      const end = new Date(`${session.date}T${session.end_time}`);

      if (sessionDate === today && now >= start && now <= end) {
        active.push(session);
      } else if (sessionDate > today) {
        upcoming.push(session);
      } else {
        past.push(session);
      }
    });

    return { active, upcoming, past };
  }

  const { active, upcoming, past } = sortSessions();

  return (
    <div className="min-h-screen w-full bg-180 text-white p-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold drop-shadow-[var(--brand-glow)]">
          Sessions
        </h1>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-brand text-black rounded-lg font-semibold hover:bg-brand-dark transition shadow-md shadow-black/40 cursor-pointer"
        >
          + Create Session
        </button>
      </div>

      {loading ? (
        <p className="text-white/70">Loading sessions…</p>
      ) : (
        <div className="space-y-12">
          <Section
            title="Active Sessions"
            sessions={active}
            onEdit={setShowEditModal}
            onCancel={setShowCancelModal}
          />

          <Section
            title="Upcoming Sessions"
            sessions={upcoming}
            onEdit={setShowEditModal}
            onCancel={setShowCancelModal}
          />

          <Section title="Past Sessions" sessions={past} />
        </div>
      )}

      {showCreateModal && (
        <CreateSessionModal
          onClose={() => setShowCreateModal(false)}
          onCreated={loadSessions}
        />
      )}

      {showEditModal && (
        <EditSessionModal
          session={showEditModal}
          onClose={() => setShowEditModal(null)}
          onUpdated={loadSessions}
        />
      )}

      {showCancelModal && (
        <CancelSessionModal
          session={showCancelModal}
          onClose={() => setShowCancelModal(null)}
          onCancelled={loadSessions}
        />
      )}
    </div>
  );
}

function Section({ title, sessions, onEdit, onCancel }) {
  if (!sessions || sessions.length === 0) return null;

  const isUpcoming = title === "Upcoming Sessions";
  const isActive = title === "Active Sessions";

  function formatDate(dateString) {
    if (!dateString) return "";
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

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-brand-light drop-shadow-[var(--brand-glow)]">
        {title}
      </h2>

      <div className="space-y-4">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="p-4 bg-black/30 border border-white/10 rounded-lg backdrop-blur-sm flex justify-between items-start"
          >
            <div>
              <p className="text-lg font-semibold">{formatDate(s.date)}</p>

              <p className="text-white/70">
                {formatTime(s.start_time)} – {formatTime(s.end_time)}
              </p>

              <p className="text-white/70">{s.location}</p>

              {s.notes && <p className="text-white/50 mt-2">{s.notes}</p>}

              <p className="text-brand-light mt-3 font-semibold flex items-center gap-2">
                👥{" "}
                {s.remaining > 0
                  ? `${s.remaining} out of ${s.max_attendees} spaces remaining`
                  : "Session Full"}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {(isUpcoming || isActive) && onEdit && (
                <button
                  className="px-3 py-1 bg-brand text-black rounded-md text-sm font-semibold hover:bg-brand-dark transition cursor-pointer"
                  onClick={() => onEdit(s)}
                >
                  Edit
                </button>
              )}

              {isUpcoming && onCancel && (
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded-md text-sm font-semibold hover:bg-red-700 transition cursor-pointer"
                  onClick={() => onCancel(s)}
                >
                  Cancel
                </button>
              )}

              <a
                href={`/admin/sessions/${s.id}/attendance`}
                className="px-3 py-1 bg-black text-white rounded-md text-sm font-semibold hover:bg-white/10 transition cursor-pointer text-center"
              >
                Attendance
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
