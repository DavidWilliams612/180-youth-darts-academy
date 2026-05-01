"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";
import ParentOnboardingModal from "./ParentOnboardingModal";

export default function ParentOnboardingPage() {
  const supabase = createClientBrowser();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        window.location.href = "/auth/login";
        return;
      }
      setUser(data.user);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen bg-180 text-white flex items-center justify-center px-4 py-10">
      <ParentOnboardingModal user={user} />
    </div>
  );
}
