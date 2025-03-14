// src/app/c/b/birth-control/data/questions.ts
import { Question, QuestionType } from "../types";

// Define all questions for the birth control form
export const birthControlQuestions: Question[] = [
  // Question 1: Birth Control Type
  {
    id: "bc-type",
    question: "What type of birth control are you interested in?",
    description: "Select the option that best matches your preference.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "pill", label: "Birth Control Pill" },
      { id: "patch", label: "Birth Control Patch" },
      { id: "ring", label: "Vaginal Ring" },
      { id: "iud", label: "IUD" },
      { id: "implant", label: "Implant" },
      { id: "emergency", label: "Emergency Contraception" },
      { id: "not-sure", label: "Not Sure / Need Guidance" }
    ]
  },
  
  // Question 2: Previous Experience
  {
    id: "experience",
    question: "Have you used birth control before?",
    description: "Your previous experience helps us provide better recommendations.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "never", label: "No, this will be my first time" },
      { id: "current", label: "Yes, I am currently using birth control" },
      { id: "previous", label: "Yes, I have used birth control in the past" }
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

// Determine eligibility based on responses
export const checkEligibility = (responses: Record<string, any>): { eligible: boolean; reason: string } => {
  // Emergency contraception special case
  if (responses['bc-type'] === 'emergency') {
    return {
      eligible: true,
      reason: "Based on your selection of emergency contraception, we recommend scheduling a consultation for timely guidance."
    };
  }

  // If we've passed all the checks, the user is eligible
  return {
    eligible: true,
    reason: "Based on your responses, you appear to be eligible for our birth control options. Our healthcare providers can help you select the best option for your needs."
  };
};