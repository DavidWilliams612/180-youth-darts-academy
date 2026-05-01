"use client";

export default function ProfileSection({ title, children }) {
  return (
    <div className="
      w-full 
      bg-white/5 
      border border-brand/30 
      rounded-xl 
      p-6 
      backdrop-blur-md 
      shadow-[0_0_12px_rgba(0,255,127,0.15)]
    ">
      <h2 className="text-xl font-semibold mb-2 text-brand-light drop-shadow-[var(--brand-glow)]">
        {title}
      </h2>
      <div className="text-white/60">
        {children}
      </div>
    </div>
  );
}
