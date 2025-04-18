//src/app/c/wm/introduction/page.tsx
"use client";

import { useRouter } from "next/navigation";
import ProgressBar from "@/app/c/wm/components/ProgressBar"; // Import ProgressBar

export default function StepOne() {
  const router = useRouter();

  const nextStep = () => {
    router.push("/c/wm/lose-weight?offset=1"); // Navigate to the next step
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Use the Progress Bar */}
      <ProgressBar progress={20} /> {/* Set progress dynamically */}

      {/* Centered Content */}
      <div className="max-w-lg text-center mt-10">
        <h2 className="text-3xl font-semibold text-[#fe92b5]">Start your weight loss journey.</h2>
        <p className="text-xl font-medium text-black mt-3">
          Learn about treatment options based on your goals, habits, and health history.
        </p>
      </div>

      {/* Bottom Disclaimer Text */}
      <div className="absolute bottom-20 w-full max-w-lg text-center text-gray-500 text-sm px-4">
        <p>
          By clicking ‘Continue’, you agree that Hers may use your responses to personalize your 
          experience and other purposes as described in our 
          <a href="#" className="underline text-gray-600"> Privacy Policy</a>.
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