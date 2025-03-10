//src/app/c/wm/submit/page.tsx
"use client";

import SubmitButton from "@/app/c/wm/components/SubmitButton";
import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";

export default function SubmitStep() {
  const router = useRouter();
  
  // Get form data from the store
  const { formData, resetForm, markStepCompleted } = useWMFormStore();
  const weightLossGoal = formData.weightLossGoal || "Not specified";
  const treatmentApproach = formData.treatmentApproach || "Not specified";
  const dateOfBirth = formData.dateOfBirth || "Not specified";

  // Format the treatment approach for display
  const formatTreatmentApproach = () => {
    if (treatmentApproach === "recommendation") {
      return "Looking for recommendations";
    } else if (treatmentApproach === "specific") {
      return "Have specific medication in mind";
    }
    return treatmentApproach;
  };

  // Handle the form submission
  const handleSubmit = () => {
    // Mark this step as completed
    markStepCompleted("/c/wm/submit");
    
    // Here you would typically send the data to your backend
    console.log("Form submitted with data:", formData);

    // You could call an API endpoint here
    // Example: await fetch('/api/submit-wm-form', { method: 'POST', body: JSON.stringify(formData) });
    
    // Reset the form data after successful submission (optional)
    // resetForm();
    
    // After submission, redirect to the homepage or a success page
    router.push("/"); 
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar - 100% complete */}
      <ProgressBar progress={100} />
      
      <h2 className="text-3xl font-semibold text-[#fe92b5]">
        Review Your Weight Loss Journey
      </h2>
      
      <p className="text-xl font-medium text-black mt-3">
        You've made it to the final step. Please review your selections before submitting.
      </p>

      {/* Summary of selections from the store */}
      <div className="mt-10 w-full max-w-lg">
        <p className="text-lg font-semibold">Summary of your selections:</p>
        <ul className="mt-4 space-y-3 text-left">
          <li className="p-4 bg-gray-100 rounded-lg">
            <span className="font-medium">Your goal:</span> Lose {weightLossGoal}
          </li>
          <li className="p-4 bg-gray-100 rounded-lg">
            <span className="font-medium">Treatment approach:</span> {formatTreatmentApproach()}
          </li>
          <li className="p-4 bg-gray-100 rounded-lg">
            <span className="font-medium">Date of birth:</span> {dateOfBirth}
          </li>
          {/* Add more form fields here as they're added to your store */}
        </ul>
      </div>

      {/* Use SubmitButton component */}
      <SubmitButton onSubmit={handleSubmit} />
    </div>
  );
}