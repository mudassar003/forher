//src/app/c/wm/lose-weight/components/WeightLossForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";
import { QuestionRenderer } from "./QuestionTypes";
import { weightLossQuestions, getProgressPercentage } from "../data/questions";
import { FormResponse } from "../types";

export default function WeightLossForm() {
  const router = useRouter();
  const pathname = "/c/wm/lose-weight";
  
  // Get the current offset from URL directly instead of using useSearchParams hook
  const [offset, setOffset] = useState(1); // Default to 1
  const [isTransitioning, setIsTransitioning] = useState(false);
  
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
  } = useWMFormStore();
  
  // Get the current question based on offset
  const currentQuestionIndex = offset - 1; // Adjust for 0-based array index
  const currentQuestion = weightLossQuestions[currentQuestionIndex];
  
  // Form state for responses
  const [responses, setResponses] = useState<FormResponse>({});
  
  // Progress percentage
  const progressPercentage = getProgressPercentage(offset);
  
  // Check if we have a valid question for this offset
  useEffect(() => {
    if (typeof window !== 'undefined' && !currentQuestion && offset > 0) {
      // Handle case where offset is invalid
      router.push(`${pathname}?offset=1`);
    }
  }, [currentQuestion, offset, router, pathname]);
  
  // Handle response change
  const handleResponseChange = (value: any) => {
    if (!currentQuestion) return;
    
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };
  
  // Store the current responses
  const storeResponses = () => {
    if (typeof window !== 'undefined') {
      // Store the current offset
      setStepOffset(pathname, offset);
      
      // Store responses in sessionStorage for now
      const sessionResponses = { ...responses };
      try {
        sessionStorage.setItem("weightLossResponses", JSON.stringify(sessionResponses));
      } catch (error) {
        console.error("Error storing responses:", error);
      }
    }
  };
  
  // Pre-load the next question data to prepare for quick transition
  const preloadNextQuestion = () => {
    if (currentQuestionIndex >= weightLossQuestions.length - 1) {
      // No next question to preload
      return;
    }
    
    // Preload the next question's content here if needed
    // This is just a placeholder for potential preloading logic
  };
  
  // Handle navigation to next screen using history.pushState for smoother transitions
  const handleContinue = () => {
    if (typeof window === 'undefined') return;
    
    // Store current screen's responses
    storeResponses();
    
    // If this is the last screen
    if (currentQuestionIndex >= weightLossQuestions.length - 1) {
      // Mark step as completed
      markStepCompleted(pathname);
      
      // Set transitioning state (will be reset when the new page loads)
      setIsTransitioning(true);
      
      // Navigate to the next step in the flow
      // Use window.location for cross-page navigation but avoid reloading for within-form navigation
      window.location.href = "/c/wm/submit";
    } else {
      // For within-form navigation, do it without a full page refresh
      // First update the URL using history API
      const nextOffset = offset + 1;
      const nextUrl = `${pathname}?offset=${nextOffset}`;
      window.history.pushState({}, '', nextUrl);
      
      // Then update the offset state to show the next question
      setOffset(nextOffset);
      
      // Optionally run any animations or transitions here
      // This keeps the same component instance and avoids a full reload
    }
  };
  
  // Check if continue button should be enabled
  const isContinueEnabled = () => {
    if (!currentQuestion) return false;
    
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
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      try {
        const storedResponses = sessionStorage.getItem("weightLossResponses");
        if (storedResponses) {
          setResponses(JSON.parse(storedResponses));
        }
      } catch (error) {
        console.error("Error loading stored responses:", error);
      }
    }
  }, []);

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

  // Preload next question when the current one is displayed
  useEffect(() => {
    preloadNextQuestion();
  }, [offset]);

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
        <p className="mt-4 text-lg">Navigating to next step...</p>
      </div>
    );
  }

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
          disabled={!isContinueEnabled() || isTransitioning}
          className={`text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-2xl ${
            isContinueEnabled() && !isTransitioning ? "bg-black hover:bg-gray-900" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}