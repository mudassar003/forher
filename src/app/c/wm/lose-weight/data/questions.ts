//src/app/c/wm/lose-weight/data/questions.ts
import { Question, QuestionType } from "../types";

// Define all questions for the weight loss form
export const weightLossQuestions: Question[] = [
  // First question (offset 1) - Primary weight loss goal
  {
    id: "weight-loss-goal",
    question: "What is your primary weight loss goal?",
    description: "This helps us tailor your program.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "lose-5", label: "Lose 5-10 lbs" },
      { id: "lose-10", label: "Lose 10-20 lbs" },
      { id: "lose-20", label: "Lose 20+ lbs" },
      { id: "maintain", label: "Maintain current weight" },
      { id: "healthy-habits", label: "Develop healthier habits" }
    ]
  },
  
  // Second question (offset 2) - Current weight
  {
    id: "current-weight",
    question: "What's your current weight?",
    description: "Enter your current weight in pounds.",
    type: QuestionType.TextInput,
    placeholder: "Enter weight in pounds",
    inputType: "number",
    validation: (value) => {
      const numValue = Number(value);
      return !isNaN(numValue) && numValue > 50 && numValue < 500;
    },
    errorMessage: "Please enter a valid weight between 50 and 500 pounds."
  }
];

// Calculate progress percentage based on current question index
export const getProgressPercentage = (currentOffset: number): number => {
  // Offset 0 is introduction (20%), max should be 95% for the last question
  const totalQuestions = weightLossQuestions.length;
  
  if (currentOffset === 0) return 20;
  
  // First actual question starts at 50%, increases proportionally to last question
  const questionIndex = currentOffset - 1; // Since offset 1 = first question
  return 50 + (questionIndex / totalQuestions * 45);
};