//src/app/c/wm/eating-patterns/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";

export default function EatingPatterns() {
  const router = useRouter();
  const { markStepCompleted, setEatingPatterns } = useWMFormStore();
  
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const options = [
    { id: "multitasking", label: "I'm usually multitasking when I eat" },
    { id: "stressed", label: "I tend to snack when I'm stressed" },
    { id: "comfort", label: "I turn to food for comfort" },
    { id: "reward", label: "I often reward myself with food" },
    { id: "social", label: "I center my social life around dining out" }
  ];

  const handleOptionSelect = (optionId: string) => {
    setSelectedOptions(prev => {
      // If already selected, remove it
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } 
      // Otherwise add it
      return [...prev, optionId];
    });
  };

  const handleContinue = () => {
    if (selectedOptions.length > 0) {
      // Store the selections in the form store
      setEatingPatterns(selectedOptions);
      markStepCompleted("/c/wm/eating-patterns");
      
      // Navigate to the next step
      router.push("/c/wm/eating-pattern-program-support");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={85} />

      <div className="max-w-lg w-full text-center mt-10">
        <h2 className="text-2xl font-semibold text-black mb-3">
          Which eating habit sounds most like you?
        </h2>
        
        <p className="text-gray-600 mb-8">
          We'll make sure your weight loss program includes support for this.
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