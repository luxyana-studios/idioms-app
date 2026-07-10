import { create } from "zustand";

// A short random token used as the RPC shuffle seed. The value only needs to be
// unique enough that consecutive shuffles produce a different order.
function makeSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

interface IdiomsState {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  // null = natural order. A non-null seed drives the RPC's md5(id || seed)
  // ordering, so shuffle is resolved server-side and spans the whole catalog.
  shuffleSeed: string | null;
  // Bumped on every shuffle so the feed screen can scroll back to the top.
  shuffleKey: number;
  // Re-rolls the seed, so each press produces a fresh whole-catalog order.
  shuffle: () => void;
}

export const useIdiomsStore = create<IdiomsState>()((set, get) => ({
  currentIndex: 0,
  setCurrentIndex: (index) => set({ currentIndex: index }),
  shuffleSeed: null,
  shuffleKey: 0,
  shuffle: () =>
    set({
      shuffleSeed: makeSeed(),
      currentIndex: 0,
      shuffleKey: get().shuffleKey + 1,
    }),
}));
