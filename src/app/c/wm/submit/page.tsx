// src/app/c/wm/submit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "../components/ProgressBar";
import { weightLossQuestions } from "../lose-weight/data/questions";

export default function SubmitPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const {
    responses,
    ineligibilityReason,
    markStepCompleted
  } = useWMFormStore();

  useEffect(() => {
    // Simulate loading time for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Format response values for display
  const formatResponseValue = (questionId: string, value: any): string => {
    if (value === null || value === undefined) return "Not provided";
    
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    
    if (typeof value === "object") {
      if (questionId === "contact-info") {
        const contactInfo = value as any;
        return `${contactInfo.firstName} ${contactInfo.lastName} (${contactInfo.email})`;
      }
      if (questionId === "height") {
        return `${value.feet}'${value.inches}"`;
      }
      return JSON.stringify(value);
    }
    
    // Find the question to get options for formatting
    const question = weightLossQuestions.find(q => q.id === questionId);
    if (!question || !('options' in question)) {
      return String(value);
    }
    
    const questionWithOptions = question as any;
    
    // Handle multi-select options
    if (Array.isArray(value)) {
      return value.map(optionId => {
        const option = questionWithOptions.options.find((opt: any) => opt.id === optionId);
        return option ? option.label : optionId;
      }).join(", ");
    }

    // For single-select questions
    const option = questionWithOptions.options.find((opt: any) => opt.id === value);
    return option ? option.label : value;
  };

  // Group questions by their sections for better organization
  const getSectionForQuestion = (questionId: string): string => {
    const sectionMap: Record<string, string> = {
      'age-group': 'Basic Demographics',
      'gender': 'Basic Demographics',
      'current-weight': 'Height, Weight & BMI',
      'height': 'Height, Weight & BMI',
      'pregnant': 'Pregnancy & Breastfeeding',
      'breastfeeding': 'Pregnancy & Breastfeeding',
      'medical-conditions': 'Medical History',
      'prescription-medications': 'Medical History',
      'eating-disorder': 'Medical History',
      'previous-weight-loss': 'Previous Weight Loss Attempts'
      // Removed all other sections that are no longer included
    };
    
    return sectionMap[questionId] || 'Other Information';
  };

  // Group questions by section
  const getGroupedQuestions = () => {
    const grouped: Record<string, any[]> = {};
    
    // Get questions that have responses
    const respondedQuestions = weightLossQuestions.filter(q => 
      responses[q.id] !== undefined
    );
    
    // Group by section
    respondedQuestions.forEach(question => {
      const section = getSectionForQuestion(question.id);
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(question);
    });
    
    return grouped;
  };

  // Handle the form submission
  const handleSubmit = async () => {
    setIsProcessing(true);
    
    try {
      // Mark this step as completed
      markStepCompleted("/c/wm/submit");
      
      // Store the responses for the results page
      sessionStorage.setItem("finalResponses", JSON.stringify(responses));
      
      // If we have an ineligibility reason, make sure it's also stored
      if (ineligibilityReason) {
        sessionStorage.setItem("ineligibilityReason", ineligibilityReason);
      }
      
      // Navigate to results page
      router.push("/c/wm/results");
    } catch (error) {
      // Handle error silently in production
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-black">Loading your responses...</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar - 100% complete */}
      <ProgressBar progress={100} />
      
      <h2 className="text-3xl font-semibold text-[#fe92b5] mt-8">
        Review Your Weight Loss Assessment
      </h2>
      
      <p className="text-xl font-medium text-black mt-3 mb-8">
        You've made it to the final step. Review your answers below and click submit to see your results.
      </p>

      {/* Review Section */}
      <div className="w-full max-w-4xl mx-auto bg-gray-50 rounded-lg p-6 mb-8 max-h-96 overflow-y-auto">
        <h3 className="text-xl font-semibold text-black mb-4">Your Responses:</h3>
        
        {Object.entries(getGroupedQuestions()).map(([section, questions]) => (
          <div key={section} className="mb-6">
            <h4 className="text-lg font-semibold text-[#fe92b5] mb-3 border-b border-gray-300 pb-1">
              {section}
            </h4>
            
            {questions.map((question) => (
              <div key={question.id} className="mb-3 pl-4">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {question.question}
                </div>
                <div className="text-sm text-gray-600 bg-white rounded px-3 py-2 border">
                  {formatResponseValue(question.id, responses[question.id])}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          className={`px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200 ${
            !isProcessing
              ? "bg-[#fe92b5] text-white hover:bg-[#e681a4] transform hover:scale-105"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isProcessing ? "Processing..." : "Submit & View Results"}
        </button>
      </div>
    </div>
  );
}