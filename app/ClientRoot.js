"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { createClientBrowser } from "@/lib/supabase/client";
import OnlineStatusWrapper from "./OnlineStatusWrapper";
import ClientChallengeListener from "@/components/ClientChallengeListener";

// ⭐ Add a tiny session context
import { SessionContext } from "@/lib/session-context";

export default function ClientRoot({ children }) {
  const supabase = createClientBrowser();
  const [session, setSession] = useState(undefined); 
  // undefined = loading, null = no session

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

  // ⭐ Don't render until hydration is complete
  if (session === undefined) {
    return null;
  }

  return (
    <SessionContext.Provider value={session}>
      {children}

      {session && (
        <>
          <OnlineStatusWrapper />
          <ClientChallengeListener />
        </>
      )}
    </SessionContext.Provider>
  );
}
