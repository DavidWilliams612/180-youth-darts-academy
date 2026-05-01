'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function LearnMorePage() {
  return (
    <div className="min-h-screen w-full bg-180 flex flex-col text-white">

      {/* TOP NAV */}
      <nav className="w-full px-6 py-4 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-brand/20">

        {/* Logo + Title */}
        <a href="/" className="flex items-center gap-3 group">
          <img
            src="/academy/logo.jpg"
            alt="Academy Logo"
            className="w-12 h-12 rounded-lg object-cover shadow-[var(--brand-glow)]"
          />
          <span className="text-xl font-bold tracking-wide uppercase group-hover:text-brand-light transition drop-shadow-[var(--brand-glow)]">
            180 Darts Academy
          </span>
        </a>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <a href="/auth/login" className="text-white/80 hover:text-white transition text-sm">
            Login
          </a>
          <a
            href="/auth/role"
            className="px-4 py-2 bg-brand text-black rounded-lg text-sm hover:bg-brand-dark transition shadow-md shadow-black/40 font-semibold"
          >
            Sign Up
          </a>
        </div>
      </nav>

      {/* MAIN NAV */}
      <div className="w-full bg-black/30 backdrop-blur-sm border-b border-brand/20">
        <div className="px-6 py-3 flex gap-6 text-white/80 text-sm">
          <a href="/" className="hover:text-white transition">Home</a>
          <a href="/learn-more" className="text-brand-light hover:text-brand transition">
            About
          </a>
        </div>
      </div>

      {/* SUB NAV */}
      <div className="w-full bg-black/20 border-b border-brand/20 backdrop-blur-sm">
        <div className="px-6 py-3 flex gap-6 text-sm text-white/70 overflow-x-auto">
          <a href="/learn-more" className="text-brand-light drop-shadow-[var(--brand-glow)]">
            About the Academy
          </a>
          <a href="/learn-more/coaches" className="hover:text-white transition">Meet the Coaches</a>
          <a href="/learn-more/philosophy" className="hover:text-white transition">Training Philosophy</a>
          <a href="/learn-more/age-groups" className="hover:text-white transition">Age Groups</a>
          <a href="/learn-more/facilities" className="hover:text-white transition">Facilities</a>
          <a href="/learn-more/contact" className="hover:text-white transition">Contact</a>
          <a href="/learn-more/become-a-coach" className="hover:text-white transition">Become a Coach</a>
        </div>
      </div>

      {/* HERO SECTION */}
      <header className="px-6 py-20 text-center">
        <Image
          src="/academy/logo.jpg"
          alt="180 Darts Academy Logo"
          width={120}
          height={120}
          className="mx-auto mb-6 rounded-lg shadow-[var(--brand-glow)]"
        />

        <h1 className="text-5xl font-bold uppercase tracking-wide text-brand drop-shadow-[var(--brand-glow)] mb-4">
          180 Darts Academy
        </h1>

        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Discover what makes 180 Darts Academy a supportive, structured, and inspiring place
          for players of all ages to grow their skills and confidence.
        </p>
      </header>

      {/* CONTENT SECTIONS */}
      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-20">

        {/* About the Academy */}
        <section>
          <h2 className="text-3xl font-semibold mb-4 text-brand-light drop-shadow-[var(--brand-glow)]">
            About the Academy
          </h2>
          <p className="text-gray-300 leading-relaxed">
            180 Darts Academy was created to give players a positive, structured environment
            where they can develop their skills, build confidence, and enjoy the sport.
            Our sessions are designed to be fun, engaging, and supportive — whether you're
            picking up a dart for the first time or preparing for competitive play.
          </p>
        </section>

        {/* Coaching Philosophy */}
        <section>
          <h2 className="text-3xl font-semibold mb-4 text-brand-light drop-shadow-[var(--brand-glow)]">
            Our Coaching Philosophy
          </h2>
          <p className="text-gray-300 leading-relaxed">
            We believe in coaching that builds players up. Our approach focuses on
            encouragement, clear communication, and steady progress. Every player is
            supported at their own pace, with guidance tailored to their goals and
            experience level. We celebrate improvement, effort, and teamwork.
          </p>
        </section>

        {/* What We Offer */}
        <section>
          <h2 className="text-3xl font-semibold mb-4 text-brand-light drop-shadow-[var(--brand-glow)]">
            What We Offer
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2 leading-relaxed">
            <li>Structured fortnightly training sessions</li>
            <li>Player development and progress monitoring</li>
            <li>Supportive coaching for all ages and abilities</li>
            <li>A welcoming community for players, parents, and coaches</li>
          </ul>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/auth/role"
            className="px-6 py-3 bg-brand text-black rounded-lg text-lg hover:bg-brand-dark transition shadow-lg shadow-black/40 font-semibold"
          >
            Join the Academy
          </Link>
        </section>
      </div>
    </div>
  );
}
