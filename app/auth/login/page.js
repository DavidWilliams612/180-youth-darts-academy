"use client";

import { useState } from "react";
import { loginAction } from "./actions";
import AuthCard from "@/components/ui/AuthCard";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-20 bg-180 text-white">

      {/* Branding */}
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
          Welcome back — let’s get you signed in
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-black/40 backdrop-blur-md rounded-2xl p-10 shadow-xl border border-white/10 animate-fadeIn">

        {/* ⭐ The form now calls the server action directly */}
        <form action={loginAction} className="space-y-5 w-full">

          <FormField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />

          <FormField
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />

          {error && (
            <p className="text-brand-light text-sm text-center drop-shadow-[var(--brand-glow)]">
              {error}
            </p>
          )}

          <Button className="w-full bg-brand text-black hover:bg-brand-light transition shadow-lg shadow-black/40 font-semibold">
            Log in
          </Button>
        </form>

        <p className="text-center text-sm text-white/60 mt-4">
          Don’t have an account?{" "}
          <Link
            href="/auth/role"
            className="text-brand-light hover:text-brand underline underline-offset-4 transition"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
