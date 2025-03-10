"use client";

import AuthLayout from "@/components/Auth/AuthLayout";
import SignupForm from "@/components/Auth/SignupForm";

const SignupPage = () => {
  return (
    <AuthLayout title="Let's get your account set up">
      <SignupForm />
    </AuthLayout>
  );
};

export default SignupPage;
