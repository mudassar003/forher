"use client";

import { useSearchParams } from "next/navigation";
import ForgotPassword from "@/components/Auth/ForgotPassword";

const ForgotPasswordPage = () => {
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get('returnUrl');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <ForgotPassword />
    </div>
  );
};

export default ForgotPasswordPage;