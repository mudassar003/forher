//src/app/c/hl/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHLFormStore } from "@/store/hlFormStore";

export default function HairLossEntry() {
  const router = useRouter();
  const { resetForm } = useHLFormStore();

  useEffect(() => {
    // Always reset the form to start fresh (no session carryover)
    resetForm();

    // Clear any stored session data
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem("hairLossResponses");
      sessionStorage.removeItem("finalHairLossResponses");
      sessionStorage.removeItem("ineligibilityReason");
    }

    // Always redirect to the introduction page for a fresh start
    const timer = setTimeout(() => {
      router.push("/c/hl/introduction");
    }, 1000); // 1 second delay for smooth transition

    return () => clearTimeout(timer);
  }, [router, resetForm]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* Loading Animation */}
      <div className="w-24 h-24 border-4 border-[#fe92b5] border-t-transparent rounded-full animate-spin mb-8"></div>
      
      {/* Loading Text */}
      <p className="text-xl text-gray-600">
        Preparing your hair loss survey...
      </p>
    </div>
  );
}