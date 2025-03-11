//src/app/(login)/signup/page.tsx
"use client";

import { Suspense } from "react";
import AuthLayout from "@/components/Auth/AuthLayout";
import SignupForm from "@/components/Auth/SignupForm";

// Loading fallback component
const SignupFormLoading = () => (
  <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg animate-pulse">
    <div className="h-10 bg-gray-200 rounded mb-4"></div>
    <div className="h-12 bg-gray-200 rounded mb-4"></div>
    <div className="h-12 bg-gray-200 rounded mb-4"></div>
    <div className="h-12 bg-gray-200 rounded mb-6"></div>
    <div className="h-10 bg-gray-200 rounded"></div>
  </div>
);

const SignupPage = () => {
  return (
    <AuthLayout title="Let's get your account set up">
      <Suspense fallback={<SignupFormLoading />}>
        <SignupForm />
      </Suspense>
    </AuthLayout>
  );
};

export default SignupPage;