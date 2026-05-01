'use client';

export default function MeetTheCoaches() {
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
          <a href="/learn-more" className="hover:text-white transition">About the Academy</a>
          <a href="/learn-more/coaches" className="text-brand-light drop-shadow-[var(--brand-glow)]">
            Meet the Coaches
          </a>
          <a href="/learn-more/philosophy" className="hover:text-white transition">Training Philosophy</a>
          <a href="/learn-more/age-groups" className="hover:text-white transition">Age Groups</a>
          <a href="/learn-more/facilities" className="hover:text-white transition">Facilities</a>
          <a href="/learn-more/contact" className="hover:text-white transition">Contact</a>
          <a href="/learn-more/become-a-coach" className="hover:text-white transition">Become a Coach</a>
        </div>
      </div>

      {/* HERO SECTION */}
      <header className="px-6 py-16 text-center">
        <h1 className="text-5xl font-bold uppercase tracking-wide text-brand drop-shadow-[var(--brand-glow)]">
          Meet the Coaches
        </h1>
        <p className="text-white/70 mt-4 max-w-2xl mx-auto">
          Our coaching team brings passion, experience, and a commitment to helping every player reach their full potential.
        </p>
      </header>

      {/* COACH PROFILES */}
      <section className="px-6 pb-20 max-w-5xl mx-auto grid md:grid-cols-2 gap-10">

        {/* COACH CARD 1 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-brand/30 shadow-[0_0_20px_rgba(0,255,127,0.15)]">
          <img
            src="/academy/Rob.png"
            alt="Coach Rob"
            className="w-full h-56 object-cover rounded-lg mb-4 shadow-[var(--brand-glow)]"
          />
          <h2 className="text-2xl font-semibold text-brand-light drop-shadow-[var(--brand-glow)]">
            Coach Rob
          </h2>
          <p className="text-brand-light text-sm mb-2">Head Coach</p>
          <p className="text-white/70 text-sm leading-relaxed">
            Short bio goes here. Coaching philosophy, experience, achievements, and what makes them special.
          </p>
        </div>

        {/* COACH CARD 2 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-brand/30 shadow-[0_0_20px_rgba(0,255,127,0.15)]">
          <img
            src="/academy/Ian.png"
            alt="Coach Ian"
            className="w-full h-56 object-cover rounded-lg mb-4 shadow-[var(--brand-glow)]"
          />
          <h2 className="text-2xl font-semibold text-brand-light drop-shadow-[var(--brand-glow)]">
            Coach Ian
          </h2>
          <p className="text-brand-light text-sm mb-2">Assistant Coach</p>
          <p className="text-white/70 text-sm leading-relaxed">
            Short bio goes here. Coaching philosophy, experience, achievements, and what makes them special.
          </p>
        </div>
{/* BECOME A COACH CTA */}
<div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-brand/30 shadow-[0_0_20px_rgba(0,255,127,0.15)]">
  <h3 className="text-xl font-semibold text-brand-light drop-shadow-[var(--brand-glow)] mb-2">
    Want to Become a Coach?
  </h3>
  <p className="text-white/70 mb-4">
    If you’re interested in joining our coaching team, we’d love to hear from you.
  </p>

  <a
    href="/learn-more/become-a-coach"
    className="inline-block px-6 py-3 bg-brand text-black rounded-lg font-semibold hover:bg-brand-dark transition shadow-md shadow-black/40"
  >
    Learn More
  </a>
</div>

      </section>
      
    </div>
  );
}
