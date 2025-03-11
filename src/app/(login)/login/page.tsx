//src/app/(login)/login/page.tsx
"use client";

import AuthLayout from "@/components/Auth/AuthLayout";
import LoginForm from "@/components/Auth/LoginForm";

const LoginPage = () => {
  return (
    <AuthLayout title="Welcome back">
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
