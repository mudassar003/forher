// src/app/c/wm/submit/page.tsx (fixed version)
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";
import { weightLossQuestions } from "../lose-weight/data/questions";
import { 
  FormResponse, 
  QuestionType, 
  SingleSelectQuestion, 
  MultiSelectQuestion 
} from "../lose-weight/types";

export default function SubmitStep() {
  const router = useRouter();
  const { markStepCompleted } = useWMFormStore();
  const [responses, setResponses] = useState<FormResponse>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load responses from sessionStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        console.log("Attempting to load responses from sessionStorage");
        const storedResponses = sessionStorage.getItem("weightLossResponses");
        console.log("Raw stored responses:", storedResponses);
        
        if (storedResponses) {
          const parsedResponses = JSON.parse(storedResponses);
          console.log("Parsed responses:", parsedResponses);
          setResponses(parsedResponses);
        } else {
          console.log("No responses found in sessionStorage");
        }
      } catch (error) {
        console.error("Error loading stored responses:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  // Gets the label for a given option ID for a specific question
  const getOptionLabel = (questionId: string, optionId: string | string[]) => {
    const question = weightLossQuestions.find(q => q.id === questionId);
    if (!question) return "Not specified";

    // Check if the question type has options (single-select or multi-select)
    if (question.type === QuestionType.TextInput) {
      return typeof optionId === 'string' ? optionId : optionId.join(', ');
    }

    // Now TypeScript knows this question has options
    const questionWithOptions = question as SingleSelectQuestion | MultiSelectQuestion;

    // For multi-select questions
    if (Array.isArray(optionId)) {
      return optionId.map(id => {
        const option = questionWithOptions.options.find(opt => opt.id === id);
        return option ? option.label : id;
      }).join(", ");
    }

    // For single-select questions
    const option = questionWithOptions.options.find(opt => opt.id === optionId);
    return option ? option.label : optionId;
  };

  // Handle the form submission
  const handleSubmit = async () => {
    setIsProcessing(true);
    
    try {
      // Mark this step as completed
      markStepCompleted("/c/wm/submit");
      
      // In a real implementation, you would send the data to your API here
      console.log("Sending data to API:", responses);
      
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store the responses for the results page
      sessionStorage.setItem("finalResponses", JSON.stringify(responses));
      
      // Navigate to results page
      router.push("/c/wm/results");
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
        <p className="mt-4 text-lg">Loading your responses...</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar - 100% complete */}
      <ProgressBar progress={100} />
      
      <h2 className="text-3xl font-semibold text-[#fe92b5] mt-8">
        Review Your Weight Loss Journey
      </h2>
      
      <p className="text-xl font-medium text-black mt-3 mb-8">
        You've made it to the final step. Please review your selections before submitting.
      </p>

      {/* Summary of selections */}
      <div className="mt-4 w-full max-w-2xl mb-24">
        <p className="text-lg font-semibold mb-4">Summary of your selections:</p>
        
        {Object.keys(responses).length === 0 ? (
          <p className="text-gray-500 italic">No responses found. You may need to complete the questionnaire.</p>
        ) : (
          <ul className="space-y-3 text-left">
            {weightLossQuestions.map((question) => {
              const response = responses[question.id];
              if (response === undefined) return null;

              return (
                <li key={question.id} className="p-4 bg-gray-100 rounded-lg">
                  <p className="font-medium">{question.question}</p>
                  <p className="mt-1 text-gray-700">
                    {Array.isArray(response) 
                      ? getOptionLabel(question.id, response)
                      : getOptionLabel(question.id, response as string)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Fixed Button at Bottom */}
      <div className="fixed bottom-6 w-full flex justify-center z-10">
        <button
          onClick={handleSubmit}
          disabled={isProcessing || Object.keys(responses).length === 0}
          className={`text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-2xl ${
            isProcessing || Object.keys(responses).length === 0 
              ? "bg-gray-400 text-white cursor-not-allowed" 
              : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          {isProcessing ? "Processing..." : "Submit & Get Recommendations"}
        </button>
      </div>

      {/* White gradient fade effect at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white to-transparent pointer-events-none" style={{ 
        backgroundImage: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.5) 70%, rgba(255,255,255,0) 100%)' 
      }}></div>
    </div>
  );
}