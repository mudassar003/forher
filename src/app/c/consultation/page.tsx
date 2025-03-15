//src/app/c/consultation/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHLFormStore, getLastCompletedStep } from "@/store/consultFormStore";

export default function HairLossEntry() {
  const router = useRouter();
  const { completedSteps, formData } = useHLFormStore();

  useEffect(() => {
    // Check if the user has already started the form
    if (completedSteps.length > 0) {
      // Get the furthest step the user has completed
      const lastCompletedStep = getLastCompletedStep(completedSteps);
      
      // Check if we need to resume at a specific offset
      const stepOffsets = formData.stepOffsets || {};
      let redirectPath = lastCompletedStep || "/c/hl/introduction";
      
      // If this step has a stored offset, include it in the redirect URL
      if (stepOffsets[lastCompletedStep]) {
        redirectPath = `${redirectPath}?offset=${stepOffsets[lastCompletedStep]}`;
      }
      
      // Short delay to ensure smooth transition
      const timer = setTimeout(() => {
        router.push(redirectPath);
      }, 1000); // 1 second delay for smooth transition

      return () => clearTimeout(timer); // Cleanup timeout on unmount
    } else {
      // If no progress, redirect to the introduction page
      const timer = setTimeout(() => {
        router.push("/c/hl/introduction");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [router, completedSteps, formData]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* Loading Animation */}
      <div className="w-24 h-24 border-4 border-[#fe92b5] border-t-transparent rounded-full animate-spin mb-8"></div>
      
      {/* Loading Text */}
      <p className="text-xl text-gray-600">
        {completedSteps.length > 0 ? "Resuming your progress..." : "Preparing your survey..."}
      </p>
    </div>
  );
}