"use client";

import { useRouter } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClientBrowser();

  async function handleLogout() {
    // 1. Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // 2. Get their player record
      const { data: player } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // 3. Mark them offline
      if (player) {
        await supabase.from("online_status").upsert({
          player_id: player.id,
          status: "offline",
          last_seen: new Date().toISOString(),
        });
      }
    }

    // 4. Sign out
    await supabase.auth.signOut();

    // 5. Redirect home
    router.push("/");
  }

  return (
    <button onClick={handleLogout} style={{ marginTop: 20 }}>
      Logout
    </button>
  );
}
