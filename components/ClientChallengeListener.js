"use client";

import { useChallengeAccepted } from "@/lib/hooks/useChallengeAccepted";
import { useRole } from "@/app/dashboard/RoleContext";

export default function ClientChallengeListener() {
  const role = useRole();

  // ⭐ Only players should listen for accepted challenges
  if (role !== "player") return null;

  useChallengeAccepted();
  return null;
}
