//src/components/Auth/AuthProvider.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { supabase } from "@/lib/supabase";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, checkSession, setUser, isAuthenticated } = useAuthStore();
  const { fetchUserSubscriptions, resetSubscriptionStore } = useSubscriptionStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      // First check if we have a user in the store already (from sessionStorage)
      if (!isAuthenticated) {
        // If not, check with Supabase directly
        await checkSession();
      }
      setIsInitialized(true);
    };
    
    initAuth();
  }, [checkSession, isAuthenticated]);

  // Fetch subscriptions whenever user changes
  useEffect(() => {
    if (user?.id) {
      console.log("User authenticated, fetching subscriptions");
      fetchUserSubscriptions(user.id);
    } else if (isInitialized && !user) {
      // Reset subscription store when user logs out
      resetSubscriptionStore();
    }
  }, [user, fetchUserSubscriptions, resetSubscriptionStore, isInitialized]);

  // Set up auth state change listener
  useEffect(() => {
    // Listen for auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN') {
          // Update user in store when signed in
          session?.user && setUser(session.user);
          // Fetch subscriptions for the new user
          if (session?.user?.id) {
            fetchUserSubscriptions(session.user.id, true);
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear user when signed out
          setUser(null);
          // Reset subscription store
          resetSubscriptionStore();
        } else if (event === 'USER_UPDATED') {
          // Update the user data when it changes
          session?.user && setUser(session.user);
        } else if (event === 'TOKEN_REFRESHED') {
          // Handle token refresh
          session?.user && setUser(session.user);
        } else {
          // For any other events, refresh the session
          await checkSession();
        }
      }
    );

    return () => {
      // Clean up the subscription when the component unmounts
      subscription.unsubscribe();
    };
  }, [setUser, checkSession, fetchUserSubscriptions, resetSubscriptionStore]);

  // Show nothing until we've initialized the auth state
  if (!isInitialized) {
    return null; // Or a loading spinner if preferred
  }

  return <>{children}</>;
};

export default AuthProvider;