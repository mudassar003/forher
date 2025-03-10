//src/app/c/wm/treatment-approach/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/app/c/wm/components/ProgressBar";
import { useWMFormStore } from "@/store/wmFormStore";

export default function TreatmentApproach() {
  const router = useRouter();
  const options = [
    { label: "Not Yet, I am looking for recommendation", value: "recommendation" },
    { label: "Yes I already have in mind", value: "specific" },
  ];

  // Get states and actions from the store
  const { 
    formData, 
    setTreatmentApproach, 
    markStepCompleted 
  } = useWMFormStore();

  // Use the value from the store, or default to first option
  const [selectedApproach, setSelectedApproach] = useState<string>(
    formData.treatmentApproach || options[0].value
  );

  // Update local state when store changes
  useEffect(() => {
    if (formData.treatmentApproach) {
      setSelectedApproach(formData.treatmentApproach);
    }
  }, [formData.treatmentApproach]);

  // Update store when selection changes
  useEffect(() => {
    setTreatmentApproach(selectedApproach);
  }, [selectedApproach, setTreatmentApproach]);

  const nextStep = () => {
    // Mark this step as completed
    markStepCompleted("/c/wm/treatment-approach");
    
    // Navigate to next step
    router.push("/c/wm/treatment-paths");
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={70} /> 

      {/* Centered Content */}
      <div className="max-w-lg text-center mt-10">
        {/* Custom Logo Text */}
        <h1 className="text-3xl font-bold text-[#fe92b5]">Direct2Her</h1>

        {/* Main Question */}
        <h2 className="text-2xl font-semibold text-black mt-3">Do you have a specific weight loss medication in mind?</h2>

        {/* Selection Options */}
        <div className="mt-6 space-y-4">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedApproach(option.value)}
              className={`w-full p-4 border-2 rounded-lg text-lg font-medium transition-all duration-200
                ${selectedApproach === option.value ? "border-[#fe92b5] bg-gray-100" : "border-gray-300 bg-white hover:bg-gray-100"}`}
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