"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ParentSignupInner from "./ParentSignupInner";

export default function ParentSignup() {
  return (
    <Suspense fallback={<div className="text-white p-10">Loading…</div>}>
      <ParentSignupInner />
    </Suspense>
  );
}
