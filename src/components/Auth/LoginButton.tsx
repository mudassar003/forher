// src/components/Auth/LoginButton.tsx
"use client";

import { useRouter } from 'next/navigation';

interface LoginButtonProps {
  className?: string;
  buttonText?: string;
  returnUrl?: string; // Custom return URL override
}

const LoginButton = ({ 
  className = "bg-black text-white px-4 py-2 rounded-md",
  buttonText = "Log in", 
  returnUrl // Optional override
}: LoginButtonProps) => {
  const router = useRouter();
  
  const handleLoginRedirect = () => {
    // Get current path if no returnUrl specified
    const currentPath = window.location.pathname + window.location.search;
    const encodedReturnUrl = encodeURIComponent(returnUrl || currentPath);
    
    // Redirect to login with return URL
    router.push(`/login?returnUrl=${encodedReturnUrl}`);
  };
  
  return (
    <button 
      onClick={handleLoginRedirect}
      className={className}
    >
      {buttonText}
    </button>
  );
};

export default LoginButton;