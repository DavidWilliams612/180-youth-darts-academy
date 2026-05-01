"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientBrowser } from "@/lib/supabase/client";

export default function ChildrenPage() {
  const supabase = createClientBrowser();
  const [children, setChildren] = useState([]);

  useEffect(() => {
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
  }, []);

  return (
    <div className="p-8 text-white space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Children</h1>

        <Link
          href="/dashboard/children/add"
          className="px-4 py-2 bg-brand text-black rounded shadow-[var(--brand-glow)] hover:bg-brand-light transition"
        >
          Add Child
        </Link>
      </div>

      {children.length === 0 ? (
        <p className="text-white/60">You haven’t added any children yet.</p>
      ) : (
        <div className="grid gap-4">
          {children.map((child) => (
            <div
              key={child.id}
              className="p-4 bg-white/5 border border-white/10 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold">{child.full_name}</p>
                  <p className="text-white/60 text-sm">
                    DOB: {child.date_of_birth}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      child.status === "approved"
                        ? "text-green-400"
                        : child.status === "pending"
                        ? "text-yellow-300"
                        : "text-red-400"
                    }`}
                  >
                    Status: {child.status}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/dashboard/children/${child.id}/edit`}
                    className="px-3 py-1 bg-white/10 border border-white/20 rounded hover:bg-white/20 transition text-sm"
                  >
                    Edit
                  </Link>

                  <Link
                    href={`/dashboard/children/${child.id}/delete`}
                    className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded hover:bg-red-500/30 transition text-sm text-red-300"
                  >
                    Delete
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
