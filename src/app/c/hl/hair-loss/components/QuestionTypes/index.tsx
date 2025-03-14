//src/app/c/hl/hair-loss/components/QuestionTypes/index.tsx
import React, { useState } from "react";
import { 
  Question, 
  QuestionType, 
  SingleSelectQuestion, 
  MultiSelectQuestion,
  TextInputQuestion
} from "../../types";

// Single Select Question Component
export const SingleSelect: React.FC<{
  question: SingleSelectQuestion;
  value: string | undefined;
  onChange: (value: string) => void;
}> = ({ question, value, onChange }) => {
  return (
    <div className="space-y-6 mb-12">
      {question.options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`w-full p-6 text-left rounded-lg border-2 transition-colors ${
            value === option.id
              ? "border-[#6366f1] bg-gray-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <span className="text-lg font-medium">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

// Multi Select Question Component
export const MultiSelect: React.FC<{
  question: MultiSelectQuestion;
  value: string[] | undefined;
  onChange: (value: string[]) => void;
}> = ({ question, value = [], onChange }) => {
  
  const handleOptionSelect = (optionId: string) => {
    // Check if "none" option exists and handle special case
    const hasNoneOption = question.options.some(opt => opt.id === "none");
    
    if (hasNoneOption) {
      // Special handling for "None of the above" option
      if (optionId === "none") {
        onChange(["none"]);
        return;
      }
      
      // If selecting an option but "none" is selected, remove "none"
      if (value.includes("none") && optionId !== "none") {
        onChange([optionId]);
        return;
      }
    }
    
    // Regular multi-select handling
    if (value.includes(optionId)) {
      // If already selected, remove it
      onChange(value.filter(id => id !== optionId));
    } else {
      // Otherwise add it
      onChange([...value, optionId]);
    }
  };
  
  return (
    <div className="space-y-6 mb-12">
      {question.options.map((option) => (
        <button
          key={option.id}
          onClick={() => handleOptionSelect(option.id)}
          className={`w-full p-6 text-left rounded-lg border-2 transition-colors ${
            value.includes(option.id)
              ? "border-[#6366f1] bg-gray-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <span className="text-lg font-medium">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

// Text Input Question Component
export const TextInput: React.FC<{
  question: TextInputQuestion;
  value: string | undefined;
  onChange: (value: string) => void;
}> = ({ question, value = "", onChange }) => {
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Apply input type restrictions
    if (question.inputType === "number") {
      // Allow only numbers
      const cleanedValue = newValue.replace(/[^0-9]/g, '');
      onChange(cleanedValue);
      
      // Validate if needed
      if (question.validation) {
        setError(question.validation(cleanedValue) ? null : question.errorMessage || "Invalid input");
      }
    } else {
      // For other input types
      onChange(newValue);
      
      // Validate if needed
      if (question.validation) {
        setError(question.validation(newValue) ? null : question.errorMessage || "Invalid input");
      }
    }
  };
  
  return (
    <div className="mb-12">
      <input
        type={question.inputType}
        value={value}
        onChange={handleChange}
        placeholder={question.placeholder}
        className={`w-full p-6 text-xl rounded-lg border-2 ${
          error ? "border-red-500" : "border-gray-300 focus:border-[#6366f1]"
        } focus:outline-none`}
      />
      {error && (
        <p className="mt-2 text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

// Question Renderer Component
export const QuestionRenderer: React.FC<{
  question: Question;
  value: any;
  onChange: (value: any) => void;
}> = ({ question, value, onChange }) => {
  switch (question.type) {
    case QuestionType.SingleSelect:
      return <SingleSelect 
        question={question as SingleSelectQuestion} 
        value={value as string} 
        onChange={onChange} 
      />;
    case QuestionType.MultiSelect:
      return <MultiSelect 
        question={question as MultiSelectQuestion} 
        value={value as string[]} 
        onChange={onChange} 
      />;
    case QuestionType.TextInput:
      return <TextInput 
        question={question as TextInputQuestion} 
        value={value as string} 
        onChange={onChange} 
      />;
    default:
      return <div>Unsupported question type</div>;
  }
};