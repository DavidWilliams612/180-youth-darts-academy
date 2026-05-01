"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function GroupsPage() {
  const supabase = createClientComponentClient();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    setLoading(true);

    const { data, error } = await supabase
      .from("training_groups")
      .select("*")
      .order("name", { ascending: true });

    if (!error) setGroups(data);
    setLoading(false);
  }

  async function createGroup() {
    if (!newGroupName.trim()) return;

    setCreating(true);

    const { error } = await supabase.from("training_groups").insert({
      name: newGroupName.trim(),
      group_type: "custom",
    });

    setCreating(false);
    setNewGroupName("");

    if (!error) loadGroups();
  }

  const tierGroups = groups.filter((g) => g.group_type === "tier");
  const ageGroups = groups.filter((g) => g.group_type === "age");
  const customGroups = groups.filter((g) => g.group_type === "custom");

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Training Groups</h1>

      {loading && <p>Loading groups…</p>}

      {!loading && (
        <div className="space-y-10">

          {/* Tier Groups */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Tier Groups</h2>
            <div className="space-y-2">
              {tierGroups.map((group) => (
                <GroupRow key={group.id} group={group} />
              ))}
            </div>
          </section>

          {/* Age Groups */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Age Groups</h2>
            <p className="text-sm text-gray-500 mb-2">
              These groups are automatically assigned based on date of birth.
            </p>
            <div className="space-y-2">
              {ageGroups.map((group) => (
                <GroupRow key={group.id} group={group} readOnly />
              ))}
            </div>
          </section>

          {/* Custom Groups */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Custom Groups</h2>

            <div className="space-y-2 mb-4">
              {customGroups.map((group) => (
                <GroupRow key={group.id} group={group} />
              ))}
            </div>

            {/* Create New Group */}
            <div className="border rounded-lg p-4 bg-white/5">
              <h3 className="font-medium mb-2">Create New Group</h3>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Group name (e.g. Elite Squad)"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded bg-black/20 border border-white/10"
                />
                <button
                  onClick={createGroup}
                  disabled={creating}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
                >
                  {creating ? "Creating…" : "Create"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function GroupRow({ group, readOnly = false }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
      <span className="font-medium">{group.name}</span>

      {readOnly ? (
        <span className="text-sm text-gray-400 italic">Automatic</span>
      ) : (
        <Link
          href={`/admin/groups/${group.id}`}
          className="text-green-500 hover:text-green-400 text-sm"
        >
          Manage Members →
        </Link>
      )}
    </div>
  );
}
