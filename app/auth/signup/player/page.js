"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { createClientBrowser } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

export default function PlayerSignup() {
  const supabase = createClientBrowser();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    date_of_birth: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  function validate() {
    const e = {};
    if (!form.full_name) e.full_name = "Full name is required";
    if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (!form.date_of_birth) e.date_of_birth = "Date of birth is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function calculateAge(dob) {
    const birth = new Date(dob);
    return Math.floor(
      (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/onboarding/player`,
      },
    });
    if (error) console.error(error);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    const age = calculateAge(form.date_of_birth);

    // ⭐ Under 13 → parent flow
    if (age < 13) {
      window.location.href =
        "/auth/signup/parent?childDob=" + form.date_of_birth;
      return;
    }

    // 1️⃣ Create auth user with correct metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          date_of_birth: form.date_of_birth,
          role: "pending",            // ⭐ Stored in auth metadata ONLY
          profile_complete: false,
        },
      },
    });

    if (authError) {
      setSubmitError(authError.message);
      return;
    }

    const user = authData.user;
    if (!user) {
      setSubmitError("Signup failed.");
      return;
    }

    // 2️⃣ Sign out immediately (approval required before login)
    await supabase.auth.signOut();

    // ⭐ 3️⃣ Insert into players table (matches your schema EXACTLY)
    const { error: insertError } = await supabase.from("players").insert({
      user_id: user.id,
      full_name: form.full_name,
      date_of_birth: form.date_of_birth,
      email: form.email,
      status: "pending",
      tier: "new",
      profile_complete: false,
      is_child: false,
      parent_id: null,
    });

    if (insertError) {
      setSubmitError(insertError.message);
      return;
    }

    // 4️⃣ Redirect to pending approval page
    window.location.href = "/auth/pending";
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
          Player Signup
        </h1>

        <p className="text-white/70 mt-2">
          Create your player account
        </p>
      </div>

      {/* Glass Card */}
      <div className="w-full max-w-md bg-black/40 backdrop-blur-md rounded-2xl p-10 shadow-xl border border-white/10 animate-fadeIn">

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

          <FormField
            label="Date of Birth"
            type="date"
            value={form.date_of_birth}
            onChange={(e) =>
              setForm({ ...form, date_of_birth: e.target.value })
            }
          />
          {errors.date_of_birth && (
            <p className="text-brand-light text-sm drop-shadow-[var(--brand-glow)]">
              {errors.date_of_birth}
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
