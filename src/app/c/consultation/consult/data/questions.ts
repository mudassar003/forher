//src/app/c/consultation/consult/data/questions.ts
import { Question, QuestionType } from "../types";

// Define all questions for the consultation form
export const consultationQuestions: Question[] = [
  // Step 1: Basic Information
  {
    id: "age-group",
    question: "What is your age group?",
    description: "This helps us ensure you're eligible for our services.",
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
    description: "Our products are specifically designed for women.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  
  // Step 2: Main Concern
  {
    id: "main-concern",
    question: "Which of the following categories would you like to address?",
    description: "Select your primary health or wellness goal.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "weight-loss", label: "Lose weight" },
      { id: "hair-growth", label: "Grow fuller hair" },
      { id: "anxiety-relief", label: "Find relief for anxiety" },
      { id: "skin-health", label: "Get glowing skin" },
      { id: "cycle-control", label: "Control your cycle" },
      { id: "wellness", label: "Explore wellness" }
    ],
    conditionalDisplay: (responses) => {
      return responses["age-group"] !== "under-18" && responses["gender"] === "yes";
    }
  },
  
  // Step 3: Health Conditions
  {
    id: "health-conditions",
    question: "Do you have any of the following conditions?",
    description: "Select all that apply. This helps us ensure any recommendations are safe for you.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "diabetes", label: "Diabetes" },
      { id: "heart-disease", label: "Heart disease" },
      { id: "high-blood-pressure", label: "High blood pressure" },
      { id: "hormonal-imbalances", label: "Hormonal imbalances (e.g., PCOS)" },
      { id: "anxiety-depression", label: "Anxiety or depression" },
      { id: "skin-conditions", label: "Skin conditions (e.g., eczema, acne)" },
      { id: "none", label: "None of the above" }
    ],
    conditionalDisplay: (responses) => {
      return responses["age-group"] !== "under-18" && responses["gender"] === "yes";
    }
  },
  
  // Step 4: Lifestyle Assessment
  {
    id: "activity-level",
    question: "How would you rate your activity level?",
    description: "This helps us understand your lifestyle habits.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "sedentary", label: "Sedentary (little to no exercise)" },
      { id: "lightly-active", label: "Lightly active (1-2 workouts per week)" },
      { id: "moderately-active", label: "Moderately active (3-4 workouts per week)" },
      { id: "very-active", label: "Very active (5+ workouts per week)" }
    ],
    conditionalDisplay: (responses) => {
      return responses["age-group"] !== "under-18" && responses["gender"] === "yes";
    }
  },
  {
    id: "water-intake",
    question: "How much water do you drink daily?",
    description: "Hydration is an important factor in overall health.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "less-than-1L", label: "Less than 1 liter" },
      { id: "1-2L", label: "1-2 liters" },
      { id: "more-than-2L", label: "More than 2 liters" }
    ],
    conditionalDisplay: (responses) => {
      return responses["age-group"] !== "under-18" && responses["gender"] === "yes";
    }
  },
  {
    id: "dietary-restrictions",
    question: "Do you have any dietary preferences or restrictions?",
    description: "This helps us recommend appropriate products.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ],
    conditionalDisplay: (responses) => {
      return responses["age-group"] !== "under-18" && responses["gender"] === "yes";
    }
  },
  {
    id: "dietary-details",
    question: "Please specify your dietary preferences or restrictions:",
    description: "For example: vegetarian, vegan, gluten-free, etc.",
    type: QuestionType.TextInput,
    placeholder: "Enter your dietary restrictions here",
    inputType: "text",
    conditionalDisplay: (responses) => {
      return responses["dietary-restrictions"] === "yes";
    }
  },
  {
    id: "stress-level",
    question: "How would you rate your stress levels?",
    description: "Stress can impact many aspects of health.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "low", label: "Low" },
      { id: "moderate", label: "Moderate" },
      { id: "high", label: "High" }
    ],
    conditionalDisplay: (responses) => {
      return responses["age-group"] !== "under-18" && responses["gender"] === "yes";
    }
  },
  
  // Step 5: Targeted Goals
  {
    id: "specific-goal",
    question: "Which of the following best describes your goal?",
    description: "This helps us tailor our recommendations to your needs.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "lose-weight", label: "Lose weight" },
      { id: "regrow-hair", label: "Regrow fuller hair" },
      { id: "relieve-anxiety", label: "Relieve anxiety" },
      { id: "improve-skin", label: "Improve skin health" },
      { id: "regulate-cycle", label: "Regulate my cycle" },
      { id: "enhance-wellness", label: "Enhance overall wellness" }
    ],
    conditionalDisplay: (responses) => {
      return responses["age-group"] !== "under-18" && responses["gender"] === "yes";
    }
  },
  {
    id: "previous-treatments",
    question: "Have you tried any treatments or products for your concern before?",
    description: "This helps us understand what has or hasn't worked for you.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes-worked", label: "Yes, and they worked" },
      { id: "yes-didnt-work", label: "Yes, but they didn't work" },
      { id: "no", label: "No, I've never tried any treatments" }
    ],
    conditionalDisplay: (responses) => {
      return responses["age-group"] !== "under-18" && responses["gender"] === "yes";
    }
  },
  
  // Step 6: Product Preferences
  {
    id: "open-to-oral",
    question: "Are you open to using supplements or oral treatments?",
    description: "Some conditions respond well to oral medications or supplements.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ],
    conditionalDisplay: (responses) => {
      return responses["age-group"] !== "under-18" && responses["gender"] === "yes";
    }
  },
  {
    id: "open-to-topical",
    question: "Are you open to using topical treatments (e.g., creams, serums)?",
    description: "Topical treatments are applied directly to the skin.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ],
    conditionalDisplay: (responses) => {
      return responses["age-group"] !== "under-18" && responses["gender"] === "yes";
    }
  },
  {
    id: "product-preference",
    question: "Would you prefer natural products or synthetic options?",
    description: "This helps us match you with products aligned with your preferences.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "natural", label: "Natural products" },
      { id: "synthetic", label: "Synthetic products" },
      { id: "no-preference", label: "No preference" }
    ],
    conditionalDisplay: (responses) => {
      return responses["age-group"] !== "under-18" && responses["gender"] === "yes";
    }
  },
  
  // Step 7: Medical Advice
  {
    id: "willing-to-consult",
    question: "Would you be willing to consult a healthcare provider before starting any treatment?",
    description: "Some treatments may require medical guidance for safety.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ],
    conditionalDisplay: (responses) => {
      return responses["age-group"] !== "under-18" && responses["gender"] === "yes";
    }
  },
  
  // Step 8: Additional Information
  {
    id: "allergies",
    question: "Do you have any allergies to any known ingredients?",
    description: "This helps us ensure our recommendations are safe for you.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ],
    conditionalDisplay: (responses) => {
      return responses["age-group"] !== "under-18" && responses["gender"] === "yes";
    }
  },
  {
    id: "allergy-details",
    question: "Please specify your allergies:",
    description: "List any ingredients or substances you're allergic to.",
    type: QuestionType.TextInput,
    placeholder: "Enter your allergies here",
    inputType: "text",
    conditionalDisplay: (responses) => {
      return responses["allergies"] === "yes";
    }
  },
  {
    id: "share-medical-history",
    question: "Would you be willing to share your medical history with a professional to receive personalized recommendations?",
    description: "This allows us to provide more tailored advice.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ],
    conditionalDisplay: (responses) => {
      return responses["age-group"] !== "under-18" && responses["gender"] === "yes";
    }
  },
  
  // Eligibility Confirmation
  {
    id: "proceed-with-recommendations",
    question: "Would you like to proceed with receiving product recommendations based on your responses?",
    description: "We'll use your answers to suggest products that may help with your concerns.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ],
    conditionalDisplay: (responses) => {
      return responses["age-group"] !== "under-18" && responses["gender"] === "yes";
    }
  }
];

// Calculate progress percentage based on current question index
export const getProgressPercentage = (currentOffset: number): number => {
  // Offset 0 is introduction (5%), max should be 100% for the last question
  const totalQuestions = consultationQuestions.length;
  
  if (currentOffset === 0) return 5;
  
  // First actual question starts at 10%, increases proportionally to last question
  const questionIndex = currentOffset - 1; // Since offset 1 = first question
  return 10 + (questionIndex / totalQuestions * 90);
};

// Determine eligibility based on responses
export const checkEligibility = (responses: Record<string, any>): { eligible: boolean; reason: string } => {
  // Check age eligibility
  if (responses['age-group'] === 'under-18') {
    return {
      eligible: false,
      reason: "We're sorry, but you must be 18 or older to use our services. Please consult with a parent/guardian and healthcare provider for appropriate care."
    };
  }
  
  // Check gender eligibility
  if (responses['gender'] === 'no') {
    return {
      eligible: false,
      reason: "Our current products and services are specifically designed for women. We apologize for any inconvenience."
    };
  }
  
  // Check if user is willing to consult a healthcare provider
  if (responses['willing-to-consult'] === 'no') {
    return {
      eligible: false,
      reason: "For safety reasons, we recommend consulting with a healthcare provider before starting any new treatments. Some of our products may require medical guidance."
    };
  }
  
  // Check specific health conditions that might require further evaluation
  if (responses['health-conditions']) {
    const conditions = responses['health-conditions'];
    
    if (Array.isArray(conditions)) {
      // Check for high-risk conditions that require medical consultation
      const highRiskConditions = conditions.some(condition => 
        ['heart-disease', 'high-blood-pressure', 'diabetes'].includes(condition)
      );
      
      if (highRiskConditions) {
        return {
          eligible: false,
          reason: "Based on your health conditions, we recommend consulting with a healthcare provider before proceeding with online treatment options. Your safety is our priority."
        };
      }
    }
  }
  
  // Check if user is proceeding with recommendations
  if (responses['proceed-with-recommendations'] === 'no') {
    return {
      eligible: false,
      reason: "You've chosen not to proceed with product recommendations. Thank you for completing the survey."
    };
  }
  
  // Check if user has both oral and topical treatments as "no"
  if (responses['open-to-oral'] === 'no' && responses['open-to-topical'] === 'no') {
    return {
      eligible: false,
      reason: "Our product recommendations typically include oral supplements and/or topical treatments. Since you've indicated you're not open to either, we may not have suitable options for you at this time."
    };
  }
  
  // If no eligibility issues found, the user is eligible
  return {
    eligible: true,
    reason: "Based on your responses, you appear to be eligible for our consultation services. Our recommendations will be tailored to your specific needs and preferences."
  };
};