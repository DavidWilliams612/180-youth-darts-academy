"use client";

import useOnlineStatus from "@/lib/hooks/useOnlineStatus";

export default function OnlineStatusWrapper() {
  useOnlineStatus();
  return null;
}
