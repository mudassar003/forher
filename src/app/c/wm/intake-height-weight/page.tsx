//src/app/c/wm/intake-height-weight/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";

export default function IntakeHeightWeight() {
  const router = useRouter();
  const { markStepCompleted, setHeight, setWeight } = useWMFormStore();
  
  const [feet, setFeet] = useState<string>("");
  const [inches, setInches] = useState<string>("");
  const [pounds, setPounds] = useState<string>("");
  const [errors, setErrors] = useState<{
    height?: string;
    weight?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {height?: string; weight?: string;} = {};
    let isValid = true;
    
    if (!feet || !inches) {
      newErrors.height = "Please enter your height";
      isValid = false;
    } else if (parseInt(feet) < 1 || parseInt(feet) > 9) {
      newErrors.height = "Please enter a valid height";
      isValid = false;
    }
    
    if (!pounds) {
      newErrors.weight = "Please enter your weight";
      isValid = false;
    } else if (parseInt(pounds) < 50 || parseInt(pounds) > 700) {
      newErrors.weight = "Please enter a valid weight";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleContinue = () => {
    if (validateForm()) {
      // Convert height to string format "feet'inches""
      const heightValue = `${feet}'${inches}"`;
      
      // Store the height and weight in the form store
      setHeight(heightValue);
      setWeight(pounds);
      markStepCompleted("/c/wm/intake-height-weight");
      
      // Navigate to the next step (this would be submit or another step)
      router.push("/c/wm/medical-intake");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={97} />

      <div className="max-w-lg w-full mt-10">
        <h2 className="text-2xl font-semibold text-black mb-3">
          What is your height?
        </h2>
        
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="number"
              value={feet}
              onChange={(e) => setFeet(e.target.value)}
              placeholder="Feet"
              min="1"
              max="9"
              className="w-full p-4 text-center rounded-lg border-2 border-gray-300 focus:border-black focus:outline-none"
            />
            <p className="text-center text-sm mt-1 text-gray-500">Feet</p>
          </div>
          <div className="flex-1">
            <input
              type="number"
              value={inches}
              onChange={(e) => setInches(e.target.value)}
              placeholder="Inches"
              min="0"
              max="11"
              className="w-full p-4 text-center rounded-lg border-2 border-gray-300 focus:border-black focus:outline-none"
            />
            <p className="text-center text-sm mt-1 text-gray-500">Inches</p>
          </div>
        </div>
        {errors.height && <p className="text-red-500 text-sm mb-6">{errors.height}</p>}
        
        <h2 className="text-2xl font-semibold text-black mb-3">
          What is your weight?
        </h2>
        
        <div className="mb-6">
          <input
            type="number"
            value={pounds}
            onChange={(e) => setPounds(e.target.value)}
            placeholder="Weight"
            min="50"
            max="700"
            className="w-full p-4 text-center rounded-lg border-2 border-gray-300 focus:border-black focus:outline-none"
          />
          <p className="text-center text-sm mt-1 text-gray-500">Pounds</p>
        </div>
        {errors.weight && <p className="text-red-500 text-sm mb-6">{errors.weight}</p>}
      </div>

      {/* Fixed Button at Bottom */}
      <div className="fixed bottom-6 w-full flex justify-center">
        <button
          onClick={handleContinue}
          className="text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-lg bg-black hover:opacity-90"
        >
          Continue
        </button>
      </div>
    </div>
  );
}