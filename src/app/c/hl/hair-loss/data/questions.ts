//src/app/c/hl/hair-loss/data/questions.ts
import { Question, QuestionType, FormResponse } from "../types";

// Define simplified questions for the hair loss form - REDUCED TO 7 QUESTIONS
export const hairLossQuestions: Question[] = [
  // Question 1: Basic Demographics - Age
  {
    id: "age-group",
    question: "What is your age group?",
    description: "Please select your current age range.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "18-24", label: "18-24" },
      { id: "25-34", label: "25-34" },
      { id: "35-44", label: "35-44" },
      { id: "45-54", label: "45-54" },
      { id: "55-plus", label: "55+" }
    ]
  },
  
  // Question 2: Basic Demographics - Gender
  {
    id: "gender",
    question: "Are you female?",
    description: "Our products are designed specifically for women's hair loss needs.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  
  // Question 3: Hair Loss Duration
  {
    id: "hair-loss-duration",
    question: "When did you first notice hair thinning or hair loss?",
    description: "Please select when you first started experiencing noticeable hair loss.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "less-than-6-months", label: "Less than 6 months ago" },
      { id: "6-months-to-1-year", label: "6 months – 1 year ago" },
      { id: "more-than-1-year", label: "More than 1 year ago" }
    ]
  },
  
  // Question 4: Affected Areas
  {
    id: "affected-areas",
    question: "What areas of your scalp are affected?",
    description: "Select all areas where you notice hair thinning or loss.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "general-thinning", label: "General thinning all over" },
      { id: "thinning-crown", label: "Thinning at the crown" },
      { id: "receding-hairline", label: "Receding hairline" },
      { id: "bald-spots", label: "Bald spots or patches" },
      { id: "no-noticeable-loss", label: "No noticeable hair loss" }
    ]
  },
  
  // Question 5: Medical Conditions
  {
    id: "medical-conditions",
    question: "Do you have any of the following medical conditions?",
    description: "Select all conditions that apply to you.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "pcos", label: "PCOS (Polycystic Ovary Syndrome)" },
      { id: "thyroid-disorder", label: "Thyroid disorder (hypothyroidism, hyperthyroidism)" },
      { id: "anemia", label: "Anemia or iron deficiency" },
      { id: "autoimmune-disorder", label: "Autoimmune disorder (Alopecia Areata, Lupus, etc.)" },
      { id: "none", label: "None of the above" }
    ]
  },
  
  // Question 6: Family History
  {
    id: "family-history",
    question: "Do you have a family history of hair loss?",
    description: "Such as female pattern baldness or male pattern baldness",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  
  // Question 7: Previous Treatments
  {
    id: "previous-treatments",
    question: "Have you tried any hair loss treatments before?",
    description: "Select all treatments you have tried.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "minoxidil", label: "Minoxidil (Topical Treatment)" },
      { id: "prp-therapy", label: "PRP Therapy (Platelet-Rich Plasma)" },
      { id: "supplements", label: "Hair Growth Supplements" },
      { id: "specialized-shampoos", label: "Specialized Shampoos" },
      { id: "none", label: "None of the above" }
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

// Simplified eligibility check - now just returns basic validation
export const checkEligibility = (responses: FormResponse): { eligible: boolean; reason: string } => {
  // Always return eligible since we're not using API validation anymore
  return {
    eligible: true,
    reason: "Thank you for completing the assessment. Based on your responses, we'll provide personalized recommendations for your hair loss concerns."
  };
};