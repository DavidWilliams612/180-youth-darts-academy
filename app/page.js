'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="relative z-10 min-h-screen flex flex-col">

      
    
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/60 pointer-events-none -z-0"></div>

      {/* Centered Hero Branding */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 text-white">

        {/* Logo */}
        <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl shadow-xl shadow-black/50 mb-6">
          <Image
            src="/academy/logo.jpg"
            alt="180 Darts Academy Logo"
            width={140}
            height={140}
            className="rounded-lg object-cover"
          />
        </div>

        {/* Academy Name */}
        <h1 className="text-6xl font-bold tracking-wide mb-6 uppercase drop-shadow-[var(--brand-glow)]">
          180 Youth Darts Academy
        </h1>

        {/* Strapline */}
        <h2 className="text-2xl font-semibold mb-4 opacity-90">
          Play. Improve. Compete.
        </h2>

        {/* Academy Description */}
        <p className="text-lg max-w-2xl mb-10 opacity-90 leading-relaxed drop-shadow">
          Welcome to 180 Youth Darts Academy — a community built around growth,
          encouragement, and the love of the game. Our sessions bring together
          players, parents, and coaches in a structured environment designed to
          build skills, confidence, and lasting friendships.
          <br></br>
          <br></br>
          Our new website is coming soon!
          <br></br>
          <br></br>
          In the meantime, follow us on social media for updates, announcements, and ways to get in touch.
          {" "}
          
        </p>

        {/* CTA Buttons */}
<div className="flex gap-4">
  <Link
    href="https://www.instagram.com/180youthdarts/"
    target="_blank"
    className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg text-lg hover:bg-brand-dark transition shadow-lg shadow-black/40 drop-shadow-[var(--brand-glow)]"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      className="w-5 h-5 shrink-0"
    >
      <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z"/>
    </svg>

    <span>Instagram</span>
  </Link>

  <Link
    href="https://www.facebook.com/people/180-Youth-Darts/61571225810218"
    target="_blank"
    className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg text-lg hover:bg-brand-dark transition shadow-lg shadow-black/40 drop-shadow-[var(--brand-glow)]"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      className="w-5 h-5 shrink-0"
    >
      <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898v-2.89h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/>
    </svg>

    <span>Facebook</span>
  </Link>
</div>

      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-300 text-sm">
        © {new Date().getFullYear()} 180 Darts Academy. All rights reserved.
      </footer>
    </main>
  );
}
