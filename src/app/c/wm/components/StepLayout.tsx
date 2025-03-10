//src/app/c/wm/components/StepLayout.tsx
"use client";

import ProgressBar from "./ProgressBar";
import { useRouter, usePathname } from "next/navigation";

const steps = ["/c/wm/step1", "/c/wm/step2", "/c/wm/step3"]; // Define steps & order

interface StepLayoutProps {
  children: React.ReactNode;
}

export default function StepLayout({ children }: StepLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentStepIndex = steps.indexOf(pathname);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      router.push(steps[currentStepIndex + 1]);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar (Now Reusable) */}
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