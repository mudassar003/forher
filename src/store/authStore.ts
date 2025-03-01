import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js"; // ✅ Import Supabase User type

interface AuthState {
  user: User | null; // ✅ Ensure user is typed correctly
  loading: boolean;
  setUser: (user: User | null) => void;
  checkSession: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  checkSession: async () => {
    set({ loading: true });
    const { data } = await supabase.auth.getSession();
    set({ user: data?.session?.user ?? null, loading: false });
  },

  signOutUser: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
