//src/app/c/wm/cravings/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";

export default function Cravings() {
  const router = useRouter();
  const { markStepCompleted, setCravings } = useWMFormStore();
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    { id: "sweet", label: "Sweet" },
    { id: "salty", label: "Salty" },
    { id: "both", label: "Both" },
    { id: "none", label: "I don't have cravings" }
  ];

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleContinue = () => {
    if (selectedOption) {
      // Store the selection in the form store
      setCravings(selectedOption);
      markStepCompleted("/c/wm/cravings");
      
      // Navigate to the next step
      router.push("/c/wm/submit");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={95} />

      <div className="max-w-lg w-full text-center mt-10">
        <h2 className="text-2xl font-semibold text-black mb-8">
          When it comes to cravings, what type of food do you usually go for?
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