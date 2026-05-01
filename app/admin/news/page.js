"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

export default function AdminNewsPage() {
  const supabase = createClientBrowser();
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("news_updates")
        .select("*")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (!error) setUpdates(data);
    }

    load();
  }, []);

  async function deleteUpdate(id) {
    const confirmed = confirm("Are you sure you want to delete this update?");
    if (!confirmed) return;

    await supabase.from("news_updates").delete().eq("id", id);

    // Refresh list locally
    setUpdates((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-brand drop-shadow-[var(--brand-glow)]">
          News & Updates
        </h1>

        <a
          href="/admin/news/create"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
        >
          + Create Update
        </a>
      </div>

      <div className="bg-white/5 border border-brand/30 rounded-xl p-6 backdrop-blur-md shadow-[0_0_12px_rgba(0,255,127,0.15)]">
        {updates.length === 0 ? (
          <p className="text-white/60">No updates yet.</p>
        ) : (
          <div className="space-y-4">
            {updates.map((u) => (
              <div
                key={u.id}
                className="border-b border-white/10 pb-4 flex justify-between items-start"
              >
                <div>
                  <h3 className="text-xl font-semibold text-brand-light drop-shadow-[var(--brand-glow)]">
                    {u.title}
                  </h3>

                  <p className="text-white/60 text-sm">
                    Audience: {u.audience}
                  </p>

                  <p className="text-white/40 text-xs">
                    {new Date(u.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-4 items-center">

                  {/* Edit */}
                  <a
                    href={`/admin/news/edit/${u.id}`}
                    className="text-green-400 underline text-sm cursor-pointer hover:text-green-300"
                  >
                    Edit
                  </a>

                  {/* Delete */}
                  <button
                    onClick={() => deleteUpdate(u.id)}
                    className="text-red-400 underline text-sm cursor-pointer hover:text-red-300"
                  >
                    Delete
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
