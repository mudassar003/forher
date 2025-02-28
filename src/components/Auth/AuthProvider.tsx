"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, []);

  return <>{children}</>;
};

export default AuthProvider;
