// src/app/c/b/birth-control/data/questions.ts
import { Question, QuestionType } from "../types";

// Define all questions for the birth control form - REDUCED TO 7 QUESTIONS
export const birthControlQuestions: Question[] = [
  // Step 1: Basic Demographics
  {
    id: "age",
    question: "What is your age group?",
    description: "This information helps us ensure our products are appropriate for you.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "18-24", label: "18-24" },
      { id: "25-34", label: "25-34" },
      { id: "35-44", label: "35-44" },
      { id: "45-54", label: "45-54" },
      { id: "55-plus", label: "55+" }
    ]
  },
  {
    id: "gender",
    question: "Are you female?",
    description: "Our products are specifically designed for women's health needs.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  
  // Step 2: Pregnancy & Breastfeeding
  {
    id: "pregnant",
    question: "Are you currently pregnant?",
    description: "Most birth control options are not suitable during pregnancy.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  {
    id: "breastfeeding",
    question: "Are you currently breastfeeding?",
    description: "Some birth control options may affect breastfeeding.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  
  // Step 3: Medical History (Simplified)
  {
    id: "medical-conditions",
    question: "Do you have any of the following medical conditions?",
    description: "Select all that apply. This helps us recommend products that are safe for you.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "diabetes", label: "Diabetes" },
      { id: "hypertension", label: "High Blood Pressure" },
      { id: "heart-disease", label: "Heart Disease" },
      { id: "blood-clots", label: "History of Blood Clots" },
      { id: "depression-anxiety", label: "Depression or Anxiety" },
      { id: "none", label: "None of the above" }
    ]
  },
  
  // Step 4: Birth Control History
  {
    id: "bc-history",
    question: "Have you used birth control before?",
    description: "Your previous experience helps us provide better recommendations.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "never", label: "No, this is my first time" },
      { id: "side-effects", label: "Yes, but I had side effects" },
      { id: "well-tolerated", label: "Yes, and I tolerated it well" }
    ]
  },
  
  // Step 5: Preference
  {
    id: "daily-pill",
    question: "Are you comfortable taking oral birth control daily?",
    description: "This helps us understand your preference for different types of birth control.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No, I'd prefer other options" }
    ]
  }
];

// Calculate progress percentage based on current question index
export const getProgressPercentage = (currentOffset: number): number => {
  // Offset 0 is introduction (20%), max should be 95% for the last question
  const totalQuestions = birthControlQuestions.length;
  
  if (currentOffset === 0) return 20;
  
  // First actual question starts at 25%, increases proportionally to last question
  const questionIndex = currentOffset - 1; // Since offset 1 = first question
  return 25 + (questionIndex / totalQuestions * 70);
};

// Simplified eligibility check - always returns eligible for this simplified version
export const checkEligibility = (responses: Record<string, any>): { eligible: boolean; reason: string } => {
  // For the simplified version, we'll always return eligible
  // This is because we're not doing API calls or complex eligibility checks
  return {
    eligible: true,
    reason: "Based on your responses, we can provide personalized birth control recommendations. Our healthcare providers can help you select the best option for your needs."
  };
};