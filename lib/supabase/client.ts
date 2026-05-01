"use client";

import { createBrowserClient } from "@supabase/ssr";

// ⭐ Create ONE shared client instance for the entire browser session
let supabase: ReturnType<typeof createBrowserClient> | null = null;

export function createClientBrowser() {
  if (!supabase) {
    supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return supabase;
}
