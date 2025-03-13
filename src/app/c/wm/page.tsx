//src/app/wm/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";
import { useEffect, useState } from "react";
import { weightLossQuestions } from "../lose-weight/data/questions";
import { FormResponse } from "../lose-weight/types";

export default function SubmitStep() {
  const router = useRouter();
  const [responses, setResponses] = useState<FormResponse>({});
  
  // Get form data from the store
  const { markStepCompleted, resetForm } = useWMFormStore();

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

  // Get human-readable answer for a question
  const getAnswerText = (questionId: string): string => {
    const answer = responses[questionId];
    if (!answer) return "Not specified";
    
    // Find the question
    const question = weightLossQuestions.find(q => q.id === questionId);
    if (!question) return String(answer);
    
    // Handle different question types
    switch (question.type) {
      case "single-select": {
        const selectedOption = question.options.find(opt => opt.id === answer);
        return selectedOption ? selectedOption.label : String(answer);
      }
      case "multi-select": {
        if (!Array.isArray(answer)) return String(answer);
        
        return answer.map(optionId => {
          const option = question.options.find(opt => opt.id === optionId);
          return option ? option.label : optionId;
        }).join(", ");
      }
      default:
        return String(answer);
    }
  };

  // Handle the form submission
  const handleSubmit = () => {
    // Mark this step as completed
    markStepCompleted("/c/wm/submit");
    
    // Here you would typically send the data to your backend
    console.log("Form submitted with data:", responses);

    // You could call an API endpoint here
    // Example: await fetch('/api/submit-wm-form', { method: 'POST', body: JSON.stringify(responses) });
    
    // Reset the form after successful submission (optional)
    // resetForm();
    // sessionStorage.removeItem("weightLossResponses");
    
    // After submission, redirect to the homepage or a success page
    router.push("/"); 
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar - 100% complete */}
      <ProgressBar progress={100} />
      
      <h2 className="text-4xl font-semibold text-[#fe92b5] mb-6">
        Review Your Weight Loss Journey
      </h2>
      
      <p className="text-2xl font-medium text-black mb-10">
        You've made it to the final step. Please review your selections before submitting.
      </p>

      {/* Summary of selections */}
      <div className="w-full max-w-2xl mb-24">
        <p className="text-xl font-semibold mb-6">Summary of your selections:</p>
        <ul className="space-y-4 text-left">
          {weightLossQuestions.map(question => (
            <li key={question.id} className="p-5 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-medium text-lg text-gray-800 mb-2">{question.question}</p>
              <p className="text-black">{getAnswerText(question.id)}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* White gradient fade effect at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white to-transparent pointer-events-none" style={{ 
        backgroundImage: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.5) 70%, rgba(255,255,255,0) 100%)' 
      }}></div>

      {/* Fixed Button at Bottom */}
      <div className="fixed bottom-6 w-full flex justify-center z-10">
        <button
          onClick={handleSubmit}
          className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-2xl hover:bg-gray-900"
        >
          Submit
        </button>
      </div>
    </div>
  );
}