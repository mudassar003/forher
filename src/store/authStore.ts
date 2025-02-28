import { create } from "zustand";
import { supabase } from "@/lib/supabase";

interface AuthState {
  user: any | null;
  loading: boolean;
  setUser: (user: any | null) => void;
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
