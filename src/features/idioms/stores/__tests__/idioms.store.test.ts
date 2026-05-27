import { useIdiomsStore } from "../idioms.store";

const INITIAL_STATE = {
  currentIndex: 0,
  isShuffled: false,
  shuffledIds: [],
  shuffleKey: 0,
};

describe("useIdiomsStore", () => {
  beforeEach(() => {
    useIdiomsStore.setState(INITIAL_STATE);
  });

  describe("initial state", () => {
    it("starts with currentIndex 0", () => {
      expect(useIdiomsStore.getState().currentIndex).toBe(0);
    });

    it("starts with shuffle disabled", () => {
      expect(useIdiomsStore.getState().isShuffled).toBe(false);
      expect(useIdiomsStore.getState().shuffledIds).toEqual([]);
    });
  });

  describe("setCurrentIndex", () => {
    it("sets currentIndex to the given value", () => {
      useIdiomsStore.getState().setCurrentIndex(7);
      expect(useIdiomsStore.getState().currentIndex).toBe(7);
    });
  });

  describe("enableShuffle", () => {
    const ids = ["a", "b", "c", "d", "e"];

    it("sets isShuffled to true", () => {
      useIdiomsStore.getState().enableShuffle(ids);
      expect(useIdiomsStore.getState().isShuffled).toBe(true);
    });

    it("stores a permutation of the provided ids", () => {
      useIdiomsStore.getState().enableShuffle(ids);
      const { shuffledIds } = useIdiomsStore.getState();
      expect(shuffledIds).toHaveLength(ids.length);
      expect([...shuffledIds].sort()).toEqual([...ids].sort());
    });

    it("resets currentIndex to 0", () => {
      useIdiomsStore.setState({ currentIndex: 5 });
      useIdiomsStore.getState().enableShuffle(ids);
      expect(useIdiomsStore.getState().currentIndex).toBe(0);
    });

    it("increments shuffleKey on each call", () => {
      useIdiomsStore.getState().enableShuffle(ids);
      expect(useIdiomsStore.getState().shuffleKey).toBe(1);
      useIdiomsStore.getState().enableShuffle(ids);
      expect(useIdiomsStore.getState().shuffleKey).toBe(2);
    });

    it("does not place currentId at position 0 when alternatives exist", () => {
      const currentId = ids[0];
      // Run enough times to rule out a lucky coincidence
      for (let i = 0; i < 20; i++) {
        useIdiomsStore.getState().enableShuffle(ids, currentId);
        expect(useIdiomsStore.getState().shuffledIds[0]).not.toBe(currentId);
      }
    });

    it("does not crash with a single-item list where currentId equals that item", () => {
      expect(() =>
        useIdiomsStore.getState().enableShuffle(["a"], "a"),
      ).not.toThrow();
      const { shuffledIds } = useIdiomsStore.getState();
      expect(shuffledIds).toEqual(["a"]);
    });
  });
});
