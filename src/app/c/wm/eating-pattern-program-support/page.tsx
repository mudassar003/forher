//src/app/c/wm/eating-pattern-program-support/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";

export default function ProgramSupport() {
  const router = useRouter();
  const { markStepCompleted, setProgramSupport } = useWMFormStore();
  
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const options = [
    { id: "nutrition", label: "Realistic nutrition plan" },
    { id: "movement", label: "Movement that works for you" },
    { id: "sleep", label: "Getting better sleep" },
    { id: "habits", label: "Building healthier habits" },
    { id: "all", label: "All of the above" }
  ];

  // Handle "All of the above" special case
  useEffect(() => {
    if (selectedOptions.includes("all")) {
      // If "all" is selected, select all options
      const allOptionsExceptAll = options
        .filter(option => option.id !== "all")
        .map(option => option.id);
      
      setSelectedOptions(["all", ...allOptionsExceptAll]);
    }
  }, [selectedOptions]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOptions(prev => {
      // Special handling for "All of the above"
      if (optionId === "all") {
        // If "all" is already selected, unselect it
        if (prev.includes("all")) {
          return [];
        }
        // Otherwise select all options
        const allOptionsIds = options.map(option => option.id);
        return allOptionsIds;
      }
      
      // For other options
      // If already selected, remove it
      if (prev.includes(optionId)) {
        const newSelection = prev.filter(id => id !== optionId);
        // If we're removing an option and "all" was selected, remove "all" too
        if (prev.includes("all")) {
          return newSelection.filter(id => id !== "all");
        }
        return newSelection;
      } 
      
      // Otherwise add it
      return [...prev, optionId];
    });
  };

  const handleContinue = () => {
    if (selectedOptions.length > 0) {
      // Store the selections in the form store
      setProgramSupport(selectedOptions);
      markStepCompleted("/c/wm/eating-pattern-program-support");
      
      // Navigate to the next step
      router.push("/c/wm/eating-pattern-goal");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={90} />

      <div className="max-w-lg w-full text-center mt-10">
        <h2 className="text-2xl font-semibold text-black mb-3">
          Any additional areas you'd like your program to focus on?
        </h2>
        
        <p className="text-gray-600 mb-8">
          Healthy lifestyle changes are key to maintaining results. Your program will include support for all of these areas.
        </p>
        
        {/* Options - Multiple selection allowed */}
        <div className="space-y-4 mb-10">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                selectedOptions.includes(option.id)
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
          disabled={selectedOptions.length === 0}
          className={`text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-lg ${
            selectedOptions.length > 0 ? "bg-black" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}