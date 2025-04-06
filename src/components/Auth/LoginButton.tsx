// src/components/Auth/LoginButton.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface LoginButtonProps {
  className?: string;
  buttonText?: string;
  returnUrl?: string; // Custom return URL override
}

/**
 * A reusable login button component that preserves the current route
 * and integrates with the authentication store
 */
const LoginButton: React.FC<LoginButtonProps> = ({ 
  className = "bg-black text-white px-4 py-2 rounded-md",
  buttonText = "Log in", 
  returnUrl // Optional override
}: LoginButtonProps) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  // Set initial returnUrl to undefined to prevent hydration errors
  const [currentPath, setCurrentPath] = useState<string | undefined>(undefined);
  
  // Safely get the current path on the client side after hydration
  useEffect(() => {
    setCurrentPath(window.location.pathname + window.location.search);
  }, []);
  
  // If already authenticated, we could redirect directly to the account page
  // or disable the button, but here we'll leave it to honor the component usage
  
  const handleLoginRedirect = (): void => {
    // If already authenticated, go to account page
    if (isAuthenticated) {
      router.push('/account');
      return;
    }
    
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
      {isAuthenticated ? "Account" : buttonText}
    </button>
  );
};

export default LoginButton;