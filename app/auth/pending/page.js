export default function ParentPending() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-20 bg-180 text-white">

      {/* Academy Branding */}
      <div className="flex flex-col items-center mb-10 animate-fadeIn">
        <div className="p-3 bg-black/40 backdrop-blur-md rounded-xl shadow-xl border border-white/10 mb-4">
          <img
            src="/academy/logo.jpg"
            alt="180 Darts Academy Logo"
            width={110}
            height={110}
            className="rounded-lg object-cover shadow-[var(--brand-glow)]"
          />
        </div>

        <h1 className="text-4xl font-bold uppercase tracking-wide text-brand drop-shadow-[var(--brand-glow)]">
          Account Pending
        </h1>

        <p className="text-white/70 mt-2 text-center max-w-md">
          Your player account has been created and is awaiting approval from the academy.
        </p>
      </div>

      {/* Glass Card */}
      <div className="w-full max-w-md bg-black/40 backdrop-blur-md rounded-2xl p-10 shadow-xl border border-white/10 animate-fadeIn text-center">

        <p className="text-white/80 mb-6 leading-relaxed">
          Once approved, you’ll receive an email and be able to log in to manage your profile and access the player dashboard.
        </p>

        <a
          href="/"
          className="inline-block bg-brand text-black px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-brand-light transition cursor-pointer"
        >
          Return to Home
        </a>

        <p className="text-white/50 text-sm mt-4">
          Already approved?{" "}
          <a
            href="/auth/login"
            className="text-brand-light hover:text-brand underline underline-offset-4 transition"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
