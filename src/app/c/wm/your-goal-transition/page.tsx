//src/app/c/wm/your-goal-transition/page.tsx
"use client";

import { useRouter } from "next/navigation";
import ProgressBar from "@/app/c/wm/components/ProgressBar"; // Import ProgressBar

export default function YourGoalTransition() {
  const router = useRouter();

  // Function to navigate to the next step
  const nextStep = () => {
    router.push("/c/wm/submit"); // Navigate to the next step
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={60} /> {/* Updated progress for step 3 */}

      {/* Centered Content */}
      <div className="max-w-lg text-left mt-5">
        {/* Static Text */}
        <h1 className="text-3xl mt-2 font-bold text-[#fe92b5]">Direct2Her</h1>

        <p className="text-3xl text-black mt-4">
          Your goal to lose <span className="text-[#fe92b5] font-semibold">16-50 lbs.</span> is closer than you think — and it doesn’t involve restrictive diets.
        </p>

        <p className="text-3xl text-black mt-4">
          To find a custom plan for you, we’ll need to build your Weight Loss Profile first.
        </p>

        <p className="text-2xl text-black mt-4 font-semibold">
          Ready?
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
