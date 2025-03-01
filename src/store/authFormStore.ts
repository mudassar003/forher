import { create } from "zustand";

interface AuthFormState {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetForm: () => void;
}

export const useAuthFormStore = create<AuthFormState>((set) => ({
  email: "",
  password: "",
  loading: false,
  error: null,
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  resetForm: () => set({ email: "", password: "", loading: false, error: null }),
}));
