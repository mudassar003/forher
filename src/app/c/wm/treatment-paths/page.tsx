//src/app/c/wm/treatment-paths/page.tsx
"use client";

import { useRouter } from "next/navigation";
import ProgressBar from "@/app/c/wm/components/ProgressBar";
import { useWMFormStore } from "@/store/wmFormStore";

export default function TreatmentPaths() {
  const router = useRouter();
  
  // Get states and actions from the store
  const { formData, markStepCompleted } = useWMFormStore();
  const approachType = formData.treatmentApproach || "recommendation";

  // Function to navigate to the next step
  const nextStep = () => {
    // Mark this step as completed
    markStepCompleted("/c/wm/treatment-paths");
    
    // Navigate to next step
    router.push("/c/wm/submit");
  };

  // Dynamic content based on the selected approach
  const renderContent = () => {
    if (approachType === "recommendation") {
      return (
        <>
          <h2 className="text-2xl font-semibold text-black mt-3">
            Our Expert Recommendations
          </h2>
          <p className="text-lg text-black mt-4">
            Based on your goal to lose {formData.weightLossGoal}, we'll recommend personalized treatment options after you complete your profile.
          </p>
          <p className="text-lg text-black mt-4">
            Our medical providers will review your health history and recommend the most effective medication for your specific needs.
          </p>
          <p className="text-lg text-black mt-4">
            You'll receive guidance on dosing, potential side effects, and how to maximize your results.
          </p>
        </>
      );
    } else {
      return (
        <>
          <h2 className="text-2xl font-semibold text-black mt-3">
            Your Medication Preference
          </h2>
          <p className="text-lg text-black mt-4">
            Since you already have a specific medication in mind, we'll help you determine if it's appropriate for your goals and health profile.
          </p>
          <p className="text-lg text-black mt-4">
            Our medical providers will evaluate your request against your health history and weight loss goals.
          </p>
          <p className="text-lg text-black mt-4">
            If your preferred medication isn't suitable, we'll suggest alternatives that may be more effective for your specific situation.
          </p>
        </>
      );
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={85} />

      {/* Centered Content */}
      <div className="max-w-lg text-center mt-10">
        {/* Custom Logo Text */}
        <h1 className="text-3xl font-bold text-[#fe92b5]">Direct2Her</h1>

        {/* Dynamic Content */}
        {renderContent()}
      </div>

      {/* Step-Specific Button */}
      <div className="fixed bottom-6 w-full flex justify-center">
        <button
          onClick={nextStep}
          className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
}