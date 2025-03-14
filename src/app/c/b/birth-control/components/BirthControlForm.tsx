//src/app/c/b/birth-control/components/BirthControlForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBCFormStore } from "@/store/bcFormStore";
import ProgressBar from "@/app/c/b/components/ProgressBar";
import { QuestionRenderer } from "./QuestionTypes";
import { birthControlQuestions, getProgressPercentage, checkEligibility } from "../data/questions";
import { FormResponse } from "../types";

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
    
    // Check for eligibility criteria after certain critical questions
    const eligibilityCheckQuestions = [
      'bc-type'
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