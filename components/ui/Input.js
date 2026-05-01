export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-brand-muted text-sm">
          {label}
        </label>
      )}

      <input
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent ${className}`}
        {...props}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
