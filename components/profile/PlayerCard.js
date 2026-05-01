"use client";

import { useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

function getInitials(name) {
  if (!name) return "P";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PlayerCard({ profile, user }) {
  const supabase = createClientBrowser();

  const fullName = user?.user_metadata?.full_name || "Player";
  const [avatarUrl, setAvatarUrl] = useState(
    user?.user_metadata?.avatar_url || null
  );

  // ⭐ Normalise tier safely
  const rawTier =
    typeof profile?.tier === "string"
      ? profile.tier.trim().toLowerCase()
      : null;

  const validTiers = ["gold", "silver", "bronze"];

  // ⭐ NEW if tier missing or invalid
  const isNew = !rawTier || !validTiers.includes(rawTier);

  // ⭐ Only apply tier styles if NOT new
  const tier = isNew ? null : rawTier;

  // ⭐ Metallic tier backgrounds
  const tierStyles = {
    gold: {
      bg: "bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700",
      badge: "bg-yellow-400 text-black",
      label: "GOLD",
    },
    silver: {
      bg: "bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600",
      badge: "bg-gray-300 text-black",
      label: "SILVER",
    },
    bronze: {
      bg: "bg-gradient-to-br from-[#b08d57] via-[#8c6f3c] to-[#6e522a]",
      badge: "bg-[#8c6f3c] text-white",
      label: "BRONZE",
    },
  };

  const { bg, badge, label } = tier ? tierStyles[tier] : {};

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const filePath = `avatars/${user.id}-${Date.now()}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    setAvatarUrl(publicUrl);
  }

  return (
    <div
      className={`
        relative rounded-xl p-6 backdrop-blur shadow-xl flex items-center gap-6
        ${
          isNew
            ? "bg-brand text-black border border-brand-light shadow-[0_0_25px_5px_rgba(0,255,0,0.35)]"
            : `${bg} shadow-[0_0_25px_5px_rgba(0,255,0,0.35)]`
        }
      `}
    >
      {/* ⭐ Tier or NEW Badge */}
      <div
        className={`
          absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow
          ${
            isNew
              ? "bg-black/20 text-black border border-black/30"
              : badge
          }
        `}
      >
        {isNew ? "NEW" : label}
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-2">
        <label className="cursor-pointer flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full overflow-hidden border border-white/20 shadow-lg bg-black/60 flex items-center justify-center text-2xl font-bold">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{getInitials(fullName)}</span>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <span className="text-xs text-black underline underline-offset-4">
            Change Avatar
          </span>
        </label>
      </div>

      {/* Player Info */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold leading-tight">{fullName}</h1>

        {profile.nickname && (
          <p className="text-black text-lg font-semibold mt-1">
            “{profile.nickname}”
          </p>
        )}

        <p className="text-white/60 text-sm mt-1">{user?.email}</p>
      </div>
    </div>
  );
}
