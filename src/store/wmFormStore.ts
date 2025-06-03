//src/store/wmFormStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the types for our form data
interface WMFormData {
  currentStep: string;
  completedSteps: string[];
  formData: {
    stepOffsets: Record<string, number>;
  };
}

// Define the store state and actions
interface WMFormState extends WMFormData {
  setCurrentStep: (step: string) => void;
  markStepCompleted: (step: string) => void;
  setStepOffset: (step: string, offset: number) => void;
  resetForm: () => void;
}

// Define the form steps in order - removed submit step
export const WM_FORM_STEPS: string[] = [
  "/c/wm/introduction",
  "/c/wm/lose-weight",
  "/c/wm/results"
];

// Create the Zustand store with persistence
export const useWMFormStore = create(
  persist<WMFormState>(
    (set) => ({
      // Initial state
      currentStep: WM_FORM_STEPS[0],
      completedSteps: [],
      formData: {
        stepOffsets: {}, // Track offsets for each step
      },

      // Actions
      setCurrentStep: (step: string) => set({ currentStep: step }),
      
      markStepCompleted: (step: string) => 
        set((state) => ({
          completedSteps: [...new Set([...state.completedSteps, step])]
        })),
      
      // Set the offset for a specific step
      setStepOffset: (step: string, offset: number) => 
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
  const validCompletedSteps = completedSteps.filter((step: string) => WM_FORM_STEPS.includes(step));
  if (validCompletedSteps.length === 0) return WM_FORM_STEPS[0];
  
  // Sort by their index in the steps array
  validCompletedSteps.sort((a: string, b: string) => 
    WM_FORM_STEPS.indexOf(b) - WM_FORM_STEPS.indexOf(a)
  );
  
  return validCompletedSteps[0];
};