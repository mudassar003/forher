// src/store/authFormStore.ts
import { create } from "zustand";

// Define stricter types for form state
interface AuthFormState {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  passwordStrength: {
    isValid: boolean;
    score: number; // 0-4, higher is stronger
    feedback: string | null;
  };
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  validatePassword: (password: string) => void;
  resetForm: () => void;
}

// Password validation function
const validatePasswordStrength = (password: string): { isValid: boolean; score: number; feedback: string | null } => {
  // Default values
  let isValid = false;
  let score = 0;
  let feedback = null;

  // If password is empty, return defaults
  if (!password) {
    return { isValid, score, feedback: "Password is required" };
  }

  // Check length
  if (password.length < 8) {
    return { isValid, score, feedback: "Password must be at least 8 characters" };
  }

  // Basic scoring system
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Determine validity and feedback based on score
  if (score >= 3) {
    isValid = true;
    feedback = score === 5 ? "Strong password" : "Good password";
  } else {
    feedback = "Password is too weak. Include uppercase letters, numbers, and special characters.";
  }

  return { isValid, score, feedback };
};

export const useAuthFormStore = create<AuthFormState>((set) => ({
  email: "",
  password: "",
  loading: false,
  error: null,
  successMessage: null,
  passwordStrength: {
    isValid: false,
    score: 0,
    feedback: null
  },
  setEmail: (email) => set({ email }),
  setPassword: (password) => {
    const strength = validatePasswordStrength(password);
    set({ 
      password,
      passwordStrength: strength
    });
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSuccessMessage: (message) => set({ successMessage: message }),
  validatePassword: (password) => {
    const strength = validatePasswordStrength(password);
    set({ passwordStrength: strength });
    return strength.isValid;
  },
  resetForm: () => set({ 
    email: "", 
    password: "", 
    loading: false, 
    error: null,
    successMessage: null,
    passwordStrength: {
      isValid: false,
      score: 0,
      feedback: null
    }
  }),
}));