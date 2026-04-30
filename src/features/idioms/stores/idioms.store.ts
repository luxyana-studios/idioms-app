import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandMMKVStorage } from "@/core/storage/mmkv";

interface IdiomsState {
  savedIds: string[];
  currentIndex: number;
  saveIdiom: (id: string) => void;
  unsaveIdiom: (id: string) => void;
  nextIdiom: (total: number) => void;
  isSaved: (id: string) => boolean;
}

export const useIdiomsStore = create<IdiomsState>()(
  persist(
    (set, get) => ({
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

      nextIdiom: (total) =>
        set((state) => ({
          currentIndex: total > 0 ? (state.currentIndex + 1) % total : 0,
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
