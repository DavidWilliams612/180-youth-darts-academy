"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase/client";

import IdentityStep from "@/app/onboarding/player/steps/IdentityStep";
import StyleStep from "@/app/onboarding/player/steps/StyleStep";
import DartsSetupStep from "@/app/onboarding/player/steps/DartsSetupStep";
import GoalsStep from "@/app/onboarding/player/steps/GoalsStep";
import ReviewStep from "@/app/onboarding/player/steps/ReviewStep";

export default function EditChildPage() {
  const supabase = createClientBrowser();
  const router = useRouter();
  const { childId } = useParams();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(null);

  const updateForm = (data) =>
    setForm((prev) => ({
      ...prev,
      ...data,
    }));

  useEffect(() => {
    async function loadChild() {
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("id", childId)
        .single();

      setForm(data);
      setLoading(false);
    }

    loadChild();
  }, [childId]);

  const safeArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  };

  const handleSubmit = async () => {
    const { error } = await supabase
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
      })
      .eq("id", childId);

    if (error) {
      console.error(error);
      alert("Error updating child.");
      return;
    }

    router.push("/dashboard/children");
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading…
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
