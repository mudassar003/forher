//src/app/c/wm/medical-intake/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";

// Define a type for the form data related to medical intake
interface MedicalFormData {
    ethnicity?: string[] | null;
    sexAssignedAtBirth?: string | null;
    identifyAsWoman?: string | null;
    medicalConditions?: string[] | null;
    maximumWeight?: string | null;
    goalWeight?: string | null;
    activityLevel?: string | null;
    takingMedications?: string | null;
    eatingSymptoms?: string[] | null;
    eatingDisorderDiagnosis?: string[] | null;
    eatingDisorderRemission?: string | null;
    purgedInLastYear?: string | null;
    medicationAllergies?: string[] | null;
    mentalHealthCondition?: string | null;
    desireToHarmSelf?: string | null;
    mentalHealthDiagnoses?: string[] | null;
    suicideResourceAcknowledgment?: string | null;
    inPsychiatricCare?: string | null;
    takingMentalHealthMeds?: string | null;
    hasMedicalConditions?: string | null;
  [key: string]: any; // To allow for other form data properties
}

// Define a type for question options
interface QuestionOption {
  id: string;
  label: string;
}

// Define a type for the medical questions
interface MedicalQuestion {
  question: string;
  description: string;
  options: QuestionOption[];
  multiSelect: boolean;
  isTextInput?: boolean;
  conditionalDisplay?: (formData: MedicalFormData) => boolean;
}

// Define the questions for each offset/screen
const medicalQuestions: MedicalQuestion[] = [
  // offset 0
  {
    question: "How would you describe your ethnicity?",
    description: "We ask this to better tailor treatment options to you. Please select all that apply.",
    options: [
      { id: "asian", label: "Asian" },
      { id: "south-asian", label: "South Asian" },
      { id: "black", label: "Black or African American" },
      { id: "hispanic", label: "Hispanic or Latino" },
      { id: "native-american", label: "Native American" },
      { id: "pacific-islander", label: "Pacific Islander" },
      { id: "white", label: "White or Caucasian" },
      { id: "other", label: "Other" },
      { id: "prefer-not-to-answer", label: "I prefer not to answer" }
    ],
    multiSelect: true
  },
  // offset 1
  {
    question: "What was your sex assigned at birth?",
    description: "",
    options: [
      { id: "female", label: "Female" },
      { id: "male", label: "Male" }
    ],
    multiSelect: false
  },
  // offset 2
  {
    question: "Do you identify as a woman?",
    description: "",
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ],
    multiSelect: false
  },
  // offset 3
  {
    question: "Do you have any of the following medical conditions?",
    description: "Select all that apply",
    options: [
      { id: "diabetes", label: "Diabetes" },
      { id: "hypertension", label: "Hypertension (High blood pressure)" },
      { id: "heart-disease", label: "Heart disease" },
      { id: "thyroid", label: "Thyroid disorder" },
      { id: "none", label: "None of the above" }
    ],
    multiSelect: true
  },
  // offset 4
  {
    question: "Is your current weight the most you have ever weighed?",
    description: "",
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ],
    multiSelect: false
  },
  // offset 5
  {
    question: "What is your goal weight?",
    description: "Please enter your desired weight in pounds (lbs).",
    options: [],
    isTextInput: true,
    multiSelect: false
  },
  // offset 6
  {
    question: "How would you describe your typical daily activity level?",
    description: "",
    options: [
      { id: "5", label: "5 – I'm very active (i.e. exercise 6-7 days per week)" },
      { id: "4", label: "4" },
      { id: "3", label: "3 – I'm moderately active (i.e. exercise 3-5 days per week)" },
      { id: "2", label: "2" },
      { id: "1", label: "1 – I'm not very active (i.e. don't usually exercise during the week)" }
    ],
    multiSelect: false
  },
  // offset 7
  {
    question: "Are you currently taking any medications?",
    description: "This helps us ensure any treatment is safe for you",
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ],
    multiSelect: false
  },
  // offset 8
  {
    question: "Have you ever experienced any of these symptoms?",
    description: "Select all that apply",
    options: [
      { id: "vomiting", label: "Causing yourself to vomit in order to lose weight" },
      { id: "binge-eating", label: "Frequently eating very large amounts of food and feeling like you can't stop eating" },
      { id: "severe-restriction", label: "Severely limiting the amount of food you eat due to an intense fear of gaining weight" },
      { id: "none", label: "No, I have not experienced any of these" }
    ],
    multiSelect: true
  },
  // offset 9
  {
    question: "Have you been diagnosed with any of the following conditions?",
    description: "Select all that apply",
    options: [
      { id: "anorexia", label: "Anorexia" },
      { id: "bulimia", label: "Bulimia" },
      { id: "binge-eating-disorder", label: "Binge eating disorder" },
      { id: "none", label: "No, I have not been diagnosed with any of these conditions" }
    ],
    multiSelect: true
  },
  // offset 10
  {
    question: "Have you been in remission from your anorexia or bulimia eating disorder for one year or more?",
    description: "",
    options: [
      { id: "current-treatment", label: "No, I am currently being treated" },
      { id: "less-than-year", label: "No, I have been in remission for less than one year" },
      { id: "year-or-more", label: "Yes, I have been in remission for one year or more" }
    ],
    multiSelect: false,
    conditionalDisplay: (formData: MedicalFormData) => {
      return !!formData.eatingDisorderDiagnosis && 
        (formData.eatingDisorderDiagnosis.includes("anorexia") || 
         formData.eatingDisorderDiagnosis.includes("bulimia"));
    }
  },
  // offset 11
  {
    question: "Have you purged or forced yourself to vomit in order to lose weight within the last 12 months?",
    description: "",
    options: [
      { id: "no", label: "No" },
      { id: "yes", label: "Yes" }
    ],
    multiSelect: false
  },
  // offset 12
  {
    question: "Have you had any allergic reactions to medications?",
    description: "Select all that apply",
    options: [
      { id: "antibiotics", label: "Antibiotics" },
      { id: "nsaids", label: "NSAIDs (like aspirin, ibuprofen)" },
      { id: "other", label: "Other medications" },
      { id: "none", label: "No known medication allergies" }
    ],
    multiSelect: true
    },
  // offset 13 (new)
    {
        question: "How frequently have you purged or vomited to lose weight over the last 3 months?",
        description: "",
        options: [
        { id: "weekly", label: "About once a week" },
        { id: "monthly", label: "About once a month" },
        { id: "not-at-all", label: "Not at all" }
        ],
        multiSelect: false,
    },

    // offset 14
    {
        question: "Please be aware that purging (self-induced vomiting with or without the use of laxatives or diuretics/water pills), severely restricting your calories, or falling below a BMI of 18.5 (underweight) at any time while using a weight loss medication can increase your risk of electrolyte imbalance and potential for seizures. If you begin purging or severely restricting at any time while on treatment, please alert our Care Team and your primary care provider so that appropriate modifications to your treatment plan can be made to ensure your safety and continued success on your weight loss journey.",
        description: "",
        options: [
        { id: "acknowledged", label: "I understand, continue" }
        ],
        multiSelect: false
    },

    // offset 15 (same as before)
    {
    question: "Have you been diagnosed with a mental health condition?",
    description: "",
    options: [
        { id: "no", label: "No" },
        { id: "yes", label: "Yes" }
    ],
    multiSelect: false
    },

    // offset 16 - Path A/B (if no mental health condition)
    {
    question: "Do you currently have any desire to harm yourself or others?",
    description: "",
    options: [
        { id: "no", label: "No" },
        { id: "yes", label: "Yes" }
    ],
    multiSelect: false,
    conditionalDisplay: (formData: MedicalFormData) => {
        return formData.mentalHealthCondition === "no";
    }
    },

    // offset 16 - Path C/D (if yes mental health condition)
    {
    question: "Have you been diagnosed with any of the following?",
    description: "Select all that apply",
    options: [
        { id: "depression", label: "Depression" },
        { id: "generalized-anxiety", label: "Generalized anxiety" },
        { id: "bipolar", label: "Bipolar disease (manic depression)" },
        { id: "panic-attack", label: "Panic attack" },
        { id: "psychiatric-hospitalization", label: "Psychiatric hospitalization within the last 3 months" },
        { id: "borderline", label: "Borderline personality disorder" },
        { id: "psychosis", label: "Psychosis" },
        { id: "schizophrenia", label: "Schizophrenia or schizoaffective disorder" },
        { id: "other", label: "Other" }
    ],
        multiSelect: true,
        conditionalDisplay: (formData: MedicalFormData) => {
            return formData.mentalHealthCondition === "yes";
        }
    },

    // offset 17 - Path B (suicide resources)
    {
    question: "If you are experiencing suicidal thoughts and need to speak to someone, please reach out to individuals in your current environment or use the resources below for immediate assistance: 24/7 National Suicide Prevention Lifeline: 988 (call or text) En Español: 1-888-628-9454 24/7 Crisis Text Line: Text 'HOME to 741-741",
    description: "",
    options: [
        { id: "understood", label: "I understand" }
    ],
    multiSelect: false,
    conditionalDisplay: (formData: MedicalFormData) => {
        return formData.mentalHealthCondition === "no" && formData.desireToHarmSelf === "yes";
    }
    },
    // offset 17 - Path C (bipolar - psychiatric care)
    {
    question: "Are you in active psychiatric care?",
    description: "",
    options: [
        { id: "yes", label: "Yes" },
        { id: "no", label: "No" }
    ],
    multiSelect: false,
    conditionalDisplay: (formData: MedicalFormData) => {
        return formData.mentalHealthCondition === "yes" && 
            formData.mentalHealthDiagnoses?.includes("bipolar") === true;
    }
    },
    // offset 17 - Path D (non-bipolar - mental health meds)
    {
    question: "Are you currently taking any mental health medication to treat your condition(s)?",
    description: "",
    options: [
        { id: "no", label: "No" },
        { id: "yes", label: "Yes" }
    ],
    multiSelect: false,
    conditionalDisplay: (formData: MedicalFormData) => {
        return formData.mentalHealthCondition === "yes" && 
            formData.mentalHealthDiagnoses?.includes("bipolar") !== true;
    }
    },
    // offset 18 - Medical conditions (for all paths eventually)
    {
    question: "Do you have any medical conditions or chronic diseases?",
    description: "",
    options: [
        { id: "no", label: "No" },
        { id: "yes", label: "Yes" }
    ],
    multiSelect: false
    },
    // offset 19 - End of for
];

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      <p className="mt-4 text-lg">Loading...</p>
    </div>
  );
}

// Form component that uses searchParams
function MedicalIntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = "/c/wm/medical-intake";
  
  // Get the current offset from URL query parameters (default to 0)
  const offset = parseInt(searchParams?.get("offset") || "0");
  
  // Get states and actions from the store
  const { 
    formData,
    markStepCompleted, 
    setEthnicity, 
    setSexAssignedAtBirth,
    setIdentifyAsWoman,
    setMedicalConditions,
    setMaximumWeight,
    setGoalWeight,
    setActivityLevel,
    setTakingMedications,
    setEatingSymptoms,
    setEatingDisorderDiagnosis,
    setEatingDisorderRemission,
    setPurgedInLastYear,
    setMedicationAllergies,
    setPurgeFrequency,
    setPurgingRiskAcknowledgment,
    setMentalHealthCondition,
    setDesireToHarmSelf,
    setMentalHealthDiagnoses,
    setSuicideResourceAcknowledgment,
    setInPsychiatricCare,
    setTakingMentalHealthMeds,
    setHasMedicalConditions,
   
    setStepOffset
  } = useWMFormStore();
  
  // Get the current question based on offset
  const currentQuestion = medicalQuestions[offset];
  
  // State for selected options
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  // State for text input (used for goal weight)
  const [textInput, setTextInput] = useState<string>("");

  // Check if current question should be skipped based on conditions
  const shouldSkipQuestion = () => {
    if (currentQuestion.conditionalDisplay && !currentQuestion.conditionalDisplay(formData)) {
      // Skip to next question
      const nextOffset = offset + 1;
      if (nextOffset >= medicalQuestions.length) {
        markStepCompleted(pathname);
        router.push("/c/wm/submit");
      } else {
        router.push(`${pathname}?offset=${nextOffset}`);
      }
      return true;
    }
    return false;
  };

  // Initialize selected options from store if available
  useEffect(() => {
    // Check if current question should be skipped
    if (shouldSkipQuestion()) return;
    
    // Load saved answers for the current offset/question if they exist
    switch(offset) {
      case 0:
        if (formData.ethnicity) setSelectedOptions(formData.ethnicity);
        break;
      case 1:
        if (formData.sexAssignedAtBirth) setSelectedOptions([formData.sexAssignedAtBirth]);
        break;
      case 2:
        if (formData.identifyAsWoman) setSelectedOptions([formData.identifyAsWoman]);
        break;
      case 3:
        if (formData.medicalConditions) setSelectedOptions(formData.medicalConditions);
        break;
      case 4:
        if (formData.maximumWeight) setSelectedOptions([formData.maximumWeight]);
        break;
      case 5:
        if (formData.goalWeight) setTextInput(formData.goalWeight);
        break;
      case 6:
        if (formData.activityLevel) setSelectedOptions([formData.activityLevel]);
        break;
      case 7:
        if (formData.takingMedications) setSelectedOptions([formData.takingMedications]);
        break;
      case 8:
        if (formData.eatingSymptoms) setSelectedOptions(formData.eatingSymptoms);
        break;
      case 9:
        if (formData.eatingDisorderDiagnosis) setSelectedOptions(formData.eatingDisorderDiagnosis);
        break;
      case 10:
        if (formData.eatingDisorderRemission) setSelectedOptions([formData.eatingDisorderRemission]);
        break;
      case 11:
        if (formData.purgedInLastYear) setSelectedOptions([formData.purgedInLastYear]);
        break;
      case 12:
        if (formData.medicationAllergies) setSelectedOptions(formData.medicationAllergies);
            break;
      case 13:
        if (formData.purgeFrequency) setSelectedOptions([formData.purgeFrequency]);
            break;
     case 14:
        if (formData.purgingRiskAcknowledgment) setSelectedOptions([formData.purgingRiskAcknowledgment]);
            break;
     case 15:
        if (formData.mentalHealthCondition) setSelectedOptions([formData.mentalHealthCondition]);
        break;
     case 16:
        if (formData.mentalHealthCondition === "no") {
            if (formData.desireToHarmSelf) setSelectedOptions([formData.desireToHarmSelf]);
        } else if (formData.mentalHealthCondition === "yes") {
            if (formData.mentalHealthDiagnoses) setSelectedOptions(formData.mentalHealthDiagnoses);
        }
        break;
     case 17:
        if (formData.mentalHealthCondition === "no" && formData.desireToHarmSelf === "yes") {
            if (formData.suicideResourceAcknowledgment) setSelectedOptions([formData.suicideResourceAcknowledgment]);
        } else if (formData.mentalHealthCondition === "yes" && formData.mentalHealthDiagnoses?.includes("bipolar")) {
            if (formData.inPsychiatricCare) setSelectedOptions([formData.inPsychiatricCare]);
        } else if (formData.mentalHealthCondition === "yes") {
            if (formData.takingMentalHealthMeds) setSelectedOptions([formData.takingMentalHealthMeds]);
        }
        break;
     case 18:
        if (formData.hasMedicalConditions) setSelectedOptions([formData.hasMedicalConditions]);
        break;
    }
  }, [offset, formData]);

  // Calculate progress for the progress bar
  // Starting at 97% and incrementing slightly for each offset
  const maxOffsetCount = medicalQuestions.length - 1;
  const progressPercentage = 97 + Math.min(offset / maxOffsetCount * 3, 3);

  // Handle text input change (for goal weight)
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setTextInput(value);
  };

  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    if (currentQuestion.multiSelect) {
      // Special handling for "I prefer not to answer" option in ethnicity question
      if (offset === 0 && optionId === "prefer-not-to-answer") {
        setSelectedOptions(["prefer-not-to-answer"]);
        return;
      }
      
      // If selecting an ethnicity option but "prefer not to answer" is selected, remove it
      if (offset === 0 && selectedOptions.includes("prefer-not-to-answer") && optionId !== "prefer-not-to-answer") {
        setSelectedOptions([optionId]);
        return;
      }
      
      // For "None" option in questions with none option, clear other selections
      if (optionId === "none" && [3, 8, 9, 12].includes(offset)) {
        setSelectedOptions(["none"]);
        return;
      }
      
      // If selecting an option other than "None", remove "None" from selections
      if (selectedOptions.includes("none") && [3, 8, 9, 12].includes(offset)) {
        setSelectedOptions([optionId]);
        return;
      }
      
      // Regular multi-select handling
      setSelectedOptions(prev => {
        // If already selected, remove it
        if (prev.includes(optionId)) {
          return prev.filter(id => id !== optionId);
        } 
        // Otherwise add it
        return [...prev, optionId];
      });
    } else {
      // Single select - just set the option
      setSelectedOptions([optionId]);
    }
  };

  // Store responses based on current offset
  const storeResponses = () => {
    switch(offset) {
      case 0:
        // Store ethnicity information
        setEthnicity(selectedOptions);
        break;
      case 1:
        // Store sex assigned at birth
        setSexAssignedAtBirth(selectedOptions[0] || "");
        break;
      case 2:
        // Store gender identity
        setIdentifyAsWoman(selectedOptions[0] || "");
        break;
      case 3:
        // Store medical conditions
        setMedicalConditions(selectedOptions);
        break;
      case 4:
        // Store maximum weight info
        setMaximumWeight(selectedOptions[0] || "");
        break;
      case 5:
        // Store goal weight
        setGoalWeight(textInput);
        break;
      case 6:
        // Store activity level
        setActivityLevel(selectedOptions[0] || "");
        break;
      case 7:
        // Store taking medications
        setTakingMedications(selectedOptions[0] || "no");
        break;
      case 8:
        // Store eating symptoms
        setEatingSymptoms(selectedOptions);
        break;
      case 9:
        // Store eating disorder diagnosis
        setEatingDisorderDiagnosis(selectedOptions);
        break;
      case 10:
        // Store eating disorder remission status
        setEatingDisorderRemission(selectedOptions[0] || "");
        break;
      case 11:
        // Store purging info
        setPurgedInLastYear(selectedOptions[0] || "");
        break;
      case 12:
        // Store medication allergies
        setMedicationAllergies(selectedOptions);
            break;
      case 13:
        // Store purge frequency
        setPurgeFrequency(selectedOptions[0] || "");
            break;
       case 14:
      // Store purging risk acknowledgment
      setPurgingRiskAcknowledgment(selectedOptions[0] || "");
            break;
        case 15:
        // Store mental health condition
        setMentalHealthCondition(selectedOptions[0] || "");
        break;
        case 16:
        // Store based on which path we're on
        if (formData.mentalHealthCondition === "no") {
            setDesireToHarmSelf(selectedOptions[0] || "");
        } else {
            setMentalHealthDiagnoses(selectedOptions);
        }
        break;
        case 17:
        // Store based on which path we're on
        if (formData.mentalHealthCondition === "no" && formData.desireToHarmSelf === "yes") {
            setSuicideResourceAcknowledgment(selectedOptions[0] || "");
        } else if (formData.mentalHealthCondition === "yes" && formData.mentalHealthDiagnoses?.includes("bipolar")) {
            setInPsychiatricCare(selectedOptions[0] || "");
        } else if (formData.mentalHealthCondition === "yes") {
            setTakingMentalHealthMeds(selectedOptions[0] || "");
        }
        break;
        case 18:
        // Store medical conditions response
        setHasMedicalConditions(selectedOptions[0] || "");
        break;
    }
    
    // Store the current offset
    setStepOffset(pathname, offset);
  };

  // Handle navigation to next screen
  const handleContinue = () => {
    // Store current screen's responses
    storeResponses();
    
    // If this is the last screen
    if (offset >= medicalQuestions.length - 1) {
      // Mark step as completed
      markStepCompleted(pathname);
      
      // Navigate to the next step in the flow
      router.push("/c/wm/submit");
    } else {
      // Navigate to the next offset
      router.push(`${pathname}?offset=${offset + 1}`);
    }
  };

  // Check if continue button should be enabled
  const isContinueEnabled = currentQuestion.isTextInput 
    ? textInput.trim() !== "" 
    : selectedOptions.length > 0;

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={progressPercentage} />

      <div className="w-full max-w-lg mt-16 mb-24">
        {/* Question - Left-aligned, larger text */}
        <h2 className="text-3xl font-semibold text-black mb-8 text-left">
          {currentQuestion.question}
        </h2>
        
        {currentQuestion.description && (
          <p className="text-gray-600 mb-8 text-left">
            {currentQuestion.description}
          </p>
        )}
        
        {/* Text input for goal weight */}
        {currentQuestion.isTextInput ? (
          <div className="mb-10">
            <input
              type="text"
              value={textInput}
              onChange={handleTextInputChange}
              placeholder="Enter weight in pounds"
              className="w-full p-6 text-lg rounded-lg border-2 border-gray-300 focus:border-[#fe92b5] focus:outline-none"
            />
          </div>
        ) : (
          /* Options - Taller, more prominent buttons */
          <div className="space-y-5 mb-10">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                className={`w-full p-6 text-left rounded-lg border-2 transition-colors ${
                  selectedOptions.includes(option.id)
                    ? "border-[#fe92b5] bg-gray-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <span className="text-lg">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* White gradient fade effect at bottom - enhanced density */}
      <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white to-transparent pointer-events-none" style={{ 
        backgroundImage: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.5) 70%, rgba(255,255,255,0) 100%)' 
      }}></div>

      {/* Fixed Button at Bottom */}
      <div className="fixed bottom-6 w-full flex justify-center z-10">
        <button
          onClick={handleContinue}
          disabled={!isContinueEnabled}
          className={`text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-lg ${
            isContinueEnabled ? "bg-black hover:bg-gray-900" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function MedicalIntakePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MedicalIntakeForm />
    </Suspense>
  );
}