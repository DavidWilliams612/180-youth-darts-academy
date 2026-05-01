"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; // Shared client

import IdentityStep from "./IdentityStep";
import StyleStep from "./StyleStep";
import DartsSetupStep from "./DartsSetupStep";
import GoalsStep from "./GoalsStep";
import ReviewStep from "./ReviewStep";

export default function PlayerOnboardingSteps() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    // Identity
    nickname: "",
    favourite_player: "",
    walk_on_song: "",

    // Style
    strengths: [],
    weaknesses: [],
    throwing_style: [],

    // Darts Setup
    dart_weight: "",
    barrel_shape: "",
    grip_style: "",
    flight_shape: "",
    stance: "",
    dominant_eye: "",

    // Goals
    short_term_goals: [],
    long_term_goals: [],
    practice_frequency: "",
    competition_mindset: "",
    confidence_level: "",
  });

  const updateForm = (data) =>
    setForm((prev) => ({
      ...prev,
      ...data,
    }));

  useEffect(() => {
    const checkProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
  setLoading(false);
  return;
}


      // Load existing profile (if needed later)
      await supabase
        .from("players")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setLoading(false);
    };

    checkProfile();
  }, []);

  const safeArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  };

  const handleSubmit = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("You must be logged in.");
        return;
      }

      // Ensure role is set
      await supabase.auth.updateUser({
        data: { role: "player" },
      });

      // ⭐ UPDATE the existing player row instead of inserting a new one
      const { error: updateError } = await supabase
        .from("players")
        .update({
          nickname: form.nickname,
          favourite_player: form.favourite_player,
          walk_on_song: form.walk_on_song,

          strengths: safeArray(form.strengths),
          weaknesses: safeArray(form.weaknesses),
          throwing_style: safeArray(form.throwing_style),

          stance: form.stance,
          dominant_eye: form.dominant_eye,

          dart_weight: form.dart_weight,
          barrel_shape: form.barrel_shape,
          grip_style: form.grip_style,
          flight_shape: form.flight_shape,

          short_term_goals: safeArray(form.short_term_goals),
          long_term_goals: safeArray(form.long_term_goals),
          practice_frequency: form.practice_frequency,
          competition_mindset: form.competition_mindset,
          confidence_level: form.confidence_level,

          // Keep status pending until admin approves
          status: "pending",
        })
        .eq("user_id", user.id);

      if (updateError) {
        console.error(updateError);
        alert("Error saving data.");
        return;
      }

      // Redirect to pending approval page
      router.push("/auth/pending");
    } catch (err) {
      console.error(err);
      alert("Unexpected error.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Checking profile...
      </div>
    );
  }

  return (
    <>
      {step === 1 && (
        <IdentityStep
          form={form}
          updateForm={updateForm}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <StyleStep
          form={form}
          updateForm={updateForm}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <DartsSetupStep
          form={form}
          updateForm={updateForm}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <GoalsStep
          form={form}
          updateForm={updateForm}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <ReviewStep
          form={form}
          onBack={() => setStep(4)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
