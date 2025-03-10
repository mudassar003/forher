//src/app/c/wm/submit/page.tsx
"use client";

import SubmitButton from "@/app/c/wm/components/SubmitButton"; // Import SubmitButton
import { useRouter } from "next/navigation"; // Import useRouter for redirection

export default function SubmitStep() {
  const router = useRouter(); // Initialize router for navigation

  // Handle the form submission
  const handleSubmit = () => {
    // Submit the form or handle data submission (e.g., saving data to Supabase or OpenAI)
    console.log("Form submitted!");

    // After submission, redirect to the homepage
    router.push("/"); // Redirect to the homepage
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      <h2 className="text-3xl font-semibold text-[#fe92b5]">
        Review Your Weight Loss Journey
      </h2>
      <p className="text-xl font-medium text-black mt-3">
        You’ve made it to the final step. Please review your selections before submitting.
      </p>

      {/* Additional content or summary can be displayed here */}
      <div className="mt-10">
        <p className="text-lg font-semibold">Summary of your selections:</p>
        <ul className="mt-4">
          <li>Your goal: Lose 16-50 lbs</li>
          {/* Display other selected options here */}
        </ul>
      </div>

      {/* Use SubmitButton component */}
      <SubmitButton onSubmit={handleSubmit} /> {/* SubmitButton triggers handleSubmit */}
    </div>
  );
}
