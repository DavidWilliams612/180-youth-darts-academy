import { createClientBrowser } from "@/lib/supabase/client";

export async function ensureProfileExists(roleHint = null) {
  const supabase = createClientBrowser();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const user = session.user;
  const userId = user.id;

  // ⭐ 1. Admins bypass the profiles table entirely
  if (user.user_metadata?.role === "admin") {
    return {
      id: userId,
      role: "admin",
      full_name: user.user_metadata.full_name || "",
      email: user.email
    };
  }

  // ⭐ 2. Prevent users from self‑assigning coach role
  if (roleHint === "coach") {
    roleHint = null;
  }

  // ⭐ 3. Load profile from DB
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  // ⭐ 4. If profile exists, ensure metadata is synced
  if (existingProfile) {
    const profileRole = existingProfile.role;

    // If metadata is missing role but profile has one → sync it
    if (!user.user_metadata?.role && profileRole) {
      await supabase.auth.updateUser({
        data: { role: profileRole }
      });
    }

    // If profile has no role but we have a valid roleHint → update it
    if (!profileRole && roleHint) {
      const { data: updatedProfile } = await supabase
        .from("profiles")
        .update({ role: roleHint })
        .eq("id", userId)
        .select()
        .single();

      // Sync metadata too
      await supabase.auth.updateUser({
        data: { role: roleHint }
      });

      return updatedProfile;
    }

    return existingProfile;
  }

  // ⭐ 5. Profile does not exist → create it
  const finalRole =
    roleHint ||
    user.user_metadata?.role ||
    "parent"; // default for Google users

  const { data: newProfile } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      role: finalRole,
      full_name: user.user_metadata.full_name || "",
    })
    .select()
    .single();

  // ⭐ Sync metadata so routing works
  await supabase.auth.updateUser({
    data: { role: finalRole }
  });

  return newProfile;
}
