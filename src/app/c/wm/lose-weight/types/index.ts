//src/app/c/wm/lose-weight/types/index.ts

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

// Question types enum - ADDED ContactInfo
export enum QuestionType {
  SingleSelect = "single-select",
  MultiSelect = "multi-select",
  TextInput = "text-input",
  HeightInput = "height-input",
  ContactInfo = "contact-info"
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

// Height input question
export interface HeightInputQuestion extends BaseQuestion {
  type: QuestionType.HeightInput;
  placeholder: string;
  inputType: string; // "height"
  validation?: (value: string) => boolean;
  errorMessage?: string;
}

// Contact info question - NEW
export interface ContactInfoQuestion extends BaseQuestion {
  type: QuestionType.ContactInfo;
  fields: {
    name: boolean;
    email: boolean;
    phone: boolean;
  };
}

// Union type of all question types - ADDED ContactInfoQuestion
export type Question = SingleSelectQuestion | MultiSelectQuestion | TextInputQuestion | HeightInputQuestion | ContactInfoQuestion;

// Contact info data interface - NEW
export interface ContactInfoData {
  name: string;
  email: string;
  phone: string;
}

// Form response type - UPDATED to include ContactInfoData
export interface FormResponse {
  [questionId: string]: string | string[] | number | ContactInfoData;
}

// Form data state
export interface FormState {
  responses: FormResponse;
  currentOffset: number;
}