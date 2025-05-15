// src/app/c/wm/lose-weight/data/questions.ts
import { Question, QuestionType } from "../types";

// Define all questions for the weight loss form
export const weightLossQuestions: Question[] = [
  // Step 1: Basic Demographics
  {
    id: "age-group",
    question: "What is your age group?",
    description: "Please select your current age range.",
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
    description: "Our products are specifically designed for women.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },

  // Step 2: Height, Weight & BMI Calculation
  {
    id: "current-weight",
    question: "What is your current weight?",
    description: "Enter your weight in kilograms (kg) or pounds (lbs).",
    type: QuestionType.TextInput,
    placeholder: "Enter weight (e.g., 70kg or 154lbs)",
    inputType: "text",
    validation: (value: string) => {
      // Accept format like "70kg" or "154lbs" or just numbers
      return /^\d+(\.\d+)?(kg|lbs)?$/i.test(value);
    },
    errorMessage: "Please enter a valid weight (e.g., 70kg or 154lbs)"
  },
  {
    id: "height",
    question: "What is your height?",
    description: "Enter your height in centimeters (cm) or feet and inches (e.g., 5'7\").",
    type: QuestionType.TextInput,
    placeholder: "Enter height (e.g., 170cm or 5'7\")",
    inputType: "text",
    validation: (value: string) => {
      // Accept format like "170cm" or "5'7\"" or just numbers
      return /^\d+(\.?\d+)?(cm|m)?$|^\d+'(\d+\")?$/i.test(value);
    },
    errorMessage: "Please enter a valid height (e.g., 170cm or 5'7\")"
  },

  // Step 3: Pregnancy & Breastfeeding
  {
    id: "pregnant",
    question: "Are you currently pregnant?",
    description: "Weight loss products are not recommended during pregnancy.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  {
    id: "breastfeeding",
    question: "Are you currently breastfeeding?",
    description: "Weight loss products are not recommended while breastfeeding.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },

  // Step 4: Medical History
  {
    id: "medical-conditions",
    question: "Do you have any of the following medical conditions?",
    description: "Select all that apply.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "type1-diabetes", label: "Type 1 Diabetes" },
      { id: "type2-diabetes", label: "Type 2 Diabetes" },
      { id: "hypertension", label: "Hypertension (High Blood Pressure)" },
      { id: "pcos", label: "PCOS (Polycystic Ovary Syndrome)" },
      { id: "thyroid", label: "Thyroid Disorder" },
      { id: "heart-disease", label: "Heart Disease" },
      { id: "kidney-liver-disease", label: "Kidney or Liver Disease" },
      { id: "depression-anxiety", label: "Depression or Anxiety" },
      { id: "none", label: "None of the above" }
    ]
  },
  {
    id: "prescription-medications",
    question: "Do you take any prescription medications?",
    description: "Some medications may interact with weight loss treatments.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  {
    id: "medications-list",
    question: "Please list your current medications",
    description: "This information helps us ensure there are no contraindications.",
    type: QuestionType.TextInput,
    placeholder: "Enter your medications, separated by commas",
    inputType: "text",
    conditionalDisplay: (formData) => formData["prescription-medications"] === "yes"
  },
  {
    id: "eating-disorder",
    question: "Have you been diagnosed with an eating disorder (Anorexia, Bulimia, Binge Eating)?",
    description: "Weight loss products may not be appropriate for those with eating disorders.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },

  // Step 5: Previous Weight Loss Attempts
  {
    id: "previous-weight-loss",
    question: "Have you previously tried weight loss programs, diets, or medications?",
    description: "Your experience helps us provide better recommendations.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "first-attempt", label: "No, this is my first attempt" },
      { id: "didnt-work", label: "Yes, but they didn't work" },
      { id: "worked-temporarily", label: "Yes, and they worked for a while" }
    ]
  },
  {
    id: "previous-medications",
    question: "Have you used any of the following weight loss medications before?",
    description: "Select all that apply.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "phentermine", label: "Phentermine" },
      { id: "orlistat", label: "Orlistat" },
      { id: "semaglutide", label: "Semaglutide" },
      { id: "tirzepatide", label: "Tirzepatide" },
      { id: "none", label: "None of the above" }
    ]
  },

  // Sleep & Stress section - keeping these as they weren't specified for removal
  {
    id: "sleep-hours",
    question: "How many hours of sleep do you get per night?",
    description: "Sleep can significantly impact weight management.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "less-than-5", label: "Less than 5 hours" },
      { id: "5-7", label: "5-7 hours" },
      { id: "8-plus", label: "8+ hours" }
    ]
  },
  {
    id: "stress-levels",
    question: "How would you rate your stress levels?",
    description: "Stress can affect weight and eating habits.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "low", label: "Low" },
      { id: "moderate", label: "Moderate" },
      { id: "high", label: "High" }
    ]
  }
];

// Calculate progress percentage based on current question index
export const getProgressPercentage = (currentOffset: number): number => {
  // Offset 0 is introduction (20%), max should be 95% for the last question
  const totalQuestions = weightLossQuestions.length;
  
  if (currentOffset === 0) return 20;
  
  // First actual question starts at 25%, increases proportionally to last question
  const questionIndex = currentOffset - 1; // Since offset 1 = first question
  return 25 + (questionIndex / totalQuestions * 70);
};

// Helper function to calculate BMI from height and weight inputs
export const calculateBMI = (weight: string, height: string): number | null => {
  try {
    // Parse weight
    let weightInKg: number;
    if (weight.toLowerCase().includes('lbs')) {
      // Convert pounds to kg
      weightInKg = parseFloat(weight) * 0.453592;
    } else {
      // Already in kg or just a number
      weightInKg = parseFloat(weight);
    }

    // Parse height
    let heightInMeters: number;
    if (height.toLowerCase().includes('cm')) {
      // Convert cm to meters
      heightInMeters = parseFloat(height) / 100;
    } else if (height.toLowerCase().includes('m')) {
      // Already in meters
      heightInMeters = parseFloat(height);
    } else if (height.includes('\'')) {
      // Format like 5'7" (feet and inches)
      const parts = height.split('\'');
      const feet = parseFloat(parts[0]);
      const inches = parts[1] ? parseFloat(parts[1].replace('"', '')) : 0;
      heightInMeters = (feet * 0.3048) + (inches * 0.0254);
    } else {
      // Assume cm if just a number
      heightInMeters = parseFloat(height) / 100;
    }

    // Calculate BMI
    return weightInKg / (heightInMeters * heightInMeters);
  } catch (error) {
    console.error('Error calculating BMI:', error);
    return null;
  }
};

// Determine eligibility based on responses
export const checkEligibility = (responses: Record<string, any>): { eligible: boolean; reason: string } => {
  let reason = "Based on your responses, you appear to be eligible for our weight loss products. Your safety is our priority, so we still recommend discussing with your healthcare provider before starting any new regimen.";

  // Step 1: Age Check
  if (responses['age-group'] === 'under-18') {
    reason = "Note: Weight loss products are not recommended for individuals under 18 years of age.";
  }

  // Step 1: Gender Check
  if (responses['gender'] === 'no') {
    reason = "Note: Our products are specifically designed for women. We recommend consulting with a healthcare provider for personalized weight management guidance.";
  }

  // Step 2: BMI Check (if both height and weight are provided)
  if (responses['current-weight'] && responses['height']) {
    const bmi = calculateBMI(responses['current-weight'], responses['height']);
    if (bmi !== null) {
      if (bmi < 18.5) {
        reason = "Note: Based on your BMI calculation, you are in the underweight category. Weight loss products are not recommended. Please consult with a healthcare provider.";
      }
    }
  }

  // Step 3: Pregnancy & Breastfeeding
  if (responses['pregnant'] === 'yes') {
    reason = "Note: Weight loss products are not recommended during pregnancy. Please consult with your healthcare provider for safe weight management during pregnancy.";
  }

  if (responses['breastfeeding'] === 'yes') {
    reason = "Note: Weight loss products are not recommended while breastfeeding. Please consult with your healthcare provider for safe weight management while breastfeeding.";
  }

  // Step 4: Medical Conditions
  if (Array.isArray(responses['medical-conditions'])) {
    if (responses['medical-conditions'].includes('type1-diabetes')) {
      reason = "Note: Weight loss products may not be suitable for individuals with Type 1 Diabetes. Please consult with your healthcare provider for personalized weight management options.";
    }

    if (responses['medical-conditions'].includes('heart-disease')) {
      reason = "Note: Weight loss products may not be suitable for individuals with heart disease. Please consult with your healthcare provider for personalized weight management options.";
    }

    if (responses['medical-conditions'].includes('kidney-liver-disease')) {
      reason = "Note: Weight loss products may not be suitable for individuals with kidney or liver disease. Please consult with your healthcare provider for personalized weight management options.";
    }
  }

  // Step 4: Eating Disorder
  if (responses['eating-disorder'] === 'yes') {
    reason = "Note: Weight loss products are not recommended for individuals with a history of eating disorders. Please consult with your healthcare provider for healthy weight management approaches.";
  }

  // Always return eligible but with appropriate warning message
  return {
    eligible: true,
    reason: reason
  };
};