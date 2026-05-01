"use client";

export default function ReviewStep({ form, onBack, onSubmit }) {
  const renderValue = (value) => {
    if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
    return value || "—";
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-black/40 backdrop-blur-md p-10 rounded-2xl border border-white/10 shadow-xl animate-fadeIn">

      {/* Title */}
      <h2 className="text-3xl font-bold text-white mb-2">Review Your Details</h2>
      <p className="text-white/70 mb-8">
        Make sure everything looks correct before completing your profile.
      </p>

      <div className="space-y-10 text-white/90">

        {/* Identity */}
        <div>
          <h3 className="text-xl font-semibold text-brand mb-3">Identity</h3>
          <div className="space-y-2">
            <p><strong>Nickname:</strong> {renderValue(form.nickname)}</p>
            <p><strong>Favourite Player:</strong> {renderValue(form.favourite_player)}</p>
            <p><strong>Walk-On Song:</strong> {renderValue(form.walk_on_song)}</p>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        {/* Playing Style */}
        <div>
          <h3 className="text-xl font-semibold text-brand mb-3">Playing Style</h3>
          <div className="space-y-2">
            <p><strong>Strengths:</strong> {renderValue(form.strengths)}</p>
            <p><strong>Weaknesses:</strong> {renderValue(form.weaknesses)}</p>
            <p><strong>Throwing Style:</strong> {renderValue(form.throwing_style)}</p>
            <p><strong>Throwing Stance:</strong> {renderValue(form.stance)}</p>
            <p><strong>Dominant Eye:</strong> {renderValue(form.dominant_eye)}</p>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        {/* Darts Setup */}
        <div>
          <h3 className="text-xl font-semibold text-brand mb-3">Darts Setup</h3>
          <div className="space-y-2">
            <p><strong>Dart Weight:</strong> {renderValue(form.dart_weight)}</p>
            <p><strong>Barrel Shape:</strong> {renderValue(form.barrel_shape)}</p>
            <p><strong>Grip Style:</strong> {renderValue(form.grip_style)}</p>
            <p><strong>Flight Shape:</strong> {renderValue(form.flight_shape)}</p>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        {/* Goals */}
        <div>
          <h3 className="text-xl font-semibold text-brand mb-3">Goals</h3>
          <div className="space-y-2">
            <p><strong>Short-Term Goals:</strong> {renderValue(form.short_term_goals)}</p>
            <p><strong>Long-Term Goals:</strong> {renderValue(form.long_term_goals)}</p>
            <p><strong>Practice Frequency:</strong> {renderValue(form.practice_frequency)}</p>
            <p><strong>Competition Mindset:</strong> {renderValue(form.competition_mindset)}</p>
            <p><strong>Confidence Level:</strong> {renderValue(form.confidence_level)}</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-10">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-md border border-white/20 bg-white/10 hover:bg-white/20 transition text-white"
        >
          Back
        </button>

        <button
          onClick={onSubmit}
          className="px-6 py-2 rounded-md bg-brand text-black font-semibold hover:bg-brand-light transition"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
