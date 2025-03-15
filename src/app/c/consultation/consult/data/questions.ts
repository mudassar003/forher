//src/app/c/consultation/consult/data/questions.ts
import { Question, QuestionType } from "../types";

// Define all questions for the consultation form
export const consultationQuestions: Question[] = [
  // Question 1: Treatment interest
  {
    id: "treatment-interest",
    question: "What treatment are you interested in?",
    description: "Select the option that best describes your current interest.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "hair-loss", label: "Hair loss treatment" },
      { id: "skin-care", label: "Skincare consultation" },
      { id: "sexual-health", label: "Sexual health" },
      { id: "mental-health", label: "Mental health support" },
      { id: "other", label: "Other concerns" }
    ]
  },
  
  // Question 2: Duration of concern
  {
    id: "concern-duration",
    question: "How long have you been experiencing this concern?",
    description: "When did you first notice this issue?",
    type: QuestionType.SingleSelect,
    options: [
      { id: "less-than-6-months", label: "Less than 6 months" },
      { id: "6-12-months", label: "6-12 months" },
      { id: "1-2-years", label: "1-2 years" },
      { id: "2-5-years", label: "2-5 years" },
      { id: "more-than-5-years", label: "More than 5 years" }
    ]
  },

  // Question 3: Previous treatments
  {
    id: "previous-treatments",
    question: "Have you tried any treatments before?",
    description: "Select all that apply to your situation.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "prescription", label: "Prescription medication" },
      { id: "otc", label: "Over-the-counter products" },
      { id: "home-remedies", label: "Home remedies" },
      { id: "professional-services", label: "Professional services" },
      { id: "none", label: "I haven't tried anything yet" }
    ]
  },

  // Question 4: Medical history
  {
    id: "medical-conditions",
    question: "Do you have any of the following medical conditions?",
    description: "This helps us recommend appropriate treatments. Select all that apply.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "high-blood-pressure", label: "High blood pressure" },
      { id: "diabetes", label: "Diabetes" },
      { id: "thyroid-issues", label: "Thyroid issues" },
      { id: "heart-disease", label: "Heart disease" },
      { id: "autoimmune", label: "Autoimmune condition" },
      { id: "none", label: "None of the above" }
    ]
  }
];

// Calculate progress percentage based on current question index
export const getProgressPercentage = (currentOffset: number): number => {
  // Offset 0 is introduction (20%), max should be 95% for the last question
  const totalQuestions = consultationQuestions.length;
  
  if (currentOffset === 0) return 20;
  
  // First actual question starts at 25%, increases proportionally to last question
  const questionIndex = currentOffset - 1; // Since offset 1 = first question
  return 25 + (questionIndex / totalQuestions * 70);
};

// Determine eligibility based on responses
export const checkEligibility = (responses: Record<string, any>): { eligible: boolean; reason: string } => {
  // Check for specific medical conditions that might require further evaluation
  if (responses['medical-conditions']) {
    const conditions = responses['medical-conditions'];
    
    if (Array.isArray(conditions)) {
      // Check for conditions that require further medical evaluation
      const requiresEvaluation = conditions.some(condition => 
        ['high-blood-pressure', 'heart-disease'].includes(condition)
      );
      
      if (requiresEvaluation) {
        return {
          eligible: false,
          reason: "Based on your medical history, we recommend consulting with a healthcare provider before proceeding with online treatment options."
        };
      }
    }
  }
  
  // For this simplified version, most users will be eligible
  return {
    eligible: true,
    reason: "Based on your responses, you appear to be eligible for our consultation services. Your safety is our priority, so we still recommend discussing with your healthcare provider before starting any new treatment."
  };
};