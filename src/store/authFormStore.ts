// src/store/authFormStore.ts
import { create } from "zustand";
import { zxcvbn, ZXCVBNScore, ZXCVBNResult } from "@zxcvbn-ts/core";

interface PasswordStrength {
  score: ZXCVBNScore;
  feedback: string;
  isValid: boolean;
}

interface AuthFormState {
  // Form fields
  email: string;
  password: string;
  
  // UI state
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  
  // Password strength
  passwordStrength: PasswordStrength;
  
  // Actions
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  validatePassword: (password: string) => PasswordStrength;
  resetForm: () => void;
}

export const useAuthFormStore = create<AuthFormState>((set, get) => ({
  // Initial state
  email: "",
  password: "",
  loading: false,
  error: null,
  successMessage: null,
  passwordStrength: {
    score: 0,
    feedback: "",
    isValid: false
  },
  
  // Actions
  setEmail: (email: string) => set({ email }),
  
  setPassword: (password: string) => {
    // Calculate password strength when password changes
    const passwordStrength = get().validatePassword(password);
    set({ password, passwordStrength });
  },
  
  setLoading: (loading: boolean) => set({ loading }),
  
  setError: (error: string | null) => set({ error }),
  
  setSuccessMessage: (successMessage: string | null) => set({ successMessage }),
  
  validatePassword: (password: string): PasswordStrength => {
    if (!password) {
      return {
        score: 0,
        feedback: "Password is required",
        isValid: false
      };
    }
    
    // Basic length check
    if (password.length < 8) {
      return {
        score: 1,
        feedback: "Password must be at least 8 characters long",
        isValid: false
      };
    }
    
    // Use zxcvbn for more comprehensive strength checking
    try {
      const result: ZXCVBNResult = zxcvbn(password);
      
      // Determine feedback based on score
      let feedback = "";
      let isValid = false;
      
      switch(result.score) {
        case 0:
          feedback = "Very weak password. Try adding more characters and symbols.";
          isValid = false;
          break;
        case 1: 
          feedback = "Weak password. Try adding numbers and special characters.";
          isValid = false;
          break;
        case 2:
          feedback = "Fair password, but could be stronger.";
          isValid = false;
          break;
        case 3:
          feedback = "Good password!";
          isValid = true;
          break;
        case 4:
          feedback = "Strong password!";
          isValid = true;
          break;
        default:
          feedback = "Password strength unknown.";
          isValid = false;
      }
      
      // If there's specific feedback from zxcvbn, use that
      if (result.feedback.warning) {
        feedback = result.feedback.warning;
        if (result.feedback.suggestions.length > 0) {
          feedback += ` ${result.feedback.suggestions.join(' ')}`;
        }
      }
      
      return {
        score: result.score,
        feedback,
        isValid
      };
    } catch (error) {
      // Fallback to simpler checks if zxcvbn fails
      console.error("Error using zxcvbn:", error);
      
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      const isStrong = hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
      
      return {
        score: isStrong ? 3 : 2,
        feedback: isStrong 
          ? "Good password!" 
          : "Add uppercase letters, numbers, and special characters.",
        isValid: isStrong
      };
    }
  },
  
  resetForm: () => set({
    email: "",
    password: "",
    loading: false,
    error: null,
    successMessage: null,
    passwordStrength: {
      score: 0,
      feedback: "",
      isValid: false
    }
  })
}));