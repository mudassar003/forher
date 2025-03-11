//src/app/(login)/login/page.tsx
"use client";

import { Suspense } from "react";
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
  return (
    <AuthLayout title="Welcome back">
      <Suspense fallback={<LoginFormLoading />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
};

export default LoginPage;