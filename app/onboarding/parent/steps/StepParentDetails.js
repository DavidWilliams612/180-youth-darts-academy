"use client";

import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";

export default function StepParentDetails({
  parentDetails,
  setParentDetails,
  next,
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Parent Details</h2>

      <FormField
        label="Date of Birth"
        type="date"
        value={parentDetails.dob}
        onChange={(e) =>
          setParentDetails({ ...parentDetails, dob: e.target.value })
        }
      />

      <FormField
        label="Phone (optional)"
        value={parentDetails.phone}
        onChange={(e) =>
          setParentDetails({ ...parentDetails, phone: e.target.value })
        }
      />

      <FormField
        label="Address (optional)"
        value={parentDetails.address}
        onChange={(e) =>
          setParentDetails({ ...parentDetails, address: e.target.value })
        }
      />

      <Button className="w-full bg-brand text-black" onClick={next}>
        Continue
      </Button>
    </div>
  );
}
