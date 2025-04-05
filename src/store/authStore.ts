// src/store/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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

// Create the store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
          const { data } = await supabase.auth.getUser();
          
          set({ 
            user: data?.user ?? null, 
            isAuthenticated: !!data?.user,
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
    }),
    {
      name: 'auth-storage', // Name for the storage
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for persistence
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated
      }), // Only persist these fields
    }
  )
);