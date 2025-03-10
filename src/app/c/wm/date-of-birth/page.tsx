"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";

export default function DateOfBirth() {
  const router = useRouter();
  const { markStepCompleted, setDateOfBirth } = useWMFormStore();
  
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isValid, setIsValid] = useState(false);

  // Handle date of birth input change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateOfBirth(value);
    
    // Simple validation for MM-DD-YYYY format
    // You might want to add more sophisticated validation
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    setIsValid(dateRegex.test(value));
  };

  const handleContinue = () => {
    if (isValid) {
      // Store the date of birth in the form store
      // This requires adding a new field in your store
      markStepCompleted("/c/wm/date-of-birth");
      
      // Navigate to the next step
      router.push("/c/wm/submit");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar - Adjust the progress value as needed */}
      <ProgressBar progress={90} />

      <div className="max-w-lg w-full text-center mt-10">
        <h2 className="text-2xl font-semibold text-black mb-4">To verify eligibility, tell us your date of birth:</h2>
        
        {/* Date of Birth Input */}
        <input
          type="text"
          value={dateOfBirth}
          onChange={handleDateChange}
          placeholder="MM-DD-YYYY"
          className="w-full p-3 border border-gray-300 rounded-lg mb-6"
        />
      </div>

      {/* Fixed Button at Bottom */}
      <div className="fixed bottom-6 w-full flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!isValid}
          className={`text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-lg ${
            isValid ? "bg-black" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}