// src/app/c/hl/hair-loss/data/questions.ts
import { Question, QuestionType, FormResponse } from "../types";

// Define all questions for the hair loss form
export const hairLossQuestions: Question[] = [
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
  {
    id: "excessive-shedding",
    question: "Do you experience excessive hair shedding (losing more than 100 hairs per day)?",
    description: "Excessive shedding is when you notice significantly more hair falling out than usual.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
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
    id: "hair-loss-medications",
    question: "Are you currently taking any medications known to cause hair loss?",
    description: "E.g., chemotherapy, beta-blockers, hormonal medications",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
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
    id: "balanced-diet",
    question: "Do you have a balanced diet with sufficient protein and vitamins?",
    description: "A balanced diet is important for hair health.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
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
  {
    id: "chemical-treatments",
    question: "Do you regularly dye or chemically treat your hair?",
    description: "Including color treatments, perms, relaxers, etc.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  
  // Step 5: Scalp Health & Hair Care
  {
    id: "scalp-issues",
    question: "Do you experience dandruff, scalp irritation, or itchiness?",
    description: "Scalp health is closely related to hair growth.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  {
    id: "wash-frequency",
    question: "How often do you wash your hair?",
    description: "Select your typical hair washing frequency.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "daily", label: "Daily" },
      { id: "every-2-3-days", label: "Every 2-3 days" },
      { id: "once-a-week", label: "Once a week" }
    ]
  },
  {
    id: "specialized-shampoo",
    question: "Do you use sulfate-free or hair-growth supporting shampoos?",
    description: "These types of shampoos can be gentler on the hair and scalp.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  
  // Step 6: Hair Loss Treatment Preferences
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
    id: "topical-treatments",
    question: "Are you open to topical hair regrowth treatments?",
    description: "E.g., minoxidil, peptides, serums",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  {
    id: "oral-supplements",
    question: "Are you interested in oral supplements for hair regrowth?",
    description: "E.g., biotin, saw palmetto, iron, or collagen",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
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
  },
  
  // Step 7: Medical Eligibility Confirmation
  {
    id: "doctor-consultation",
    question: "Are you willing to consult a doctor before starting any new hair loss treatment?",
    description: "Medical guidance is important for safe and effective treatment.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
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
export const checkEligibility = (responses: FormResponse): { eligible: boolean; reason: string } => {
  // Check for conditions and provide guidance, but allow all users to proceed

  // Age under 18
  if (responses["age-group"] === "under-18") {
    return {
      eligible: true,
      reason: "While you are under 18, you can still proceed. However, we recommend consulting with a healthcare provider before starting any hair loss treatments."
    };
  }

  // Gender not female
  if (responses["gender"] === "no") {
    return {
      eligible: true,
      reason: "While our products are designed for women's hair loss needs, you can still proceed. We recommend consulting with a healthcare provider for treatments best suited to your needs."
    };
  }

  // No noticeable hair loss
  if (responses["affected-areas"] && 
      Array.isArray(responses["affected-areas"]) && 
      responses["affected-areas"].includes("no-noticeable-loss") && 
      responses["affected-areas"].length === 1) {
    return {
      eligible: true,
      reason: "While you may not notice significant hair loss, you can still proceed. We recommend monitoring your hair and consulting with a doctor if you notice changes."
    };
  }

  // Autoimmune disorder
  if (responses["medical-conditions"] && 
      Array.isArray(responses["medical-conditions"]) && 
      responses["medical-conditions"].includes("autoimmune-disorder")) {
    return {
      eligible: true,
      reason: "While you have an autoimmune condition, you can still proceed. We strongly recommend consulting your doctor before starting any hair loss treatments."
    };
  }

  // Hair loss medications
  if (responses["hair-loss-medications"] === "yes") {
    return {
      eligible: true,
      reason: "While you're taking medications that may cause hair loss, you can still proceed. We recommend consulting your doctor before starting any hair loss treatment."
    };
  }

  // Not willing to consult doctor
  if (responses["doctor-consultation"] === "no") {
    return {
      eligible: true,
      reason: "While a medical consultation is recommended, you can still proceed. Please note that consulting a healthcare provider is important for safe and effective treatment."
    };
  }

  // All checks passed
  return {
    eligible: true,
    reason: "Based on your responses, you appear to be eligible for our hair loss treatments. Please note that a medical consultation is still recommended before starting treatment."
  };
};