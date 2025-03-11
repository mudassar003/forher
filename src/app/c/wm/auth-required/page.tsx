//src/app/c/wm/auth-required/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWMFormStore } from "@/store/wmFormStore";
import ProgressBar from "@/app/c/wm/components/ProgressBar";

export default function AuthRequired() {
  const router = useRouter();
  const { markStepCompleted, isAuthenticated } = useWMFormStore();
  
  useEffect(() => {
    // Mark this step as completed
    markStepCompleted("/c/wm/auth-required");
    
    // If user is already authenticated, redirect to next step
    if (isAuthenticated()) {
      router.push("/c/wm/intake-height-weight");
    }
  }, [markStepCompleted, isAuthenticated, router]);

  // Create return URL for login/signup
  const returnUrl = "/c/wm/intake-height-weight";
  const loginUrl = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;
  const signupUrl = `/signup?returnUrl=${encodeURIComponent(returnUrl)}`;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={96} />

      <div className="max-w-lg w-full text-center mt-10">
        <h2 className="text-2xl font-semibold text-black mb-3">
          Almost there!
        </h2>
        
        <p className="text-gray-600 mb-8">
          To continue and save your progress, please create an account or sign in.
        </p>
        
        <div className="space-y-4 mb-10">
          <Link href={loginUrl}>
            <button className="w-full p-4 text-center rounded-lg bg-black text-white hover:opacity-90">
              Log In
            </button>
          </Link>
          
          <p className="text-gray-500 my-2">or</p>
          
          <Link href={signupUrl}>
            <button className="w-full p-4 text-center rounded-lg border-2 border-black text-black hover:bg-gray-100">
              Create Account
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}