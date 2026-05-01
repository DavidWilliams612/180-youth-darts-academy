"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { createClientBrowser } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

export default function ParentSignup() {
  const supabase = createClientBrowser();
  const searchParams = useSearchParams();
  const childDob = searchParams.get("childDob");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  function validate() {
    const e = {};
    if (!form.full_name) e.full_name = "Full name is required";
    if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=parent`,
      },
    });
    if (error) console.error(error);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    // 1. Create the auth user
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          role: "parent",
        },
      },
    });

    if (signupError) {
      setSubmitError(signupError.message);
      return;
    }

    const user = signupData.user;
    if (!user) {
      setSubmitError("Signup failed.");
      return;
    }

    // 2. Insert into parents table
    const { error: parentError } = await supabase.from("parents").insert({
      user_id: user.id,
      full_name: form.full_name,
      email: form.email,
      status: "pending",
    });

    if (parentError) {
      setSubmitError(parentError.message);
      return;
    }

    // 3. Log them in
const { error: loginError } = await supabase.auth.signInWithPassword({
  email: form.email,
  password: form.password,
});

if (loginError) {
  setSubmitError(loginError.message);
  return;
}

// ⭐ FIX: Ensure role metadata is set on the active session
await supabase.auth.updateUser({
  data: { role: "parent" },
});

// 4. Redirect to callback
window.location.href = `/auth/callback`;

  }

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
          Parent Signup
        </h1>

        <p className="text-white/70 mt-2">
          Create your parent account
        </p>
      </div>

      {/* Glass Card */}
      <div className="w-full max-w-md bg-black/40 backdrop-blur-md rounded-2xl p-10 shadow-xl border border-white/10 animate-fadeIn">

        {/* ⭐ Junior Player Detected Banner */}
        {childDob && (
          <div className="mb-6 p-4 bg-brand/10 border border-brand/30 rounded-xl text-brand-light text-sm shadow-md animate-fadeIn">
            <p className="font-semibold text-base mb-1">Junior Player Detected</p>
            <p className="text-white/80">
              Players under 13 must be registered by a parent or guardian.
              Your child’s date of birth:{" "}
              <span className="font-semibold">{childDob}</span>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 w-full">

          {/* GOOGLE LOGIN */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black hover:bg-gray-200 transition shadow-lg flex items-center justify-center gap-3 cursor-pointer"
          >
            <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </Button>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-brand/30" />
            <span className="text-white/50 text-sm">or</span>
            <div className="h-px flex-1 bg-brand/30" />
          </div>

          <FormField
            label="Full Name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="Your full name"
          />
          {errors.full_name && (
            <p className="text-brand-light text-sm drop-shadow-[var(--brand-glow)]">
              {errors.full_name}
            </p>
          )}

          <FormField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-brand-light text-sm drop-shadow-[var(--brand-glow)]">
              {errors.email}
            </p>
          )}

          <FormField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Create a strong password"
          />
          {errors.password && (
            <p className="text-brand-light text-sm drop-shadow-[var(--brand-glow)]">
              {errors.password}
            </p>
          )}

          {submitError && (
            <p className="text-brand-light text-sm text-center drop-shadow-[var(--brand-glow)]">
              {submitError}
            </p>
          )}

          <Button className="w-full bg-brand text-black hover:bg-brand-light transition shadow-lg shadow-black/40 cursor-pointer font-semibold">
            Create Account
          </Button>
        </form>

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
