'use client';

import { useState } from 'react';

export default function StagingAccessGate() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const correctCode = process.env.NEXT_PUBLIC_STAGING_ACCESS_CODE;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (code === correctCode) {
      // Set cookie for 1 hour
      document.cookie = "staging_access=true; path=/; max-age=3600";

      // ⭐ Redirect so middleware can let them through
      window.location.href = "/";
    } else {
      setError("Incorrect code");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="p-8 bg-white/10 backdrop-blur-md rounded-xl shadow-xl max-w-sm w-full border border-white/10">
        <h1 className="text-3xl font-bold text-center mb-6 text-brand">
          Staging Access
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            id="access-code"
            name="access-code"
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
