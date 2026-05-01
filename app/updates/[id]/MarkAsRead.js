"use client";

import { useEffect } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

export default function MarkAsRead({ updateId }) {
  const supabase = createClientBrowser();

  useEffect(() => {
    async function mark() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("news_reads").upsert({
        user_id: user.id,   // FIXED
        update_id: updateId,
      });
    }

    mark();
  }, [updateId]);

  return null;
}
