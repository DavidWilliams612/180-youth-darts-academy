'use client';

export default function BecomeACoach() {
  return (
    <div className="min-h-screen w-full bg-180 flex flex-col text-white">

      {/* TOP NAV */}
      <nav className="w-full px-6 py-4 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-brand/20">
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
          <a href="/learn-more" className="hover:text-white transition">About the Academy</a>
          <a href="/learn-more/coaches" className="hover:text-white transition">Meet the Coaches</a>
          <a href="/learn-more/philosophy" className="hover:text-white transition">Training Philosophy</a>
          <a href="/learn-more/age-groups" className="hover:text-white transition">Age Groups</a>
          <a href="/learn-more/facilities" className="hover:text-white transition">Facilities</a>
          <a href="/learn-more/contact" className="hover:text-white transition">Contact</a>

          {/* Highlighted current page */}
          <a href="/learn-more/become-a-coach" className="text-brand-light drop-shadow-[var(--brand-glow)]">
            Become a Coach
          </a>
        </div>
      </div>

      {/* HERO */}
      <header className="px-6 py-16 text-center">
        <h1 className="text-5xl font-bold uppercase tracking-wide text-brand drop-shadow-[var(--brand-glow)]">
          Become a Coach
        </h1>
        <p className="text-white/70 mt-4 max-w-2xl mx-auto">
          Help players grow. Shape the next generation. Be part of something special at 180 Darts Academy.
        </p>
      </header>

      {/* CONTENT SECTIONS */}
      <section className="px-6 pb-20 max-w-4xl mx-auto space-y-12">

        {/* WHY */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-brand/30 shadow-[0_0_20px_rgba(0,255,127,0.15)]">
          <h2 className="text-2xl font-semibold text-brand-light drop-shadow-[var(--brand-glow)] mb-3">
            Why Become a Coach?
          </h2>
          <p className="text-white/70 leading-relaxed">
            Coaching at 180 Darts Academy isn’t about titles or trophies — it’s about people.
            Our coaches are mentors, motivators, and role models who help players build confidence,
            discipline, and a lifelong love for the game.
          </p>
        </div>

        {/* WHAT'S INVOLVED */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-brand/30 shadow-[0_0_20px_rgba(0,255,127,0.15)]">
          <h2 className="text-2xl font-semibold text-brand-light drop-shadow-[var(--brand-glow)] mb-3">
            What’s Involved
          </h2>
          <ul className="space-y-2 text-white/70 leading-relaxed">
            <li>• Supporting players during practice sessions</li>
            <li>• Offering guidance on technique, consistency, and mindset</li>
            <li>• Providing encouragement and constructive feedback</li>
            <li>• Helping new players feel welcome</li>
            <li>• Optional involvement in online coaching sessions</li>
          </ul>
          <p className="text-white/70 mt-4">
            No formal qualifications are required — just passion, patience, and a willingness to help others improve.
          </p>
        </div>

        {/* WHO */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-brand/30 shadow-[0_0_20px_rgba(0,255,127,0.15)]">
          <h2 className="text-2xl font-semibold text-brand-light drop-shadow-[var(--brand-glow)] mb-3">
            Who We’re Looking For
          </h2>
          <ul className="space-y-2 text-white/70 leading-relaxed">
            <li>• You enjoy helping others learn</li>
            <li>• You’re patient, positive, and encouraging</li>
            <li>• You have a basic understanding of darts (or are willing to learn)</li>
            <li>• You can commit to occasional volunteer time</li>
            <li>• You want to be part of a friendly, growing community</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-brand/30 shadow-[0_0_20px_rgba(0,255,127,0.15)]">
          <h3 className="text-xl font-semibold text-brand-light drop-shadow-[var(--brand-glow)] mb-2">
            Interested in Joining Us?
          </h3>
          <p className="text-white/70 mb-4">
            If you’d like to become a coach at 180 Darts Academy, we’d love to hear from you.
            Send us a message and tell us a little about yourself.
          </p>

          <a
            href="mailto:coaching@180dartsacademy.com"
            className="inline-block px-6 py-3 bg-brand text-black rounded-lg font-semibold hover:bg-brand-dark transition shadow-md shadow-black/40"
          >
            coaching@180dartsacademy.com
          </a>
        </div>

      </section>
    </div>
  );
}
