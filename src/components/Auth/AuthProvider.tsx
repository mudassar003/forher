//src/components/Auth/AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    // Initial session check
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          // If session exists, store the access token
          localStorage.setItem('user-auth-token', session.access_token);
        } else if (event === 'SIGNED_OUT') {
          // Clear token on sign out
          localStorage.removeItem('user-auth-token');
        }
        
        // Update auth state
        checkSession();
      }
    );

    return () => {
      // Clean up the subscription
      subscription.unsubscribe();
    };
  }, [checkSession]);

  return <>{children}</>;
};

export default AuthProvider;