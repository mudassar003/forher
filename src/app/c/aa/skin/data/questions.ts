// src/app/c/hl/hair-loss/data/questions.ts
import { Question, QuestionType } from "../types";

// Define all questions for the hair loss form
export const hairLossQuestions: Question[] = [
  // Question 1: Hair loss pattern
  {
    id: "hair-loss-pattern",
    question: "What pattern of hair loss are you experiencing?",
    description: "Select the option that best describes your hair loss pattern.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "thinning-crown", label: "Thinning at the crown or top of head" },
      { id: "receding-hairline", label: "Receding hairline" },
      { id: "overall-thinning", label: "Overall thinning" },
      { id: "patchy-loss", label: "Patchy hair loss" },
      { id: "not-sure", label: "I'm not sure" }
    ]
  },
  
  // Question 2: Duration of hair loss
  {
    id: "hair-loss-duration",
    question: "How long have you been experiencing hair loss?",
    description: "When did you first notice your hair thinning or receding?",
    type: QuestionType.SingleSelect,
    options: [
      { id: "less-than-6-months", label: "Less than 6 months" },
      { id: "6-12-months", label: "6-12 months" },
      { id: "1-2-years", label: "1-2 years" },
      { id: "2-5-years", label: "2-5 years" },
      { id: "more-than-5-years", label: "More than 5 years" }
    ]
  }
];

// Calculate progress percentage based on current question index
export const getProgressPercentage = (currentOffset: number): number => {
  // Offset 0 is introduction (20%), max should be 95% for the last question
  const totalQuestions = hairLossQuestions.length;
  
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
    reason: "Based on your responses, you appear to be eligible for our hair loss treatments. Your safety is our priority, so we still recommend discussing with your healthcare provider before starting any new regimen."
  };
};