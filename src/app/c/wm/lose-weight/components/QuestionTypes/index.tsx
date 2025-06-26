//src/app/c/wm/lose-weight/components/QuestionTypes/index.tsx
import React, { useState } from "react";
import { 
  Question, 
  QuestionType, 
  SingleSelectQuestion, 
  MultiSelectQuestion,
  TextInputQuestion,
  HeightInputQuestion,
  ContactInfoQuestion,
  ContactInfoData,
  US_STATES
} from "../../types";
import { sanitizeInput, validateContactInfo } from "../../data/questions";

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
              ? "border-[#fe92b5] bg-gray-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <span className="text-lg font-medium text-black">{option.label}</span>
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
              ? "border-[#fe92b5] bg-gray-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <span className="text-lg font-medium text-black">{option.label}</span>
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
        className={`w-full p-6 text-xl rounded-lg border-2 text-black ${
          error ? "border-red-500" : "border-gray-300 focus:border-[#fe92b5]"
        } focus:outline-none`}
      />
      {error && (
        <p className="mt-2 text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

// Height Input Component
export const HeightInput: React.FC<{
  question: HeightInputQuestion;
  value: string | undefined;
  onChange: (value: string) => void;
}> = ({ question, value = "", onChange }) => {
  const [error, setError] = useState<string | null>(null);
  
  // Parse current value or set defaults
  let currentFeet = "";
  let currentInches = "";
  
  if (value) {
    try {
      const heightData = JSON.parse(value);
      currentFeet = heightData.feet || "";
      currentInches = heightData.inches || "";
    } catch {
      // Invalid JSON, use defaults
    }
  }
  
  const handleHeightChange = (field: 'feet' | 'inches', newValue: string) => {
    // Only allow numbers
    const cleanedValue = newValue.replace(/[^0-9]/g, '');
    
    let updatedFeet = currentFeet;
    let updatedInches = currentInches;
    
    if (field === 'feet') {
      updatedFeet = cleanedValue;
    } else {
      updatedInches = cleanedValue;
    }
    
    // Create the height object
    const heightObject = {
      feet: updatedFeet,
      inches: updatedInches
    };
    
    const heightString = JSON.stringify(heightObject);
    onChange(heightString);
    
    // Validate if both values are provided
    if (question.validation && updatedFeet && updatedInches) {
      setError(question.validation(heightString) ? null : question.errorMessage || "Invalid height");
    } else if (updatedFeet && updatedInches) {
      setError(null);
    }
  };
  
  return (
    <div className="mb-12">
      <div className="flex gap-4">
        {/* Feet Input */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-black mb-2">
            Feet
          </label>
          <input
            type="number"
            value={currentFeet}
            onChange={(e) => handleHeightChange('feet', e.target.value)}
            placeholder="5"
            min="3"
            max="8"
            className={`w-full p-6 text-xl rounded-lg border-2 text-black ${
              error ? "border-red-500" : "border-gray-300 focus:border-[#fe92b5]"
            } focus:outline-none`}
          />
        </div>
        
        {/* Inches Input */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-black mb-2">
            Inches
          </label>
          <input
            type="number"
            value={currentInches}
            onChange={(e) => handleHeightChange('inches', e.target.value)}
            placeholder="7"
            min="0"
            max="11"
            className={`w-full p-6 text-xl rounded-lg border-2 text-black ${
              error ? "border-red-500" : "border-gray-300 focus:border-[#fe92b5]"
            } focus:outline-none`}
          />
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-red-500 text-sm">{error}</p>
      )}
      
      {/* Display selected height */}
      {currentFeet && currentInches && (
        <p className="mt-2 text-gray-600 text-sm">
          Selected height: {currentFeet}'{currentInches}"
        </p>
      )}
    </div>
  );
};

// Updated Contact Info Component with new fields
export const ContactInfo: React.FC<{
  question: ContactInfoQuestion;
  value: ContactInfoData | undefined;
  onChange: (value: ContactInfoData) => void;
}> = ({ question, value, onChange }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidated, setIsValidated] = useState<boolean>(false);
  
  // Initialize default values
  const contactData: ContactInfoData = {
    firstName: value?.firstName || "",
    lastName: value?.lastName || "",
    email: value?.email || "",
    phone: value?.phone || "",
    state: value?.state || "",
    dateOfBirth: value?.dateOfBirth || ""
  };
  
  const handleFieldChange = (field: keyof ContactInfoData, rawValue: string) => {
    let processedValue: string;
    
    // Apply appropriate sanitization based on field type
    switch (field) {
      case 'firstName':
      case 'lastName':
        // For names, preserve spaces during typing
        processedValue = rawValue;
        break;
      case 'email':
        // For email, just trim and lowercase
        processedValue = rawValue.trim().toLowerCase();
        break;
      case 'phone':
        // Format phone numbers
        processedValue = sanitizeInput.phone(rawValue);
        break;
      case 'dateOfBirth':
        // For date input, use the raw value as browser handles formatting
        processedValue = rawValue;
        break;
      case 'state':
        // State should be selected from dropdown, keep as is
        processedValue = rawValue;
        break;
      default:
        processedValue = rawValue;
    }
    
    const updatedData = {
      ...contactData,
      [field]: processedValue
    };
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    onChange(updatedData);
  };
  
  const handleBlur = (field: keyof ContactInfoData) => {
    // Sanitize names on blur
    if (field === 'firstName' || field === 'lastName') {
      const sanitizedValue = sanitizeInput.name(contactData[field]);
      if (sanitizedValue !== contactData[field]) {
        const updatedData = {
          ...contactData,
          [field]: sanitizedValue
        };
        onChange(updatedData);
      }
    }
    
    // Validate on blur
    const validation = validateContactInfo(contactData);
    setErrors(validation.errors);
    setIsValidated(true);
  };
  
  return (
    <div className="space-y-6 mb-12">
      {/* First and Last Name Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name Field */}
        {question.fields.firstName && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={contactData.firstName}
              onChange={(e) => handleFieldChange('firstName', e.target.value)}
              onBlur={() => handleBlur('firstName')}
              placeholder="Enter your first name"
              maxLength={50}
              className={`w-full p-4 text-lg rounded-lg border-2 text-black ${
                errors.firstName ? "border-red-500" : "border-gray-300 focus:border-[#fe92b5]"
              } focus:outline-none`}
              required
            />
            {errors.firstName && (
              <p className="mt-1 text-red-500 text-sm">{errors.firstName}</p>
            )}
          </div>
        )}
        
        {/* Last Name Field */}
        {question.fields.lastName && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={contactData.lastName}
              onChange={(e) => handleFieldChange('lastName', e.target.value)}
              onBlur={() => handleBlur('lastName')}
              placeholder="Enter your last name"
              maxLength={50}
              className={`w-full p-4 text-lg rounded-lg border-2 text-black ${
                errors.lastName ? "border-red-500" : "border-gray-300 focus:border-[#fe92b5]"
              } focus:outline-none`}
              required
            />
            {errors.lastName && (
              <p className="mt-1 text-red-500 text-sm">{errors.lastName}</p>
            )}
          </div>
        )}
      </div>
      
      {/* Email Field */}
      {question.fields.email && (
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={contactData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="Enter your email address"
            maxLength={254}
            className={`w-full p-4 text-lg rounded-lg border-2 text-black ${
              errors.email ? "border-red-500" : "border-gray-300 focus:border-[#fe92b5]"
            } focus:outline-none`}
            required
          />
          {errors.email && (
            <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
          )}
        </div>
      )}
      
      {/* Phone and State Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phone Field */}
        {question.fields.phone && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={contactData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              placeholder="(555) 123-4567"
              maxLength={14}
              className={`w-full p-4 text-lg rounded-lg border-2 text-black ${
                errors.phone ? "border-red-500" : "border-gray-300 focus:border-[#fe92b5]"
              } focus:outline-none`}
              required
            />
            {errors.phone && (
              <p className="mt-1 text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>
        )}
        
        {/* State Field */}
        {question.fields.state && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              State *
            </label>
            <select
              value={contactData.state}
              onChange={(e) => handleFieldChange('state', e.target.value)}
              onBlur={() => handleBlur('state')}
              className={`w-full p-4 text-lg rounded-lg border-2 text-black bg-white ${
                errors.state ? "border-red-500" : "border-gray-300 focus:border-[#fe92b5]"
              } focus:outline-none`}
              required
            >
              <option value="">Select your state</option>
              {US_STATES.map((state) => (
                <option key={state.abbreviation} value={state.abbreviation}>
                  {state.name}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 text-red-500 text-sm">{errors.state}</p>
            )}
          </div>
        )}
      </div>
      
      {/* Date of Birth Field */}
      {question.fields.dateOfBirth && (
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            value={contactData.dateOfBirth}
            onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
            onBlur={() => handleBlur('dateOfBirth')}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
            className={`w-full p-4 text-lg rounded-lg border-2 text-black ${
              errors.dateOfBirth ? "border-red-500" : "border-gray-300 focus:border-[#fe92b5]"
            } focus:outline-none`}
            required
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-red-500 text-sm">{errors.dateOfBirth}</p>
          )}
          <p className="mt-1 text-gray-600 text-sm">
            You must be at least 18 years old to use our services
          </p>
        </div>
      )}
      
      {/* Privacy Notice */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Privacy Notice:</span> Your information is secure and will only be used to provide your personalized weight loss recommendations. We never share your data with third parties.
        </p>
      </div>
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
    case QuestionType.HeightInput:
      return <HeightInput 
        question={question as HeightInputQuestion} 
        value={value as string} 
        onChange={onChange} 
      />;
    case QuestionType.ContactInfo:
      return <ContactInfo 
        question={question as ContactInfoQuestion} 
        value={value as ContactInfoData} 
        onChange={onChange} 
      />;
    default:
      return <div className="text-black">Unsupported question type</div>;
  }
};