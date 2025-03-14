// src/store/hlFormStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the types for our form data
interface HLFormData {
  currentStep: string;
  completedSteps: string[];
  formData: {
    stepOffsets: Record<string, number>;
  };
}

// Define the store state and actions
interface HLFormState extends HLFormData {
  setCurrentStep: (step: string) => void;
  markStepCompleted: (step: string) => void;
  setStepOffset: (step: string, offset: number) => void;
  resetForm: () => void;
}

// Define the form steps in order
export const HL_FORM_STEPS = [
  "/c/hl/introduction",
  "/c/hl/hair-loss",
  "/c/hl/submit"
];

// Create the Zustand store with persistence
export const useHLFormStore = create(
  persist<HLFormState>(
    (set) => ({
      // Initial state
      currentStep: HL_FORM_STEPS[0],
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
          currentStep: HL_FORM_STEPS[0],
          completedSteps: [],
          formData: {
            stepOffsets: {},
          }
        }),
    }),
    {
      name: "hl-form-storage", // Name for localStorage key
    }
  )
);

// Helper function to determine if a user can access a specific step
export const canAccessStep = (step: string, completedSteps: string[]): boolean => {
  const stepIndex = HL_FORM_STEPS.indexOf(step);
  if (stepIndex === 0) return true; // First step is always accessible
  
  // Check if the previous step has been completed
  const previousStep = HL_FORM_STEPS[stepIndex - 1];
  return completedSteps.includes(previousStep);
};

// Helper function to get the next step
export const getNextStep = (currentStep: string): string | null => {
  const currentIndex = HL_FORM_STEPS.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === HL_FORM_STEPS.length - 1) return null;
  return HL_FORM_STEPS[currentIndex + 1];
};

// Helper function to get last completed step (for resuming)
export const getLastCompletedStep = (completedSteps: string[]): string => {
  if (completedSteps.length === 0) return HL_FORM_STEPS[0];
  
  // Find the last completed step based on the order in HL_FORM_STEPS
  const validCompletedSteps = completedSteps.filter(step => HL_FORM_STEPS.includes(step));
  if (validCompletedSteps.length === 0) return HL_FORM_STEPS[0];
  
  // Sort by their index in the steps array
  validCompletedSteps.sort((a, b) => 
    HL_FORM_STEPS.indexOf(b) - HL_FORM_STEPS.indexOf(a)
  );
  
  return validCompletedSteps[0];
};