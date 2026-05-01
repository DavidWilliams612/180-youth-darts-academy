"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase/client";

export default function DashboardNav({ user }) {
  const router = useRouter();
  const supabase = createClientBrowser();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  }

  return (
    <nav className="w-full bg-black/40 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-white font-semibold text-lg">
          Dartly
        </Link>

        <Link href="/dashboard" className="text-white/80 hover:text-white">
          Home
        </Link>

        <Link href="/dashboard/players" className="text-white/80 hover:text-white">
          Players
        </Link>

        <Link href="/dashboard/sessions" className="text-white/80 hover:text-white">
          Sessions
        </Link>

        <Link href="/dashboard/profile" className="text-white/80 hover:text-white">
          Profile
        </Link>
      </div>

      <button
        onClick={handleLogout}
        className="text-white/80 hover:text-white text-sm"
      >
        Log out
      </button>
    </nav>
  );
}
