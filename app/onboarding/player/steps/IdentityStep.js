"use client";

export default function IdentityStep({ form, updateForm, onNext }) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-black/40 backdrop-blur-md p-10 rounded-2xl border border-white/10 shadow-xl animate-fadeIn">
      <h2 className="text-3xl font-bold text-white mb-6">Your Identity</h2>

      <div className="space-y-6 text-white/90">

        <div>
          <label className="block mb-1">Nickname</label>
          <input
            type="text"
            value={form.nickname}
            onChange={(e) => updateForm({ nickname: e.target.value })}
            className="w-full p-3 rounded bg-black/30 border border-white/20 text-white"
            placeholder="What should we call you?"
          />
        </div>

        <div>
          <label className="block mb-1">Favourite Player</label>
          <input
            type="text"
            value={form.favourite_player}
            onChange={(e) => updateForm({ favourite_player: e.target.value })}
            className="w-full p-3 rounded bg-black/30 border border-white/20 text-white"
            placeholder="Who's your inspiration?"
          />
        </div>

        <div>
          <label className="block mb-1">Walk-On Song</label>
          <input
            type="text"
            value={form.walk_on_song}
            onChange={(e) => updateForm({ walk_on_song: e.target.value })}
            className="w-full p-3 rounded bg-black/30 border border-white/20 text-white"
            placeholder="Your walk-on anthem"
          />
        </div>

      </div>

      <button
        onClick={onNext}
        className="mt-10 px-6 py-2 rounded-md bg-brand text-black font-semibold hover:bg-brand-light transition"
      >
        Next
      </button>
    </div>
  );
}
