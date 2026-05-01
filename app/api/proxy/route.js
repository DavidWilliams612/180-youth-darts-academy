import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ noSession: true });
    }

    const userId = session.user.id;

    // ⭐ 1️⃣ Check admin FIRST
    const { data: admin } = await supabase
      .from("admins")
      .select("id, user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (admin) {
      return NextResponse.json({
        role: "admin",
        status: "approved",
      });
    }

    // 2️⃣ Check parent
    const { data: parent } = await supabase
      .from("parents")
      .select("id, status, user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (parent) {
      return NextResponse.json({
        role: "parent",
        status: parent.status,
      });
    }

    // 3️⃣ Check player
    const { data: player } = await supabase
      .from("players")
      .select("id, status, user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (player) {
      return NextResponse.json({
        role: "player",
        status: player.status,
      });
    }

    return NextResponse.json({
      role: null,
      status: "none",
    });

  } catch (err) {
    console.error("❌ PROXY ROUTE ERROR:", err);
    return NextResponse.json({ error: "proxy_failed" });
  }
}
