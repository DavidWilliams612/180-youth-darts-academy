export default function FormField({ label, type = "text", ...props }) {
  return (
    <label className="flex flex-col gap-1 w-full">
      <span className="text-sm font-medium text-white/90">{label}</span>

      <input
        type={type}
        className="
          w-full
          rounded-md
          bg-white/10
          text-white
          placeholder-white/60
          border border-white/20
          focus:border-white/40
          focus:ring-0
          px-3 py-2
          transition
        "
        {...props}
      />
    </label>
  );
}
