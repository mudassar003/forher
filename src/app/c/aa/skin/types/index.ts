//src/app/c/aa/skin/types/index.ts

// Question option type
export interface QuestionOption {
  id: string;
  label: string;
}

// Base question interface
export interface BaseQuestion {
  id: string;
  question: string;
  description: string;
  type: QuestionType;
  conditionalDisplay?: (formData: Record<string, any>) => boolean;
}

// Question types enum
export enum QuestionType {
  SingleSelect = "single-select",
  MultiSelect = "multi-select",
  TextInput = "text-input"
}

// Single select question
export interface SingleSelectQuestion extends BaseQuestion {
  type: QuestionType.SingleSelect;
  options: QuestionOption[];
}

// Multi select question
export interface MultiSelectQuestion extends BaseQuestion {
  type: QuestionType.MultiSelect;
  options: QuestionOption[];
}

// Text input question
export interface TextInputQuestion extends BaseQuestion {
  type: QuestionType.TextInput;
  placeholder: string;
  inputType: string; // "text", "number", etc.
  validation?: (value: string) => boolean;
  errorMessage?: string;
}

// Union type of all question types
export type Question = SingleSelectQuestion | MultiSelectQuestion | TextInputQuestion;

// Form response type
export interface FormResponse {
  [questionId: string]: string | string[] | number;
}

// Form data state
export interface FormState {
  responses: FormResponse;
  currentOffset: number;
}