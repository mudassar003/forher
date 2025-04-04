// src/lib/auth.ts
import { supabase } from "./supabase";
import { Session } from "@supabase/supabase-js";

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
    // Rate limiting check could be done here or in middleware
    
    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { data: null, error: "Invalid email address" };
    }

    // Validate password (basic check - more comprehensive check in store)
    if (!password || password.length < 8) {
      return { data: null, error: "Password must be at least 8 characters" };
    }

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      /* Uncomment for email verification
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
      */
    });

    if (error) {
      console.error("Sign-Up Error:", error.message);
      // Use generic error messages to avoid leaking information
      if (error.message.includes("email")) {
        return { data: null, error: "Email address is invalid or already in use" };
      }
      return { data: null, error: "Failed to create account" };
    }

    /* Uncomment for email verification check
    // Check if email verification is required
    if (data?.user && !data.user.email_confirmed_at) {
      return { 
        data, 
        error: null,
        session: data.session,
        message: "Please check your email to verify your account"
      };
    }
    */

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

    // Sign in the user
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