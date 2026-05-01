"use client";

import SelectInput from "@/components/onboarding/SelectInput";
import Button from "@/components/ui/Button";

export default function DartsSetupStep({ form, updateForm, onNext, onBack }) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-black/40 backdrop-blur-md p-10 rounded-2xl border border-white/10 shadow-xl animate-fadeIn">

      <h2 className="text-3xl font-bold text-white mb-6">Darts Setup</h2>

      <div className="space-y-8">

        {/* Dart Weight */}
        <SelectInput
          label="Dart Weight"
          value={form.dart_weight}
          onChange={(value) => updateForm({ dart_weight: value })}
          options={["18g", "20g", "22g", "24g", "26g", "28g"]}
        />

        {/* Barrel Shape */}
        <SelectInput
          label="Barrel Shape"
          value={form.barrel_shape}
          onChange={(value) => updateForm({ barrel_shape: value })}
          options={["Straight", "Torpedo", "Front-loaded", "Scalloped"]}
        />

        {/* Grip Style */}
        <SelectInput
          label="Grip Style"
          value={form.grip_style}
          onChange={(value) => updateForm({ grip_style: value })}
          options={["Light", "Medium", "Heavy", "Front Grip", "Rear Grip"]}
        />

        {/* Flight Shape */}
        <SelectInput
          label="Flight Shape"
          value={form.flight_shape}
          onChange={(value) => updateForm({ flight_shape: value })}
          options={["Standard", "Slim", "Pear", "Kite"]}
        />

      </div>

      {/* Navigation */}
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
