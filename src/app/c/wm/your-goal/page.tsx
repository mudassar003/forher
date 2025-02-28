"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/app/c/wm/components/ProgressBar"; // Import ProgressBar

export default function YourGoal() {
  const router = useRouter();
  const options = [
    { label: "Losing 1-15 lbs", value: "1-15 lbs." },
    { label: "Losing 16-50 lbs", value: "16-50 lbs." },
    { label: "Losing 51+ lbs", value: "51+ lbs." },
    { label: "Not sure, I just need to lose weight", value: "weight" },
  ];

  // Default selection to first option
  const [selectedGoal, setSelectedGoal] = useState<string>(options[0].value);

  useEffect(() => {
    // Save to localStorage when selectedGoal changes
    localStorage.setItem("selectedGoal", selectedGoal);
  }, [selectedGoal]);

  const nextStep = () => {
    if (selectedGoal === "51+ lbs.") {
      router.push("/c/wm/social-proof"); // Navigate to social-proof step
    } else {
      router.push("/c/wm/your-goal-transition"); // Navigate to the next step
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={40} /> {/* Updated progress for step 2 */}

      {/* Centered Content */}
      <div className="max-w-lg text-center mt-10">
        {/* Custom Logo Text */}
        <h1 className="text-3xl font-bold text-[#fe92b5]">Direct2Her</h1>

        {/* Main Question */}
        <h2 className="text-2xl font-semibold text-black mt-3">What’s your weight loss goal?</h2>

        {/* Selection Options */}
        <div className="mt-6 space-y-4">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedGoal(option.value)}
              className={`w-full p-4 border-2 rounded-lg text-lg font-medium transition-all duration-200
                ${selectedGoal === option.value ? "border-[#fe92b5] bg-gray-100" : "border-gray-300 bg-white hover:bg-gray-100"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
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
