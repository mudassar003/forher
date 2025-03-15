// src/app/c/mh/submit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMHFormStore } from "@/store/mhFormStore";
import ProgressBar from "@/app/c/mh/components/ProgressBar";
import { anxietyQuestions, checkEligibility, assessAnxietySeverity } from "../anxiety/data/questions";
import { 
  FormResponse, 
  QuestionType, 
  SingleSelectQuestion, 
  MultiSelectQuestion 
} from "../anxiety/types";

export default function SubmitStep() {
  const router = useRouter();
  const { markStepCompleted } = useMHFormStore();
  const [responses, setResponses] = useState<FormResponse>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ineligibilityReason, setIneligibilityReason] = useState<string | null>(null);
  const [anxietySeverity, setAnxietySeverity] = useState<string | null>(null);

  // Load responses from sessionStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Check if there's an ineligibility reason stored
        const storedIneligibilityReason = sessionStorage.getItem("ineligibilityReason");
        if (storedIneligibilityReason) {
          setIneligibilityReason(storedIneligibilityReason);
        }
        
        // Load responses
        const storedResponses = sessionStorage.getItem("anxietyResponses");
        if (storedResponses) {
          const parsedResponses = JSON.parse(storedResponses);
          setResponses(parsedResponses);
          
          // Calculate anxiety severity based on responses
          const severity = assessAnxietySeverity(parsedResponses);
          setAnxietySeverity(severity);
          
          // Check eligibility based on all responses
          const eligibility = checkEligibility(parsedResponses);
          if (!eligibility.eligible && !storedIneligibilityReason) {
            setIneligibilityReason(eligibility.reason);
          }
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
    const question = anxietyQuestions.find(q => q.id === questionId);
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

  // Group questions by their sections for better organization
  const getSectionForQuestion = (questionId: string): string => {
    const sectionMap: Record<string, string> = {
      'age-group': 'Basic Demographics',
      'gender': 'Basic Demographics',
      'anxiety-symptoms': 'Symptoms & Severity',
      'symptom-duration': 'Symptoms & Severity',
      'symptom-severity': 'Symptoms & Severity',
      'daily-impact': 'Impact Assessment',
      'triggers': 'Impact Assessment',
      'medical-history': 'Medical History',
      'current-medications': 'Medical History',
      'medication-list': 'Medical History',
      'diagnosed-conditions': 'Medical History',
      'previous-treatment': 'Previous Treatment',
      'treatment-effectiveness': 'Previous Treatment',
      'sleep-quality': 'Lifestyle Factors',
      'stress-levels': 'Lifestyle Factors',
      'alcohol-consumption': 'Lifestyle Factors',
      'caffeine-consumption': 'Lifestyle Factors',
      'exercise-frequency': 'Lifestyle Factors',
      'treatment-preferences': 'Treatment Preferences',
      'medication-openness': 'Treatment Preferences',
      'therapy-preference': 'Treatment Preferences'
    };
    
    return sectionMap[questionId] || 'Other Information';
  };

  // Group questions by section
  const getGroupedQuestions = () => {
    const grouped: Record<string, any[]> = {};
    
    // Get questions that have responses
    const respondedQuestions = anxietyQuestions.filter(q => 
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
      markStepCompleted("/c/mh/submit");
      
      // Store the responses for the results page
      sessionStorage.setItem("finalAnxietyResponses", JSON.stringify(responses));
      
      // If we have an ineligibility reason, make sure it's also stored
      if (ineligibilityReason) {
        sessionStorage.setItem("ineligibilityReason", ineligibilityReason);
      }
      
      // Navigate to results page
      router.push("/c/mh/results");
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
        Review Your Mental Health Assessment
      </h2>
      
      <p className="text-xl font-medium text-black mt-3 mb-8">
        You've made it to the final step. Please review your responses before submitting.
      </p>

      {/* Display anxiety severity information if available */}
      {anxietySeverity !== null && (
        <div className={`w-full max-w-2xl p-5 mb-6 rounded-lg ${
          anxietySeverity === 'Mild' ? 'bg-green-100' : 
          anxietySeverity === 'Moderate' ? 'bg-yellow-100' : 
          anxietySeverity === 'Moderate to Severe' ? 'bg-orange-100' : 
          'bg-red-100'
        }`}>
          <h3 className="text-lg font-semibold">Your Anxiety Level: {anxietySeverity}</h3>
          <p className="mt-1">
            {anxietySeverity === 'Mild' ? 
              'Your symptoms appear to be manageable with minimal impact on daily life.' : 
             anxietySeverity === 'Moderate' ? 
              'Your symptoms are having a noticeable impact on your daily functioning.' : 
             anxietySeverity === 'Moderate to Severe' ? 
              'Your symptoms are significantly impacting multiple areas of your life.' : 
              'Your symptoms are having a substantial impact on your daily functioning and wellbeing.'}
          </p>
        </div>
      )}

      {/* Display ineligibility warning if applicable */}
      {ineligibilityReason && (
        <div className="w-full max-w-2xl bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
          <p className="font-medium text-red-700">Eligibility Notice:</p>
          <p className="text-red-600">{ineligibilityReason}</p>
          <p className="text-sm mt-2 text-gray-600">
            Based on your responses, our products may not be suitable for you. We can still
            provide general recommendations when you submit.
          </p>
        </div>
      )}

      {/* Summary of selections grouped by section */}
      <div className="mt-4 w-full max-w-2xl mb-24">
        {Object.keys(responses).length === 0 ? (
          <p className="text-gray-500 italic">No responses found. You may need to complete the questionnaire.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(getGroupedQuestions()).map(([section, questions]) => (
              <div key={section} className="border rounded-lg overflow-hidden">
                <h3 className="bg-gray-100 px-4 py-2 font-semibold">{section}</h3>
                <ul className="divide-y">
                  {questions.map((question) => {
                    const response = responses[question.id];
                    if (response === undefined) return null;

                    return (
                      <li key={question.id} className="p-4">
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
              </div>
            ))}
          </div>
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