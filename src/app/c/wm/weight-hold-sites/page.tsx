//src/app/c/wm/weight-hold-sites/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";

export default function WeightHoldSites() {
  const router = useRouter();
  const { markStepCompleted, setWeightHoldSites } = useWMFormStore();
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    { id: "stomach", label: "Around my stomach or waist" },
    { id: "hips-thighs", label: "Hips and thighs" },
    { id: "all-over", label: "All over" }
  ];

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleContinue = () => {
    if (selectedOption) {
      // Store the selection in the form store
      setWeightHoldSites(selectedOption);
      markStepCompleted("/c/wm/weight-hold-sites");
      
      // Navigate to the next step
      router.push("/c/wm/cravings");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={85} />

      <div className="max-w-lg w-full text-center mt-10">
        <h2 className="text-2xl font-semibold text-black mb-8">
          Where do you hold most of your weight?
        </h2>
        
        {/* Options */}
        <div className="space-y-4 mb-10">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                selectedOption === option.id
                  ? "border-black bg-gray-100"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fixed Button at Bottom */}
      <div className="fixed bottom-6 w-full flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!selectedOption}
          className={`text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-lg ${
            selectedOption ? "bg-black" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}