'use client';

export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-180 text-white">

      {/* Brand‑tinted overlay */}
      <div className="absolute inset-0 -z-10 bg-brand/10 backdrop-blur-sm" />

      {/* Subtle brand glow edges */}
      <div className="pointer-events-none absolute inset-0 -z-10 shadow-[0_0_60px_20px_rgba(0,255,127,0.15)]" />

      {/* Page content */}
      <main className="relative z-10 flex items-center justify-center min-h-screen px-4">
        {children}
      </main>
    </div>
  );
}
