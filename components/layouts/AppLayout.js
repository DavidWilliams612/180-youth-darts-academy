"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import UnreadNewsCount from "@/components/UnreadNewsCount";

export default function AppLayout({ children, navItems }) {
  const supabase = createClientBrowser();
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingSessionsState, setPendingSessionsState] = useState(0);

  // 🔹 Never block UI: always clear loading, even if no session
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      const user = session?.user || null;
      setRole(user?.user_metadata?.role || null);
      setLoading(false);
    }

    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function updatePendingSessions() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      const user = session?.user;
      if (!user) {
        setPendingSessionsState(0);
        return;
      }

      const { data: player } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!player) {
        setPendingSessionsState(0);
        return;
      }

      const { data: sessions } = await supabase
        .from("session_invited_players")
        .select("status")
        .eq("player_id", player.id);

      const pending = sessions.filter((s) => s.status === "pending").length;
      setPendingSessionsState(pending);
    }

    updatePendingSessions();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    // This should now be very brief, not infinite
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white/70">
        Loading…
      </div>
    );
  }

  const renderNavItem = (item) => {
    const { href, label, id } = item;

    const cleanPath = pathname.replace(/\/+$/, "");
    const cleanHref = href.replace(/\/+$/, "");

    let isActive =
      cleanPath === cleanHref ||
      cleanPath.startsWith(cleanHref + "/");

    if (cleanHref === "/admin" && cleanPath !== "/admin") {
      isActive = false;
    }

    if (cleanHref === "/dashboard" && cleanPath !== "/dashboard") {
      isActive = false;
    }

    return (
      <div key={href} className="flex items-center gap-2 justify-between">
        <Link
          href={href}
          prefetch={false}
          className={`block px-4 py-2 rounded-md text-sm transition ${
            isActive
              ? "bg-brand text-white shadow-[var(--brand-glow)]"
              : "text-white/80 hover:text-white hover:bg-white/10"
          }`}
        >
          {label}
        </Link>

        {id === "latest-news" && (
          <div className="-ml-2">
            <UnreadNewsCount />
          </div>
        )}

        {href === "/dashboard/sessions" && pendingSessionsState > 0 && (
          <span
            className="
              bg-[#ff4b4b]
              text-black
              text-xs
              px-2
              py-0.5
              rounded-full
              shadow-[0_0_6px_rgba(255,75,75,0.6)]
            "
          >
            {pendingSessionsState}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-180 flex text-white">
      <aside className="w-64 border-r border-white/10 bg-brand-accent/10 backdrop-blur-md p-6 flex flex-col">
        <div className="flex flex-col gap-6">
          <Link href="/" prefetch={false} className="flex items-center gap-3 group">
            <img
              src="/academy/logo.jpg"
              alt="Academy Logo"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <span className="text-lg font-bold uppercase tracking-wide group-hover:text-white transition drop-shadow-[var(--brand-glow)]">
              180 Darts Academy
            </span>
          </Link>

          <nav className="flex flex-col gap-2">
            {navItems.map(item => renderNavItem(item))}
          </nav>
        </div>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/auth/login");
          }}
          className="mt-8 px-4 py-2 text-left text-sm text-white/60 hover:text-white transition cursor-pointer"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-10">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
