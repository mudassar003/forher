// src/store/authFormStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Define types
export interface PasswordStrength {
  score: number;
  feedback: string;
  isValid: boolean;
}

interface AuthFormState {
  email: string;
  password: string;
  passwordStrength: PasswordStrength;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  
  // Actions/setters
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  validatePassword: (password: string) => boolean;
  resetForm: () => void;
}

// Default password strength state
const defaultPasswordStrength: PasswordStrength = {
  score: 0,
  feedback: '',
  isValid: false
};

export const useAuthFormStore = create<AuthFormState>()(
  devtools(
    (set, get) => ({
      // State
      email: '',
      password: '',
      passwordStrength: defaultPasswordStrength,
      loading: false,
      error: null,
      successMessage: null,
      
      // Actions
      setEmail: (email: string) => set({ email }),
      
      setPassword: (password: string) => {
        // Evaluate password strength
        const strength = evaluatePasswordStrength(password);
        set({ password, passwordStrength: strength });
      },
      
      setLoading: (loading: boolean) => set({ loading }),
      
      setError: (error: string | null) => set({ error }),
      
      setSuccessMessage: (message: string | null) => set({ successMessage: message }),
      
      validatePassword: (password: string) => {
        const strength = evaluatePasswordStrength(password);
        set({ passwordStrength: strength });
        return strength.isValid;
      },
      
      resetForm: () => set({
        email: '',
        password: '',
        passwordStrength: defaultPasswordStrength,
        loading: false,
        error: null,
        successMessage: null
      })
    }),
    { name: "auth-form-store" }
  )
);

// Helper function to evaluate password strength
function evaluatePasswordStrength(password: string): PasswordStrength {
  // Default weak password
  const result: PasswordStrength = {
    score: 0,
    feedback: 'Password is too weak',
    isValid: false
  };
  
  if (!password) {
    return result;
  }
  
  // Basic criteria checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  // Calculate score (0-4)
  let score = 0;
  if (hasMinLength) score++;
  if (hasUpperCase) score++;
  if (hasLowerCase && hasNumbers) score++;
  if (hasSpecialChar) score++;
  
  // Determine feedback based on missing criteria
  let feedback = '';
  let isValid = false;
  
  if (score >= 3) {
    isValid = true;
    feedback = score === 4 ? 'Strong password' : 'Good password';
  } else {
    const missing = [];
    if (!hasMinLength) missing.push('at least 8 characters');
    if (!hasUpperCase) missing.push('uppercase letters');
    if (!hasLowerCase) missing.push('lowercase letters');
    if (!hasNumbers) missing.push('numbers');
    if (!hasSpecialChar) missing.push('special characters');
    
    feedback = `Password should include ${missing.join(', ')}`;
  }
  
  return { score, feedback, isValid };
}