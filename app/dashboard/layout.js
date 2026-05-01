"use client";

import React, { useEffect, useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { playerNav, parentNav, coachNav, adminNav } from "@/lib/navItems";

import PresenceUpdater from "./_components/PresenceUpdater";
import { useIncomingChallenges } from "@/lib/hooks/useIncomingChallenges";
import IncomingChallengeModal from "./_components/IncomingChallengeModal";
import ClientChallengeListener from "@/components/ClientChallengeListener";

import { RoleContext } from "./RoleContext";

export default function DashboardLayout({ children }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load role
  useEffect(() => {
    let mounted = true;

    async function loadRole() {
      try {
        let res = await fetch("/api/proxy", { cache: "no-store" });
        let data = await res.json();

        if (!mounted) return;

        if (data?.noSession === true) {
          window.location.href = "/auth/login";
          return;
        }

        if (data.status === "pending") {
          window.location.href =
            data.role === "parent"
              ? "/auth/parent/pending"
              : "/auth/pending";
          return;
        }

        if (data.status === "rejected") {
          window.location.href = "/auth/rejected";
          return;
        }

        setRole(data.role);
        setLoading(false);
      } catch (err) {
        console.error("❌ PROXY FETCH ERROR:", err);
        setLoading(false);
      }
    }

    loadRole();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-20 bg-180 text-white">
        Loading your dashboard…
      </div>
    );
  }

  const nav =
    role === "player"
      ? playerNav
      : role === "parent"
      ? parentNav
      : role === "coach"
      ? coachNav
      : role === "admin"
      ? adminNav
      : [];

  return (
    <RoleContext.Provider value={role}>
      <ClientChallengeListener />
      <PresenceUpdater />

      {/* ⭐ Hook + modal now handled inside wrapper */}
      <IncomingChallengeWrapper />

      <AppLayout navItems={nav}>{children}</AppLayout>
    </RoleContext.Provider>
  );
}

// ⭐ Wrapper so the hook runs inside the provider AND can close the modal
function IncomingChallengeWrapper() {
  // ⭐ ALWAYS call hooks — never conditionally
  const incomingInvite = useIncomingChallenges();
  const [visible, setVisible] = useState(true);

  // Reset visibility when a new invite arrives
  useEffect(() => {
    if (incomingInvite) setVisible(true);
  }, [incomingInvite]);

  // ⭐ Safe: hook order is stable, and this conditional is AFTER all hooks
  if (!incomingInvite || !visible) return null;

  return (
    <IncomingChallengeModal
      invite={incomingInvite}
      onClose={() => setVisible(false)}
    />
  );
}
