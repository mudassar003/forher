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
    ethnicity: string[] | null;
    sexAssignedAtBirth: string | null;
    medicalConditions: string[] | null;
    takingMedications: string | null;
    medicationAllergies: string[] | null;
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
  setEthnicity: (ethnicity: string[]) => void;
  setSexAssignedAtBirth: (sex: string) => void;
  setMedicalConditions: (conditions: string[]) => void;
  setTakingMedications: (value: string) => void;
  setMedicationAllergies: (allergies: string[]) => void;
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
        ethnicity: null,
        sexAssignedAtBirth: null,
        medicalConditions: null,
        takingMedications: null,
        medicationAllergies: null,
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
      
      // New actions for medical intake
      setEthnicity: (ethnicity) => 
        set((state) => ({
          formData: { ...state.formData, ethnicity: ethnicity }
        })),
        
      setSexAssignedAtBirth: (sex) => 
        set((state) => ({
          formData: { ...state.formData, sexAssignedAtBirth: sex }
        })),
        
      setMedicalConditions: (conditions) => 
        set((state) => ({
          formData: { ...state.formData, medicalConditions: conditions }
        })),
        
      setTakingMedications: (value) => 
        set((state) => ({
          formData: { ...state.formData, takingMedications: value }
        })),
        
      setMedicationAllergies: (allergies) => 
        set((state) => ({
          formData: { ...state.formData, medicationAllergies: allergies }
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
            ethnicity: null,
            sexAssignedAtBirth: null,
            medicalConditions: null,
            takingMedications: null,
            medicationAllergies: null,
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