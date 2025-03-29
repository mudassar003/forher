// src/components/Auth/LoginButton.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginButtonProps {
  className?: string;
  buttonText?: string;
  returnUrl?: string; // Custom return URL override
}

/**
 * A reusable login button component that preserves the current route
 * This component works without requiring usePathname by using window.location
 */
const LoginButton = ({ 
  className = "bg-black text-white px-4 py-2 rounded-md",
  buttonText = "Log in", 
  returnUrl // Optional override
}: LoginButtonProps) => {
  const router = useRouter();
  // Set initial returnUrl to undefined to prevent hydration errors
  const [currentPath, setCurrentPath] = useState<string | undefined>(undefined);
  
  // Safely get the current path on the client side after hydration
  useEffect(() => {
    setCurrentPath(window.location.pathname + window.location.search);
  }, []);
  
  const handleLoginRedirect = () => {
    // Use the provided returnUrl, or the dynamically determined currentPath, or fall back to "/"
    const pathToReturn = returnUrl || currentPath || "/";
    const encodedReturnUrl = encodeURIComponent(pathToReturn);
    
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