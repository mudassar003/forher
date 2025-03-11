//src/components/Auth/AuthCallback.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const AuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if this is an OAuth callback
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      // If we have a session and a returnUrl query param, redirect to the return URL
      if (data?.session) {
        // Store auth token
        if (typeof window !== 'undefined') {
          localStorage.setItem('user-auth-token', data.session.access_token || 'token-placeholder');
        }
        
        // Check for returnUrl in the URL
        const returnUrl = searchParams?.get("returnUrl");
        if (returnUrl) {
          router.push(returnUrl);
        }
      }
    };

    checkSession();
  }, [router, searchParams]);

  return null; // This component doesn't render anything
};

export default AuthCallback;