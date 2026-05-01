"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createClientBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useRole } from "./RoleContext";

// Dynamically import widget (client only)
const OnlinePlayersWidget = dynamic(
  () => import("./_components/OnlinePlayersWidget"),
  { ssr: false }
);

export default function DashboardPage() {
  const supabase = createClientBrowser();
  const router = useRouter();
  const role = useRole();

  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");

  const [player, setPlayer] = useState(null);          // ⭐ NEW
  const [needsProfile, setNeedsProfile] = useState(false); // ⭐ NEW

  const [updates, setUpdates] = useState([]);
  const [readIds, setReadIds] = useState(new Set());

  const [nextSessions, setNextSessions] = useState([]);

  // Parent-only state
  const [children, setChildren] = useState([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [childName, setChildName] = useState("");
  const [childDOB, setChildDOB] = useState("");

  // Load user info + player profile
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Extract first name
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "";

      const extractedFirstName = fullName.split(" ")[0] || "Player";
      setFirstName(extractedFirstName);

      // ⭐ Load player row
      const { data: playerRow } = await supabase
        .from("players")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setPlayer(playerRow);
      setNeedsProfile(playerRow && !playerRow.profile_complete);

      setLoading(false);
    }

    load();
  }, []);

  // Load latest news updates
  useEffect(() => {
    async function loadUpdates() {
      const { data, error } = await supabase
        .from("news_updates")
        .select("*")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error) {
        setUpdates(data);
      }
    }

    loadUpdates();
  }, []);

  // Load read records
  useEffect(() => {
    async function loadReads() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: reads } = await supabase
        .from("news_reads")
        .select("update_id")
        .eq("user_id", user.id);

      setReadIds(new Set(reads?.map(r => r.update_id)));
    }

    loadReads();
  }, []);

  // Load children — ONLY for parents
  useEffect(() => {
    if (role !== "parent") return;

    async function loadChildren() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("parent_id", user.id);

      setChildren(data || []);
    }

    loadChildren();
  }, [role]);

  // Load next accepted upcoming sessions WITH CAPACITY
  useEffect(() => {
    async function loadNextSessions() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get player ID
      const { data: player } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!player) return;

      // Get invited sessions
      const { data } = await supabase
        .from("session_invited_players")
        .select(`
          *,
          training_sessions:training_sessions!fk_session(
            *,
            invited:session_invited_players!fk_session(status)
          )
        `)
        .eq("player_id", player.id);

      if (!data) return;

      const now = new Date();

      // Filter: accepted + future
      const upcoming = data
        .filter((s) => {
          const date = new Date(s.training_sessions?.date);
          return s.status === "accepted" && date >= now;
        })
        .sort((a, b) => {
          const da = new Date(a.training_sessions?.date);
          const db = new Date(b.training_sessions?.date);
          return da - db;
        })
        .slice(0, 3);

      // Add capacity calculations
      const withCapacity = upcoming.map((s) => {
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

      setNextSessions(withCapacity);
    }

    loadNextSessions();
  }, []);

  // Date formatter
  function formatDate(dateString) {
    const date = new Date(dateString);

    const day = date.getDate();
    const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
    const month = date.toLocaleDateString("en-GB", { month: "long" });
    const year = date.getFullYear();

    const suffix =
      day % 10 === 1 && day !== 11 ? "st" :
      day % 10 === 2 && day !== 12 ? "nd" :
      day % 10 === 3 && day !== 13 ? "rd" : "th";

    return `${weekday} ${day}${suffix} ${month} ${year}`;
  }

  if (loading) {
    return (
      <div className="text-brand-light animate-pulse drop-shadow-[var(--brand-glow)]">
        Loading your dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand drop-shadow-[var(--brand-glow)]">
          Welcome back, {firstName}
        </h1>
        <p className="text-white/70">
          Here’s what’s happening at the academy.
        </p>
      </div>

      {/* ⭐ Profile Completion Banner */}
      {needsProfile && (
        <div className="bg-black/40 backdrop-blur-md border border-brand/40 rounded-xl p-6 shadow-xl animate-fadeIn">
          <h2 className="text-xl font-semibold text-brand drop-shadow-[var(--brand-glow)]">
            Complete Your Player Profile
          </h2>
          <p className="text-white/70 mt-1">
            Finish setting up your profile to unlock personalised training insights.
          </p>

          <button
            onClick={() => router.push("/dashboard/profile/edit")}
            className="mt-4 px-5 py-2 bg-brand text-black font-semibold rounded-lg hover:bg-brand-light transition shadow-lg shadow-black/40"
          >
            Continue Profile Setup
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Your Next Session */}
        <div className="bg-white/5 border border-brand/30 rounded-xl p-6 backdrop-blur-md shadow-[0_0_12px_rgba(0,255,127,0.15)]">
          <h2 className="text-xl font-semibold mb-2 text-brand-light drop-shadow-[var(--brand-glow)]">
            Your Next Session
          </h2>

          {nextSessions.length === 0 ? (
            <p className="text-white/60">No accepted upcoming sessions.</p>
          ) : (
            <div className="space-y-4">
              {nextSessions.map((s) => (
                <Link
                  key={s.id}
                  href={`/dashboard/sessions/${s.session_id}`}
                  className="block p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition"
                >
                  <p className="font-semibold text-white">
                    {formatDate(s.training_sessions?.date)}
                  </p>

                  <p className="text-white/60">
                    {s.training_sessions?.start_time} – {s.training_sessions?.end_time}
                  </p>

                  <p className="text-white/60">
                    {s.training_sessions?.location}
                  </p>

                  {/* Capacity Badge */}
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
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Latest News */}
        <div className="bg-white/5 border border-brand/30 rounded-xl p-6 backdrop-blur-md shadow-[0_0_12px_rgba(0,255,127,0.15)]">
          <h2 className="text-xl font-semibold mb-2 text-brand-light drop-shadow-[var(--brand-glow)]">
            Latest News
          </h2>

          {updates.length === 0 ? (
            <p className="text-white/60">No updates yet.</p>
          ) : (
            <div className="space-y-4">
              {updates.map((u) => {
                const unread = !readIds.has(u.id);

                return (
                  <div key={u.id} className="border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-semibold ${
                          unread ? "text-brand-light" : "text-white/80"
                        }`}
                      >
                        {u.title}
                      </h3>

                      {unread && (
                        <span className="text-[#ff4b4b] text-xs font-semibold bg-[#ff4b4b]/15 px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    <p className="text-white/60 text-sm">
                      {u.body.slice(0, 100)}...
                    </p>

                    <a
                      href={`/updates/${u.id}`}
                      className="text-brand-light text-sm underline"
                    >
                      Read more
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Players Online */}
        <div className="bg-white/5 border border-brand/30 rounded-xl p-6 backdrop-blur-md shadow-[0_0_12px_rgba(0,255,127,0.15)]">
          <h2 className="text-xl font-semibold mb-2 text-brand-light drop-shadow-[var(--brand-glow)]">
            Players Online
          </h2>

          <OnlinePlayersWidget />
        </div>

        {/* Parent-only: Your Children */}
        {role === "parent" && (
          <div className="bg-white/5 border border-brand/30 rounded-xl p-6 backdrop-blur-md shadow-[0_0_12px_rgba(0,255,127,0.15)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-brand-light drop-shadow-[var(--brand-glow)]">
                Your Children
              </h2>

              <button
                onClick={() => router.push("/dashboard/children/add")}
                className="px-3 py-1 text-sm bg-brand text-black rounded shadow-[var(--brand-glow)] hover:bg-brand-light transition"
              >
                Add Child
              </button>
            </div>

            {children.length === 0 ? (
              <p className="text-white/60">No children added yet.</p>
            ) : (
              <div className="space-y-3">
                {children.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <p className="font-semibold text-white">{c.full_name}</p>
                    <p className="text-white/60 text-sm">
                      DOB: {c.date_of_birth}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        c.status === "approved"
                          ? "text-green-400"
                          : c.status === "pending"
                          ? "text-yellow-300"
                          : "text-red-400"
                      }`}
                    >
                      Status: {c.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Parent-only: Add Child Modal */}
      {role === "parent" && showAddChild && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black/90 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-brand-light">
              Add Child
            </h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();

                const res = await fetch("/api/parents/add-child", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    full_name: childName,
                    date_of_birth: childDOB,
                  }),
                });

                const data = await res.json();

                if (res.ok) {
                  setShowAddChild(false);
                  setChildName("");
                  setChildDOB("");

                  // Refresh children list
                  const {
                    data: { user },
                  } = await supabase.auth.getUser();

                  if (!user) return;

                  const { data: kids } = await supabase
                    .from("players")
                    .select("*")
                    .eq("parent_id", user.id);

                  setChildren(kids || []);
                } else {
                  console.error(data.error);
                }
              }}
            >
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Child's full name"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                  required
                />

                <input
                  type="date"
                  value={childDOB}
                  onChange={(e) => setChildDOB(e.target.value)}
                  className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddChild(false)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded hover:bg-white/20 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-brand text-black rounded shadow-[var(--brand-glow)] hover:bg-brand-light transition"
                >
                  Add Child
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
