import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandMMKVStorage } from "@/core/storage/mmkv";
import { supabase } from "@/core/supabase/client";
import type { Idiom } from "../types";

interface IdiomsState {
  idioms: Idiom[];
  savedIds: string[];
  currentIndex: number;
  loading: boolean;
  loadIdioms: () => Promise<void>;
  saveIdiom: (id: string) => void;
  unsaveIdiom: (id: string) => void;
  nextIdiom: () => void;
  isSaved: (id: string) => boolean;
}

export const useIdiomsStore = create<IdiomsState>()(
  persist(
    (set, get) => ({
      idioms: [],
      savedIds: [],
      currentIndex: 0,
      loading: false,

      loadIdioms: async () => {
        if (get().idioms.length > 0 || get().loading) return;
        set({ loading: true });

        const { data, error } = await supabase
          .from("idioms")
          .select("*")
          .eq("status", "published");

        if (error) {
          console.error("Failed to load idioms:", error.message);
          set({ loading: false });
          return;
        }

        const idioms: Idiom[] = (data ?? []).map((row) => ({
          id: row.id,
          expression: row.expression,
          languageCode: row.language_code,
          idiomaticMeaning: row.idiomatic_meaning,
          explanation: row.explanation ?? undefined,
          examples: row.examples ?? undefined,
          tags: row.tags ?? [],
          source: row.source as Idiom["source"],
          status: row.status as Idiom["status"],
        }));

        set({ idioms, loading: false });
      },

      saveIdiom: (id) =>
        set((state) => ({
          savedIds: state.savedIds.includes(id)
            ? state.savedIds
            : [...state.savedIds, id],
        })),

      unsaveIdiom: (id) =>
        set((state) => ({
          savedIds: state.savedIds.filter((s) => s !== id),
        })),

      nextIdiom: () =>
        set((state) => ({
          currentIndex: (state.currentIndex + 1) % state.idioms.length,
        })),

      isSaved: (id) => get().savedIds.includes(id),
    }),
    {
      name: "idioms-store",
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (state) => ({ savedIds: state.savedIds }) as IdiomsState,
    },
  ),
);
