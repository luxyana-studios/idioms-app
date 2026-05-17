import { create } from "zustand";

interface IdiomsState {
  currentIndex: number;
  nextIdiom: (total: number) => void;
}

export const useIdiomsStore = create<IdiomsState>()((set) => ({
  currentIndex: 0,
  nextIdiom: (total) =>
    set((state) => ({
      currentIndex: total > 0 ? (state.currentIndex + 1) % total : 0,
    })),
}));
