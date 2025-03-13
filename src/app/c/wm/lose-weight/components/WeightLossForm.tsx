//src/app/c/wm/lose-weight/components/WeightLossForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";
import { QuestionRenderer } from "./QuestionTypes";
import { weightLossQuestions, getProgressPercentage } from "../data/questions";
import { FormResponse } from "../types";

export default function WeightLossForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = "/c/wm/lose-weight";
  
  // Get the current offset from URL query parameters (default to 1)
  const offset = parseInt(searchParams?.get("offset") || "1");
  
  // Get states and actions from the store
  const { 
    formData,
    markStepCompleted,
    setStepOffset
  } = useWMFormStore();
  
  // Get the current question based on offset
  const currentQuestionIndex = offset - 1; // Adjust for 0-based array index
  const currentQuestion = weightLossQuestions[currentQuestionIndex];
  
  // Form state for responses
  const [responses, setResponses] = useState<FormResponse>({});
  
  // Progress percentage
  const progressPercentage = getProgressPercentage(offset);
  
  // Check if we have a valid question for this offset
  if (!currentQuestion) {
    // Handle case where offset is invalid
    useEffect(() => {
      router.push(`${pathname}?offset=1`);
    }, [router, pathname]);
    return null;
  }
  
  // Handle response change
  const handleResponseChange = (value: any) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };
  
  // Store the current responses
  const storeResponses = () => {
    // Store the current offset
    setStepOffset(pathname, offset);
    
    // Store responses in sessionStorage for now
    // In a real app, you'd store this in your global store
    const sessionResponses = { ...responses };
    sessionStorage.setItem("weightLossResponses", JSON.stringify(sessionResponses));
  };
  
  // Handle navigation to next screen
  const handleContinue = () => {
    // Store current screen's responses
    storeResponses();
    
    // If this is the last screen
    if (currentQuestionIndex >= weightLossQuestions.length - 1) {
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
  const isContinueEnabled = () => {
    const response = responses[currentQuestion.id];
    
    if (response === undefined) return false;
    
    switch (currentQuestion.type) {
      case "single-select":
        return typeof response === "string" && response !== "";
      case "multi-select":
        return Array.isArray(response) && response.length > 0;
      case "text-input":
        return typeof response === "string" && response.trim() !== "";
      default:
        return false;
    }
  };
  
  // Load stored responses on mount
  useEffect(() => {
    try {
      const storedResponses = sessionStorage.getItem("weightLossResponses");
      if (storedResponses) {
        setResponses(JSON.parse(storedResponses));
      }
    } catch (error) {
      console.error("Error loading stored responses:", error);
    }
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={progressPercentage} />

      <div className="w-full max-w-2xl mt-16 mb-24">
        {/* Question - Left-aligned, larger text */}
        <h2 className="text-4xl font-semibold text-black mb-10 text-left">
          {currentQuestion.question}
        </h2>
        
        {currentQuestion.description && (
          <p className="text-gray-600 mb-8 text-left text-lg">
            {currentQuestion.description}
          </p>
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
          disabled={!isContinueEnabled()}
          className={`text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-2xl ${
            isContinueEnabled() ? "bg-black hover:bg-gray-900" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}