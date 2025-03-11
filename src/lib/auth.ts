//src/lib/auth.ts
import { supabase } from "./supabase";

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });

  if (error) {
    console.error("Google Sign-In Error:", error.message);
    return { error: error.message };
  }

  return { data };
};

/**
 * Sign up with Email & Password
 */
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error("Sign-Up Error:", error.message);
    return { error: error.message };
  }

  return { data };
};

/**
 * Sign in with Email & Password
 */
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign-In Error:", error.message);
    return { error: error.message };
  }

  return { data };
};

/**
 * Sign out user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign-Out Error:", error.message);
    return { error: error.message };
  }

  return { message: "Signed out successfully" };
};


/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    console.error("Password Reset Error:", error.message);
    return { error: error.message };
  }

  return { message: "Password reset email sent" };
};

/**
 * Update password after reset
 */
export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    console.error("Update Password Error:", error.message);
    return { error: error.message };
  }

  return { message: "Password updated successfully" };
};