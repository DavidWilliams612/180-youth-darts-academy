"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientBrowser } from "@/lib/supabase/client";

export default function UpdatesPage() {
  const supabase = createClientBrowser();

  const [updates, setUpdates] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Load all updates
  useEffect(() => {
    async function loadUpdates() {
      const { data, error } = await supabase
        .from("news_updates")
        .select("*")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });

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
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: reads } = await supabase
        .from("news_reads")
        .select("update_id")
        .eq("user_id", user.id);

      setReadIds(new Set(reads?.map(r => r.update_id)));
      setLoading(false);
    }

    loadReads();
  }, []);

  if (loading) {
    return (
      <div className="text-brand-light animate-pulse drop-shadow-[var(--brand-glow)]">
        Loading updates…
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Page Title */}
      <h1 className="text-3xl font-bold tracking-tight text-brand drop-shadow-[var(--brand-glow)]">
        All Updates
      </h1>

      {/* Updates List */}
      <div className="space-y-6">
        {updates.map(update => {
          const unread = !readIds.has(update.id);

          return (
            <div
              key={update.id}
              className="bg-white/5 border border-brand/30 rounded-xl p-6 backdrop-blur-md shadow-[0_0_12px_rgba(0,255,127,0.15)]"
            >
              <div className="flex items-center gap-2 mb-1">
                <h2
                  className={`text-xl font-semibold ${
                    unread ? "text-brand-light" : "text-white/80"
                  }`}
                >
                  {update.title}
                </h2>

                {unread && (
                  <span className="text-[#ff4b4b] text-xs font-semibold bg-[#ff4b4b]/15 px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
              </div>

              <p className="text-white/60 text-sm mb-3">
                {new Date(update.created_at).toLocaleString()}
              </p>

              <p className="text-white/70 mb-3">
                {update.body.slice(0, 150)}...
              </p>

              <Link
                href={`/updates/${update.id}`}
                className="text-brand-light underline text-sm drop-shadow-[var(--brand-glow)]"
              >
                Read more →
              </Link>
            </div>
          );
        })}
      </div>

    </div>
  );
}
