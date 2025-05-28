//src/app/c/hl/introduction/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHLFormStore } from "@/store/hlFormStore";
import ProgressBar from "@/app/c/hl/components/ProgressBar";

export default function HairLossIntroductionPage() {
  const router = useRouter();
  const { resetForm, setCurrentStep, markStepCompleted } = useHLFormStore();
  
  // Always reset the form when this page loads to ensure fresh start
  useEffect(() => {
    resetForm();
    setCurrentStep("/c/hl/introduction");
    
    // Clear any previous responses from sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem("hairLossResponses");
      sessionStorage.removeItem("finalHairLossResponses");
      sessionStorage.removeItem("ineligibilityReason");
    }
  }, [resetForm, setCurrentStep]);

  const nextStep = () => {
    // Mark this step as completed
    markStepCompleted("/c/hl/introduction");
    
    // Navigate directly to the first question with offset=1
    router.push("/c/hl/hair-loss?offset=1");
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Use the Progress Bar */}
      <ProgressBar progress={20} />

      {/* Centered Content */}
      <div className="max-w-lg text-center mt-10">
        <h2 className="text-3xl font-semibold text-[#fe92b5]">Start your hair loss treatment journey.</h2>
        <p className="text-xl font-medium text-black mt-3">
          Learn about treatment options based on your goals, hair type, and health history.
        </p>
      </div>

      {/* Bottom Disclaimer Text */}
      <div className="absolute bottom-20 w-full max-w-lg text-center text-gray-500 text-sm px-4">
        <p>
          By clicking 'Continue', you agree that Lilys may use your responses to personalize your 
          experience and other purposes as described in our 
          <a href="/privacy-policy" className="underline text-gray-600"> Privacy Policy</a>.
          Responses prior to account creation will not be used as part of your medical assessment.
        </p>
      </div>

      {/* Step-Specific Button */}
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