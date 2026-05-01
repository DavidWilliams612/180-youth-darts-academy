"use client";

import ChipSelector from "@/components/onboarding/ChipSelector";
import SelectInput from "@/components/onboarding/SelectInput";

export default function GoalsStep({ form, updateForm, onNext, onBack }) {
  return (
    <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl p-10 shadow-xl border border-white/10">
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-white">Your Goals</h2>

        {/* Short-Term Goals (multi-select) */}
        <ChipSelector
          label="Short-Term Goals"
          options={[
            "Improve Scoring",
            "Hit More Doubles",
            "Increase Confidence",
            "Improve Consistency",
            "Better Practice Routine",
          ]}
          value={form.short_term_goals || []}
          onChange={(value) => updateForm({ short_term_goals: value })}
          multiple
        />

        {/* Long-Term Goals (multi-select) */}
        <ChipSelector
          label="Long-Term Goals"
          options={[
            "Win Local Competitions",
            "Join a Team",
            "Compete Nationally",
            "Improve Ranking",
            "Become a Pro",
          ]}
          value={form.long_term_goals || []}
          onChange={(value) => updateForm({ long_term_goals: value })}
          multiple
        />

        {/* Practice Frequency (single-select) */}
        <SelectInput
          label="Practice Frequency"
          value={form.practice_frequency || ""}
          onChange={(value) => updateForm({ practice_frequency: value })}
          options={[
            "1–2 times per week",
            "3–4 times per week",
            "5+ times per week",
            "Only before matches",
          ]}
        />

        {/* Competition Mindset (single-select) */}
        <SelectInput
          label="Competition Mindset"
          value={form.competition_mindset || ""}
          onChange={(value) => updateForm({ competition_mindset: value })}
          options={[
            "Calm",
            "Aggressive",
            "Focused",
            "Emotional",
            "Confident",
            "Nervous",
          ]}
        />

        {/* Confidence Level (single-select) */}
        <SelectInput
          label="Confidence Level"
          value={form.confidence_level || ""}
          onChange={(value) => updateForm({ confidence_level: value })}
          options={["Low", "Medium", "High", "Very High"]}
        />

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-md border border-white/20 bg-black/20 hover:bg-black/30 transition"
          >
            Back
          </button>

          <button
            onClick={onNext}
            className="px-6 py-2 rounded-md bg-brand text-black font-medium hover:bg-brand-light transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
