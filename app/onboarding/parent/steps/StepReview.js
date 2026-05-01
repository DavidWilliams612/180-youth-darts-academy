"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { createClientBrowser } from "@/lib/supabase/client";

export default function StepReview({
  parentDetails,
  children,
  user,
}) {
  const supabase = createClientBrowser();
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);

    // Save parent
    await supabase.from("parents").insert({
      user_id: user.id,
      full_name: user.user_metadata.full_name,
      dob: parentDetails.dob,
      phone: parentDetails.phone,
      address: parentDetails.address,
      status: "pending",
    });

    // Save children
    for (const child of children) {
      await supabase.from("children").insert({
        parent_id: user.id,
        full_name: child.full_name,
        dob: child.dob,
        status: "pending",
      });
    }

    window.location.href = "/onboarding/parent/pending";
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Review & Submit</h2>

      <div className="space-y-2 text-sm">
        <p><strong>Parent DOB:</strong> {parentDetails.dob}</p>
        {parentDetails.phone && (
          <p><strong>Phone:</strong> {parentDetails.phone}</p>
        )}
        {parentDetails.address && (
          <p><strong>Address:</strong> {parentDetails.address}</p>
        )}
      </div>

      <h3 className="text-lg font-semibold mt-4">Children</h3>
      <div className="space-y-2 text-sm">
        {children.map((c) => (
          <p key={c.id}>
            {c.full_name} — {c.dob}
          </p>
        ))}
      </div>

      <Button
        className="w-full bg-brand text-black"
        onClick={submit}
        disabled={loading}
      >
        {loading ? "Submitting…" : "Submit for Approval"}
      </Button>
    </div>
  );
}
