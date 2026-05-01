"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";
import OnlineStatusWrapper from "./OnlineStatusWrapper";
import ClientChallengeListener from "@/components/ClientChallengeListener";

export default function ClientRoot() {
  const supabase = createClientBrowser();
  const [session, setSession] = useState(undefined); 
  // ⭐ undefined = "not loaded yet"
  // null = "loaded and no session"

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // ⭐ FIX: Do NOT block rendering while session is undefined (hydrating)
  if (session === undefined) {
    return null; // hydration phase only
  }

  // ⭐ If user is logged out, still allow the app to render
  // (AppLayout or pages will handle redirects)
  return (
    <>
      {session && (
        <>
          <OnlineStatusWrapper />
          <ClientChallengeListener />
        </>
      )}
    </>
  );
}
