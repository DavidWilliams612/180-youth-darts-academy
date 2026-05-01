"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

export function useGameScores(sessionId) {
  const supabase = createClientBrowser();
  const [scores, setScores] = useState([]);

  useEffect(() => {
    async function loadScores() {
      const { data } = await supabase
        .from("game_scores")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      setScores(data || []);
    }

    loadScores();

    const channel = supabase
      .channel(`scores-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_scores",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setScores((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return scores;
}
