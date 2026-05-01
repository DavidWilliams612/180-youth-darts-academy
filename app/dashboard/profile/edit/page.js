"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

import TextInput from "@/components/onboarding/TextInput";
import SelectInput from "@/components/onboarding/SelectInput";
import ChipSelector from "@/components/onboarding/ChipSelector";

export default function EditProfilePage() {
  const supabase = createClientBrowser();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});

  const updateForm = (data) => setForm((prev) => ({ ...prev, ...data }));

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        // ⭐ NORMALISE ALL FIELDS SO UI COMPONENTS ALWAYS SHOW VALUES
        setForm({
          ...data,

          // Identity
          nickname: data.nickname || "",
          favourite_player: data.favourite_player || "",
          walk_on_song: data.walk_on_song || "",

          // Darts Setup
          dart_brand: data.dart_brand || "",
          dart_weight: data.dart_weight || "",
          barrel_shape: data.barrel_shape || "",
          flight_shape: data.flight_shape || "",
          grip_style: data.grip_style || "",
          stance: data.stance || "",
          dominant_eye: data.dominant_eye || "",

          // Mindset & Training
          practice_frequency: data.practice_frequency || "",
          competition_mindset: data.competition_mindset || "",
          confidence_level: data.confidence_level || "",

          // Arrays
          strengths: Array.isArray(data.strengths) ? data.strengths : [],
          improvements: Array.isArray(data.improvements) ? data.improvements : [],

        });
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  const save = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1️⃣ Update profile fields
    await supabase
      .from("players")
      .update({
        nickname: form.nickname,
        favourite_player: form.favourite_player,
        walk_on_song: form.walk_on_song,

        dart_brand: form.dart_brand,
        dart_weight: form.dart_weight,
        barrel_shape: form.barrel_shape,
        flight_shape: form.flight_shape,

        grip_style: form.grip_style,
        stance: form.stance,
        dominant_eye: form.dominant_eye,

        practice_frequency: form.practice_frequency,
        competition_mindset: form.competition_mindset,
        confidence_level: form.confidence_level,

        strengths: form.strengths,
        improvements: form.improvements,

      })
      .eq("user_id", user.id);

    // 2️⃣ Required fields for profile completion
    const requiredFields = [
      form.nickname,
      form.favourite_player,
      form.walk_on_song,
      form.dart_brand,
      form.dart_weight,
      form.strengths?.length > 0,
      form.improvements?.length > 0,
    ];

    const isComplete = requiredFields.every(Boolean);

    // 3️⃣ Update profile_complete
    await supabase
      .from("players")
      .update({ profile_complete: isComplete })
      .eq("user_id", user.id);

    // 4️⃣ Redirect
    window.location.href = "/dashboard/profile";
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 py-16 bg-180 text-white">

      {/* Header */}
      <div className="text-center mb-10 animate-fadeIn">
        <h1 className="text-4xl font-bold uppercase tracking-wide text-brand drop-shadow-[var(--brand-glow)]">
          Edit Profile
        </h1>
        <p className="text-white/70 mt-2">
          Update your academy information
        </p>
      </div>

      {/* Glass Card */}
      <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl p-10 shadow-xl border border-white/10 animate-fadeIn">

        {/* 🎯 PLAYER IDENTITY */}
<h2 className="text-brand text-xl font-semibold mb-4 mt-8">Player Identity</h2>

        <TextInput
          label="Nickname"
          value={form.nickname}
          onChange={(v) => updateForm({ nickname: v })}
        />

        <TextInput
          label="Favourite Player"
          value={form.favourite_player}
          onChange={(v) => updateForm({ favourite_player: v })}
        />

        <TextInput
          label="Walk-on Song"
          value={form.walk_on_song}
          onChange={(v) => updateForm({ walk_on_song: v })}
        />
<div className="w-full h-px bg-brand/60 my-8"></div>

        {/* 🎯 DARTS SETUP */}
<h2 className="text-brand text-xl font-semibold mb-4 mt-8">Darts Setup</h2>

        <SelectInput
          label="Dart Brand"
          value={form.dart_brand}
          onChange={(v) => updateForm({ dart_brand: v })}
          options={["Target", "Winmau", "Unicorn", "Red Dragon", "Other"]}
        />

        <SelectInput
          label="Dart Weight (g)"
          value={form.dart_weight}
          onChange={(v) => updateForm({ dart_weight: v })}
          options={[18, 20, 21, 22, 23, 24, 25, 26]}
        />

        <SelectInput
          label="Barrel Shape"
          value={form.barrel_shape}
          onChange={(v) => updateForm({ barrel_shape: v })}
          options={["Straight", "Torpedo", "Scalloped"]}
        />

        <SelectInput
          label="Flight Shape"
          value={form.flight_shape}
          onChange={(v) => updateForm({ flight_shape: v })}
          options={["Standard", "Slim", "Kite", "Pear"]}
        />
<div className="w-full h-px bg-brand/60 my-8"></div>

        {/* 🎯 PLAYING STYLE */}
<h2 className="text-brand text-xl font-semibold mb-4 mt-8">Playing Style</h2>
        <SelectInput
          label="Grip Style"
          value={form.grip_style}
          onChange={(v) => updateForm({ grip_style: v })}
          options={["Front", "Middle", "Rear", "Pencil", "Claw"]}
        />

        <SelectInput
          label="Stance"
          value={form.stance}
          onChange={(v) => updateForm({ stance: v })}
          options={["Straight", "Angled", "Side-on"]}
        />

        <SelectInput
          label="Dominant Eye"
          value={form.dominant_eye}
          onChange={(v) => updateForm({ dominant_eye: v })}
          options={["Left", "Right", "Both"]}
        />
<div className="w-full h-px bg-brand/60 my-8"></div>

        {/* 🎯 TRAINING & MINDSET */}
<h2 className="text-brand text-xl font-semibold mb-4 mt-8">Training & Mindset</h2>

        <SelectInput
          label="Practice Frequency"
          value={form.practice_frequency}
          onChange={(v) => updateForm({ practice_frequency: v })}
          options={[
            "Rarely",
            "1–2 times per week",
            "3–4 times per week",
            "Daily",
          ]}
        />

        <SelectInput
          label="Competition Mindset"
          value={form.competition_mindset}
          onChange={(v) => updateForm({ competition_mindset: v })}
          options={[
            "Casual",
            "Competitive",
            "Highly Competitive",
            "Professional Mindset",
          ]}
        />

        <SelectInput
          label="Confidence Level"
          value={form.confidence_level}
          onChange={(v) => updateForm({ confidence_level: v })}
          options={[
            "Low",
            "Moderate",
            "High",
            "Very High",
          ]}
        />

        {/* Strengths & Improvements */}
        <ChipSelector
          label="Strengths"
          options={["Scoring", "Doubles", "Composure", "Consistency", "Finishing"]}
          value={form.strengths}
          onChange={(v) => updateForm({ strengths: v })}
        />

        <ChipSelector
          label="Areas to Improve"
          options={["Scoring", "Doubles", "Composure", "Consistency", "Finishing"]}
          value={form.improvements}
          onChange={(v) => updateForm({ improvements: v })}
        />

<div className="w-full h-px bg-brand/60 my-8"></div>

        {/* Save Button */}
        <button
          onClick={save}
          className="mt-8 w-full bg-brand text-black py-3 rounded-lg font-semibold shadow-lg shadow-black/40 hover:bg-brand-light transition"
        >
          Save Changes
        </button>

      </div>
    </div>
  );
}
