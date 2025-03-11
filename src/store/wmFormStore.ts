// src/store/wmFormStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the types for our form data
interface WMFormData {
  currentStep: string;
  completedSteps: string[];
  formData: {
    weightLossGoal: string | null;
    treatmentApproach: string | null;
    numberOfProgramsTried: string | null;
    dateOfBirth: string | null;
    familyWithWeightStruggle: string | null;
    dailyLifeStressLevel: string | null;
    qualitySleep: string | null;
    weightHoldSites: string | null;
    cravings: string | null;
    eatingPatterns: string[] | null;
    programSupport: string[] | null;
    goalMeaning: string[] | null;
    height: string | null;
    weight: string | null;

    
    // Medical intake fields (offset 0-12)
    ethnicity: string[] | null;
    sexAssignedAtBirth: string | null;
    identifyAsWoman: string | null;
    medicalConditions: string[] | null;
    maximumWeight: string | null;
    goalWeight: string | null;
    activityLevel: string | null;
    takingMedications: string | null;
    eatingSymptoms: string[] | null;
    eatingDisorderDiagnosis: string[] | null;
    eatingDisorderRemission: string | null;
    purgedInLastYear: string | null;
    medicationAllergies: string[] | null;
    purgeFrequency: string | null;
    purgingRiskAcknowledgment: string | null;
    mentalHealthCondition: string | null;
    desireToHarmSelf: string | null;
    mentalHealthDiagnoses: string[] | null;
    suicideResourceAcknowledgment: string | null;
    inPsychiatricCare: string | null;
    takingMentalHealthMeds: string | null;
    hasMedicalConditions: string | null;
    
    // Track offsets for each step
    stepOffsets: Record<string, number>;
  };
}

// Define the store state and actions
interface WMFormState extends WMFormData {
  setCurrentStep: (step: string) => void;
  markStepCompleted: (step: string) => void;
  setWeightLossGoal: (goal: string) => void;
  setTreatmentApproach: (approach: string) => void;
  setNumberOfProgramsTried: (count: string) => void;
  setDateOfBirth: (dob: string) => void;
  setFamilyWithWeightStruggle: (value: string) => void;
  setDailyLifeStressLevel: (level: string) => void;
  setQualitySleep: (sleep: string) => void;
  setWeightHoldSites: (sites: string) => void;
  setCravings: (cravings: string) => void;
  setEatingPatterns: (patterns: string[]) => void;
  setProgramSupport: (support: string[]) => void;
  setGoalMeaning: (meaning: string[]) => void;
  setHeight: (height: string) => void;
  setWeight: (weight: string) => void;
  
  // Medical intake actions (offset 0-12)
  setEthnicity: (ethnicity: string[]) => void;
  setSexAssignedAtBirth: (sex: string) => void;
  setIdentifyAsWoman: (value: string) => void;
  setMedicalConditions: (conditions: string[]) => void;
  setMaximumWeight: (value: string) => void;
  setGoalWeight: (weight: string) => void;
  setActivityLevel: (level: string) => void;
  setTakingMedications: (value: string) => void;
  setEatingSymptoms: (symptoms: string[]) => void;
  setEatingDisorderDiagnosis: (diagnoses: string[]) => void;
  setEatingDisorderRemission: (status: string) => void;
  setPurgedInLastYear: (value: string) => void;
  setMedicationAllergies: (allergies: string[]) => void;
  setPurgeFrequency: (frequency: string) => void;
  setPurgingRiskAcknowledgment: (acknowledged: string) => void;
  setMentalHealthCondition: (value: string) => void;
  setDesireToHarmSelf: (value: string) => void;
  setMentalHealthDiagnoses: (diagnoses: string[]) => void;
  setSuicideResourceAcknowledgment: (value: string) => void;
  setInPsychiatricCare: (value: string) => void;
  setTakingMentalHealthMeds: (value: string) => void;
  setHasMedicalConditions: (value: string) => void;
    
  
  // Offset tracking
  setStepOffset: (step: string, offset: number) => void;
  resetForm: () => void;
}

// Define the form steps in order
export const WM_FORM_STEPS = [
  "/c/wm/introduction",
  "/c/wm/your-goal",
  "/c/wm/your-goal-transition",
  "/c/wm/treatment-approach",
  "/c/wm/treatment-paths",
  "/c/wm/wayfind-build-profile",
  "/c/wm/select-state",
  "/c/wm/date-of-birth",
  "/c/wm/number-of-programs-tried",
  "/c/wm/any-family-with-weight-struggle",
  "/c/wm/daily-life-stress-level",
  "/c/wm/quality-sleep",
  "/c/wm/weight-hold-sites",
  "/c/wm/cravings",
  "/c/wm/eating-patterns",
  "/c/wm/eating-pattern-program-support",
  "/c/wm/eating-pattern-goal",
  "/c/wm/intake-height-weight",
  "/c/wm/medical-intake", // Added medical intake step
  "/c/wm/submit"
];

// Create the Zustand store with persistence
export const useWMFormStore = create(
  persist<WMFormState>(
    (set, get) => ({
      // Initial state
      currentStep: WM_FORM_STEPS[0],
      completedSteps: [],
      formData: {
        weightLossGoal: null,
        treatmentApproach: null,
        numberOfProgramsTried: null,
        dateOfBirth: null,
        familyWithWeightStruggle: null,
        dailyLifeStressLevel: null,
        qualitySleep: null,
        weightHoldSites: null,
        cravings: null,
        eatingPatterns: null,
        programSupport: null,
        goalMeaning: null,
        height: null,
        weight: null,
        
        // Medical intake fields (offset 0-12)
        ethnicity: null,
        sexAssignedAtBirth: null,
        identifyAsWoman: null,
        medicalConditions: null,
        maximumWeight: null,
        goalWeight: null,
        activityLevel: null,
        takingMedications: null,
        eatingSymptoms: null,
        eatingDisorderDiagnosis: null,
        eatingDisorderRemission: null,
        purgedInLastYear: null,
        medicationAllergies: null,
        purgeFrequency: null,
        purgingRiskAcknowledgment: null,
        mentalHealthCondition: null,
        desireToHarmSelf: null,
        mentalHealthDiagnoses: null,
        suicideResourceAcknowledgment: null,
        inPsychiatricCare: null,
        takingMentalHealthMeds: null,
        hasMedicalConditions: null,
        
        
        stepOffsets: {}, // Track offsets for each step
      },

      // Actions
      setCurrentStep: (step) => set({ currentStep: step }),
      
      markStepCompleted: (step) => 
        set((state) => ({
          completedSteps: [...new Set([...state.completedSteps, step])]
        })),
      
      setWeightLossGoal: (goal) => 
        set((state) => ({
          formData: { ...state.formData, weightLossGoal: goal }
        })),
      
      setTreatmentApproach: (approach) => 
        set((state) => ({
          formData: { ...state.formData, treatmentApproach: approach }
        })),
      
      setNumberOfProgramsTried: (count) => 
        set((state) => ({
          formData: { ...state.formData, numberOfProgramsTried: count }
        })),
      
      setDateOfBirth: (dob) => 
        set((state) => ({
          formData: { ...state.formData, dateOfBirth: dob }
        })),
        
      setFamilyWithWeightStruggle: (value) => 
        set((state) => ({
          formData: { ...state.formData, familyWithWeightStruggle: value }
        })),
        
      setDailyLifeStressLevel: (level) => 
        set((state) => ({
          formData: { ...state.formData, dailyLifeStressLevel: level }
        })),
        
      setQualitySleep: (sleep) => 
        set((state) => ({
          formData: { ...state.formData, qualitySleep: sleep }
        })),
        
      setWeightHoldSites: (sites) => 
        set((state) => ({
          formData: { ...state.formData, weightHoldSites: sites }
        })),
        
      setCravings: (cravings) => 
        set((state) => ({
          formData: { ...state.formData, cravings: cravings }
        })),

      setEatingPatterns: (patterns) => 
        set((state) => ({
          formData: { ...state.formData, eatingPatterns: patterns }
        })),

      setProgramSupport: (support) => 
        set((state) => ({
          formData: { ...state.formData, programSupport: support }
        })),

      setGoalMeaning: (meaning) => 
        set((state) => ({
          formData: { ...state.formData, goalMeaning: meaning }
        })),
        
      setHeight: (height) => 
        set((state) => ({
          formData: { ...state.formData, height: height }
        })),
        
      setWeight: (weight) => 
        set((state) => ({
          formData: { ...state.formData, weight: weight }
        })),

      // Medical intake actions (offset 0-12)
      setEthnicity: (ethnicity) => 
        set((state) => ({
          formData: { ...state.formData, ethnicity: ethnicity }
        })),
        
      setSexAssignedAtBirth: (sex) => 
        set((state) => ({
          formData: { ...state.formData, sexAssignedAtBirth: sex }
        })),
        
      setIdentifyAsWoman: (value) => 
        set((state) => ({
          formData: { ...state.formData, identifyAsWoman: value }
        })),
        
      setMedicalConditions: (conditions) => 
        set((state) => ({
          formData: { ...state.formData, medicalConditions: conditions }
        })),
        
      setMaximumWeight: (value) => 
        set((state) => ({
          formData: { ...state.formData, maximumWeight: value }
        })),
        
      setGoalWeight: (weight) => 
        set((state) => ({
          formData: { ...state.formData, goalWeight: weight }
        })),
        
      setActivityLevel: (level) => 
        set((state) => ({
          formData: { ...state.formData, activityLevel: level }
        })),
        
      setTakingMedications: (value) => 
        set((state) => ({
          formData: { ...state.formData, takingMedications: value }
        })),
        
      setEatingSymptoms: (symptoms) => 
        set((state) => ({
          formData: { ...state.formData, eatingSymptoms: symptoms }
        })),
        
      setEatingDisorderDiagnosis: (diagnoses) => 
        set((state) => ({
          formData: { ...state.formData, eatingDisorderDiagnosis: diagnoses }
        })),
        
      setEatingDisorderRemission: (status) => 
        set((state) => ({
          formData: { ...state.formData, eatingDisorderRemission: status }
        })),
        
      setPurgedInLastYear: (value) => 
        set((state) => ({
          formData: { ...state.formData, purgedInLastYear: value }
        })),
        
      setMedicationAllergies: (allergies) => 
        set((state) => ({
          formData: { ...state.formData, medicationAllergies: allergies }
        })),
      
      setPurgeFrequency: (frequency) => 
      set((state) => ({
        formData: { ...state.formData, purgeFrequency: frequency }
      })),

      setPurgingRiskAcknowledgment: (acknowledged) => 
      set((state) => ({
        formData: { ...state.formData, purgingRiskAcknowledgment: acknowledged }
      })),

      setMentalHealthCondition: (value) => 
      set((state) => ({
        formData: { ...state.formData, mentalHealthCondition: value }
      })),

    setDesireToHarmSelf: (value) => 
      set((state) => ({
        formData: { ...state.formData, desireToHarmSelf: value }
      })),

    setMentalHealthDiagnoses: (diagnoses) => 
      set((state) => ({
        formData: { ...state.formData, mentalHealthDiagnoses: diagnoses }
      })),
    
    setSuicideResourceAcknowledgment: (value) => 
      set((state) => ({
        formData: { ...state.formData, suicideResourceAcknowledgment: value }
      })),

    setInPsychiatricCare: (value) => 
      set((state) => ({
        formData: { ...state.formData, inPsychiatricCare: value }
      })),

    setTakingMentalHealthMeds: (value) => 
      set((state) => ({
        formData: { ...state.formData, takingMentalHealthMeds: value }
      })),

    setHasMedicalConditions: (value) => 
      set((state) => ({
        formData: { ...state.formData, hasMedicalConditions: value }
      })),

      // Set the offset for a specific step
      setStepOffset: (step, offset) => 
        set((state) => ({
          formData: { 
            ...state.formData, 
            stepOffsets: {
              ...state.formData.stepOffsets,
              [step]: offset
            }
          }
        })),
      
      resetForm: () => 
        set({
          currentStep: WM_FORM_STEPS[0],
          completedSteps: [],
          formData: {
            weightLossGoal: null,
            treatmentApproach: null,
            numberOfProgramsTried: null,
            dateOfBirth: null,
            familyWithWeightStruggle: null,
            dailyLifeStressLevel: null,
            qualitySleep: null,
            weightHoldSites: null,
            cravings: null,
            eatingPatterns: null,
            programSupport: null,
            goalMeaning: null,
            height: null,
            weight: null,
            
            // Medical intake fields (offset 0-12)
            ethnicity: null,
            sexAssignedAtBirth: null,
            identifyAsWoman: null,
            medicalConditions: null,
            maximumWeight: null,
            goalWeight: null,
            activityLevel: null,
            takingMedications: null,
            eatingSymptoms: null,
            eatingDisorderDiagnosis: null,
            eatingDisorderRemission: null,
            purgedInLastYear: null,
            medicationAllergies: null,
            purgeFrequency: null,
            purgingRiskAcknowledgment: null,
            mentalHealthCondition: null,
            desireToHarmSelf: null,
            mentalHealthDiagnoses: null,
            suicideResourceAcknowledgment: null,
            inPsychiatricCare: null,
            takingMentalHealthMeds: null,
            hasMedicalConditions: null,
            
            
            stepOffsets: {},
          }
        }),
    }),
    {
      name: "wm-form-storage", // Name for localStorage key
    }
  )
);

// Helper function to determine if a user can access a specific step
export const canAccessStep = (step: string, completedSteps: string[]): boolean => {
  const stepIndex = WM_FORM_STEPS.indexOf(step);
  if (stepIndex === 0) return true; // First step is always accessible
  
  // Check if the previous step has been completed
  const previousStep = WM_FORM_STEPS[stepIndex - 1];
  return completedSteps.includes(previousStep);
};

// Helper function to get the next step
export const getNextStep = (currentStep: string): string | null => {
  const currentIndex = WM_FORM_STEPS.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === WM_FORM_STEPS.length - 1) return null;
  return WM_FORM_STEPS[currentIndex + 1];
};

// Helper function to get last completed step (for resuming)
export const getLastCompletedStep = (completedSteps: string[]): string => {
  if (completedSteps.length === 0) return WM_FORM_STEPS[0];
  
  // Find the last completed step based on the order in WM_FORM_STEPS
  const validCompletedSteps = completedSteps.filter(step => WM_FORM_STEPS.includes(step));
  if (validCompletedSteps.length === 0) return WM_FORM_STEPS[0];
  
  // Sort by their index in the steps array
  validCompletedSteps.sort((a, b) => 
    WM_FORM_STEPS.indexOf(b) - WM_FORM_STEPS.indexOf(a)
  );
  
  return validCompletedSteps[0];
};