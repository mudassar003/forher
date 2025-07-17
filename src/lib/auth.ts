// src/lib/auth.ts
import { supabase } from "./supabase";
import { Session, User } from "@supabase/supabase-js";
import { validateEmail, validatePassword, sanitizeString } from "@/utils/inputValidation";

// Define response type for better type safety
export interface AuthResponse<T = unknown> {
  data: T | null;
  error: string | null;
  session?: Session | null;
}

/**
 * Sign in with Google OAuth
 * @param returnUrl Optional return URL after successful authentication
 */
export const signInWithGoogle = async (returnUrl?: string): Promise<AuthResponse> => {
  try {
    // Default redirect to homepage if no returnUrl provided
    const redirectPath = returnUrl ? returnUrl : '/';
    const redirectTo = `${window.location.origin}${redirectPath}`;
    
    // Store returnUrl in sessionStorage for access after OAuth completes
    if (returnUrl) {
      sessionStorage.setItem('loginReturnUrl', returnUrl);
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        // This will ensure cookies are set properly
      },
    });

    if (error) {
      return { data: null, error: "Failed to sign in with Google. Please try again." };
    }

    return { data, error: null, session: null };
  } catch (err) {
    return { data: null, error: "Authentication service temporarily unavailable. Please try again." };
  }
};

/**
 * Sign up with Email & Password
 * @param email User's email address
 * @param password User's password
 * @param recaptchaToken Optional reCAPTCHA token for verification
 */
export const signUpWithEmail = async (
  email: string, 
  password: string,
  recaptchaToken?: string
): Promise<AuthResponse> => {
  try {
    // Sanitize inputs
    const sanitizedEmail = sanitizeString(email);
    
    // Validate email format
    const emailValidation = validateEmail(sanitizedEmail);
    if (!emailValidation.valid) {
      return { data: null, error: emailValidation.error || "Invalid email address" };
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { data: null, error: passwordValidation.error || "Invalid password" };
    }

    // If reCAPTCHA is enabled, verify the token on the server
    if (recaptchaToken && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      try {
        const verifyResponse = await fetch('/api/auth/verify-recaptcha', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: recaptchaToken,
            action: 'signup'
          }),
          credentials: 'include'
        });

        if (!verifyResponse.ok) {
          return { data: null, error: "Security verification failed. Please try again." };
        }

        const verifyResult = await verifyResponse.json();
        if (!verifyResult.success) {
          return { data: null, error: "Security verification failed. Please try again." };
        }
      } catch (recaptchaError) {
        return { data: null, error: "Security verification failed. Please try again." };
      }
    }

    // Sign up the user with cookie-based sessions
    const { data, error } = await supabase.auth.signUp({ 
      email: sanitizedEmail, 
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
      // Use generic error messages to avoid leaking information
      if (error.message.includes("email") || error.message.includes("already")) {
        return { data: null, error: "An account with this email already exists. Please try logging in instead." };
      }
      if (error.message.includes("password")) {
        return { data: null, error: "Password does not meet security requirements. Please try a stronger password." };
      }
      return { data: null, error: "Unable to create account. Please try again or contact support." };
    }

    return { data, error: null, session: data.session };
  } catch (err) {
    return { data: null, error: "Registration service temporarily unavailable. Please try again." };
  }
};

/**
 * Sign in with Email & Password
 * @param email User's email address
 * @param password User's password
 * @param recaptchaToken Optional reCAPTCHA token for verification
 */
export const signInWithEmail = async (
  email: string, 
  password: string,
  recaptchaToken?: string
): Promise<AuthResponse> => {
  try {
    // Sanitize inputs
    const sanitizedEmail = sanitizeString(email);
    
    // Validate email format
    const emailValidation = validateEmail(sanitizedEmail);
    if (!emailValidation.valid) {
      return { data: null, error: emailValidation.error || "Invalid email address" };
    }

    // Implement attempt tracking for rate limiting (could use session storage)
    const attemptKey = `login_attempts_${sanitizedEmail.toLowerCase()}`;
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

    // If reCAPTCHA is enabled, verify the token on the server
    if (recaptchaToken && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      try {
        const verifyResponse = await fetch('/api/auth/verify-recaptcha', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: recaptchaToken,
            action: 'login'
          }),
          credentials: 'include'
        });

        if (!verifyResponse.ok) {
          return { data: null, error: "Security verification failed. Please try again." };
        }

        const verifyResult = await verifyResponse.json();
        if (!verifyResult.success) {
          return { data: null, error: "Security verification failed. Please try again." };
        }
      } catch (recaptchaError) {
        return { data: null, error: "Security verification failed. Please try again." };
      }
    }

    // Sign in the user - using the auth-helpers client ensures cookies are used
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });

    // Handle login attempts tracking
    if (error) {
      // Increment attempt count and store
      attempts.count += 1;
      attempts.timestamp = Date.now();
      sessionStorage.setItem(attemptKey, JSON.stringify(attempts));
      
      // Use consistent error message regardless of whether email or password is wrong
      // to prevent user enumeration
      return { data: null, error: "Invalid email or password. Please check your credentials and try again." };
    } else {
      // Clear login attempts on success
      sessionStorage.removeItem(attemptKey);
    }

    return { data, error: null, session: data.session };
  } catch (err) {
    return { data: null, error: "Login service temporarily unavailable. Please try again." };
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
      return { data: null, error: "Sign out failed. Please try again." };
    }
    
    // Clear any auth-related data from sessionStorage
    sessionStorage.removeItem('loginReturnUrl');
    
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: "Sign out service temporarily unavailable. Please try again." };
  }
};

/**
 * Send password reset email
 * @param email User's email address
 */
export const sendPasswordResetEmail = async (email: string): Promise<AuthResponse> => {
  try {
    // Sanitize and validate email
    const sanitizedEmail = sanitizeString(email);
    const emailValidation = validateEmail(sanitizedEmail);
    if (!emailValidation.valid) {
      return { data: null, error: emailValidation.error || "Invalid email address" };
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
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
    return { data: null, error: "Password reset service temporarily unavailable. Please try again." };
  }
};

/**
 * Update password after reset
 * @param newPassword New password to set
 */
export const updatePassword = async (newPassword: string): Promise<AuthResponse> => {
  try {
    // Validate password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return { data: null, error: passwordValidation.error || "Invalid password" };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      return { data: null, error: "Failed to update password. Please ensure your new password meets security requirements." };
    }

    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: "Password update service temporarily unavailable. Please try again." };
  }
};

/**
 * Get the current authenticated user
 * @returns Object containing the user or error
 */
export const getCurrentUser = async (): Promise<{ user: User | null; error: Error | null }> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error: new Error("Unable to verify user session") };
  }
};

/**
 * Verify if the current user has a valid session
 * @returns Promise<boolean> - true if the user has a valid session, false otherwise
 */
export const verifySession = async (): Promise<boolean> => {
  try {
    // Try to get the user from the auth state
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return false;
    }
    
    // If we have a user, then the session is valid
    return !!user;
  } catch (error) {
    return false;
  }
};

/**
 * Refresh the current session if needed
 * @returns Promise<boolean> - true if the session was refreshed successfully, false otherwise
 */
export const refreshSession = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      return false;
    }
    
    return !!data.session;
  } catch (error) {
    return false;
  }
};

/**
 * Set up listener for auth state changes
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void): (() => void) => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  
  return data.subscription.unsubscribe;
};