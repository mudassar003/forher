//src/app/c/wm/auth-required/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";
import Link from "next/link";

export default function AuthRequired() {
  const router = useRouter();
  const { isAuthenticated, markStepCompleted } = useWMFormStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated()) {
      markStepCompleted("/c/wm/auth-required");
      router.push("/c/wm/intake-height-weight");
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, markStepCompleted, router]);

  const handleContinueAsGuest = () => {
    // For guest users, store a temporary token and proceed
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-auth-token', 'guest-temporary-token');
    }
    markStepCompleted("/c/wm/auth-required");
    router.push("/c/wm/intake-height-weight");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={96} />

      <div className="max-w-lg w-full text-center mt-10">
        <h2 className="text-2xl font-semibold text-black mb-3">
          Create an account to save your progress
        </h2>
        
        <p className="text-gray-600 mb-8">
          Sign up or log in to save your information and get personalized recommendations.
        </p>
        
        <div className="space-y-4 mb-6">
          <Link href="/login?returnUrl=/c/wm/intake-height-weight" className="block">
            <button className="w-full bg-black text-white p-4 rounded-lg font-semibold hover:opacity-90 transition">
              Log in
            </button>
          </Link>
          
          <Link href="/signup?returnUrl=/c/wm/intake-height-weight" className="block">
            <button className="w-full border-2 border-black text-black p-4 rounded-lg font-semibold hover:bg-gray-100 transition">
              Sign up
            </button>
          </Link>
        </div>
        
        <button
          onClick={handleContinueAsGuest}
          className="text-blue-600 underline font-medium hover:text-blue-800"
        >
          Continue as guest
        </button>
      </div>
    </div>
  );
}