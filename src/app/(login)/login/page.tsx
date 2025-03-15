//src/app/(login)/login/page.tsx
"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AuthLayout from "@/components/Auth/AuthLayout";
import LoginForm from "@/components/Auth/LoginForm";

// Loading fallback component
const LoginFormLoading = () => (
  <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg animate-pulse">
    <div className="h-10 bg-gray-200 rounded mb-4"></div>
    <div className="h-12 bg-gray-200 rounded mb-4"></div>
    <div className="h-12 bg-gray-200 rounded mb-4"></div>
    <div className="h-12 bg-gray-200 rounded mb-6"></div>
    <div className="h-10 bg-gray-200 rounded"></div>
  </div>
);

const LoginPage = () => {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard'; // Default to dashboard

  // Store the returnUrl in sessionStorage for use after OAuth redirects
  useEffect(() => {
    if (returnUrl) {
      sessionStorage.setItem('loginReturnUrl', returnUrl);
    }
  }, [returnUrl]);

  return (
    <AuthLayout title="Welcome back">
      <Suspense fallback={<LoginFormLoading />}>
        <LoginForm returnUrl={returnUrl} />
      </Suspense>
    </AuthLayout>
  );
};

export default LoginPage;