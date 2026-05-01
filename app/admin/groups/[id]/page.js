"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function GroupDetailPage() {
  const supabase = createClientComponentClient();
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroup();
  }, [id]);

  async function loadGroup() {
    setLoading(true);

    // Load group info
    const { data: groupData } = await supabase
      .from("training_groups")
      .select("*")
      .eq("id", id)
      .single();

    setGroup(groupData);

    // Load all players
    const { data: players } = await supabase
      .from("players")
      .select("id, full_name, user_id, date_of_birth")
      .order("full_name", { ascending: true });

    setAllPlayers(players || []);

    // Load group members
    const { data: memberRows } = await supabase
      .from("training_group_members")
      .select("player_id")
      .eq("group_id", id);

    const memberIds = memberRows?.map((m) => m.player_id) || [];
    setMembers(memberIds);

    setLoading(false);
  }

  async function addMember(playerId) {
    await supabase.from("training_group_members").insert({
      group_id: id,
      player_id: playerId,
    });
    loadGroup();
  }

  async function removeMember(playerId) {
    await supabase
      .from("training_group_members")
      .delete()
      .eq("group_id", id)
      .eq("player_id", playerId);

    loadGroup();
  }

  if (loading || !group) {
    return <div className="p-8">Loading group…</div>;
  }

  const isAgeGroup = group.group_type === "age";

  const filteredPlayers = allPlayers.filter((p) =>
    p.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{group.name}</h1>

      <p className="text-gray-400 mb-6">
        {isAgeGroup
          ? "This is an automatic age group. Players are assigned based on date of birth."
          : "Manage which players belong to this group."}
      </p>

      {/* Members List */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Current Members</h2>

        {members.length === 0 && (
          <p className="text-gray-500">No players in this group yet.</p>
        )}

        <div className="space-y-2">
          {allPlayers
            .filter((p) => members.includes(p.id))
            .map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10"
              >
                <span>{player.full_name}</span>

                {!isAgeGroup && (
                  <button
                    onClick={() => removeMember(player.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
        </div>
      </section>

      {/* Add Members (only for tier/custom groups) */}
      {!isAgeGroup && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Add Players</h2>

          <input
            type="text"
            placeholder="Search players…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 mb-4 rounded bg-black/20 border border-white/10"
          />

          <div className="space-y-2">
            {filteredPlayers
              .filter((p) => !members.includes(p.id))
              .map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10"
                >
                  <span>{player.full_name}</span>

                  <button
                    onClick={() => addMember(player.id)}
                    className="text-green-500 hover:text-green-400 text-sm"
                  >
                    Add →
                  </button>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
