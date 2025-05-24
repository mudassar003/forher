//src/app/c/wm/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";

export default function WeightManagementEntry() {
  const router = useRouter();
  const { resetForm } = useWMFormStore();

  useEffect(() => {
    // Reset the form to start fresh
    resetForm();

    // Clear any stored session data
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem("weightLossResponses");
      sessionStorage.removeItem("ineligibilityReason");
      sessionStorage.removeItem("finalResponses");
    }

    // Redirect to the introduction page
    const timer = setTimeout(() => {
      router.push("/c/wm/introduction");
    }, 1000); // 1 second delay for smooth transition

    return () => clearTimeout(timer);
  }, [router, resetForm]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* Loading Animation */}
      <div className="w-24 h-24 border-4 border-[#fe92b5] border-t-transparent rounded-full animate-spin mb-8"></div>
      
      {/* Loading Text */}
      <p className="text-xl text-black">
        Preparing your weight management survey...
      </p>
    </div>
  );
}