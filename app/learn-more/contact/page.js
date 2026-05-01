'use client';

export default function Contact() {
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
      <div className="w-full bg-black/30 border-b border-brand/20 backdrop-blur-sm">
        <div className="px-6 py-3 flex gap-6 text-sm text-white/80">
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
          <a href="/learn-more/contact" className="text-brand-light drop-shadow-[var(--brand-glow)]">
            Contact
          </a>
          <a href="/learn-more/become-a-coach" className="hover:text-white transition">Become a Coach</a>
        </div>
      </div>

      {/* HERO */}
      <header className="px-6 py-16 text-center">
        <h1 className="text-5xl font-bold uppercase tracking-wide text-brand drop-shadow-[var(--brand-glow)]">
          Contact Us
        </h1>
        <p className="text-white/70 mt-4 max-w-2xl mx-auto">
          Get in touch with the academy — we’re here to help.
        </p>
      </header>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-12">

        <section>
          <h2 className="text-3xl font-semibold mb-4 text-brand-light drop-shadow-[var(--brand-glow)]">
            Email
          </h2>
          <p className="text-gray-300 leading-relaxed">
            You can reach us at: <span className="text-white">info@180dartsacademy.com</span>
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4 text-brand-light drop-shadow-[var(--brand-glow)]">
            Location
          </h2>
          <p className="text-gray-300 leading-relaxed">
            We train at: <br />
            <span className="text-white">[Your Venue Name]</span> <br />
            <span className="text-white">[Address Line 1]</span> <br />
            <span className="text-white">[Town / City]</span>
          </p>
        </section>

      </div>
    </div>
  );
}
