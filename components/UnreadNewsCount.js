"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

export default function UnreadNewsCount() {
  const supabase = createClientBrowser();
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: updates } = await supabase
        .from("news_updates")
        .select("id");

      const { data: reads } = await supabase
        .from("news_reads")
        .select("update_id")
        .eq("user_id", user.id); // FIXED

      const readIds = new Set(reads?.map(r => r.update_id));
      const unread = updates.filter(u => !readIds.has(u.id));

      setCount(unread.length);
    }

    load();
  }, []);

  if (count === 0) return null;

  return (
  <span className="bg-[#ff4b4b] text-black text-xs px-2 py-0.5 rounded-full shadow-[0_0_6px_rgba(255,75,75,0.6)]">
    {count}
  </span>
);

}
