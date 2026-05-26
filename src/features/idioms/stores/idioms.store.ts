import { create } from "zustand";

function fisherYatesShuffle(ids: string[]): string[] {
  const arr = [...ids];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface IdiomsState {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isShuffled: boolean;
  shuffledIds: string[];
  enableShuffle: (idiomIds: string[]) => void;
  disableShuffle: () => void;
}

export const useIdiomsStore = create<IdiomsState>()((set) => ({
  currentIndex: 0,
  setCurrentIndex: (index) => set({ currentIndex: index }),
  isShuffled: false,
  shuffledIds: [],
  enableShuffle: (idiomIds) =>
    set({
      isShuffled: true,
      shuffledIds: fisherYatesShuffle(idiomIds),
      currentIndex: 0,
    }),
  disableShuffle: () =>
    set({ isShuffled: false, shuffledIds: [], currentIndex: 0 }),
}));
