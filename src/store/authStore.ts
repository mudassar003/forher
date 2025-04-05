// src/store/authStore.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  checkSession: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  setUser: (user) => set({ 
    user,
    isAuthenticated: !!user,
    loading: false
  }),

  checkSession: async () => {
    set({ loading: true });
    try {
      // Uses the createClientComponentClient to get the session which utilizes cookies
      const { data } = await supabase.auth.getSession();
      
      set({ 
        user: data?.session?.user ?? null, 
        isAuthenticated: !!data?.session?.user,
        loading: false 
      });
    } catch (error) {
      console.error("Error checking session:", error);
      set({
        user: null,
        isAuthenticated: false,
        loading: false
      });
    }
  },

  signOutUser: async () => {
    try {
      // Sign out will clear the cookie-based session
      await supabase.auth.signOut();
      set({ 
        user: null,
        isAuthenticated: false,
        loading: false
      });
    } catch (error) {
      console.error("Error signing out:", error);
      // Still reset the state even if there's an error
      set({ 
        user: null,
        isAuthenticated: false 
      });
    }
  },
}));