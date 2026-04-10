import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "@/core/supabase/client";

interface AuthState {
  session: Session | null;
  user: User | null;
  initialized: boolean;
  loading: boolean;
  initialize: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initialized: false,
  loading: false,

  initialize: () => {
    // Skip Supabase when running without credentials (demo/dev mode)
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
      set({
        initialized: true,
        session: {
          user: { id: "demo", email: "demo@idiomdeck.app" },
        } as Session,
        user: { id: "demo", email: "demo@idiomdeck.app" } as User,
      });
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, initialized: true });
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password) => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
}));
