//scr/app/c/wm/number-of-programs-tried/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";

export default function NumberOfProgramsTried() {
  const router = useRouter();
  const { markStepCompleted, setNumberOfProgramsTried } = useWMFormStore();
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    { id: "none", label: "None, this is my first time trying" },
    { id: "1-5", label: "1-5" },
    { id: "6-10", label: "6-10" },
    { id: "many", label: "More than I can remember" }
  ];

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleContinue = () => {
    if (selectedOption) {
      // Store the selection in the form store
      setNumberOfProgramsTried(selectedOption);
      markStepCompleted("/c/wm/number-of-programs-tried");
      
      // Navigate to the next step (date of birth in this case)
      router.push("/c/wm/submit");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar - Adjust the progress value as needed */}
      <ProgressBar progress={80} />

      <div className="max-w-lg w-full text-center mt-10">
        <h2 className="text-2xl font-semibold text-black mb-8">
          How many different weight loss programs have you tried in the past?
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