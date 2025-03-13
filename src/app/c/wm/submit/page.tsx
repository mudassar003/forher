//src/app/c/wm/submit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";
import { weightLossQuestions } from "../lose-weight/data/questions";
import { FormResponse } from "../lose-weight/types";

export default function SubmitStep() {
  const router = useRouter();
  const { markStepCompleted } = useWMFormStore();
  const [responses, setResponses] = useState<FormResponse>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load responses from sessionStorage on component mount
  useEffect(() => {
    try {
      const storedResponses = sessionStorage.getItem("weightLossResponses");
      if (storedResponses) {
        setResponses(JSON.parse(storedResponses));
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading stored responses:", error);
      setIsLoading(false);
    }
  }, []);

  // Gets the label for a given option ID for a specific question
  const getOptionLabel = (questionId: string, optionId: string | string[]) => {
    const question = weightLossQuestions.find(q => q.id === questionId);
    if (!question || !question.options) return "Not specified";

    // For multi-select questions
    if (Array.isArray(optionId)) {
      return optionId.map(id => {
        const option = question.options.find(opt => opt.id === id);
        return option ? option.label : id;
      }).join(", ");
    }

    // For single-select questions
    const option = question.options.find(opt => opt.id === optionId);
    return option ? option.label : optionId;
  };

  // Handle the form submission
  const handleSubmit = () => {
    // Mark this step as completed
    markStepCompleted("/c/wm/submit");
    
    // Here you would typically send the data to your backend
    console.log("Form submitted with responses:", responses);

    // You could call an API endpoint here
    // Example: await fetch('/api/submit-wm-form', { method: 'POST', body: JSON.stringify(responses) });
    
    // After submission, redirect to the homepage or a success page
    router.push("/");
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
          className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-2xl hover:bg-gray-900"
        >
          Submit & Get Recommendations
        </button>
      </div>

      {/* White gradient fade effect at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white to-transparent pointer-events-none" style={{ 
        backgroundImage: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.5) 70%, rgba(255,255,255,0) 100%)' 
      }}></div>
    </div>
  );
}