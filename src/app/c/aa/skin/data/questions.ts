// src/app/c/aa/skin/data/questions.ts
import { Question, QuestionType } from "../types";

// Define all questions for the skin assessment form
export const skinQuestions: Question[] = [
  // Question 1: Skin concern
  {
    id: "skin-concern",
    question: "What is your primary skin concern?",
    description: "Select the option that best describes your main skin issue.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "acne", label: "Acne and breakouts" },
      { id: "aging", label: "Fine lines and wrinkles" },
      { id: "dark-spots", label: "Dark spots and hyperpigmentation" },
      { id: "dryness", label: "Dryness and flakiness" },
      { id: "redness", label: "Redness and irritation" },
      { id: "oiliness", label: "Excessive oiliness" }
    ]
  },
  
  // Question 2: Duration of skin concern
  {
    id: "concern-duration",
    question: "How long have you been experiencing this skin concern?",
    description: "When did you first notice this issue?",
    type: QuestionType.SingleSelect,
    options: [
      { id: "less-than-month", label: "Less than a month" },
      { id: "1-3-months", label: "1-3 months" },
      { id: "3-6-months", label: "3-6 months" },
      { id: "6-12-months", label: "6-12 months" },
      { id: "more-than-year", label: "More than a year" }
    ]
  }
];

// Calculate progress percentage based on current question index
export const getProgressPercentage = (currentOffset: number): number => {
  // Offset 0 is introduction (20%), max should be 95% for the last question
  const totalQuestions = skinQuestions.length;
  
  if (currentOffset === 0) return 20;
  
  // First actual question starts at 25%, increases proportionally to last question
  const questionIndex = currentOffset - 1; // Since offset 1 = first question
  return 25 + (questionIndex / totalQuestions * 70);
};

// Determine eligibility based on responses
export const checkEligibility = (responses: Record<string, any>): { eligible: boolean; reason: string } => {
  // For this simplified version, we'll consider all users eligible
  return {
    eligible: true,
    reason: "Based on your responses, you appear to be eligible for our skin treatments. Your safety is our priority, so we still recommend discussing with your healthcare provider before starting any new regimen."
  };
};