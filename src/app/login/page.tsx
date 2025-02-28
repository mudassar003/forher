"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/Auth/LoginForm";

const LoginPage = () => {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard"); // Redirect if logged in
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
