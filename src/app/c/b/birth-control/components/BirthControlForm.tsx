//src/app/c/b/birth-control/components/BirthControlForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBCFormStore } from "@/store/bcFormStore";
import ProgressBar from "@/app/c/b/components/ProgressBar";
import { QuestionRenderer } from "./QuestionTypes";
import { birthControlQuestions, getProgressPercentage, checkEligibility } from "../data/questions";
import { FormResponse, QuestionType } from "../types";

export default function BirthControlForm() {
  const router = useRouter();
  const pathname = "/c/b/birth-control";
  
  // Get the current offset from URL directly instead of using useSearchParams hook
  const [offset, setOffset] = useState(1); // Default to 1
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [ineligibilityReason, setIneligibilityReason] = useState<string | null>(null);
  
  // Use an effect to get the search params (safely in browser environment)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get offset from URL
      const searchParams = new URL(window.location.href).searchParams;
      const urlOffset = parseInt(searchParams.get("offset") || "1");
      setOffset(urlOffset);
    }
  }, []);
  
  // Get states and actions from the store
  const {
    formData,
    markStepCompleted,
    setStepOffset
  } = useBCFormStore();
  
  // Form state for responses
  const [responses, setResponses] = useState<FormResponse>({});
  
  // Filter questions based on conditional display
  const filteredQuestions = birthControlQuestions.filter(question => {
    if (!question.conditionalDisplay) return true;
    return question.conditionalDisplay(responses);
  });
  
  // Get the current question based on offset
  const currentQuestionIndex = offset - 1; // Adjust for 0-based array index
  const currentQuestion = filteredQuestions[currentQuestionIndex];
  
  // Progress percentage
  const progressPercentage = getProgressPercentage(offset);
  
  // Check if we have a valid question for this offset
  useEffect(() => {
    if (typeof window !== 'undefined' && !currentQuestion && offset > 0) {
      // Handle case where offset is invalid
      router.push(`${pathname}?offset=1`);
    }
  }, [currentQuestion, offset, router, pathname]);
  
  // Load stored responses on mount
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      try {
        const storedResponses = sessionStorage.getItem("birthControlResponses");
        if (storedResponses) {
          setResponses(JSON.parse(storedResponses));
        }
      } catch (error) {
        console.error("Error loading stored responses:", error);
      }
    }
  }, []);
  
  // Handle response change
  const handleResponseChange = (value: any) => {
    if (!currentQuestion) return;
    
    const updatedResponses = {
      ...responses,
      [currentQuestion.id]: value
    };
    
    setResponses(updatedResponses);
    
    // Check for eligibility after any critical questions
    const eligibilityCheckQuestions = [
      'age',
      'gender',
      'pregnant',
      'breastfeeding',
      'medical-conditions',
      'eating-disorder',
      'blood-clots',
      'doctor-consult'
    ];
    
    if (eligibilityCheckQuestions.includes(currentQuestion.id)) {
      const eligibility = checkEligibility(updatedResponses);
      
      if (!eligibility.eligible) {
        setIneligibilityReason(eligibility.reason);
      } else {
        setIneligibilityReason(null);
      }
    }
  };
  
  // Store the current responses
  const storeResponses = () => {
    if (typeof window !== 'undefined') {
      // Store the current offset
      setStepOffset(pathname, offset);
      
      // Store responses in sessionStorage
      try {
        sessionStorage.setItem("birthControlResponses", JSON.stringify(responses));
      } catch (error) {
        console.error("Error storing responses:", error);
      }
    }
  };
  
  // Handle navigation to next screen
  const handleContinue = () => {
    if (typeof window === 'undefined') return;
    
    // Store current screen's responses
    storeResponses();
    
    // If user is ineligible, redirect to a dedicated ineligible page
    if (ineligibilityReason) {
      // Store the ineligibility reason for the results page
      sessionStorage.setItem("ineligibilityReason", ineligibilityReason);
      
      // Mark step as completed
      markStepCompleted(pathname);
      
      // Set transitioning state
      setIsTransitioning(true);
      
      // Navigate to the results page directly
      window.location.href = "/c/b/submit";
      return;
    }
    
    // If this is the last screen
    if (currentQuestionIndex >= filteredQuestions.length - 1) {
      // Mark step as completed
      markStepCompleted(pathname);
      
      // Set transitioning state (will be reset when the new page loads)
      setIsTransitioning(true);
      
      // Navigate to the next step in the flow
      window.location.href = "/c/b/submit";
    } else {
      // For within-form navigation, do it without a full page refresh
      // First update the URL using history API
      const nextOffset = offset + 1;
      const nextUrl = `${pathname}?offset=${nextOffset}`;
      window.history.pushState({}, '', nextUrl);
      
      // Then update the offset state to show the next question
      setOffset(nextOffset);
    }
  };
  
  // Check if continue button should be enabled
  const isContinueEnabled = () => {
    if (!currentQuestion) return false;
    
    const response = responses[currentQuestion.id];
    
    if (response === undefined) return false;
    
    switch (currentQuestion.type) {
      case QuestionType.SingleSelect:
        return typeof response === "string" && response !== "";
      case QuestionType.MultiSelect:
        return Array.isArray(response) && response.length > 0;
      case QuestionType.TextInput:
        return typeof response === "string" && response.trim() !== "";
      default:
        return false;
    }
  };
  
  // When URL changes via browser back/forward buttons, update the offset
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handlePopState = () => {
        const searchParams = new URL(window.location.href).searchParams;
        const urlOffset = parseInt(searchParams.get("offset") || "1");
        setOffset(urlOffset);
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  // If no currentQuestion is available yet, show loading instead of error
  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    );
  }

  if (isTransitioning) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
        <p className="mt-4 text-lg">Analyzing your responses...</p>
      </div>
    );
  }

  // Get step number for display (grouping related questions into steps)
  const getStepNumber = (): number => {
    if (!currentQuestion) return 1;
    
    const stepMap: Record<string, number> = {
      // Step 1: Basic Demographics
      'age': 1,
      'gender': 1,
      
      // Step 2: Pregnancy & Breastfeeding
      'pregnant': 2,
      'breastfeeding': 2,
      
      // Step 3: Medical History
      'medical-conditions': 3,
      'medications': 3,
      'medication-specify': 3,
      'eating-disorder': 3,
      
      // Step 4: Birth Control History
      'bc-history': 4,
      'blood-clots': 4,
      'daily-pill': 4,
      
      // Step 5: Sexual Health & Libido
      'libido-decrease': 5,
      'stress-impact': 5,
      'natural-support': 5,
      'herbal-allergies': 5,
      
      // Step 6: Lifestyle & Preferences
      'smoking': 6,
      'regular-cycle': 6,
      'overall-wellbeing': 6,
      'daily-supplements': 6,
      
      // Step 7: Medical Eligibility Confirmation
      'doctor-consult': 7,
      
      // Step 8: Product Preference
      'non-prescription': 8,
      'hormonal-bc': 8
    };
    
    return stepMap[currentQuestion.id] || 1;
  };

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={progressPercentage} />

      <div className="w-full max-w-2xl mt-16 mb-24">
        {/* Current Step Indicator */}
        <div className="mb-4 text-[#fe92b5] font-medium">
          Step {getStepNumber()} of 8
        </div>
        
        {/* Question - Left-aligned, larger text */}
        <h2 className="text-4xl font-semibold text-black mb-10 text-left">
          {currentQuestion.question}
        </h2>
        
        {currentQuestion.description && (
          <p className="text-gray-600 mb-8 text-left text-lg">
            {currentQuestion.description}
          </p>
        )}
        
        {/* Display ineligibility warning if applicable */}
        {ineligibilityReason && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
            <p className="font-medium text-red-700">Eligibility Notice:</p>
            <p className="text-red-600">{ineligibilityReason}</p>
            <p className="text-sm mt-2 text-gray-600">
              You can continue with the assessment, but based on your responses,
              our products may not be suitable for you.
            </p>
          </div>
        )}
        
        {/* Render the appropriate question component */}
        <QuestionRenderer
          question={currentQuestion}
          value={responses[currentQuestion.id]}
          onChange={handleResponseChange}
        />
      </div>

      {/* White gradient fade effect at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white to-transparent pointer-events-none" style={{
        backgroundImage: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.5) 70%, rgba(255,255,255,0) 100%)'
      }}></div>

      {/* Fixed Button at Bottom */}
      <div className="fixed bottom-6 w-full flex justify-center z-10">
        <button
          onClick={handleContinue}
          disabled={!isContinueEnabled() || isTransitioning}
          className={`text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-2xl ${isContinueEnabled() && !isTransitioning ? "bg-black hover:bg-gray-900" : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          {ineligibilityReason ? "Continue to Results" : "Continue"}
        </button>
      </div>
    </div>
  );
}