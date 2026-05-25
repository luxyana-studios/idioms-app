import { create } from "zustand";

interface IdiomsState {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

export const useIdiomsStore = create<IdiomsState>()((set) => ({
  currentIndex: 0,
  setCurrentIndex: (index) => set({ currentIndex: index }),
}));
