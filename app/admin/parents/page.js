"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabaseClient";

export default function ManageParentsPage() {
  const [parents, setParents] = useState([]);

  // Status popover
  const [openStatusEditor, setOpenStatusEditor] = useState(null); // will store user_id
  const [statusPopoverPosition, setStatusPopoverPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef(null);

  // Fetch parents
  useEffect(() => {
    const fetchParents = async () => {
      const { data, error } = await supabase.from("parents").select("*");

      if (error) {
        console.error("Error fetching parents:", error);
        return;
      }

      setParents(data);
    };

    fetchParents();
  }, []);

  // Close popover on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpenStatusEditor(null);
      }
    };

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  // ⭐ UPDATED: Update status via secure admin API
  const updateStatus = async (userId, status) => {
    try {
      const res = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          status,
          type: "parent",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error updating parent status:", data.error);
        return;
      }

      // Update UI instantly
      setParents((prev) =>
        prev.map((p) => (p.user_id === userId ? { ...p, status } : p))
      );

      setOpenStatusEditor(null);
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  // ⭐ UPDATED: Open status popover using user_id
  const openStatusPopover = (parentId, e) => {
    const parent = parents.find((p) => p.id === parentId);

    const rect = e.currentTarget.getBoundingClientRect();
    setStatusPopoverPosition({
      top: rect.bottom + 8,
      left: rect.left,
    });

    setOpenStatusEditor(parent.user_id); // store user_id instead of id
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Manage Parents</h1>

      <div className="overflow-x-auto bg-black/30 border border-white/10 rounded-xl backdrop-blur-md shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 text-white/60">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Status</th>
              <th className="p-4">View</th>
            </tr>
          </thead>

          <tbody>
            {parents.map((parent) => (
              <tr
                key={parent.id}
                className="border-b border-white/5 hover:bg-white/5 transition"
              >
                <td className="p-4">{parent.full_name}</td>
                <td className="p-4">{parent.email}</td>

                {/* Status cell */}
                <td
                  className="p-4 cursor-pointer underline underline-offset-4 decoration-white/40"
                  onClick={(e) => openStatusPopover(parent.id, e)}
                >
                  <span
                    className={`capitalize font-semibold ${
                      parent.status === "approved"
                        ? "text-green-400"
                        : parent.status === "pending"
                        ? "text-yellow-300"
                        : parent.status === "rejected"
                        ? "text-red-400"
                        : "text-white/70"
                    }`}
                  >
                    {parent.status || "pending"}
                  </span>
                </td>

                {/* View button */}
                <td className="p-4">
                  <button
                    className="px-3 py-1 text-sm bg-white/10 border border-white/20 rounded hover:bg-white/20 transition"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    </div>
  );
}
