'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="relative z-10 min-h-screen flex flex-col">

      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover -z-10"
      >
        <source src="/videos/darts_bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/60 pointer-events-none -z-0"></div>

      {/* Centered Hero Branding */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 text-white">

        {/* Logo */}
        <div className="p-2 sm:p-3 bg-white/10 backdrop-blur-sm rounded-xl shadow-xl shadow-black/50 mb-6">
          <Image
            src="/academy/logo.jpg"
            alt="180 Darts Academy Logo"
            width={120}
            height={120}
            className="rounded-lg object-cover w-24 h-24 sm:w-32 sm:h-32"
          />
        </div>

        {/* Academy Name */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-wide mb-4 sm:mb-6 uppercase drop-shadow-[var(--brand-glow)]">
          180 Darts Academy
        </h1>

        {/* Strapline */}
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 opacity-90">
          Play. Improve. Compete.
        </h2>

        {/* Academy Description */}
        <p className="text-base sm:text-lg max-w-xl sm:max-w-2xl mb-8 sm:mb-10 opacity-90 leading-relaxed drop-shadow">
          Welcome to 180 Darts Academy — a community built around growth,
          encouragement, and the love of the game. Our sessions bring together
          players, parents, and coaches in a structured environment designed to
          build skills, confidence, and lasting friendships.{" "}
          <Link
            href="/learn-more"
            className="text-brand-light hover:text-brand font-medium transition"
          >
            Learn more about the academy
          </Link>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg text-lg hover:bg-white/20 transition backdrop-blur-sm text-center"
          >
            Log in
          </Link>

          <Link
            href="/auth/role"
            className="px-6 py-3 bg-brand text-white rounded-lg text-lg hover:bg-brand-dark transition shadow-lg shadow-black/40 drop-shadow-[var(--brand-glow)] text-center"
          >
            Sign up
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 sm:py-6 text-center text-gray-300 text-xs sm:text-sm">
        © {new Date().getFullYear()} 180 Darts Academy. All rights reserved.
      </footer>
    </main>
  );
}
