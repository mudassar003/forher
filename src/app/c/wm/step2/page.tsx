"use client";

import { useRouter } from "next/navigation";
import ProgressBar from "@/app/c/wm/components/ProgressBar"; // Import ProgressBar

export default function StepTwo() {
  const router = useRouter();

  const nextStep = () => {
    router.push("/c/wm/step3"); // Navigate to the next step
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar (No need to duplicate logic) */}
      <ProgressBar progress={40} />

      {/* Centered Content */}
      <div className="max-w-lg text-center mt-10">
        <h2 className="text-3xl font-semibold text-teal-600">Tell us about your health.</h2>
        <p className="text-lg text-gray-700 mt-4">
          Answer a few quick questions about your health to personalize your recommendations.
        </p>
      </div>

      {/* Step-Specific Button (No Back Button) */}
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
