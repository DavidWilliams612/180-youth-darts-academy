"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import UnreadNewsCount from "@/components/UnreadNewsCount";
import { useSession } from "@/lib/session-context";

export default function AppLayout({ children, navItems }) {
  const supabase = createClientBrowser();
  const pathname = usePathname();
  const router = useRouter();

  const session = useSession();
  const role = session?.user?.user_metadata?.role || null;

  const [pendingSessionsState, setPendingSessionsState] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load pending sessions
  useEffect(() => {
    async function updatePendingSessions() {
      const user = session?.user;
      if (!user) return setPendingSessionsState(0);

      const { data: player } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!player) return setPendingSessionsState(0);

      const { data: sessions } = await supabase
        .from("session_invited_players")
        .select("status")
        .eq("player_id", player.id);

      const pending = sessions?.filter((s) => s.status === "pending").length || 0;
      setPendingSessionsState(pending);
    }

    updatePendingSessions();
  }, [session]);

  const renderNavItem = (item) => {
    const { href, label, id } = item;

    const cleanPath = pathname.replace(/\/+$/, "");
    const cleanHref = href.replace(/\/+$/, "");

    let isActive =
      cleanPath === cleanHref ||
      cleanPath.startsWith(cleanHref + "/");

    if (cleanHref === "/admin" && cleanPath !== "/admin") isActive = false;
    if (cleanHref === "/dashboard" && cleanPath !== "/dashboard") isActive = false;

    return (
      <div key={href} className="flex items-center gap-2 justify-between">
        <Link
          href={href}
          prefetch={false}
          onClick={() => setMobileOpen(false)}
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
          <span className="bg-[#ff4b4b] text-black text-xs px-2 py-0.5 rounded-full shadow-[0_0_6px_rgba(255,75,75,0.6)]">
            {pendingSessionsState}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-180 flex text-white">

      {/* ⭐ Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-brand-accent/20 backdrop-blur-md border-b border-white/10">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white text-2xl"
        >
          ☰
        </button>

        <Link href="/" prefetch={false} className="flex items-center gap-3">
          <img
            src="/academy/logo.jpg"
            alt="Academy Logo"
            className="w-10 h-10 rounded-lg object-cover"
          />
          <span className="text-lg font-bold uppercase tracking-wide">
            180 Darts Academy
          </span>
        </Link>
      </div>

      {/* ⭐ Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ⭐ Mobile drawer */}
      <div
        className={`
          md:hidden fixed top-0 left-0 h-full w-64 z-50
          bg-brand-accent/10 backdrop-blur-md border-r border-white/10 p-6
          transform transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <nav className="flex flex-col gap-2 mt-14">
          {navItems.map(renderNavItem)}
        </nav>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/auth/login");
          }}
          className="mt-8 px-4 py-2 text-left text-sm text-white/60 hover:text-white transition cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* ⭐ Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-white/10 bg-brand-accent/10 backdrop-blur-md p-6 flex-col">
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
            {navItems.map(renderNavItem)}
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

      {/* ⭐ Main content */}
      <main className="flex-1 p-10 mt-14 md:mt-0">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
