//src/components/Auth/AuthProvider.tsx
"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { checkSession } = useAuthStore();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to refresh the token
  const refreshToken = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Error refreshing token:", error);
        return;
      }
      
      // If successful, refresh token was handled by Supabase internally
      // Update auth state
      checkSession();
      
      // Schedule next refresh
      scheduleRefresh(data.session?.expires_at);
    } catch (err) {
      console.error("Unexpected error during token refresh:", err);
    }
  };
  
  // Schedule token refresh based on expiration time
  const scheduleRefresh = (expiresAt?: number) => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    
    if (!expiresAt) return;
    
    // Get current time in seconds
    const now = Math.floor(Date.now() / 1000);
    
    // Calculate time until expiration (minus 5 minutes for safety)
    const timeUntilExpiry = expiresAt - now - 300; // 5 minutes buffer
    
    // Schedule refresh
    if (timeUntilExpiry > 0) {
      refreshTimerRef.current = setTimeout(refreshToken, timeUntilExpiry * 1000);
    } else {
      // Token is already expired or about to expire, refresh immediately
      refreshToken();
    }
  };

  useEffect(() => {
    // Initial session check
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      checkSession();
      
      // Schedule refresh if we have a session
      if (data.session) {
        scheduleRefresh(data.session.expires_at);
      }
    };
    
    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Update auth state
        checkSession();
        
        if (session) {
          // If new session established, schedule refresh
          scheduleRefresh(session.expires_at);
        } else if (event === 'SIGNED_OUT') {
          // Clear any scheduled refresh
          if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
          }
        }
      }
    );

    return () => {
      // Clean up the subscription and timer
      subscription.unsubscribe();
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [checkSession]);

  return <>{children}</>;
};

export default AuthProvider;