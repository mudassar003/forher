//src/app/c/wm/medical-intake/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";

// Define the questions for each offset/screen
const medicalQuestions = [
  // offset 0
  {
    question: "How would you describe your ethnicity?",
    description: "We ask this to better tailor treatment options to you. Please select all that apply.",
    options: [
      { id: "asian", label: "Asian" },
      { id: "south-asian", label: "South Asian" },
      { id: "black", label: "Black or African American" },
      { id: "hispanic", label: "Hispanic or Latino" },
      { id: "native-american", label: "Native American" },
      { id: "pacific-islander", label: "Pacific Islander" },
      { id: "white", label: "White or Caucasian" },
      { id: "other", label: "Other" },
      { id: "prefer-not-to-answer", label: "I prefer not to answer" }
    ],
    multiSelect: true
  },
  // offset 1
  {
    question: "What was your sex assigned at birth?",
    description: "",
    options: [
      { id: "female", label: "Female" },
      { id: "male", label: "Male" }
    ],
    multiSelect: false
  },
  // offset 2
  {
    question: "Do you have any of the following medical conditions?",
    description: "Select all that apply",
    options: [
      { id: "diabetes", label: "Diabetes" },
      { id: "hypertension", label: "Hypertension (High blood pressure)" },
      { id: "heart-disease", label: "Heart disease" },
      { id: "thyroid", label: "Thyroid disorder" },
      { id: "none", label: "None of the above" }
    ],
    multiSelect: true
  },
  // offset 3
  {
    question: "Are you currently taking any medications?",
    description: "This helps us ensure any treatment is safe for you",
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ],
    multiSelect: false
  },
  // offset 4
  {
    question: "Have you had any allergic reactions to medications?",
    description: "Select all that apply",
    options: [
      { id: "antibiotics", label: "Antibiotics" },
      { id: "nsaids", label: "NSAIDs (like aspirin, ibuprofen)" },
      { id: "other", label: "Other medications" },
      { id: "none", label: "No known medication allergies" }
    ],
    multiSelect: true
  }
];

export default function MedicalIntakePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { markStepCompleted, setEthnicity, setSexAssignedAtBirth, setMedicalConditions, setTakingMedications, setMedicationAllergies } = useWMFormStore();
  
  // Get the current offset from URL query parameters (default to 0)
  const offset = parseInt(searchParams?.get("offset") || "0");
  
  // Get the current question based on offset
  const currentQuestion = medicalQuestions[offset];
  
  // State for selected options
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Calculate progress for the progress bar
  // Starting at 97% and incrementing slightly for each offset
  const progressPercentage = 97 + Math.min(offset, 4);

  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    if (currentQuestion.multiSelect) {
      // Special handling for "I prefer not to answer" option in ethnicity question
      if (offset === 0 && optionId === "prefer-not-to-answer") {
        setSelectedOptions(["prefer-not-to-answer"]);
        return;
      }
      
      // If selecting an ethnicity option but "prefer not to answer" is selected, remove it
      if (offset === 0 && selectedOptions.includes("prefer-not-to-answer") && optionId !== "prefer-not-to-answer") {
        setSelectedOptions([optionId]);
        return;
      }
      
      // For "None" option in medical conditions, clear other selections
      if (optionId === "none" && offset === 1) {
        setSelectedOptions(["none"]);
        return;
      }
      
      // If selecting an option other than "None", remove "None" from selections
      if (selectedOptions.includes("none") && offset === 1) {
        setSelectedOptions([optionId]);
        return;
      }
      
      // Regular multi-select handling
      setSelectedOptions(prev => {
        // If already selected, remove it
        if (prev.includes(optionId)) {
          return prev.filter(id => id !== optionId);
        } 
        // Otherwise add it
        return [...prev, optionId];
      });
    } else {
      // Single select - just set the option
      setSelectedOptions([optionId]);
    }
  };

  // Store responses based on current offset
  const storeResponses = () => {
    switch(offset) {
      case 0:
        // Store ethnicity information
        useWMFormStore.getState().setEthnicity(selectedOptions);
        break;
      case 1:
        // Store sex assigned at birth
        useWMFormStore.getState().setSexAssignedAtBirth(selectedOptions[0] || "");
        break;
      case 2:
        setMedicalConditions(selectedOptions);
        break;
      case 3:
        setTakingMedications(selectedOptions[0] || "no");
        break;
      case 4:
        setMedicationAllergies(selectedOptions);
        break;
    }
  };

  // Handle navigation to next screen
  const handleContinue = () => {
    // Store current screen's responses
    storeResponses();
    
    // If this is the last screen
    if (offset >= medicalQuestions.length - 1) {
      // Mark step as completed
      markStepCompleted("/c/wm/medical-intake");
      
      // Navigate to the next step in the flow
      router.push("/c/wm/submit");
    } else {
      // Navigate to the next offset
      router.push(`/c/wm/medical-intake?offset=${offset + 1}`);
    }
  };

  // Reset selected options when offset changes
  useEffect(() => {
    setSelectedOptions([]);
  }, [offset]);

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={progressPercentage} />

      <div className="w-full max-w-lg mt-16 mb-24">
        {/* Question - Left-aligned, larger text */}
        <h2 className="text-3xl font-semibold text-black mb-8 text-left">
          {currentQuestion.question}
        </h2>
        
        {currentQuestion.description && (
          <p className="text-gray-600 mb-8 text-left">
            {currentQuestion.description}
          </p>
        )}
        
        {/* Options - Taller, more prominent buttons */}
        <div className="space-y-5 mb-10">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`w-full p-6 text-left rounded-lg border-2 transition-colors ${
                selectedOptions.includes(option.id)
                  ? "border-[#3D7D6C] bg-gray-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <span className="text-lg">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* White gradient fade effect at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>

      {/* Fixed Button at Bottom */}
      <div className="fixed bottom-6 w-full flex justify-center z-10">
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