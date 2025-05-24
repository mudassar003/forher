//src/app/c/wm/lose-weight/components/IntroductionStep.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";

export default function IntroductionStep() {
  const router = useRouter();
  const { markStepCompleted, resetForm, setCurrentStep } = useWMFormStore();
  const pathname = "/c/wm/lose-weight";
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset stored responses and form progress
  useEffect(() => {
    // Reset the form state
    resetForm();
    setCurrentStep(pathname);
    
    // Also clear any stored responses in sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem("weightLossResponses");
      sessionStorage.removeItem("ineligibilityReason");
    }
  }, [resetForm, setCurrentStep, pathname]);

  const nextStep = () => {
    // Mark the introduction step as completed in the store
    markStepCompleted(pathname);
    
    // Navigate to the first question - using history.pushState for smoother transition
    if (typeof window !== 'undefined') {
      // Update URL without full page reload
      const nextUrl = `${pathname}?offset=1`;
      window.history.pushState({}, '', nextUrl);
      
      // Now programmatically trigger navigation with the router for SPA-style navigation
      router.push(nextUrl);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Use the Progress Bar */}
      <ProgressBar progress={20} />

      {/* Centered Content */}
      <div className="max-w-3xl text-center mt-10">
        <h2 className="text-4xl font-semibold text-[#fe92b5] mb-6">Start your weight loss journey.</h2>
        <p className="text-2xl font-medium text-black mt-3">
          Learn about treatment options based on your goals, habits, and health history.
        </p>
      </div>

      {/* Bottom Disclaimer Text with updated brand name and privacy policy link */}
      <div className="absolute bottom-20 w-full max-w-2xl text-center text-gray-500 text-sm px-4">
        <p>
          By clicking 'Continue', you agree that Lilys may use your responses to personalize your 
          experience and other purposes as described in our 
          <a href="http://localhost:3000/privacy-policy" className="underline text-gray-600"> Privacy Policy</a>.
          Responses prior to account creation will not be used as part of your medical assessment.
        </p>
      </div>

      {/* Step-Specific Button */}
      <div className="fixed bottom-6 w-full flex justify-center z-10">
        <button
          onClick={nextStep}
          disabled={isLoading}
          className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-2xl hover:bg-gray-900"
        >
          {isLoading ? "Loading..." : "Continue"}
        </button>
      </div>
    </div>
  );
}