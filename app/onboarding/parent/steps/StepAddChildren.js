"use client";

import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";

export default function StepAddChildren({
  children,
  setChildren,
  next,
  back,
}) {
  function addChild() {
    setChildren([
      ...children,
      { id: Date.now(), full_name: "", dob: "" },
    ]);
  }

  function updateChild(id, field, value) {
    setChildren(
      children.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      )
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Add Children</h2>

      {children.map((child) => (
        <div
          key={child.id}
          className="p-4 bg-black/30 border border-white/10 rounded-lg space-y-3"
        >
          <FormField
            label="Child Name"
            value={child.full_name}
            onChange={(e) =>
              updateChild(child.id, "full_name", e.target.value)
            }
          />

          <FormField
            label="Child DOB"
            type="date"
            value={child.dob}
            onChange={(e) =>
              updateChild(child.id, "dob", e.target.value)
            }
          />
        </div>
      ))}

      <Button
        type="button"
        className="w-full bg-slate-700"
        onClick={addChild}
      >
        Add Another Child
      </Button>

      <div className="flex gap-3">
        <Button className="flex-1 bg-slate-700" onClick={back}>
          Back
        </Button>
        <Button className="flex-1 bg-brand text-black" onClick={next}>
          Continue
        </Button>
      </div>
    </div>
  );
}
