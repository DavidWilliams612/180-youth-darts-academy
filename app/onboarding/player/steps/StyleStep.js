"use client";

import ChipSelector from "@/components/onboarding/ChipSelector";
import SelectInput from "@/components/onboarding/SelectInput";
import Button from "@/components/ui/Button";

export default function StyleStep({ form, updateForm, onNext, onBack }) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-black/40 backdrop-blur-md p-10 rounded-2xl border border-white/10 shadow-xl animate-fadeIn">

      <h2 className="text-3xl font-bold text-white mb-6">Playing Style</h2>

      <div className="space-y-8">

        <ChipSelector
          label="Strengths"
          options={[
            "Scoring Power",
            "Finishing",
            "Consistency",
            "Composure",
            "High Averages",
            "Pressure Play",
          ]}
          value={form.strengths}
          onChange={(value) => updateForm({ strengths: value })}
          multiple
        />

        <ChipSelector
          label="Weaknesses"
          options={[
            "Doubles",
            "Scoring Dips",
            "Nerves",
            "Slow Starts",
            "Finishing",
            "Focus",
          ]}
          value={form.weaknesses}
          onChange={(value) => updateForm({ weaknesses: value })}
          multiple
        />

        <ChipSelector
          label="Throwing Style"
          options={[
            "Fast Thrower",
            "Slow Thrower",
            "Rhythmic",
            "Deliberate",
            "Aggressive",
            "Relaxed",
          ]}
          value={form.throwing_style}
          onChange={(value) => updateForm({ throwing_style: value })}
          multiple
        />

        <SelectInput
          label="Throwing Stance"
          value={form.stance}
          onChange={(value) => updateForm({ stance: value })}
          options={["Side-on", "Front-on", "45° Angle"]}
        />

        <SelectInput
          label="Dominant Eye"
          value={form.dominant_eye}
          onChange={(value) => updateForm({ dominant_eye: value })}
          options={["Left Eye", "Right Eye", "Both / Unsure"]}
        />

      </div>

      <div className="flex justify-between mt-10">
        <Button
          onClick={onBack}
          className="px-6 py-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 transition rounded-md"
        >
          Back
        </Button>

        <Button
          onClick={onNext}
          className="px-6 py-2 bg-brand text-black font-semibold hover:bg-brand-light transition rounded-md"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
