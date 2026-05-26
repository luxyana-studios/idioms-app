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
  shuffleKey: number;
  enableShuffle: (idiomIds: string[], currentId?: string) => void;
}

export const useIdiomsStore = create<IdiomsState>()((set, get) => ({
  currentIndex: 0,
  setCurrentIndex: (index) => set({ currentIndex: index }),
  isShuffled: false,
  shuffledIds: [],
  shuffleKey: 0,
  enableShuffle: (idiomIds, currentId) => {
    const shuffled = fisherYatesShuffle(idiomIds);
    // Ensure the currently visible card is never at position 0 so the user
    // always sees a different card after pressing shuffle.
    if (currentId && shuffled[0] === currentId && shuffled.length > 1) {
      const swapIdx = 1 + Math.floor(Math.random() * (shuffled.length - 1));
      [shuffled[0], shuffled[swapIdx]] = [shuffled[swapIdx], shuffled[0]];
    }
    set({
      isShuffled: true,
      shuffledIds: shuffled,
      currentIndex: 0,
      shuffleKey: get().shuffleKey + 1,
    });
  },
}));
