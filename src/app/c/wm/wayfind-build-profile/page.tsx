//src/app/c/wm/wayfind-build-profile/page.tsx
"use client";

import { useRouter } from "next/navigation";
import ProgressBar from "@/app/c/wm/components/ProgressBar";
import { useWMFormStore } from "@/store/wmFormStore";

export default function WayfindBuildProfile() {
  const router = useRouter();
  
  // Get states and actions from the store
  const { markStepCompleted } = useWMFormStore();

  // Function to navigate to the next step
  const nextStep = () => {
    // Mark this step as completed
    markStepCompleted("/c/wm/wayfind-build-profile");
    
    // Navigate to next step
    router.push("/c/wm/select-state");
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={95} />

      {/* Centered Content */}
      <div className="max-w-lg w-full text-center mb-12">
        {/* Hers Logo */}
        <h1 className="text-4xl font-medium text-[#89c9b8] mb-6">hers</h1>
        
        {/* Avatar Circle */}
        <div className="w-16 h-16 rounded-full border-2 border-[#89c9b8] mx-auto mb-6 overflow-hidden flex items-center justify-center">
          <img 
            src="/api/placeholder/60/60" 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Page Title */}
        <h2 className="text-3xl font-semibold text-black mb-8">
          Up next, complete your health history
        </h2>
        
        {/* Steps List */}
        <div className="flex flex-col items-start text-left w-full mb-6">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 flex items-center justify-center mr-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="#89c9b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="#89c9b8" strokeWidth="2"/>
              </svg>
            </div>
            <span className="text-gray-400 text-lg">Weight loss profile</span>
          </div>
        </div>
        
        {/* Step Dot and Line */}
        <div className="relative flex flex-col items-start ml-3 mb-6">
          <div className="absolute left-0 top-0 w-0.5 h-full bg-gray-200 -ml-[1px]"></div>
          <div className="w-3 h-3 rounded-full bg-[#89c9b8] -ml-[6px] mb-24"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300 -ml-[6px]"></div>
        </div>
        
        {/* Health History Box */}
        <div className="w-full bg-gray-50 rounded-lg p-6 mb-4 text-left">
          <h3 className="text-xl font-semibold text-black mb-3">Health history</h3>
          <p className="text-gray-600">
            A licensed medical provider will review this to build a treatment plan
            tailored to your goals.
          </p>
        </div>
        
        {/* Treatment Preview */}
        <div className="flex items-center text-left ml-3">
          <span className="text-gray-400 text-lg">Treatment preview</span>
        </div>
      </div>

      {/* Next Button */}
      <div className="fixed bottom-6 w-full flex justify-center">
        <button
          onClick={nextStep}
          className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-lg"
        >
          Next
        </button>
      </div>
    </div>
  );
}