// src/app/c/mh/anxiety/data/questions.ts
import { Question, QuestionType } from "../types";

// Define all questions for the mental health form
export const mentalHealthQuestions: Question[] = [
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
    question: "What is your gender?",
    description: "Please select your gender.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "female", label: "Female" },
      { id: "male", label: "Male" },
      { id: "other", label: "Other" },
      { id: "prefer-not-to-say", label: "Prefer not to say" }
    ]
  },

  // Step 2: Symptoms & Severity
  {
    id: "anxiety-symptoms",
    question: "Which anxiety symptoms do you experience?",
    description: "Select all that apply.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "excessive-worry", label: "Excessive worry" },
      { id: "restlessness", label: "Restlessness or feeling on edge" },
      { id: "fatigue", label: "Fatigue" },
      { id: "concentration", label: "Difficulty concentrating" },
      { id: "irritability", label: "Irritability" },
      { id: "sleep-issues", label: "Sleep problems" },
      { id: "muscle-tension", label: "Muscle tension" },
      { id: "panic-attacks", label: "Panic attacks" },
      { id: "social-anxiety", label: "Social anxiety" },
      { id: "phobias", label: "Specific phobias" }
    ]
  },
  {
    id: "symptom-duration",
    question: "How long have you been experiencing these symptoms?",
    description: "Please select the timeframe that best describes your experience.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "less-than-1-month", label: "Less than 1 month" },
      { id: "1-3-months", label: "1-3 months" },
      { id: "3-6-months", label: "3-6 months" },
      { id: "6-12-months", label: "6-12 months" },
      { id: "more-than-1-year", label: "More than 1 year" }
    ]
  },
  {
    id: "symptom-severity",
    question: "How would you rate the severity of your symptoms?",
    description: "Please select the option that best describes your experience.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "mild", label: "Mild - noticeable but manageable" },
      { id: "moderate", label: "Moderate - interferes with some activities" },
      { id: "severe", label: "Severe - significantly impacts daily life" },
      { id: "extreme", label: "Extreme - debilitating in many situations" }
    ]
  },

  // Step 3: Impact Assessment
  {
    id: "daily-impact",
    question: "How do your anxiety symptoms impact your daily life?",
    description: "Select all areas that are affected.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "work", label: "Work performance" },
      { id: "relationships", label: "Relationships" },
      { id: "sleep", label: "Sleep" },
      { id: "physical-health", label: "Physical health" },
      { id: "concentration", label: "Concentration/focus" },
      { id: "social-activities", label: "Social activities" },
      { id: "daily-tasks", label: "Daily tasks/chores" },
      { id: "minimal-impact", label: "Minimal impact" }
    ]
  },
  {
    id: "triggers",
    question: "What typically triggers your anxiety?",
    description: "Select all that apply.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "work-stress", label: "Work or school stress" },
      { id: "social-situations", label: "Social situations" },
      { id: "health-concerns", label: "Health concerns" },
      { id: "financial-stress", label: "Financial stress" },
      { id: "relationship-issues", label: "Relationship issues" },
      { id: "past-trauma", label: "Past trauma" },
      { id: "uncertainty", label: "Uncertainty about the future" },
      { id: "specific-phobias", label: "Specific situations or objects" },
      { id: "no-clear-trigger", label: "No clear triggers" }
    ]
  },

  // Step 4: Medical History
  {
    id: "medical-history",
    question: "Do you have any of the following medical conditions?",
    description: "Select all that apply.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "depression", label: "Depression" },
      { id: "bipolar", label: "Bipolar Disorder" },
      { id: "ptsd", label: "PTSD" },
      { id: "ocd", label: "OCD" },
      { id: "thyroid", label: "Thyroid Disorder" },
      { id: "heart-condition", label: "Heart Condition" },
      { id: "high-blood-pressure", label: "High Blood Pressure" },
      { id: "substance-use", label: "Substance Use Disorder" },
      { id: "none", label: "None of the above" }
    ]
  },
  {
    id: "current-medications",
    question: "Are you currently taking any medications?",
    description: "Some medications may interact with mental health treatments.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ]
  },
  {
    id: "medication-list",
    question: "Please list your current medications",
    description: "This helps us ensure there are no contraindications.",
    type: QuestionType.TextInput,
    placeholder: "Enter your medications, separated by commas",
    inputType: "text",
    conditionalDisplay: (formData) => formData["current-medications"] === "yes"
  },
  {
    id: "diagnosed-conditions",
    question: "Have you been formally diagnosed with any mental health conditions?",
    description: "Select all that apply.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "generalized-anxiety", label: "Generalized Anxiety Disorder" },
      { id: "panic-disorder", label: "Panic Disorder" },
      { id: "social-anxiety", label: "Social Anxiety Disorder" },
      { id: "depression", label: "Depression" },
      { id: "bipolar", label: "Bipolar Disorder" },
      { id: "ptsd", label: "PTSD" },
      { id: "ocd", label: "OCD" },
      { id: "other", label: "Other condition" },
      { id: "none", label: "No formal diagnosis" }
    ]
  },

  // Step 5: Previous Treatment
  {
    id: "previous-treatment",
    question: "Have you previously received treatment for anxiety or other mental health concerns?",
    description: "Select all that apply.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "therapy", label: "Therapy or counseling" },
      { id: "medication", label: "Medication" },
      { id: "self-help", label: "Self-help books or programs" },
      { id: "support-groups", label: "Support groups" },
      { id: "mindfulness", label: "Mindfulness or meditation" },
      { id: "alternative", label: "Alternative treatments (e.g., acupuncture)" },
      { id: "none", label: "No previous treatment" }
    ]
  },
  {
    id: "treatment-effectiveness",
    question: "If you've tried treatments before, how effective were they?",
    description: "Please select the option that best describes your experience.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "very-effective", label: "Very effective" },
      { id: "somewhat-effective", label: "Somewhat effective" },
      { id: "minimally-effective", label: "Minimally effective" },
      { id: "not-effective", label: "Not effective at all" },
      { id: "mixed-results", label: "Mixed results" },
      { id: "not-applicable", label: "Not applicable" }
    ],
    conditionalDisplay: (formData) => {
      const previousTreatment = formData["previous-treatment"];
      return Array.isArray(previousTreatment) && 
             previousTreatment.length > 0 && 
             !previousTreatment.includes("none");
    }
  },

  // Step 6: Lifestyle Factors
  {
    id: "sleep-quality",
    question: "How would you rate your overall sleep quality?",
    description: "Sleep can significantly impact mental health.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "excellent", label: "Excellent" },
      { id: "good", label: "Good" },
      { id: "fair", label: "Fair" },
      { id: "poor", label: "Poor" },
      { id: "very-poor", label: "Very poor" }
    ]
  },
  {
    id: "stress-levels",
    question: "How would you rate your current stress levels?",
    description: "Please select the option that best describes your experience.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "low", label: "Low" },
      { id: "moderate", label: "Moderate" },
      { id: "high", label: "High" },
      { id: "very-high", label: "Very high" }
    ]
  },
  {
    id: "alcohol-consumption",
    question: "How often do you consume alcohol?",
    description: "Alcohol can impact anxiety symptoms and medication effectiveness.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "never", label: "Never" },
      { id: "occasionally", label: "Occasionally" },
      { id: "weekly", label: "Weekly" },
      { id: "several-times-week", label: "Several times per week" },
      { id: "daily", label: "Daily" }
    ]
  },
  {
    id: "caffeine-consumption",
    question: "How would you describe your caffeine consumption?",
    description: "Caffeine can exacerbate anxiety symptoms.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "none", label: "None" },
      { id: "low", label: "Low (1 cup of coffee/tea per day)" },
      { id: "moderate", label: "Moderate (2-3 cups per day)" },
      { id: "high", label: "High (4+ cups per day)" }
    ]
  },
  {
    id: "exercise-frequency",
    question: "How often do you engage in physical exercise?",
    description: "Regular exercise can help manage anxiety symptoms.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "never", label: "Never" },
      { id: "occasionally", label: "Occasionally" },
      { id: "1-2-times", label: "1-2 times per week" },
      { id: "3-4-times", label: "3-4 times per week" },
      { id: "5-plus-times", label: "5+ times per week" }
    ]
  },

  // Step 7: Treatment Preferences
  {
    id: "treatment-preferences",
    question: "What type of support are you looking for?",
    description: "Select all that apply.",
    type: QuestionType.MultiSelect,
    options: [
      { id: "medication", label: "Medication" },
      { id: "therapy", label: "Therapy or counseling" },
      { id: "self-help", label: "Self-help tools" },
      { id: "lifestyle-changes", label: "Lifestyle recommendations" },
      { id: "combination", label: "Combination approach" },
      { id: "not-sure", label: "Not sure" }
    ]
  },
  {
    id: "medication-openness",
    question: "How open are you to taking medication for anxiety?",
    description: "This helps us determine appropriate recommendations.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "very-open", label: "Very open" },
      { id: "somewhat-open", label: "Somewhat open" },
      { id: "prefer-avoid", label: "Prefer to avoid if possible" },
      { id: "only-last-resort", label: "Only as a last resort" },
      { id: "not-open", label: "Not open to medication" }
    ]
  },
  {
    id: "therapy-preference",
    question: "If interested in therapy, which format would you prefer?",
    description: "Select your preferred therapy format.",
    type: QuestionType.SingleSelect,
    options: [
      { id: "in-person", label: "In-person" },
      { id: "video", label: "Video sessions" },
      { id: "phone", label: "Phone sessions" },
      { id: "messaging", label: "Messaging-based therapy" },
      { id: "no-preference", label: "No preference" },
      { id: "not-interested", label: "Not interested in therapy" }
    ]
  }
];

// Calculate progress percentage based on current question index
export const getProgressPercentage = (currentOffset: number): number => {
  // Offset 0 is introduction (20%), max should be 95% for the last question
  const totalQuestions = mentalHealthQuestions.length;
  
  if (currentOffset === 0) return 20;
  
  // First actual question starts at 25%, increases proportionally to last question
  const questionIndex = currentOffset - 1; // Since offset 1 = first question
  return 25 + (questionIndex / totalQuestions * 70);
};

// Helper function to assess anxiety severity based on responses
export const assessAnxietySeverity = (responses: Record<string, any>): string => {
  let severityScore = 0;
  
  // Check selected symptoms count
  if (responses['anxiety-symptoms'] && Array.isArray(responses['anxiety-symptoms'])) {
    severityScore += Math.min(responses['anxiety-symptoms'].length, 5);
  }
  
  // Check self-reported severity
  if (responses['symptom-severity']) {
    switch(responses['symptom-severity']) {
      case 'mild': severityScore += 1; break;
      case 'moderate': severityScore += 2; break;
      case 'severe': severityScore += 3; break;
      case 'extreme': severityScore += 4; break;
    }
  }
  
  // Check impact on daily life
  if (responses['daily-impact'] && Array.isArray(responses['daily-impact'])) {
    if (!responses['daily-impact'].includes('minimal-impact')) {
      severityScore += Math.min(responses['daily-impact'].length, 3);
    }
  }
  
  // Assess severity based on score
  if (severityScore <= 3) return "Mild";
  if (severityScore <= 6) return "Moderate";
  if (severityScore <= 9) return "Moderate to Severe";
  return "Severe";
};

// Determine eligibility based on responses
export const checkEligibility = (responses: Record<string, any>): { eligible: boolean; reason: string } => {
  // Step 1: Age Check
  if (responses['age-group'] === 'under-18') {
    return {
      eligible: false,
      reason: "Our mental health services are designed for adults 18 and older. We recommend speaking with a parent or guardian about seeking support from a mental health professional who specializes in working with adolescents."
    };
  }

  // Step 4: Active severe conditions check
  if (Array.isArray(responses['medical-history'])) {
    if (responses['medical-history'].includes('bipolar')) {
      return {
        eligible: false,
        reason: "Based on your responses, our standard anxiety treatment may not be the best fit for your needs. Bipolar disorder often requires specialized care. We recommend consulting with a psychiatrist for personalized treatment."
      };
    }

    if (responses['medical-history'].includes('substance-use')) {
      return {
        eligible: false,
        reason: "Based on your responses, you may benefit from specialized care that addresses both substance use and anxiety. We recommend seeking care from a provider who specializes in dual diagnosis treatment."
      };
    }
  }

  // Step 4: Suicidal ideation check (this would be added to the questionnaire if appropriate)
  if (responses['suicidal-thoughts'] === 'yes') {
    return {
      eligible: false,
      reason: "Your safety is our top priority. Based on your responses, we recommend immediate consultation with a mental health professional or calling a crisis helpline for support. Our services are not designed for crisis intervention."
    };
  }

  // Treatment readiness check
  if (responses['medication-openness'] === 'not-open' && 
      (!responses['treatment-preferences'] || 
       !Array.isArray(responses['treatment-preferences']) || 
       responses['treatment-preferences'].includes('medication'))) {
    return {
      eligible: true,
      reason: "We noticed that you're interested in medication support but also indicated you're not open to taking medication. Our providers can discuss non-medication options, but wanted to note this potential mismatch in expectations."
    };
  }

  // If we've passed all the checks, the user is eligible
  return {
    eligible: true,
    reason: "Based on your responses, our mental health support services appear to be a good fit for your needs. We look forward to connecting you with appropriate resources."
  };
};