export default function ChipSelector({ label, options, value = [], onChange }) {
  const toggle = (item) => {
    if (value.includes(item)) {
      onChange(value.filter((v) => v !== item));
    } else {
      onChange([...value, item]);
    }
  };

  return (
    <div className="mb-6">
      <label className="block mb-2 text-brand-light">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => toggle(o)}
            className={`px-4 py-2 rounded-full border ${
              value.includes(o)
                ? "bg-brand text-black border-brand"
                : "bg-black/30 border-white/10"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
