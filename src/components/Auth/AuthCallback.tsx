//src/components/Auth/AuthCallback.tsx



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
      // Check for access_token in the URL - this indicates an OAuth callback
      const accessToken = searchParams?.get("access_token");
      const refreshToken = searchParams?.get("refresh_token");
      
      // This is a protection against running the callback logic on every page load
      if (!accessToken && !refreshToken) {
        return;
      }

      try {
        // If there's a returnUrl in the query params, extract it for redirection
        const returnUrl = searchParams?.get("returnUrl");
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Store the access token in localStorage
          localStorage.setItem('user-auth-token', session.access_token);
          
          // Redirect to the return URL if available, otherwise to dashboard
          if (returnUrl) {
            router.push(decodeURIComponent(returnUrl));
          } else {
            router.push("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  // This component doesn't render anything visible
  return null;
};

export default AuthCallback;