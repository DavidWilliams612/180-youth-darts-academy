"use client";

import AppLayout from "@/components/layouts/AppLayout";
import { adminNav } from "@/lib/navItems";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Layout({ children }) {
  const router = useRouter();

  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const res = await fetch("/api/proxy", { cache: "no-store" });
      const data = await res.json();

      console.log("🔥 ADMIN PROXY RESULT:", data);

      // Not logged in at all
      if (!data.role) {
        router.replace("/auth/login");
        return;
      }

      // Logged in but not admin
      if (data.role !== "admin") {
        router.replace("/auth/login");
        return;
      }

      // Admin but pending/rejected (if that ever applies)
      if (data.status === "pending") {
        router.replace("/auth/pending");
        return;
      }

      if (data.status === "rejected") {
        router.replace("/auth/rejected");
        return;
      }

      // Fully approved admin
      setAllowed(true);
      setLoading(false);
    }

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white/70">
        Loading…
      </div>
    );
  }

  if (!allowed) {
    return null; // Redirect already triggered
  }

  return <AppLayout navItems={adminNav}>{children}</AppLayout>;
}
