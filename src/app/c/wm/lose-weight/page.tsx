//src/app/c/wm/medical-intake/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";

// Define a type for the form data related to medical intake
interface MedicalFormData {
  [key: string]: any; // To allow for form data properties
}

// Define a type for question options
interface QuestionOption {
  id: string;
  label: string;
}

// Define a type for the medical questions
interface MedicalQuestion {
  question: string;
  description: string;
  options: QuestionOption[];
  multiSelect: boolean;
  isTextInput?: boolean;
  conditionalDisplay?: (formData: MedicalFormData) => boolean;
}

// Define the questions for each offset/screen
const medicalQuestions: MedicalQuestion[] = [
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
  // More questions can be added as needed
];

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      <p className="mt-4 text-lg">Loading...</p>
    </div>
  );
}

// Form component that uses searchParams
function MedicalIntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = "/c/wm/medical-intake";
  
  // Get the current offset from URL query parameters (default to 0)
  const offset = parseInt(searchParams?.get("offset") || "0");
  
  // Get states and actions from the store
  const { 
    formData,
    markStepCompleted,
    setStepOffset
  } = useWMFormStore();
  
  // Get the current question based on offset
  const currentQuestion = medicalQuestions[offset];
  
  // State for selected options
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  // State for text input (used for goal weight)
  const [textInput, setTextInput] = useState<string>("");

  // Calculate progress for the progress bar
  // Starting at 97% and incrementing slightly for each offset
  const maxOffsetCount = medicalQuestions.length - 1;
  const progressPercentage = 97 + Math.min(offset / maxOffsetCount * 3, 3);

  // Handle text input change (for goal weight)
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setTextInput(value);
  };

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

  // Store the current offset
  const storeResponses = () => {
    // Store the current offset
    setStepOffset(pathname, offset);
  };

  // Handle navigation to next screen
  const handleContinue = () => {
    // Store current screen's responses
    storeResponses();
    
    // If this is the last screen
    if (offset >= medicalQuestions.length - 1) {
      // Mark step as completed
      markStepCompleted(pathname);
      
      // Navigate to the next step in the flow
      router.push("/c/wm/submit");
    } else {
      // Navigate to the next offset
      router.push(`${pathname}?offset=${offset + 1}`);
    }
  };

  // Check if continue button should be enabled
  const isContinueEnabled = currentQuestion.isTextInput 
    ? textInput.trim() !== "" 
    : selectedOptions.length > 0;

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
        
        {/* Text input for goal weight */}
        {currentQuestion.isTextInput ? (
          <div className="mb-10">
            <input
              type="text"
              value={textInput}
              onChange={handleTextInputChange}
              placeholder="Enter weight in pounds"
              className="w-full p-6 text-lg rounded-lg border-2 border-gray-300 focus:border-[#fe92b5] focus:outline-none"
            />
          </div>
        ) : (
          /* Options - Taller, more prominent buttons */
          <div className="space-y-5 mb-10">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                className={`w-full p-6 text-left rounded-lg border-2 transition-colors ${
                  selectedOptions.includes(option.id)
                    ? "border-[#fe92b5] bg-gray-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <span className="text-lg">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* White gradient fade effect at bottom - enhanced density */}
      <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white to-transparent pointer-events-none" style={{ 
        backgroundImage: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.5) 70%, rgba(255,255,255,0) 100%)' 
      }}></div>

      {/* Fixed Button at Bottom */}
      <div className="fixed bottom-6 w-full flex justify-center z-10">
        <button
          onClick={handleContinue}
          disabled={!isContinueEnabled}
          className={`text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-lg ${
            isContinueEnabled ? "bg-black hover:bg-gray-900" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function MedicalIntakePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MedicalIntakeForm />
    </Suspense>
  );
}