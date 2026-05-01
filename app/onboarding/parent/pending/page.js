"use client";

import Link from "next/link";

export default function ParentPendingPage() {
  return (
    <div className="min-h-screen bg-180 text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl text-center space-y-6 animate-fadeIn">

        <h1 className="text-2xl font-semibold text-brand drop-shadow-[var(--brand-glow)]">
          Account Pending Approval
        </h1>

        <p className="text-white/70 text-sm leading-relaxed">
          Your parent account has been created successfully and is now awaiting approval
          from the 180 Darts Academy admin team.
        </p>

        <p className="text-white/60 text-sm">
          You’ll receive an email once your account has been approved.
        </p>

        <div className="pt-4">
          <Link
            href="/auth/login"
            className="text-brand-light underline underline-offset-4 hover:text-brand transition"
          >
            Return to Login
          </Link>
        </div>

      </div>
    </div>
  );
}
