//src/app/c/b/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBCFormStore } from "@/store/bcFormStore";

export default function BirthControlEntry() {
  const router = useRouter();
  const { resetForm } = useBCFormStore();

  useEffect(() => {
    // Always reset the form to start fresh - no session persistence
    resetForm();

    // Clear any stored session data
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem("birthControlResponses");
      sessionStorage.removeItem("finalBCResponses");
      sessionStorage.removeItem("ineligibilityReason");
      
      // Also clear any potential cookies related to BC form
      try {
        document.cookie = "bc-form-storage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } catch (error) {
        console.log("No cookies to clear");
      }
    }

    // Redirect to the introduction page
    const timer = setTimeout(() => {
      router.push("/c/b/introduction");
    }, 1000); // 1 second delay for smooth transition

    return () => clearTimeout(timer);
  }, [router, resetForm]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* Loading Animation */}
      <div className="w-24 h-24 border-4 border-[#fe92b5] border-t-transparent rounded-full animate-spin mb-8"></div>
      
      {/* Loading Text */}
      <p className="text-xl text-gray-600">
        Preparing your birth control survey...
      </p>
    </div>
  );
}