import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandMMKVStorage } from "@/core/storage/mmkv";
import { MOCK_IDIOMS } from "../data/mock";
import type { Idiom } from "../types";

interface IdiomsState {
  idioms: Idiom[];
  savedIds: string[];
  currentIndex: number;
  saveIdiom: (id: string) => void;
  unsaveIdiom: (id: string) => void;
  nextIdiom: () => void;
  isSaved: (id: string) => boolean;
}

export const useIdiomsStore = create<IdiomsState>()(
  persist(
    (set, get) => ({
      idioms: MOCK_IDIOMS,
      savedIds: [],
      currentIndex: 0,

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
