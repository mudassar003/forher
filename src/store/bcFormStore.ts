// src/store/bcFormStore.ts
import { create } from "zustand";

// Define the types for our form data
interface BCFormData {
  currentStep: string;
  completedSteps: string[];
  formData: {
    stepOffsets: Record<string, number>;
  };
}

// Define the store state and actions
interface BCFormState extends BCFormData {
  setCurrentStep: (step: string) => void;
  markStepCompleted: (step: string) => void;
  setStepOffset: (step: string, offset: number) => void;
  resetForm: () => void;
}

// Define the form steps in order
export const BC_FORM_STEPS = [
  "/c/b/introduction",
  "/c/b/birth-control",
  "/c/b/submit"
];

// Create the Zustand store WITHOUT persistence to ensure fresh start every time
export const useBCFormStore = create<BCFormState>((set) => ({
  // Initial state
  currentStep: BC_FORM_STEPS[0],
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
      currentStep: BC_FORM_STEPS[0],
      completedSteps: [],
      formData: {
        stepOffsets: {},
      }
    }),
}));

// Helper function to determine if a user can access a specific step
export const canAccessStep = (step: string, completedSteps: string[]): boolean => {
  const stepIndex = BC_FORM_STEPS.indexOf(step);
  if (stepIndex === 0) return true; // First step is always accessible
  
  // Check if the previous step has been completed
  const previousStep = BC_FORM_STEPS[stepIndex - 1];
  return completedSteps.includes(previousStep);
};

// Helper function to get the next step
export const getNextStep = (currentStep: string): string | null => {
  const currentIndex = BC_FORM_STEPS.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === BC_FORM_STEPS.length - 1) return null;
  return BC_FORM_STEPS[currentIndex + 1];
};

// Helper function to get last completed step (for resuming) - NOT USED in this version
export const getLastCompletedStep = (completedSteps: string[]): string => {
  // Always return first step since we're not persisting sessions
  return BC_FORM_STEPS[0];
};