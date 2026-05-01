"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabaseClient";

export default function ManagePlayersPage() {
  const [players, setPlayers] = useState([]);

  // Tier popover
  const [openTierEditor, setOpenTierEditor] = useState(null);
  const [tierPopoverPosition, setTierPopoverPosition] = useState({ top: 0, left: 0 });

  // Status popover
  const [openStatusEditor, setOpenStatusEditor] = useState(null);
  const [statusPopoverPosition, setStatusPopoverPosition] = useState({ top: 0, left: 0 });

  const popoverRef = useRef(null);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // Fetch players
  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase.from("players").select("*");
      if (error) {
        console.error("Error fetching players:", error);
        return;
      }
      setPlayers(data);
    };
    fetchPlayers();
  }, []);

  // Age group: U10, U14, U18, Adult
  const getAgeGroup = (dob) => {
    if (!dob) return "Unknown";
    const birth = new Date(dob);
    const age = Math.floor(
      (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );

    if (age <= 9) return "U10";
    if (age <= 13) return "U14";
    if (age <= 17) return "U18";
    return "Adult";
  };

  // Close popovers on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpenTierEditor(null);
        setOpenStatusEditor(null);
      }
    };

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  // Update tier
  const updateTier = async (userId, newTier) => {
  try {
    const res = await fetch("/api/admin/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        tier: newTier,
        type: "player",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Error updating tier:", data.error);
      return;
    }

    setPlayers((prev) =>
      prev.map((p) => (p.user_id === userId ? { ...p, tier: newTier } : p))
    );

    setOpenTierEditor(null);
  } catch (err) {
    console.error("Unexpected error:", err);
  }
};


  // ⭐ UPDATED: Update status via secure admin API
  const updateStatus = async (userId, status) => {
    try {
      const res = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          status,
          type: "player",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error updating status:", data.error);
        return;
      }

      // Update UI instantly
      setPlayers((prev) =>
        prev.map((p) => (p.user_id === userId ? { ...p, status } : p))
      );

      setOpenStatusEditor(null);
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  // Open tier popover
  const openTierPopover = (playerId, e) => {
  const player = players.find((p) => p.id === playerId);

  const rect = e.currentTarget.getBoundingClientRect();
  setTierPopoverPosition({
    top: rect.bottom + 8,
    left: rect.left,
  });

  setOpenTierEditor(player.user_id); // store user_id
  setOpenStatusEditor(null);
};


  // ⭐ UPDATED: Open status popover using user_id
  const openStatusPopover = (playerId, e) => {
    const player = players.find((p) => p.id === playerId);

    const rect = e.currentTarget.getBoundingClientRect();
    setStatusPopoverPosition({
      top: rect.bottom + 8,
      left: rect.left,
    });

    setOpenStatusEditor(player.user_id); // store user_id instead of id
    setOpenTierEditor(null);
  };

  // Open profile modal
  const openProfile = (player) => {
    setSelectedPlayer(player);
    setShowProfile(true);
  };

  const closeProfile = () => {
    setShowProfile(false);
    setSelectedPlayer(null);
  };

  const tierColorClasses = (tier) => {
    if (tier === "Gold") return "text-yellow-300";
    if (tier === "Silver") return "text-slate-200";
    if (tier === "Bronze") return "text-amber-500";
    return "text-white/70";
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Manage Players</h1>

      <div className="overflow-x-auto bg-black/30 border border-white/10 rounded-xl backdrop-blur-md shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 text-white/60">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Tier</th>
              <th className="p-4">Age Group</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Status</th>
              <th className="p-4">View</th>
            </tr>
          </thead>

          <tbody>
            {players.map((player) => (
              <tr
                key={player.id}
                className="border-b border-white/5 hover:bg-white/5 transition"
              >
                <td className="p-4">{player.full_name}</td>
                <td className="p-4">{player.email}</td>

                {/* Tier cell */}
                <td
                  className={`p-4 cursor-pointer underline underline-offset-4 decoration-white/40 ${tierColorClasses(
                    player.tier
                  )}`}
                  onClick={(e) => openTierPopover(player.id, e)}
                >
                  {player.tier || "Set tier"}
                </td>

                <td className="p-4">{getAgeGroup(player.date_of_birth)}</td>

                <td className="p-4">
                  {player.created_at ? player.created_at.slice(0, 10) : ""}
                </td>

                {/* Status cell */}
                <td
                  className="p-4 cursor-pointer underline underline-offset-4 decoration-white/40"
                  onClick={(e) => openStatusPopover(player.id, e)}
                >
                  <span
                    className={`capitalize ${
                      player.status === "approved"
                        ? "text-green-400"
                        : player.status === "pending"
                        ? "text-yellow-300"
                        : player.status === "rejected"
                        ? "text-red-400"
                        : "text-white/70"
                    }`}
                  >
                    {player.status || "pending"}
                  </span>
                </td>

                {/* View button */}
                <td className="p-4">
                  <button
                    className="px-3 py-1 text-sm bg-white/10 border border-white/20 rounded hover:bg-white/20 transition"
                    onClick={() => openProfile(player)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tier Popover */}
      {openTierEditor &&
        createPortal(
          <div
            ref={popoverRef}
            className="absolute z-[9999] bg-black/90 border border-white/20 rounded-lg shadow-xl p-3 w-40 animate-fadeIn"
            style={{
              top: tierPopoverPosition.top,
              left: tierPopoverPosition.left,
            }}
          >
            <p className="text-sm text-white/70 mb-2">Select Tier</p>

            <button
              onClick={() => updateTier(openTierEditor, "Gold")}
              className="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition"
            >
              Gold
            </button>

            <button
              onClick={() => updateTier(openTierEditor, "Silver")}
              className="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition"
            >
              Silver
            </button>

            <button
              onClick={() => updateTier(openTierEditor, "Bronze")}
              className="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition"
            >
              Bronze
            </button>
          </div>,
          document.body
        )}

      {/* Status Popover */}
      {openStatusEditor &&
        createPortal(
          <div
            ref={popoverRef}
            className="absolute z-[9999] bg-black/90 border border-white/20 rounded-lg shadow-xl p-3 w-40 animate-fadeIn"
            style={{
              top: statusPopoverPosition.top,
              left: statusPopoverPosition.left,
            }}
          >
            <p className="text-sm text-white/70 mb-2">Set Status</p>

            <button
              onClick={() => updateStatus(openStatusEditor, "approved")}
              className="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition text-green-400"
            >
              Approved
            </button>

            <button
              onClick={() => updateStatus(openStatusEditor, "pending")}
              className="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition text-yellow-300"
            >
              Pending
            </button>

            <button
              onClick={() => updateStatus(openStatusEditor, "rejected")}
              className="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition text-red-400"
            >
              Rejected
            </button>
          </div>,
          document.body
        )}

      {/* Profile Modal */}
      {showProfile &&
        selectedPlayer &&
        createPortal(
          <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70">
            <div className="bg-black/95 border border-white/15 rounded-2xl p-6 w-full max-w-3xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center text-xl font-semibold">
                    {selectedPlayer.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {selectedPlayer.full_name}
                    </h2>
                    <p className="text-sm text-white/60">
                      {selectedPlayer.email}
                    </p>
                    <p
                      className={`mt-1 text-xs font-semibold inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 ${tierColorClasses(
                        selectedPlayer.tier
                      )}`}
                    >
                      <span className="h-2 w-2 rounded-full bg-yellow-300" />
                      {selectedPlayer.tier || "No Tier Set"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeProfile}
                  className="text-white/60 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                {/* Identity */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-base font-semibold mb-3">Identity</h3>
                  <div className="space-y-1 text-white/80">
                    <p>
                      <span className="text-white/50">Nickname:</span>{" "}
                      {selectedPlayer.nickname || "Not set"}
                    </p>
                    <p>
                      <span className="text-white/50">Favourite Player:</span>{" "}
                      {selectedPlayer.favourite_player || "Not set"}
                    </p>
                    <p>
                      <span className="text-white/50">Walk-On Song:</span>{" "}
                      {selectedPlayer.walk_on_song || "Not set"}
                    </p>
                  </div>
                </div>

                {/* Playing Style */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-base font-semibold mb-3">
                    Playing Style
                  </h3>
                  <div className="space-y-1 text-white/80">
                    <p>
                      <span className="text-white/50">Strengths:</span>{" "}
                      {selectedPlayer.strengths || "Not set"}
                    </p>
                    <p>
                      <span className="text-white/50">Weaknesses:</span>{" "}
                      {selectedPlayer.weaknesses || "Not set"}
                    </p>
                    <p>
                      <span className="text-white/50">Throwing Style:</span>{" "}
                      {selectedPlayer.throwing_style || "Not set"}
                    </p>
                    <p>
                      <span className="text-white/50">Throwing Stance:</span>{" "}
                      {selectedPlayer.stance || "Not set"}
                    </p>
                    <p>
                      <span className="text-white/50">Dominant Eye:</span>{" "}
                      {selectedPlayer.dominant_eye || "Not set"}
                    </p>
                  </div>
                </div>

                {/* Darts Setup */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-base font-semibold mb-3">
                    Darts Setup
                  </h3>
                  <div className="space-y-1 text-white/80">
                    <p>
                      <span className="text-white/50">Dart Weight:</span>{" "}
                      {selectedPlayer.dart_weight || "Not set"}
                    </p>
                    <p>
                      <span className="text-white/50">Barrel Shape:</span>{" "}
                      {selectedPlayer.barrel_shape || "Not set"}
                    </p>
                    <p>
                      <span className="text-white/50">Grip Style:</span>{" "}
                      {selectedPlayer.grip_style || "Not set"}
                    </p>
                    <p>
                      <span className="text-white/50">Flight Shape:</span>{" "}
                      {selectedPlayer.flight_shape || "Not set"}
                    </p>
                  </div>
                </div>

                {/* Goals */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-base font-semibold mb-3">Goals</h3>
                  <div className="space-y-1 text-white/80">
                    <p>
                      <span className="text-white/50">Short-Term Goals:</span>{" "}
                      {selectedPlayer.short_term_goals || "Not set"}
                    </p>
                    <p>
                      <span className="text-white/50">Long-Term Goals:</span>{" "}
                      {selectedPlayer.long_term_goals || "Not set"}
                    </p>
                    <p>
                      <span className="text-white/50">Practice Frequency:</span>{" "}
                      {selectedPlayer.practice_frequency || "Not set"}
                    </p>
                    <p>
                      <span className="text-white/50">
                        Competition Mindset:
                      </span>{" "}
                      {selectedPlayer.competition_mindset || "Not set"}
                    </p>
                    <p>
                      <span className="text-white/50">Confidence Level:</span>{" "}
                      {selectedPlayer.confidence_level || "Not set"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeProfile}
                  className="px-4 py-2 text-sm bg-white/10 border border-white/20 rounded hover:bg-white/20 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
