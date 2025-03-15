// src/store/mhFormStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the types for our form data
interface MHFormData {
  currentStep: string;
  completedSteps: string[];
  formData: {
    stepOffsets: Record<string, number>;
  };
}

// Define the store state and actions
interface MHFormState extends MHFormData {
  setCurrentStep: (step: string) => void;
  markStepCompleted: (step: string) => void;
  setStepOffset: (step: string, offset: number) => void;
  resetForm: () => void;
}

// Define the form steps in order
export const MH_FORM_STEPS = [
  "/c/mh/introduction",
  "/c/mh/anxiety",
  "/c/mh/submit"
];

// Create the Zustand store with persistence
export const useMHFormStore = create(
  persist<MHFormState>(
    (set) => ({
      // Initial state
      currentStep: MH_FORM_STEPS[0],
      completedSteps: [],
      formData: {
        stepOffsets: {}, // Track offsets for each step
      },

      // Actions
      setCurrentStep: (step) => set({ currentStep: step }),
      
      markStepCompleted: (step) => 
        set((state) => ({
          completedSteps: [...new Set([...state.completedSteps, step])]
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
          currentStep: MH_FORM_STEPS[0],
          completedSteps: [],
          formData: {
            stepOffsets: {},
          }
        }),
    }),
    {
      name: "mh-form-storage", // Name for localStorage key
    }
  )
);

// Helper function to determine if a user can access a specific step
export const canAccessStep = (step: string, completedSteps: string[]): boolean => {
  const stepIndex = MH_FORM_STEPS.indexOf(step);
  if (stepIndex === 0) return true; // First step is always accessible
  
  // Check if the previous step has been completed
  const previousStep = MH_FORM_STEPS[stepIndex - 1];
  return completedSteps.includes(previousStep);
};

// Helper function to get the next step
export const getNextStep = (currentStep: string): string | null => {
  const currentIndex = MH_FORM_STEPS.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === MH_FORM_STEPS.length - 1) return null;
  return MH_FORM_STEPS[currentIndex + 1];
};

// Helper function to get last completed step (for resuming)
export const getLastCompletedStep = (completedSteps: string[]): string => {
  if (completedSteps.length === 0) return MH_FORM_STEPS[0];
  
  // Find the last completed step based on the order in MH_FORM_STEPS
  const validCompletedSteps = completedSteps.filter(step => MH_FORM_STEPS.includes(step));
  if (validCompletedSteps.length === 0) return MH_FORM_STEPS[0];
  
  // Sort by their index in the steps array
  validCompletedSteps.sort((a, b) => 
    MH_FORM_STEPS.indexOf(b) - MH_FORM_STEPS.indexOf(a)
  );
  
  return validCompletedSteps[0];
};