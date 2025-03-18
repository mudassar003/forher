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
  },
  
  // Step 5: Sexual Health & Libido
  {
    id: "libido-decrease",
    question: "Have you noticed a decrease in libido or arousal over time?",
    description: "This helps us understand if you might benefit from libido support products.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "frequently", label: "Yes, frequently" },
      { id: "sometimes", label: "Yes, sometimes" },
      { id: "no", label: "No" }
    ]
  },
  {
    id: "stress-impact",
    question: "Do you experience stress or anxiety that impacts your sexual desire?",
    description: "Stress and anxiety can affect sexual health and libido.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  {
    id: "natural-support",
    question: "Are you interested in natural libido support without synthetic hormones?",
    description: "We offer products with natural ingredients to support sexual health.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  {
    id: "herbal-allergies",
    question: "Do you have any allergies to herbal supplements?",
    description: "Such as ashwagandha, ginkgo biloba, or damiana.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  
  // Step 6: Lifestyle & Preferences
  {
    id: "smoking",
    question: "Do you smoke?",
    description: "Smoking may impact birth control effectiveness and overall health.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  {
    id: "regular-cycle",
    question: "Do you have a regular menstrual cycle?",
    description: "Regular cycles are typically between 21-35 days.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  {
    id: "overall-wellbeing",
    question: "Would you prefer a product that enhances overall well-being in addition to libido support?",
    description: "Some of our products offer multiple benefits beyond sexual health.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  {
    id: "daily-supplements",
    question: "Are you comfortable using daily supplements or pills?",
    description: "This helps us understand your preference for product formats.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  
  // Step 7: Medical Eligibility Confirmation
  {
    id: "doctor-consult",
    question: "Are you willing to consult a doctor before starting any new sexual health or birth control treatment?",
    description: "Professional medical advice is important for your safety.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  
  // Step 8: Product Preference
  {
    id: "non-prescription",
    question: "Are you looking for a non-prescription libido support product?",
    description: "We offer both prescription and non-prescription options.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  {
    id: "hormonal-bc",
    question: "Would you prefer hormonal birth control tailored to your needs?",
    description: "Personalized birth control can help manage side effects and fit your lifestyle.",
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
  const totalQuestions = birthControlQuestions.length;
  
  if (currentOffset === 0) return 20;
  
  // First actual question starts at 25%, increases proportionally to last question
  const questionIndex = currentOffset - 1; // Since offset 1 = first question
  return 25 + (questionIndex / totalQuestions * 70);
};

// Determine eligibility based on responses
export const checkEligibility = (responses: Record<string, any>): { eligible: boolean; reason: string } => {
  let reason = "Based on your responses, you appear to be eligible for our products. Our healthcare providers can help you select the best option for your needs.";

  // Basic Demographics checks
  if (responses['age'] === 'under-18') {
    reason = "Note: You must be 18 or older to be eligible for these products. We recommend consulting with a healthcare provider for age-appropriate options.";
  }
  
  if (responses['gender'] === 'no') {
    reason = "Note: Our products are specifically designed for women's health needs. We appreciate your interest and hope to offer products suitable for all genders in the future.";
  }
  
  // Pregnancy & Breastfeeding checks
  if (responses['pregnant'] === 'yes') {
    reason = "Note: Birth control products are not suitable during pregnancy. We recommend consulting with your healthcare provider for pregnancy-safe options.";
  }
  
  if (responses['breastfeeding'] === 'yes') {
    reason = "Note: Most birth control products are not recommended while breastfeeding. We suggest discussing options with your healthcare provider.";
  }
  
  // Medical History checks
  if (responses['medical-conditions'] && Array.isArray(responses['medical-conditions'])) {
    const conditions = responses['medical-conditions'];
    
    if (conditions.includes('type1-diabetes')) {
      reason = "Note: Type 1 Diabetes may present risks with certain birth control options. We recommend discussing this with your healthcare provider.";
    }
    
    if (conditions.includes('heart-disease')) {
      reason = "Note: Heart disease may present risks with hormonal birth control options. We suggest consulting with your healthcare provider.";
    }
    
    if (conditions.includes('kidney-liver')) {
      reason = "Note: Kidney or liver disease may affect how your body processes birth control. We recommend discussing this with your healthcare provider.";
    }
  }
  
  if (responses['eating-disorder'] === 'yes') {
    reason = "Note: A history of eating disorders may require specialized medical guidance for birth control. We recommend consulting with your healthcare provider.";
  }
  
  // Blood clot history check
  if (responses['blood-clots'] === 'yes') {
    reason = "Note: A history of blood clots, stroke, or estrogen sensitivity may make you ineligible for combination hormonal birth control. We recommend discussing alternative options with your healthcare provider.";
  }
  
  // Herbal supplement allergies check for libido products
  if (responses['herbal-allergies'] === 'yes' && responses['natural-support'] === 'yes') {
    reason = "Note: Allergies to herbal supplements may make you ineligible for our natural libido support products. We recommend discussing alternative options with your healthcare provider.";
  }
  
  // Doctor consultation check
  if (responses['doctor-consult'] === 'no') {
    reason = "Note: Medical consultation is strongly recommended before starting any of our products for your safety. We encourage you to discuss your options with a healthcare provider.";
  }
  
  // If smoking, provide a warning
  if (responses['smoking'] === 'yes') {
    reason = "Note: Smoking may impact birth control effectiveness and increase health risks. We recommend discussing this with your healthcare provider during consultation.";
  }
  
  // Always return eligible but with appropriate warning message
  return {
    eligible: true,
    reason: reason
  };
};