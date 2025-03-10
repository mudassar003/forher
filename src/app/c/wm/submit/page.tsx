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
  const numberOfProgramsTried = formData.numberOfProgramsTried || "Not specified";
  const dateOfBirth = formData.dateOfBirth || "Not specified";
  const familyWithWeightStruggle = formData.familyWithWeightStruggle || "Not specified";
  const dailyLifeStressLevel = formData.dailyLifeStressLevel || "Not specified";
  const qualitySleep = formData.qualitySleep || "Not specified";
  const weightHoldSites = formData.weightHoldSites || "Not specified";
  const cravings = formData.cravings || "Not specified";
  const eatingPatterns = formData.eatingPatterns || [];
  const programSupport = formData.programSupport || [];
  const goalMeaning = formData.goalMeaning || [];

  // Format the treatment approach for display
  const formatTreatmentApproach = () => {
    if (treatmentApproach === "recommendation") {
      return "Looking for recommendations";
    } else if (treatmentApproach === "specific") {
      return "Have specific medication in mind";
    }
    return treatmentApproach;
  };

  // Format the number of programs tried for display
  const formatNumberOfProgramsTried = () => {
    switch (numberOfProgramsTried) {
      case "none":
        return "None, this is my first time trying";
      case "1-5":
        return "1-5 programs";
      case "6-10":
        return "6-10 programs";
      case "many":
        return "More than I can remember";
      default:
        return numberOfProgramsTried;
    }
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
          <li className="p-4 bg-gray-100 rounded-lg">
            <span className="font-medium">Previous weight loss programs:</span> {formatNumberOfProgramsTried()}
          </li>
          <li className="p-4 bg-gray-100 rounded-lg">
            <span className="font-medium">Family with weight struggle:</span> {familyWithWeightStruggle}
          </li>
          <li className="p-4 bg-gray-100 rounded-lg">
            <span className="font-medium">Daily life stress level:</span> {dailyLifeStressLevel}
          </li>
          <li className="p-4 bg-gray-100 rounded-lg">
            <span className="font-medium">Quality of sleep:</span> {qualitySleep}
          </li>
          <li className="p-4 bg-gray-100 rounded-lg">
            <span className="font-medium">Weight hold sites:</span> {weightHoldSites}
          </li>
          <li className="p-4 bg-gray-100 rounded-lg">
            <span className="font-medium">Cravings:</span> {cravings}
          </li>
          <li className="p-4 bg-gray-100 rounded-lg">
            <span className="font-medium">Eating patterns:</span> {eatingPatterns.join(", ")}
          </li>
          <li className="p-4 bg-gray-100 rounded-lg">
            <span className="font-medium">Program support:</span> {programSupport.join(", ")}
          </li>
          <li className="p-4 bg-gray-100 rounded-lg">
            <span className="font-medium">Goal meaning:</span> {goalMeaning.join(", ")}
          </li>
          
          





          {/* Add more form fields here as they're added to your store */}
        </ul>
      </div>

      {/* Use SubmitButton component */}
      <SubmitButton onSubmit={handleSubmit} />
    </div>
  );
}