import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createClientServer() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          // Next.js 13.1 uses cookieStore.get(name) as a FUNCTION, not a method
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set(name, value, options) {
          cookieStore.set(name, value, options);
        },
        remove(name, options) {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );
}
