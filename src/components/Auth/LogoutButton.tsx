"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { FiLogOut } from "react-icons/fi";

const LogoutButton = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { signOutUser } = useAuthStore();
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Clear auth data from state/store
      await signOutUser();
      
      // Clear any relevant local storage items
      localStorage.removeItem('user-auth-token');
      sessionStorage.removeItem('loginReturnUrl');
      
      // Redirect to homepage
      router.push('/');
      
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
    >
      <FiLogOut />
      <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
    </button>
  );
};

export default LogoutButton;