"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";   // Shared client

export default function AttendancePage() {
  const { id } = useParams();

  const [session, setSession] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    // Load session info
    const { data: sessionData } = await supabase
      .from("training_sessions")
      .select("*")
      .eq("id", id)
      .single();

    setSession(sessionData);

    // Load attendance
    const { data: attendanceData } = await supabase
      .from("session_invited_players")
      .select("*, players(full_name)")
      .eq("session_id", id);

    setAttendance(attendanceData || []);
    setLoading(false);
  }

  // ⭐ Match formatting used in Sessions + Session Details pages
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
    return <div className="p-8 text-white/70">Loading attendance…</div>;
  }

  const accepted = attendance.filter((a) => a.status === "accepted");
  const declined = attendance.filter((a) => a.status === "declined");
  const pending = attendance.filter((a) => a.status === "pending");

  return (
    <div className="min-h-screen w-full bg-180 text-white p-10">
      <h1 className="text-4xl font-bold mb-6 drop-shadow-[var(--brand-glow)]">
        Attendance
      </h1>

      {session && (
        <p className="text-white/70 mb-10">
          {formatDate(session.date)} •{" "}
          {formatTime(session.start_time)}–{formatTime(session.end_time)} •{" "}
          {session.location}
        </p>
      )}

      <AttendanceSection title="Accepted" color="text-green-400" list={accepted} />
      <AttendanceSection title="Declined" color="text-red-400" list={declined} showReason />
      <AttendanceSection title="Pending" color="text-yellow-400" list={pending} />
    </div>
  );
}

function AttendanceSection({ title, color, list, showReason = false }) {
  return (
    <div className="mb-10">
      <h2 className={`text-2xl font-semibold mb-4 ${color}`}>{title}</h2>

      {list.length === 0 ? (
        <p className="text-white/50">None</p>
      ) : (
        <div className="space-y-3">
          {list.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-black/30 border border-white/10 rounded-lg backdrop-blur-sm"
            >
              <p className="font-medium">{item.players.full_name}</p>

              {showReason && item.reason && (
                <p className="text-white/60 text-sm mt-1">
                  Reason: {item.reason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
