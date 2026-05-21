import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandMMKVStorage } from "@/core/storage/mmkv";

interface IdiomsState {
  deferredIds: string[];
  currentIndex: number;
  deferIdiom: (id: string) => void;
  nextIdiom: (total: number) => void;
  setCurrentIndex: (index: number) => void;
}

export const useIdiomsStore = create<IdiomsState>()(
  persist(
    (set) => ({
      deferredIds: [],
      currentIndex: 0,

      deferIdiom: (id) =>
        set((state) => ({
          deferredIds: [...state.deferredIds.filter((d) => d !== id), id],
        })),

      nextIdiom: (total) =>
        set((state) => ({
          currentIndex: total > 0 ? (state.currentIndex + 1) % total : 0,
        })),

      setCurrentIndex: (index) => set({ currentIndex: index }),
    }),
    {
      name: "idioms-store",
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (state) =>
        ({ deferredIds: state.deferredIds }) as IdiomsState,
    },
  ),
);
