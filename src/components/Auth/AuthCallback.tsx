// src/components/Auth/AuthCallback.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const AuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        // Get the session to check if we have an authenticated user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Store the access token in localStorage
          localStorage.setItem('user-auth-token', session.access_token);
          
          // Look for returnUrl in URL or use default
          const returnUrl = searchParams?.get("returnUrl") || "/dashboard";
          
          // Redirect to the return URL
          router.push(decodeURIComponent(returnUrl));
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
  }, [router, searchParams]);

  // This component doesn't render anything visible
  return null;
};

export default AuthCallback;