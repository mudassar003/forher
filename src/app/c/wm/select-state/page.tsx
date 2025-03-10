"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";

export default function SelectState() {
  const router = useRouter();
  const { markStepCompleted } = useWMFormStore();

  // Temporarily hardcoded states
  const states = ["California", "Texas"]; 

  const [selectedState, setSelectedState] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const handleContinue = () => {
    if (selectedState && isChecked) {
      markStepCompleted("/c/wm/select-state");
      router.push("/c/wm/submit");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={98} />

      <div className="max-w-lg w-full text-center mt-10">
        {/* Custom Logo Text */}
        <h1 className="text-3xl font-bold text-[#fe92b5]">Direct2Her</h1>
        
        <h2 className="text-2xl font-semibold text-black mt-6 mb-4">Select the state you live in:</h2>
        <p className="text-gray-600 mb-6">This state is where your medication will be shipped to, if prescribed.</p>

        {/* State Dropdown */}
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
        >
          <option value="">State</option>
          {states.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>

        {/* Terms and Conditions Checkbox */}
        <div className="flex items-center space-x-2 mb-6">
          <input 
            type="checkbox" 
            checked={isChecked} 
            onChange={() => setIsChecked(!isChecked)} 
            className="w-5 h-5"
          />
          <label className="text-gray-600 text-sm">
            By clicking "Continue," I agree to the <a href="#" className="text-blue-500">Terms and Conditions</a> and 
            <a href="#" className="text-blue-500"> Telehealth Consent</a> and acknowledge the 
            <a href="#" className="text-blue-500"> Privacy Policy</a>.
          </label>
        </div>
      </div>

      {/* Fixed Button at Bottom */}
      <div className="fixed bottom-6 w-full flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!selectedState || !isChecked}
          className={`text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-lg ${
            selectedState && isChecked ? "bg-black" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>

      {/* Documentation for Future API Integration
      <div className="mt-8 p-4 bg-gray-100 text-gray-600 text-sm rounded-lg w-full max-w-lg mb-24">
        <h3 className="font-semibold text-black mb-2">How to Replace Hardcoded States with API Data</h3>
        <ol className="list-decimal pl-5">
          <li>Replace the `states` array with an API call inside `useEffect`.</li>
          <li>Use `fetch("https://api.countrystatecity.in/v1/countries/US/states")` with the correct API key.</li>
          <li>Ensure `data` returned is an array, then update `setStates(data.map(state => state.name))`.</li>
          <li>Remove the hardcoded states and enable dynamic state fetching.</li>
        </ol>
        <p className="mt-2">Once the API key is available, update this component accordingly.</p>
      </div> */}
    </div>
  );
}