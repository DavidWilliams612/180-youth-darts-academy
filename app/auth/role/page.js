"use client";

import AuthCard from "@/components/ui/AuthCard";
import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

export default function SignupRolePage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-20 bg-180 text-white">

      {/* Academy Branding */}
      <div className="flex flex-col items-center mb-10 animate-fadeIn">
        <div className="p-3 bg-black/40 backdrop-blur-md rounded-xl shadow-xl border border-white/10 mb-4">
          <Image
            src="/academy/logo.jpg"
            alt="180 Darts Academy Logo"
            width={110}
            height={110}
            className="rounded-lg object-cover shadow-[var(--brand-glow)]"
          />
        </div>

        <h1 className="text-4xl font-bold uppercase tracking-wide text-brand drop-shadow-[var(--brand-glow)]">
          180 Darts Academy
        </h1>

        <p className="text-white/70 mt-2">
          Create your account — choose your role
        </p>
      </div>

      {/* Glass Card */}
      <div className="w-full max-w-md bg-black/40 backdrop-blur-md rounded-2xl p-10 shadow-xl border border-white/10 animate-fadeIn">

        <div className="space-y-4">

          {/* PLAYER BUTTON */}
          <Button
            onClick={() => (window.location.href = "/auth/signup/player")}
            className="w-full bg-white/10 border border-brand/30 text-white rounded-lg py-3
                       hover:bg-brand/20 hover:border-brand/40
                       hover:shadow-[var(--brand-glow)]
                       transition-all duration-300 backdrop-blur-sm cursor-pointer"
          >
            🎯 I’m a Player
          </Button>

          {/* PARENT BUTTON */}
          <Button
            onClick={() => (window.location.href = "/auth/signup/parent")}
            className="w-full bg-white/10 border border-brand/30 text-white rounded-lg py-3
                       hover:bg-brand/20 hover:border-brand/40
                       hover:shadow-[var(--brand-glow)]
                       transition-all duration-300 backdrop-blur-sm cursor-pointer"
          >
            👨‍👩‍👧 I’m a Parent
          </Button>

        </div>

        <p className="text-center text-sm text-white/60 mt-4">
          Already have an account{" "}
          <Link
            href="/auth/login"
            className="text-brand-light hover:text-brand underline underline-offset-4 transition"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
