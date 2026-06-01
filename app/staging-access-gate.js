'use client';

import { useState } from 'react';

export default function StagingAccessGate({ children }) {
  const [entered, setEntered] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  // 🔍 Diagnostic logs — this is what we need to see in the browser console
  console.log('🔍 Environment check:');
  console.log('NEXT_PUBLIC_VERCEL_ENV:', process.env.NEXT_PUBLIC_VERCEL_ENV);
  console.log('NEXT_PUBLIC_STAGING_ACCESS_CODE:', process.env.NEXT_PUBLIC_STAGING_ACCESS_CODE);
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const correctCode = process.env.NEXT_PUBLIC_STAGING_ACCESS_CODE;

  const handleSubmit = (e) => {
  e.preventDefault();
  if (code === correctCode) {
    // ⭐ This is the new line — it tells the server you’re allowed in
    document.cookie = "staging_access=true; path=/; max-age=3600";


    setEntered(true);
  } else {
    setError('Incorrect code');
  }
};


  if (entered) return children;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="p-8 bg-white/10 backdrop-blur-md rounded-xl shadow-xl max-w-sm w-full border border-white/10">
        <h1 className="text-3xl font-bold text-center mb-6 text-brand">
          Staging Access
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Enter access code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="px-4 py-3 rounded-lg bg-black/40 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-brand"
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="px-4 py-3 rounded-lg bg-brand hover:bg-brand-dark transition text-white font-semibold shadow-lg shadow-black/40"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
