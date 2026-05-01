"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-brand-soft px-6 py-4 flex items-center justify-between">
      
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center space-x-2">
        <img src="/logo.svg" alt="Dartly" className="h-8" />
        <span className="font-semibold text-brand text-lg">Dartly</span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center space-x-6 text-brand">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/sessions">Sessions</Link>
        <Link href="/profile">Profile</Link>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-brand-accent hover:underline"
        >
          Logout
        </button>
      </div>

      {/* Mobile Hamburger */}
      <button
        className="md:hidden text-brand"
        onClick={() => setOpen(true)}
      >
        <Menu size={26} />
      </button>

      {/* Mobile Menu */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50">
          <div className="absolute right-0 top-0 w-64 h-full bg-white shadow-xl p-6 space-y-6">
            <button
              className="text-brand mb-4"
              onClick={() => setOpen(false)}
            >
              <X size={26} />
            </button>

            <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
            <Link href="/sessions" onClick={() => setOpen(false)}>Sessions</Link>
            <Link href="/profile" onClick={() => setOpen(false)}>Profile</Link>

            <button
              onClick={() => {
                supabase.auth.signOut();
                setOpen(false);
              }}
              className="text-brand-accent hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
