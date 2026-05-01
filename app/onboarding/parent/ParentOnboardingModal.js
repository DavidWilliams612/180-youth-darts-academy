"use client";

import { useState } from "react";
import StepParentDetails from "./steps/StepParentDetails";
import StepAddChildren from "./steps/StepAddChildren";
import StepReview from "./steps/StepReview";

export default function ParentOnboardingModal({ user }) {
  const [step, setStep] = useState(1);

  const [parentDetails, setParentDetails] = useState({
    dob: "",
    phone: "",
    address: "",
  });

  const [children, setChildren] = useState([]);

  function next() {
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => s - 1);
  }

  return (
    <div className="w-full max-w-lg bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl animate-fadeIn">
      {step === 1 && (
        <StepParentDetails
          parentDetails={parentDetails}
          setParentDetails={setParentDetails}
          next={next}
        />
      )}

      {step === 2 && (
        <StepAddChildren
          children={children}
          setChildren={setChildren}
          next={next}
          back={back}
        />
      )}

      {step === 3 && (
        <StepReview
          parentDetails={parentDetails}
          children={children}
          user={user}
        />
      )}
    </div>
  );
}
