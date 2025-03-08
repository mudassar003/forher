"use client";

import { useRouter } from "next/navigation";
import ProgressBar from "@/c/wm/components/ProgressBar"; // Import ProgressBar

export default function StepThree() {
  const router = useRouter();

  const nextStep = () => {
    router.push("/c/wm/step4"); // Navigate to the next step (or final submission)
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={60} />

      {/* Centered Content */}
      <div className="max-w-lg text-center mt-10">
        <h2 className="text-3xl font-semibold text-teal-600">Your Personalized Plan</h2>
        <p className="text-lg text-gray-700 mt-4">
          Based on your responses, here’s what we recommend for you.
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
