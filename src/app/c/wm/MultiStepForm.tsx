"use client";

import { usePathname, useRouter } from "next/navigation";

const steps = ["/c/wm/step1", "/c/wm/step2", "/c/wm/step3"];

export default function MultiStepForm() {
  const pathname = usePathname(); // Get current step from URL
  const router = useRouter();

  // Determine current step index
  const currentStepIndex = steps.indexOf(pathname);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      {/* Progress Bar */}
      <div className="relative w-full bg-gray-300 rounded-full h-2 mb-6">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Step Content */}
      <button onClick={() => router.push(steps[currentStepIndex + 1] || steps[0])} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
        Next
      </button>
    </div>
  );
}
