// src/app/c/aa/skin/data/questions.ts
import { Question, QuestionType } from "../types";
import { FormResponse } from "../types";

// Define all questions for the skin assessment form
export const skinQuestions: Question[] = [
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
    description: "Our products are specifically formulated for women.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  
  // Step 2: Skin Type Assessment
  {
    id: "skin-type",
    question: "How would you describe your skin type?",
    description: "Select the option that best describes your skin's natural state.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "oily", label: "Oily" },
      { id: "dry", label: "Dry" },
      { id: "combination", label: "Combination (Oily T-zone, dry cheeks)" },
      { id: "sensitive", label: "Sensitive" },
      { id: "normal", label: "Normal" }
    ]
  },
  {
    id: "skin-concerns",
    question: "Do you have any of the following skin concerns?",
    description: "Select all that apply to your skin.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "acne", label: "Acne or pimples" },
      { id: "dry-patches", label: "Dry patches" },
      { id: "redness", label: "Redness or irritation" },
      { id: "uneven-tone", label: "Uneven skin tone" },
      { id: "wrinkles", label: "Wrinkles or fine lines" },
      { id: "hyperpigmentation", label: "Hyperpigmentation (dark spots)" },
      { id: "dark-circles", label: "Dark circles around eyes" },
      { id: "none", label: "None of the above" }
    ]
  },
  
  // Step 3: Skin Conditions & Sensitivity
  {
    id: "skin-conditions",
    question: "Do you have any diagnosed skin conditions?",
    description: "Select all conditions that have been diagnosed by a healthcare professional.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "eczema", label: "Eczema" },
      { id: "psoriasis", label: "Psoriasis" },
      { id: "rosacea", label: "Rosacea" },
      { id: "severe-acne", label: "Severe acne" },
      { id: "skin-allergies", label: "Skin allergies" },
      { id: "none", label: "None of the above" }
    ]
  },
  {
    id: "product-sensitivity",
    question: "Do you have any sensitivity to skincare products?",
    description: "Let us know if you've experienced reactions to products in the past.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes, I have experienced irritation with products before" },
      { id: "no", label: "No, I have no issues with skincare products" }
    ]
  },
  
  // Step 4: Usage of Skincare Products
  {
    id: "skincare-frequency",
    question: "How often do you use skincare products?",
    description: "Select the option that best describes your current routine.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "daily", label: "Daily" },
      { id: "weekly", label: "2-3 times a week" },
      { id: "rarely", label: "Rarely" },
      { id: "starting", label: "I'm just starting my skincare routine" }
    ]
  },
  {
    id: "current-products",
    question: "Which types of skincare products do you use regularly?",
    description: "Select all the products that are part of your current routine.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "cleanser", label: "Cleanser" },
      { id: "moisturizer", label: "Moisturizer" },
      { id: "sunscreen", label: "Sunscreen" },
      { id: "serums", label: "Serums (e.g., vitamin C, hyaluronic acid)" },
      { id: "exfoliants", label: "Exfoliants (e.g., scrubs, chemical exfoliators)" },
      { id: "masks", label: "Face masks" },
      { id: "none", label: "None of the above" }
    ]
  },
  
  // Step 5: Medical Conditions
  {
    id: "medical-conditions",
    question: "Do you have any of the following conditions that may affect your skin?",
    description: "Select all conditions that apply to you.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "hormonal", label: "Hormonal imbalances (e.g., PCOS)" },
      { id: "diabetes", label: "Diabetes" },
      { id: "heart", label: "Heart conditions" },
      { id: "blood-pressure", label: "High blood pressure" },
      { id: "none", label: "None of the above" }
    ]
  },
  
  // Step 6: Previous Skincare Treatments
  {
    id: "previous-treatments",
    question: "Have you used any of the following treatments in the past?",
    description: "Select all treatments you have experienced.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "retinoids", label: "Retinoids (e.g., Retinol, Tretinoin)" },
      { id: "peels", label: "Chemical peels" },
      { id: "laser", label: "Laser treatments" },
      { id: "microneedling", label: "Microneedling" },
      { id: "injectables", label: "Botox or fillers" },
      { id: "none", label: "None of the above" }
    ]
  },
  {
    id: "treatment-reactions",
    question: "Have you ever experienced adverse reactions to skincare treatments?",
    description: "Let us know about your past experiences with treatments.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes, I've had irritation, redness, or breakouts" },
      { id: "no", label: "No, my skin reacted well to treatments" },
      { id: "not-applicable", label: "I've never used advanced treatments" }
    ]
  },
  
  // Step 7: Lifestyle & Diet
  {
    id: "stress-levels",
    question: "How would you rate your stress levels?",
    description: "Stress can significantly impact skin health.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "low", label: "Low" },
      { id: "moderate", label: "Moderate" },
      { id: "high", label: "High" }
    ]
  },
  {
    id: "water-intake",
    question: "How much water do you drink daily?",
    description: "Hydration plays a key role in skin health.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "less-than-1", label: "Less than 1 liter" },
      { id: "1-2", label: "1-2 liters" },
      { id: "more-than-2", label: "More than 2 liters" }
    ]
  },
  {
    id: "diet",
    question: "How would you describe your diet?",
    description: "Your nutrition can affect your skin's appearance.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "balanced", label: "Balanced (eating a variety of healthy foods)" },
      { id: "processed", label: "High in processed foods and sugar" },
      { id: "plant-based", label: "Vegetarian/Vegan" },
      { id: "other", label: "Other" }
    ]
  },
  {
    id: "smoking-alcohol",
    question: "Do you smoke or drink alcohol regularly?",
    description: "These habits can affect your skin's health and appearance.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "both", label: "Yes, both" },
      { id: "alcohol-only", label: "Yes, alcohol only" },
      { id: "smoking-only", label: "Yes, smoking only" },
      { id: "neither", label: "No" }
    ]
  },
  
  // Step 8: Sun Protection & Outdoor Exposure
  {
    id: "sunscreen-usage",
    question: "How often do you use sunscreen?",
    description: "Sun protection is essential for maintaining healthy skin.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "daily", label: "Daily" },
      { id: "sometimes", label: "Only when outside for extended periods" },
      { id: "rarely", label: "Rarely or never" }
    ]
  },
  {
    id: "sun-exposure",
    question: "Do you spend a lot of time outdoors or in direct sunlight?",
    description: "UV exposure can significantly impact skin aging and health.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes, I'm often outdoors" },
      { id: "no", label: "No, I prefer staying indoors" }
    ]
  },
  
  // Step 9: Allergies & Sensitivities
  {
    id: "allergies",
    question: "Do you have any known allergies to skincare ingredients?",
    description: "This helps us avoid recommending products with ingredients you're sensitive to.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  {
    id: "allergy-details",
    question: "Please specify your allergies to skincare ingredients",
    description: "List any ingredients you know you're allergic or sensitive to.",
    type: QuestionType.TextInput,
    inputType: "text",
    placeholder: "Enter allergies here...",
    conditionalDisplay: (responses: FormResponse) => responses["allergies"] === "yes"
  },
  
  // Step 10: Consultation and Medical Advice
  {
    id: "dermatologist-consult",
    question: "Are you willing to consult a dermatologist before starting any new skincare routine?",
    description: "Some advanced products may require professional guidance.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  
  // Step 11: Eligibility Confirmation
  {
    id: "results-timeline",
    question: "Are you open to trying a skincare product that may take a few weeks to show results?",
    description: "Most effective skincare solutions require consistent use over time.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes, I'm looking for long-term solutions" },
      { id: "no", label: "No, I need immediate results" }
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
  let reason = "Based on your responses, you appear to be eligible for our skin treatments. We'll recommend products specifically tailored to your skin type and concerns.";

  // Check for age under 18
  if (responses["age-group"] === "under-18") {
    reason = "Note: Our skincare products are not recommended for those under 18 years of age. We suggest consulting with a dermatologist for personalized skincare advice.";
  }

  // Check for gender requirement
  if (responses["gender"] === "no") {
    reason = "Note: Our current skincare line is specifically formulated for women. We appreciate your interest and hope to offer products suitable for all genders in the future.";
  }

  // Check for severe skin conditions that might need medical attention
  const skinConditions = responses["skin-conditions"] || [];
  if (Array.isArray(skinConditions) && 
      (skinConditions.includes("psoriasis") || 
       skinConditions.includes("severe-acne") || 
       skinConditions.includes("eczema"))) {
    reason = "Note: Based on your skin condition, we recommend consulting with a dermatologist before starting any new skincare regimen. They can provide personalized advice for your specific needs.";
  }

  // Check for willingness to consult a dermatologist
  if (responses["dermatologist-consult"] === "no") {
    reason = "Note: Some of our advanced skincare products require professional guidance. We recommend being open to consulting with a dermatologist for the best results and to ensure the products are suitable for your specific skin needs.";
  }

  // Always return eligible but with appropriate warning message
  return {
    eligible: true,
    reason: reason
  };
};