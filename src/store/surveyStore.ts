// /src/store/surveyStore.ts
import create from 'zustand';

// Define the state structure for the survey
interface SurveyStore {
  currentStep: string;  // Tracks the current step
  responses: Record<string, string>;  // Stores answers for each question
  isSurveyCompleted: boolean;  // Whether the survey is completed
  startSurvey: () => void;  // Starts the survey
  goToNextStep: (step: string) => void;  // Moves to the next step
  setResponse: (question: string, answer: string) => void;  // Sets the answer for a question
  completeSurvey: () => void;  // Marks survey as completed
}

// Create the Zustand store
export const useSurveyStore = create<SurveyStore>((set) => ({
  currentStep: "intro",  // Initial step
  responses: {},  // No answers yet
  isSurveyCompleted: false,  // Survey is not completed initially
  
  startSurvey: () => set({ currentStep: "introduction" }),
  goToNextStep: (step) => set({ currentStep: step }),
  setResponse: (question, answer) => set((state) => ({
    responses: { ...state.responses, [question]: answer }
  })),
  completeSurvey: () => set({ isSurveyCompleted: true }),
}));
