// src/app/c/b/birth-control/data/questions.ts
import { Question, QuestionType } from "../types";

// Define all questions for the birth control form
export const birthControlQuestions: Question[] = [
  // Step 1: Basic Demographics
  {
    id: "age",
    question: "What is your age group?",
    description: "This information helps us ensure our products are appropriate for you.",
    type: QuestionType.SingleSelect,
    options: [
      // { id: "under-18", label: "Under 18" },
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
    description: "Our products are specifically designed for women's health needs.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  
  // Step 2: Pregnancy & Breastfeeding
  {
    id: "pregnant",
    question: "Are you currently pregnant?",
    description: "Most birth control options are not suitable during pregnancy.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  {
    id: "breastfeeding",
    question: "Are you currently breastfeeding?",
    description: "Some birth control options may affect breastfeeding.",
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
    description: "Select all that apply. This helps us recommend products that are safe for you.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "type1-diabetes", label: "Type 1 Diabetes" },
      { id: "type2-diabetes", label: "Type 2 Diabetes" },
      { id: "hypertension", label: "Hypertension (High Blood Pressure)" },
      { id: "pcos", label: "PCOS (Polycystic Ovary Syndrome)" },
      { id: "thyroid", label: "Thyroid Disorder" },
      { id: "heart-disease", label: "Heart Disease" },
      { id: "kidney-liver", label: "Kidney or Liver Disease" },
      { id: "depression-anxiety", label: "Depression or Anxiety" },
      { id: "none", label: "None of the above" }
    ]
  },
  {
    id: "medications",
    question: "Do you take any prescription medications?",
    description: "Some medications may interact with birth control.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  {
    id: "medication-specify",
    question: "Please specify the medications you're taking",
    description: "This helps us ensure there are no interactions with our products.",
    type: QuestionType.TextInput,
    placeholder: "Enter your medications here",
    inputType: "text",
    conditionalDisplay: (responses) => responses["medications"] === "yes"
  },
  {
    id: "eating-disorder",
    question: "Have you been diagnosed with an eating disorder?",
    description: "Such as Anorexia, Bulimia, or Binge Eating.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  
  // Step 4: Birth Control History
  {
    id: "bc-history",
    question: "Have you used birth control before?",
    description: "Your previous experience helps us provide better recommendations.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "never", label: "No, this is my first time" },
      { id: "side-effects", label: "Yes, but I had side effects" },
      { id: "well-tolerated", label: "Yes, and I tolerated it well" }
    ]
  },
  {
    id: "blood-clots",
    question: "Do you have any history of blood clots, stroke, or estrogen sensitivity?",
    description: "These conditions may affect which birth control options are safe for you.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  {
    id: "daily-pill",
    question: "Are you comfortable taking oral birth control daily?",
    description: "This helps us understand your preference for different types of birth control.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No, I'd prefer other options" }
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
  // Basic Demographics checks
  if (responses['age'] === 'under-18') {
    return {
      eligible: false,
      reason: "You must be 18 or older to be eligible for these products."
    };
  }
  
  if (responses['gender'] === 'no') {
    return {
      eligible: false,
      reason: "Our products are specifically designed for women's health needs."
    };
  }
  
  // Pregnancy & Breastfeeding checks
  if (responses['pregnant'] === 'yes') {
    return {
      eligible: false,
      reason: "Birth control products are not suitable during pregnancy."
    };
  }
  
  if (responses['breastfeeding'] === 'yes') {
    return {
      eligible: false,
      reason: "You are not eligible for most birth control products while breastfeeding."
    };
  }
  
  // Medical History checks
  if (responses['medical-conditions'] && Array.isArray(responses['medical-conditions'])) {
    const conditions = responses['medical-conditions'];
    
    if (conditions.includes('type1-diabetes')) {
      return {
        eligible: false,
        reason: "Type 1 Diabetes may present risks with certain birth control options."
      };
    }
    
    if (conditions.includes('heart-disease')) {
      return {
        eligible: false,
        reason: "Heart disease may present risks with hormonal birth control options."
      };
    }
    
    if (conditions.includes('kidney-liver')) {
      return {
        eligible: false,
        reason: "Kidney or liver disease may affect how your body processes birth control."
      };
    }
  }
  
  if (responses['eating-disorder'] === 'yes') {
    return {
      eligible: false,
      reason: "A history of eating disorders may require specialized medical guidance for birth control."
    };
  }
  
  // Blood clot history check
  if (responses['blood-clots'] === 'yes') {
    return {
      eligible: false,
      reason: "A history of blood clots, stroke, or estrogen sensitivity may make you ineligible for combination hormonal birth control."
    };
  }
  
  // If we've passed all the checks, the user is eligible
  return {
    eligible: true,
    reason: "Based on your responses, you appear to be eligible for our products. Our healthcare providers can help you select the best option for your needs."
  };
};