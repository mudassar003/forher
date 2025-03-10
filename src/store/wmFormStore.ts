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
    // Add other form fields as needed
  };
}

// Define the store state and actions
interface WMFormState extends WMFormData {
  setCurrentStep: (step: string) => void;
  markStepCompleted: (step: string) => void;
  setWeightLossGoal: (goal: string) => void;
  setTreatmentApproach: (approach: string) => void;
  resetForm: () => void;
  // You can add more setters for additional form fields
}

// Define the form steps in order
export const WM_FORM_STEPS = [
  "/c/wm/introduction",
  "/c/wm/your-goal",
  "/c/wm/your-goal-transition",
  "/c/wm/treatment-approach",
  "/c/wm/treatment-paths",
  "/c/wm/wayfind-build-profile", // New step added here
  "/c/wm/submit"
];

// Create the Zustand store with persistence
export const useWMFormStore = create(
  persist<WMFormState>(
    (set) => ({
      // Initial state
      currentStep: WM_FORM_STEPS[0],
      completedSteps: [],
      formData: {
        weightLossGoal: null,
        treatmentApproach: null,
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
      
      resetForm: () => 
        set({
          currentStep: WM_FORM_STEPS[0],
          completedSteps: [],
          formData: {
            weightLossGoal: null,
            treatmentApproach: null,
          }
        }),
    }),
    {
      name: "wm-form-storage", // Name for localStorage key
      // You can add additional persistence options here
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