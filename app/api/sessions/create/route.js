import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  // Use service role key for server-side inserts
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const body = await req.json();

    const {
      date,
      start_time,
      end_time,
      location,
      notes,
      invite_mode,
      group_id,
      selected_players,
    } = body;

    // 1. Create the session
    const { data: session, error: sessionError } = await supabase
      .from("training_sessions")
      .insert([
        {
          date,
          start_time,
          end_time,
          location,
          notes,
          invite_mode,
          group_id: invite_mode === "group" ? group_id : null,
        },
      ])
      .select()
      .single();

    if (sessionError) {
      console.error("Session creation error:", sessionError);
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }

    const sessionId = session.id;

    // 2. Handle attendance creation
    if (invite_mode === "all") {
      const { data: players } = await supabase.from("players").select("id");

      if (players?.length) {
        await supabase.from("session_invited_players").insert(
          players.map((p) => ({
            session_id: sessionId,
            player_id: p.id,
          }))
        );
      }
    }

    if (invite_mode === "group") {
      const { data: group } = await supabase
        .from("training_groups")
        .select("*")
        .eq("id", group_id)
        .single();

      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 400 });
      }

      if (group.group_type === "age") {
        const { data: players } = await supabase
          .from("players")
          .select("id, date_of_birth");

        const today = new Date();

        const eligible = players.filter((p) => {
          if (!p.date_of_birth) return false;

          const dob = new Date(p.date_of_birth);
          const age =
            today.getFullYear() -
            dob.getFullYear() -
            (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);

          if (group.name === "U10") return age < 10;
          if (group.name === "U14") return age < 14;
          if (group.name === "U18") return age < 18;

          return false;
        });

        if (eligible.length > 0) {
          await supabase.from("session_invited_players").insert(
            eligible.map((p) => ({
              session_id: sessionId,
              player_id: p.id,
            }))
          );
        }
      }

      if (group.group_type === "tier" || group.group_type === "custom") {
        const { data: members } = await supabase
          .from("training_group_members")
          .select("player_id")
          .eq("group_id", group_id);

        if (members?.length) {
          await supabase.from("session_invited_players").insert(
            members.map((m) => ({
              session_id: sessionId,
              player_id: m.player_id,
            }))
          );
        }
      }
    }

    if (invite_mode === "specific") {
      if (selected_players?.length) {
        await supabase.from("session_invited_players").insert(
          selected_players.map((playerId) => ({
            session_id: sessionId,
            player_id: playerId,
          }))
        );
      }
    }

    return NextResponse.json({ success: true, sessionId });

  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
