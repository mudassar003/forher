//src/app/c/wm/lose-weight/components/IntroductionStep.tsx
"use client";

import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";

export default function IntroductionStep() {
  const router = useRouter();
  const { markStepCompleted } = useWMFormStore();
  const pathname = "/c/wm/lose-weight";

  const nextStep = () => {
    // Mark the introduction step as completed in the store
    markStepCompleted(pathname);
    
    // Navigate to the first question
    router.push(`${pathname}?offset=1`);
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

      {/* Bottom Disclaimer Text */}
      <div className="absolute bottom-20 w-full max-w-2xl text-center text-gray-500 text-sm px-4">
        <p>
          By clicking 'Continue', you agree that Hers may use your responses to personalize your 
          experience and other purposes as described in our 
          <a href="#" className="underline text-gray-600"> Privacy Policy</a>.
          Responses prior to account creation will not be used as part of your medical assessment.
        </p>
      </div>

      {/* Step-Specific Button */}
      <div className="fixed bottom-6 w-full flex justify-center z-10">
        <button
          onClick={nextStep}
          className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-2xl hover:bg-gray-900"
        >
          Continue
        </button>
      </div>
    </div>
  );
}