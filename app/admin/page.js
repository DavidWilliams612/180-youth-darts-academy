export default function AdminHome() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-6 text-brand drop-shadow-[var(--brand-glow)]">
        Admin Dashboard
      </h1>

      <p className="text-white/70 max-w-2xl">
        Welcome to the 180 Darts Academy admin panel.
        Use the navigation on the left to manage coaches, players, sessions,
        and academy settings.
      </p>
    </div>
  );
}
