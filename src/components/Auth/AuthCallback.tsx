// src/components/Auth/AuthCallback.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const AuthCallback = () => {
  const router = useRouter();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        // Get the session to check if we have an authenticated user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get the stored returnUrl or use default
          const returnUrl = sessionStorage.getItem('loginReturnUrl') || "/dashboard";
          sessionStorage.removeItem('loginReturnUrl'); // Clean up
          
          // Redirect to the return URL
          router.push(returnUrl);
        } else {
          // If no session found but we're on the callback page,
          // redirect to login with a message
          router.push("/login?error=authFailed");
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        router.push("/login?error=authError");
      }
    };

    handleAuthCallback();
  }, [router]);

  // This component doesn't render anything visible
  return null;
};

export default AuthCallback;