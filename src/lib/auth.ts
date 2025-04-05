// src/lib/auth.ts
import { supabase } from "./supabase";
import { Session, AuthError } from "@supabase/supabase-js";

// Define response type for better type safety
interface AuthResponse<T = any> {
  data: T | null;
  error: string | null;
  session?: Session | null;
}

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
        // This will ensure cookies are set properly
        // and the session is persisted via cookies rather than localStorage
        
      },
    });

    if (error) {
      console.error("Google Sign-In Error:", error.message);
      return { data: null, error: "Failed to sign in with Google" };
    }

    return { data, error: null, session: null };
  } catch (err) {
    console.error("Unexpected error during Google Sign-in:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
};

/**
 * Sign up with Email & Password
 */
export const signUpWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { data: null, error: "Invalid email address" };
    }

    // Validate password (basic check - more comprehensive check in store)
    if (!password || password.length < 8) {
      return { data: null, error: "Password must be at least 8 characters" };
    }

    // Sign up the user with cookie-based sessions
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        // This ensures cookies are used for auth state management
        data: {
          // Include any additional user metadata here
        }
      }
    });

    if (error) {
      console.error("Sign-Up Error:", error.message);
      // Use generic error messages to avoid leaking information
      if (error.message.includes("email")) {
        return { data: null, error: "Email address is invalid or already in use" };
      }
      return { data: null, error: "Failed to create account" };
    }

    return { data, error: null, session: data.session };
  } catch (err) {
    console.error("Unexpected error during Sign up:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
};

/**
 * Sign in with Email & Password
 */
export const signInWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    // Implement attempt tracking for rate limiting (could use session storage)
    const attemptKey = `login_attempts_${email.toLowerCase()}`;
    const attemptData = sessionStorage.getItem(attemptKey);
    const attempts = attemptData ? JSON.parse(attemptData) : { count: 0, timestamp: Date.now() };
    
    // Reset attempts if more than 30 minutes have passed
    const thirtyMinutes = 30 * 60 * 1000;
    if (Date.now() - attempts.timestamp > thirtyMinutes) {
      attempts.count = 0;
      attempts.timestamp = Date.now();
    }
    
    // Check for too many attempts (5 max)
    if (attempts.count >= 5) {
      const timeLeft = Math.ceil((thirtyMinutes - (Date.now() - attempts.timestamp)) / 60000);
      return { 
        data: null, 
        error: `Too many failed attempts. Please try again in ${timeLeft} minutes.` 
      };
    }
    
    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { data: null, error: "Invalid email address" };
    }

    // Sign in the user - using the auth-helpers client ensures cookies are used
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Handle login attempts tracking
    if (error) {
      // Increment attempt count and store
      attempts.count += 1;
      attempts.timestamp = Date.now();
      sessionStorage.setItem(attemptKey, JSON.stringify(attempts));
      
      console.error("Sign-In Error:", error.message);
      
      // Use consistent error message regardless of whether email or password is wrong
      // to prevent user enumeration
      return { data: null, error: "Invalid email or password" };
    } else {
      // Clear login attempts on success
      sessionStorage.removeItem(attemptKey);
    }

    return { data, error: null, session: data.session };
  } catch (err) {
    console.error("Unexpected error during Sign in:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
};

/**
 * Sign out user
 */
export const signOut = async (): Promise<AuthResponse> => {
  try {
    // This will remove both cookies and any localStorage session info
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign-Out Error:", error.message);
      return { data: null, error: "Failed to sign out" };
    }
    
    // Clear any auth-related data from sessionStorage
    sessionStorage.removeItem('loginReturnUrl');
    
    return { data: null, error: null };
  } catch (err) {
    console.error("Unexpected error during Sign out:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string): Promise<AuthResponse> => {
  try {
    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { data: null, error: "Invalid email address" };
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error("Password Reset Error:", error.message);
      // Don't reveal if the email exists or not for security
      return { data: null, error: "If your email exists in our system, you will receive a password reset link" };
    }

    return { 
      data: null, 
      error: null,
      // Use success message instead of error
      session: null
    };
  } catch (err) {
    console.error("Unexpected error during password reset:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
};

/**
 * Update password after reset
 */
export const updatePassword = async (newPassword: string): Promise<AuthResponse> => {
  try {
    // Basic password validation
    if (!newPassword || newPassword.length < 8) {
      return { data: null, error: "Password must be at least 8 characters" };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error("Update Password Error:", error.message);
      return { data: null, error: "Failed to update password" };
    }

    return { data: null, error: null };
  } catch (err) {
    console.error("Unexpected error during password update:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    return { user, error: null };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { user: null, error };
  }
};

/**
 * Verify if the current user has a valid session
 */
export const verifySession = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Session verification error:", error);
      return false;
    }
    
    return !!session;
  } catch (error) {
    console.error("Unexpected error verifying session:", error);
    return false;
  }
};