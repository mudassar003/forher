//src/app/c/wm/lose-weight/data/questions.ts
import { Question, QuestionType, ContactInfoData } from "../types";

// Define all questions for the weight loss form - ADDED contact-info step
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

  // Step 2: Height, Weight & BMI Calculation - UPDATED
  {
    id: "current-weight",
    question: "What is your current weight?",
    description: "Enter your weight in pounds.",
    type: QuestionType.TextInput,
    placeholder: "Enter weight in pounds",
    inputType: "number",
    validation: (value: string) => {
      const numValue = parseFloat(value);
      return !isNaN(numValue) && numValue > 0;
    },
    errorMessage: "Please enter a valid weight in pounds"
  },
  {
    id: "height",
    question: "What is your height?",
    description: "Enter your height in feet and inches.",
    type: QuestionType.HeightInput,
    placeholder: "Enter height",
    inputType: "height",
    validation: (value: string) => {
      try {
        const heightData = JSON.parse(value);
        const feet = parseInt(heightData.feet);
        const inches = parseInt(heightData.inches);
        
        return feet >= 3 && feet <= 8 && inches >= 0 && inches <= 11;
      } catch {
        return false;
      }
    },
    errorMessage: "Please enter a valid height"
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

  // Step 4: Medical History - REDUCED
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

  // Step 6: Contact Information - NEW STEP
  {
    id: "contact-info",
    question: "Let's get your contact information",
    description: "Please provide your details to receive your personalized weight loss plan and recommendations.",
    type: QuestionType.ContactInfo,
    fields: {
      name: true,
      email: true,
      phone: true
    }
  }
];

// Input sanitization and validation utilities
export const sanitizeInput = {
  name: (value: string): string => {
    // Remove HTML tags, scripts, and special characters, keep only letters, spaces, hyphens, apostrophes
    return value
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[^\p{L}\s\-'\.]/gu, '') // Keep only letters, spaces, hyphens, apostrophes, dots (Unicode-aware)
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .slice(0, 50); // Limit length
  },
  
  email: (value: string): string => {
    // Basic email sanitization - remove whitespace and convert to lowercase
    return value
      .trim()
      .toLowerCase()
      .slice(0, 254); // RFC 5321 limit
  },
  
  phone: (value: string): string => {
    // Remove all non-digit characters except + and spaces for initial cleaning
    let cleaned = value.replace(/[^\d]/g, '');
    
    // If it starts with 1, remove it (US country code)
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      cleaned = cleaned.slice(1);
    }
    
    // Format as US phone number (XXX) XXX-XXXX
    if (cleaned.length >= 10) {
      const areaCode = cleaned.slice(0, 3);
      const exchange = cleaned.slice(3, 6);
      const number = cleaned.slice(6, 10);
      return `(${areaCode}) ${exchange}-${number}`;
    } else if (cleaned.length >= 6) {
      const areaCode = cleaned.slice(0, 3);
      const exchange = cleaned.slice(3, 6);
      const number = cleaned.slice(6);
      return `(${areaCode}) ${exchange}-${number}`;
    } else if (cleaned.length >= 3) {
      const areaCode = cleaned.slice(0, 3);
      const exchange = cleaned.slice(3);
      return `(${areaCode}) ${exchange}`;
    } else if (cleaned.length > 0) {
      return `(${cleaned}`;
    }
    
    return cleaned;
  }
};

export const validateContactInfo = (data: ContactInfoData): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters long";
  } else if (data.name.length > 50) {
    errors.name = "Name must be less than 50 characters";
  } else if (!/^[\p{L}\s\-'\.]+$/u.test(data.name)) {
    errors.name = "Name can only contain letters, spaces, hyphens, apostrophes, and dots";
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = "Please enter a valid email address";
  } else if (data.email.length > 254) {
    errors.email = "Email address is too long";
  }
  
  // Phone validation  
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  const digitsOnly = data.phone.replace(/[^\d]/g, '');
  if (!data.phone || !phoneRegex.test(data.phone) || digitsOnly.length !== 10) {
    errors.phone = "Please enter a valid 10-digit US phone number";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Calculate progress percentage based on current question index
export const getProgressPercentage = (currentOffset: number): number => {
  // Offset 0 is introduction (20%), max should be 95% for the last question
  const totalQuestions = weightLossQuestions.length;
  
  if (currentOffset === 0) return 20;
  
  // First actual question starts at 25%, increases proportionally to last question
  const questionIndex = currentOffset - 1; // Since offset 1 = first question
  return 25 + (questionIndex / totalQuestions * 70);
};

// Helper function to calculate BMI from height and weight inputs - UPDATED
export const calculateBMI = (weight: string, height: string): number | null => {
  try {
    // Parse weight in pounds (now just a number)
    const weightInLbs = parseFloat(weight);
    if (isNaN(weightInLbs) || weightInLbs <= 0) {
      return null;
    }
    
    // Parse height from JSON format {feet: "5", inches: "7"}
    let heightData;
    try {
      heightData = JSON.parse(height);
    } catch {
      return null;
    }
    
    const feet = parseInt(heightData.feet);
    const inches = parseInt(heightData.inches);
    
    if (isNaN(feet) || isNaN(inches) || feet < 0 || inches < 0 || inches > 11) {
      return null;
    }
    
    // Convert to total inches
    const totalInches = (feet * 12) + inches;
    
    // Convert weight to kg and height to meters
    const weightInKg = weightInLbs * 0.453592;
    const heightInMeters = totalInches * 0.0254;
    
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