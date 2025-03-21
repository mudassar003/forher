// src/app/c/hl/hair-loss/data/questions.ts
import { FormResponse, QuestionType } from "../types";

// Define all questions for the hair loss form - keeping only 10 essential questions
export const hairLossQuestions = [
  // Step 1: Basic Demographics
  {
    id: "age-group",
    question: "What is your age group?",
    description: "Please select your current age range.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "under-18", label: "Under 18" },
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
    description: "Our products are designed specifically for women's hair loss needs.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  
  // Step 2: Hair Loss Assessment
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
  
  // Step 3: Medical History
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
  
  // Step 4: Lifestyle & Diet
  {
    id: "recent-changes",
    question: "Have you experienced recent stress, illness, or hormonal changes?",
    description: "E.g., post-pregnancy, menopause, major life events",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  
  // Step 5: Hair Care
  {
    id: "heat-styling",
    question: "How often do you use heat styling tools?",
    description: "E.g., blow dryers, straighteners, curling irons",
    type: QuestionType.SingleSelect,
    options: [
      { id: "rarely", label: "Rarely" },
      { id: "occasionally", label: "Occasionally" },
      { id: "frequently", label: "Frequently" }
    ]
  },
  
  // Step 6: Treatment Preferences
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
  },
  {
    id: "long-term-commitment",
    question: "Are you comfortable committing to long-term hair regrowth treatments?",
    description: "3-6 months minimum is typically required to see results",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  }
];

// Calculate progress percentage based on current question offset
export const getProgressPercentage = (currentOffset: number): number => {
  const totalQuestions = hairLossQuestions.length;
  // Calculate a percentage with a minimum of 5% and max of 100%
  const percentage = Math.min(100, Math.max(5, (currentOffset / totalQuestions) * 100));
  return Math.round(percentage); // Round to nearest integer
};

// Simplified eligibility check function - no conditional logic
export const checkEligibility = (responses: FormResponse): { eligible: boolean; reason: string } => {
  // Simple eligibility check - everyone is eligible now
  return {
    eligible: true,
    reason: "Based on your responses, you appear to be eligible for our hair loss treatments. Please note that a medical consultation is still recommended before starting treatment."
  };
};