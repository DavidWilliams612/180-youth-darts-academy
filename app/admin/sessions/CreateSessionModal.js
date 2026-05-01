"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import PlayerSelectModal from "./PlayerSelectModal";

export default function CreateSessionModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    notes: "",
    invite_mode: "all",
    group_id: null,
    max_attendees: 50,
  });

  const [groups, setGroups] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    const { data } = await supabase
      .from("training_groups")
      .select("*")
      .order("name", { ascending: true });

    setGroups(data || []);
  }

  // ⭐ Normalise time to HH:MM:SS (Postgres requires this)
  function normaliseTime(t) {
    if (!t) return null;
    return t.length === 5 ? `${t}:00` : t;
  }

  async function createSession() {
    console.log("=== CREATE SESSION STARTED ===");

    const start = normaliseTime(form.start_time);
    const end = normaliseTime(form.end_time);

    console.log("NORMALISED TIMES:", { start, end });

    // 1. Create the session
    const { data, error } = await supabase
      .from("training_sessions")
      .insert([
        {
          date: form.date,
          start_time: start,
          end_time: end,
          location: form.location,
          notes: form.notes,
          invite_mode: form.invite_mode,
          group_id: form.invite_mode === "group" ? form.group_id : null,
          max_attendees: form.max_attendees,
        },
      ])
      .select();

    console.log("SESSION INSERT RESULT:", { data, error });

    if (error) {
      console.error("❌ Session insert error:", error);
      return;
    }

    const sessionId = data?.[0]?.id;
    console.log("SESSION ID:", sessionId);

    if (!sessionId) {
      console.error("❌ No sessionId returned — stopping.");
      return;
    }

    // 2. Handle attendance creation
    // -----------------------------

    if (form.invite_mode === "all") {
      console.log("INVITE MODE: ALL PLAYERS");

      const { data: players, error: playersError } = await supabase
        .from("players")
        .select("id");

      console.log("PLAYERS FOR INVITE:", { players, playersError });

      if (players?.length) {
        const { data: inviteData, error: inviteError } = await supabase
          .from("session_invited_players")
          .insert(
            players.map((p) => ({
              session_id: sessionId,
              player_id: p.id,
              status: "pending",
            }))
          )
          .select();

        console.log("INVITE INSERT RESULT:", { inviteData, inviteError });
      }
    }

    if (form.invite_mode === "group") {
      console.log("INVITE MODE: GROUP");

      const { data: group } = await supabase
        .from("training_groups")
        .select("*")
        .eq("id", form.group_id)
        .single();

      console.log("GROUP LOADED:", group);

      if (group.group_type === "age") {
        console.log("GROUP TYPE: AGE");

        const { data: players } = await supabase
          .from("players")
          .select("id, date_of_birth");

        const today = new Date();

        const eligible = players.filter((p) => {
          if (!p.date_of_birth) return false;

          const dob = new Date(p.date_of_birth);
          const age =
            today.getFullYear() -
            dob.getFullYear() -
            (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);

          if (group.name === "U10") return age < 10;
          if (group.name === "U14") return age < 14;
          if (group.name === "U18") return age < 18;

          return false;
        });

        if (eligible.length > 0) {
          await supabase.from("session_invited_players").insert(
            eligible.map((p) => ({
              session_id: sessionId,
              player_id: p.id,
              status: "pending",
            }))
          );
        }
      }

      if (group.group_type === "tier" || group.group_type === "custom") {
        console.log("GROUP TYPE: TIER/CUSTOM");

        const { data: members } = await supabase
          .from("training_group_members")
          .select("player_id")
          .eq("group_id", form.group_id);

        if (members?.length) {
          await supabase.from("session_invited_players").insert(
            members.map((m) => ({
              session_id: sessionId,
              player_id: m.player_id,
              status: "pending",
            }))
          );
        }
      }
    }

    if (form.invite_mode === "specific") {
      console.log("INVITE MODE: SPECIFIC PLAYERS:", selectedPlayers);

      if (selectedPlayers.length > 0) {
        await supabase.from("session_invited_players").insert(
          selectedPlayers.map((playerId) => ({
            session_id: sessionId,
            player_id: playerId,
            status: "pending",
          }))
        );
      }
    }

    console.log("=== CREATE SESSION COMPLETE ===");

    onCreated();
    onClose();
  }

  const tierGroups = groups.filter((g) => g.group_type === "tier");
  const ageGroups = groups.filter((g) => g.group_type === "age");
  const customGroups = groups.filter((g) => g.group_type === "custom");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-white/10 rounded-lg p-6 w-full max-w-lg shadow-xl">

        <h2 className="text-2xl font-bold mb-6 text-brand drop-shadow-[var(--brand-glow)]">
          Create Session
        </h2>

        <div className="space-y-4">

          <label className="block text-white/70 text-sm mb-1">Date of Session</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
            className="w-full p-2 rounded bg-black/40 border border-white/20 text-white"
          />

          <label className="block text-white/70 text-sm mb-1">Session times</label>
          <div className="flex gap-4">
            <input
              type="time"
              value={form.start_time}
              onChange={(e) => updateField("start_time", e.target.value)}
              className="w-full p-2 rounded bg-black/40 border border-white/20 text-white"
            />
            <input
              type="time"
              value={form.end_time}
              onChange={(e) => updateField("end_time", e.target.value)}
              className="w-full p-2 rounded bg-black/40 border border-white/20 text-white"
            />
          </div>

          <label className="block text-white/70 text-sm mb-1">Location</label>
          <input
            type="text"
            placeholder="Location"
            value={form.location}
            onChange={(e) => updateField("location", e.target.value)}
            className="w-full p-2 rounded bg-black/40 border border-white/20 text-white"
          />

          <label className="block text-white/70 text-sm mb-1">Session notes</label>
          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            className="w-full p-2 rounded bg-black/40 border border-white/20 text-white"
          />

          <div>
            <label className="block text-white/70 text-sm mb-1">
              Maximum number of attendees
            </label>
            <input
              type="number"
              min="1"
              value={form.max_attendees}
              onChange={(e) => updateField("max_attendees", Number(e.target.value))}
              className="w-full p-2 rounded bg-black/40 border border-white/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <p className="font-medium">Who should be invited?</p>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.invite_mode === "all"}
                onChange={() => updateField("invite_mode", "all")}
              />
              Everyone
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.invite_mode === "group"}
                onChange={() => updateField("invite_mode", "group")}
              />
              A specific group
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.invite_mode === "specific"}
                onChange={() => updateField("invite_mode", "specific")}
              />
              Specific players
            </label>
          </div>

          {form.invite_mode === "group" && (
            <select
              className="w-full p-2 rounded bg-black/40 border border-white/20 text-white"
              value={form.group_id || ""}
              onChange={(e) => updateField("group_id", e.target.value)}
            >
              <option value="">Select a group…</option>

              {tierGroups.length > 0 && (
                <optgroup label="Tier Groups">
                  {tierGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </optgroup>
              )}

              {ageGroups.length > 0 && (
                <optgroup label="Age Groups">
                  {ageGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </optgroup>
              )}

              {customGroups.length > 0 && (
                <optgroup label="Custom Groups">
                  {customGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          )}

          {form.invite_mode === "specific" && (
            <div>
              <button
                onClick={() => setShowPlayerModal(true)}
                className="px-4 py-2 bg-brand text-black rounded-lg font-semibold hover:bg-brand-dark transition shadow-md shadow-black/40 cursor-pointer"
              >
                Select Players
              </button>

              {selectedPlayers.length > 0 && (
                <p className="text-sm text-white/70 mt-2">
                  {selectedPlayers.length} players selected
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white/70 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={createSession}
            className="px-4 py-2 bg-brand text-black rounded-lg font-semibold hover:bg-brand-dark transition shadow-md shadow-black/40 cursor-pointer"
          >
            Create Session
          </button>
        </div>

        {showPlayerModal && (
          <PlayerSelectModal
            onClose={() => setShowPlayerModal(false)}
            onSave={(players) => {
              setSelectedPlayers(players);
              setShowPlayerModal(false);
            }}
            selectedPlayers={selectedPlayers}
          />
        )}
      </div>
    </div>
  );
}
