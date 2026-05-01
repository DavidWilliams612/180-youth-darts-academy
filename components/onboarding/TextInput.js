export default function TextInput({ label, value, onChange, placeholder }) {
  return (
    <div className="mb-6">
      <label className="block mb-2 text-brand-light">{label}</label>
      <input
        className="w-full p-3 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
