//src/app/c/wm/lose-weight/data/questions.ts
import { Question, QuestionType } from "../types";

// Define all questions for the weight loss form
export const weightLossQuestions: Question[] = [
  // Question 1 - Age group
  {
    id: "age-group",
    question: "What is your age group?",
    description: "Select your current age range.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "under-18", label: "Under 18" },
      { id: "18-25", label: "18-25" },
      { id: "26-35", label: "26-35" },
      { id: "36-45", label: "36-45" },
      { id: "46-55", label: "46-55" },
      { id: "56-plus", label: "56+" }
    ]
  },
  
  // Question 2 - Current weight range
  {
    id: "current-weight-range",
    question: "What is your current weight range?",
    description: "Select your current weight range.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "under-50kg", label: "Under 50 kg (110 lbs)" },
      { id: "50-65kg", label: "50-65 kg (110-143 lbs)" },
      { id: "66-80kg", label: "66-80 kg (144-176 lbs)" },
      { id: "81-100kg", label: "81-100 kg (177-220 lbs)" },
      { id: "101-120kg", label: "101-120 kg (221-264 lbs)" },
      { id: "over-120kg", label: "Over 120 kg (265+ lbs)" }
    ]
  },
  
  // Question 3 - Weight loss goal
  {
    id: "weight-loss-goal",
    question: "What is your weight loss goal?",
    description: "This helps us tailor your program.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "lose-5-10kg", label: "Lose 5-10 kg (11-22 lbs)" },
      { id: "lose-11-20kg", label: "Lose 11-20 kg (23-44 lbs)" },
      { id: "lose-20kg-plus", label: "Lose more than 20 kg (45+ lbs)" },
      { id: "maintain", label: "Maintain current weight but improve metabolism" }
    ]
  },
  
  // Question 4 - Activity level
  {
    id: "activity-level",
    question: "How active is your lifestyle?",
    description: "Select your current activity level.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "sedentary", label: "Sedentary (little or no exercise)" },
      { id: "lightly-active", label: "Lightly active (exercise 1-2 times per week)" },
      { id: "moderately-active", label: "Moderately active (exercise 3-4 times per week)" },
      { id: "very-active", label: "Very active (exercise 5+ times per week)" }
    ]
  },
  
  // Question 5 - Eating habits
  {
    id: "eating-habits",
    question: "How would you describe your eating habits?",
    description: "Select the option that best describes your typical eating pattern.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "portion-control", label: "I eat mostly healthy but struggle with portion control" },
      { id: "sugar-carbs", label: "I often crave sugary or high-carb foods" },
      { id: "emotional-eating", label: "I eat emotionally or due to stress" },
      { id: "specific-diet", label: "I follow a specific diet (e.g., keto, intermittent fasting, etc.)" },
      { id: "inconsistent", label: "My diet varies, and I struggle with consistency" }
    ]
  },
  
  // Question 6 - Cravings
  {
    id: "cravings",
    question: "Do you struggle with cravings?",
    description: "Select the option that best describes your experience with food cravings.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "frequent-cravings", label: "Yes, I frequently crave sweets and carbs" },
      { id: "some-control", label: "Yes, I have cravings but can control them sometimes" },
      { id: "no-cravings", label: "No, I don't struggle with cravings much" }
    ]
  },
  
  // Question 7 - Hunger frequency
  {
    id: "hunger-frequency",
    question: "How often do you feel hungry throughout the day?",
    description: "Select the option that best describes your hunger patterns.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "almost-always", label: "Almost always" },
      { id: "frequently", label: "Frequently" },
      { id: "sometimes", label: "Sometimes" },
      { id: "rarely", label: "Rarely" }
    ]
  },
  
  // Question 8 - Medical conditions
  {
    id: "medical-conditions",
    question: "Do you have any of the following conditions?",
    description: "Select all that apply.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "diabetes", label: "Type 2 Diabetes" },
      { id: "insulin-resistance", label: "Insulin resistance or metabolic syndrome" },
      { id: "hypertension", label: "Hypertension (high blood pressure)" },
      { id: "depression-anxiety", label: "Depression or anxiety" },
      { id: "none", label: "None of the above" }
    ]
  },
  
  // Question 9 - Prior weight loss treatments
  {
    id: "prior-treatments",
    question: "Have you tried any weight loss medications or treatments before?",
    description: "Select the option that best describes your experience.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes-worked", label: "Yes, and they worked for me" },
      { id: "yes-didnt-work", label: "Yes, but they didn't work as expected" },
      { id: "no-first-time", label: "No, this is my first time" }
    ]
  },
  
  // Question 10 - Injectable comfort
  {
    id: "injectable-comfort",
    question: "Are you comfortable with injectable weight loss medications?",
    description: "This helps us determine the best treatment options for you.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "open-to-injections", label: "Yes, I am open to injections" },
      { id: "prefer-oral", label: "No, I prefer oral medications" }
    ]
  },
  
  // Question 11 - Focus areas
  {
    id: "focus-areas",
    question: "What is your main focus in weight loss?",
    description: "This helps us tailor your program to your specific needs.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "control-appetite", label: "Controlling appetite and cravings" },
      { id: "boost-metabolism", label: "Boosting metabolism and energy" },
      { id: "manage-blood-sugar", label: "Managing blood sugar and insulin resistance" },
      { id: "combination", label: "A combination of all the above" }
    ]
  },
  
  // Question 12 - Preference for results timeframe
  {
    id: "results-timeframe",
    question: "Would you prefer a medication that works gradually for long-term results or one with faster effects?",
    description: "Select your preference for treatment outcomes.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "gradual", label: "I prefer gradual, sustainable weight loss" },
      { id: "faster", label: "I want to see faster results" },
      { id: "either", label: "I'm open to either, as long as it works" }
    ]
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