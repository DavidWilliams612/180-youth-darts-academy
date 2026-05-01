"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PlayerSelectModal from "./PlayerSelectModal";

export default function EditSessionModal({ session, onClose, onUpdated }) {
  const [form, setForm] = useState({
    date: session.date,
    start_time: session.start_time,
    end_time: session.end_time,
    location: session.location,
    notes: session.notes || "",
    invite_mode: session.invite_mode || "all",
    group_id: session.group_id || null,
    max_attendees: session.max_attendees ?? 50,
  });

  const [groups, setGroups] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    loadGroups();
    loadInvitedPlayers();
  }, []);

  async function loadGroups() {
    const { data } = await supabase
      .from("training_groups")
      .select("*")
      .order("name", { ascending: true });

    setGroups(data || []);
  }

  async function loadInvitedPlayers() {
    const { data } = await supabase
      .from("session_invited_players")
      .select("player_id")
      .eq("session_id", session.id);

    setSelectedPlayers(data?.map((p) => p.player_id) || []);
  }

  // ⭐ UPSERT + CLEANUP VERSION
  async function updateSession() {
    // 1. Update the session itself
    const { error: updateError } = await supabase
      .from("training_sessions")
      .update({
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        location: form.location,
        notes: form.notes,
        invite_mode: form.invite_mode,
        group_id: form.invite_mode === "group" ? form.group_id : null,
        max_attendees: form.max_attendees,
      })
      .eq("id", session.id);

    if (updateError) {
      console.error(updateError);
      return;
    }

    // ⭐ Build invitedPlayerIds based on invite_mode
    let invitedPlayerIds = [];

    if (form.invite_mode === "all") {
      const { data: players } = await supabase.from("players").select("id");
      invitedPlayerIds = players?.map((p) => p.id) || [];
    }

    if (form.invite_mode === "group") {
      const { data: group } = await supabase
        .from("training_groups")
        .select("*")
        .eq("id", form.group_id)
        .maybeSingle();

      if (group) {
        if (group.group_type === "age") {
          const { data: players } = await supabase
            .from("players")
            .select("id, date_of_birth");

          const today = new Date();

          invitedPlayerIds = players
            .filter((p) => {
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
            })
            .map((p) => p.id);
        }

        if (group.group_type === "tier" || group.group_type === "custom") {
          const { data: members } = await supabase
            .from("training_group_members")
            .select("player_id")
            .eq("group_id", form.group_id);

          invitedPlayerIds = members?.map((m) => m.player_id) || [];
        }
      }
    }

    if (form.invite_mode === "specific") {
      invitedPlayerIds = selectedPlayers;
    }

    // ⭐ UPSERT invited players (insert new OR update existing)
    const upsertRows = invitedPlayerIds.map((playerId) => ({
      session_id: session.id,
      player_id: playerId,
      status: "pending",
      reason: null,
    }));

    const { error: upsertError } = await supabase
      .from("session_invited_players")
      .upsert(upsertRows, {
        onConflict: "session_id,player_id",
      });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return;
    }

    // ⭐ Remove players who are no longer invited
    const { error: deleteError } = await supabase
      .from("session_invited_players")
      .delete()
      .eq("session_id", session.id)
      .not("player_id", "in", `(${invitedPlayerIds.join(",")})`);

    if (deleteError) {
      console.error("Delete uninvited error:", deleteError);
      return;
    }

    onUpdated();
    onClose();
  }

  const tierGroups = groups.filter((g) => g.group_type === "tier");
  const ageGroups = groups.filter((g) => g.group_type === "age");
  const customGroups = groups.filter((g) => g.group_type === "custom");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-white/10 rounded-lg p-6 w-full max-w-lg shadow-xl">

        <h2 className="text-2xl font-bold mb-6 text-brand drop-shadow-[var(--brand-glow)]">
          Edit Session
        </h2>

        <div className="space-y-4">
          {/* Date */}
          <label className="block text-white/70 text-sm mb-1">Date of Session</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
            className="w-full p-2 rounded bg-black/40 border border-white/20 text-white"
          />

          {/* Times */}
          <label className="block text-white/70 text-sm mb-1">Sessions times</label>
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

          {/* Location */}
          <label className="block text-white/70 text-sm mb-1">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => updateField("location", e.target.value)}
            className="w-full p-2 rounded bg-black/40 border border-white/20 text-white"
          />

          {/* Notes */}
          <label className="block text-white/70 text-sm mb-1">Session notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            className="w-full p-2 rounded bg-black/40 border border-white/20 text-white"
          />

          {/* Max attendees */}
          <label className="block text-white/70 text-sm mb-1">Maximum number of attendees</label>
          <input
            type="number"
            min="1"
            value={form.max_attendees}
            onChange={(e) => updateField("max_attendees", Number(e.target.value))}
            className="w-full p-2 rounded bg-black/40 border border-white/20 text-white"
            placeholder="Max attendees"
          />

          {/* Invite Mode */}
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

          {/* Group Dropdown */}
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

          {/* Specific Players */}
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
            onClick={updateSession}
            className="px-4 py-2 bg-brand text-black rounded-lg font-semibold hover:bg-brand-dark transition shadow-md shadow-black/40 cursor-pointer"
          >
            Save Changes
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
