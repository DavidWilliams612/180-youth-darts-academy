"use client";

export default function SelectInput({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col space-y-1 mb-6">
      <label className="block mb-2 text-brand-light">{label}</label>

      <div className="relative">
        <select
          className="
            w-full p-3 pr-10 rounded-lg
            bg-black/40 backdrop-blur-md
            border border-white/10
            text-white
            appearance-none
            transition
            focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/40
            hover:border-brand/40
          "
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" className="text-gray-400">Select...</option>

          {options.map((o) => (
            <option key={o} value={o} className="text-black">
              {o}
            </option>
          ))}
        </select>

        {/* Custom arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg
            className="w-4 h-4 text-brand-light opacity-80"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
