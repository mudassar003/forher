//src/components/Auth/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { FiLogOut } from "react-icons/fi";

interface LogoutButtonProps {
  className?: string;
  showIcon?: boolean;
  buttonText?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  className = "",
  showIcon = true,
  buttonText = "Logout"
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const router = useRouter();
  const { signOutUser } = useAuthStore();
  
  const handleLogout = async (): Promise<void> => {
    try {
      setIsLoggingOut(true);
      
      // Clear auth data from state/store
      await signOutUser();
      
      // Clear any relevant session storage items
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
      className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors ${className}`}
    >
      {showIcon && <FiLogOut />}
      <span>{isLoggingOut ? "Logging out..." : buttonText}</span>
    </button>
  );
};

export default LogoutButton;