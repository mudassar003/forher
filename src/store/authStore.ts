import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js"; // ✅ Import Supabase User type

interface AuthState {
  user: User | null; // ✅ Ensure user is typed correctly
  loading: boolean;
  isAuthenticated: boolean; // Add authentication status flag for easier checks
  setUser: (user: User | null) => void;
  checkSession: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false, // Initialize as not authenticated

  setUser: (user) => set({ 
    user,
    isAuthenticated: !!user // Set authentication status based on user presence
  }),

  checkSession: async () => {
    set({ loading: true });
    const { data } = await supabase.auth.getSession();
    set({ 
      user: data?.session?.user ?? null, 
      isAuthenticated: !!data?.session?.user, // Set authentication status
      loading: false 
    });
  },

  signOutUser: async () => {
    await supabase.auth.signOut();
    set({ 
      user: null,
      isAuthenticated: false // Update authentication status on logout
    });
  },
}));