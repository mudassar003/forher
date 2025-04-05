//src/components/Auth/AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { checkSession, setUser } = useAuthStore();

  useEffect(() => {
    // Initial session check
    const initAuth = async () => {
      await checkSession();
    };
    
    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log("Auth state changed:", event);
        
        if (session) {
          // Update user in store when session changes
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          // Clear user when signed out
          setUser(null);
        } else {
          // For all other events, just refresh the session
          await checkSession();
        }
      }
    );

    return () => {
      // Clean up the subscription
      subscription.unsubscribe();
    };
  }, [checkSession, setUser]);

  return <>{children}</>;
};

export default AuthProvider;