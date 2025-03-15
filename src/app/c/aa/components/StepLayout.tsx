//src/app/c/aa/components/StepLayout.tsx
"use client";

import { useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useRouter, usePathname } from "next/navigation";
import { useAAFormStore, AA_FORM_STEPS, getNextStep } from "@/store/aaFormStore";

interface StepLayoutProps {
  children: React.ReactNode;
}

export default function StepLayout({ children }: StepLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Get states and actions from the store
  const { 
    currentStep, 
    completedSteps, 
    setCurrentStep, 
    markStepCompleted 
  } = useAAFormStore();

  // Calculate progress
  const currentStepIndex = AA_FORM_STEPS.indexOf(pathname);
  const progressPercentage = ((currentStepIndex + 1) / AA_FORM_STEPS.length) * 100;

  // Update current step in the store when pathname changes
  useEffect(() => {
    if (pathname && AA_FORM_STEPS.includes(pathname)) {
      setCurrentStep(pathname);
    }
  }, [pathname, setCurrentStep]);

  const nextStep = () => {
    // Mark current step as completed
    if (pathname) {
      markStepCompleted(pathname);
    }

    // Navigate to next step
    const next = getNextStep(pathname || "");
    if (next) {
      router.push(next);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={progressPercentage} />

      {/* Step Content */}
      <div className="max-w-lg text-center mt-10">{children}</div>

      {/* Sticky Continue Button */}
      <div className="fixed bottom-6 w-full flex justify-center">
        <button
          onClick={nextStep}
          className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
}