//src/app/c/wm/lose-weight/data/questions.ts
import { Question, QuestionType, ContactInfoData } from "../types";

export const weightLossQuestions: Question[] = [
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

export const sanitizeInput = {
  name: (value: string): string => {
    return value
      .replace(/<[^>]*>/g, '')
      .replace(/[<>\"'&]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 50);
  },
  
  email: (value: string): string => {
    return value
      .trim()
      .toLowerCase()
      .slice(0, 254);
  },
  
  phone: (value: string): string => {
    let cleaned = value.replace(/[^\d]/g, '');
    
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      cleaned = cleaned.slice(1);
    }
    
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
  
  if (!data.name || data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters long";
  } else if (data.name.length > 50) {
    errors.name = "Name must be less than 50 characters";
  } else if (/[<>\"'&]/.test(data.name)) {
    errors.name = "Name contains invalid characters";
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = "Please enter a valid email address";
  } else if (data.email.length > 254) {
    errors.email = "Email address is too long";
  }
  
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

export const getProgressPercentage = (currentOffset: number): number => {
  const totalQuestions = weightLossQuestions.length;
  
  if (currentOffset === 0) return 20;
  
  const questionIndex = currentOffset - 1;
  return 25 + (questionIndex / totalQuestions * 70);
};

export const calculateBMI = (weight: string, height: string): number | null => {
  try {
    const weightInLbs = parseFloat(weight);
    if (isNaN(weightInLbs) || weightInLbs <= 0) {
      return null;
    }
    
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
    
    const totalInches = (feet * 12) + inches;
    const weightInKg = weightInLbs * 0.453592;
    const heightInMeters = totalInches * 0.0254;
    
    return weightInKg / (heightInMeters * heightInMeters);
  } catch {
    return null;
  }
};

export const checkEligibility = (responses: Record<string, any>): { eligible: boolean; reason: string } => {
  let reason = "Based on your responses, you appear to be eligible for our weight loss products. Your safety is our priority, so we still recommend discussing with your healthcare provider before starting any new regimen.";

  if (responses['age-group'] === 'under-18') {
    reason = "Note: Weight loss products are not recommended for individuals under 18 years of age.";
  }

  if (responses['gender'] === 'no') {
    reason = "Note: Our products are specifically designed for women. We recommend consulting with a healthcare provider for personalized weight management guidance.";
  }

  if (responses['current-weight'] && responses['height']) {
    const bmi = calculateBMI(responses['current-weight'], responses['height']);
    if (bmi !== null) {
      if (bmi < 18.5) {
        reason = "Note: Based on your BMI calculation, you are in the underweight category. Weight loss products are not recommended. Please consult with a healthcare provider.";
      }
    }
  }

  if (responses['pregnant'] === 'yes') {
    reason = "Note: Weight loss products are not recommended during pregnancy. Please consult with your healthcare provider for safe weight management during pregnancy.";
  }

  if (responses['breastfeeding'] === 'yes') {
    reason = "Note: Weight loss products are not recommended while breastfeeding. Please consult with your healthcare provider for safe weight management while breastfeeding.";
  }

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

  if (responses['eating-disorder'] === 'yes') {
    reason = "Note: Weight loss products are not recommended for individuals with a history of eating disorders. Please consult with your healthcare provider for healthy weight management approaches.";
  }

  return {
    eligible: true,
    reason: reason
  };
};