import { useIdiomsStore } from "../idioms.store";

const INITIAL_STATE = {
  currentIndex: 0,
  isShuffled: false,
  shuffledIds: [],
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
  });

  describe("disableShuffle", () => {
    it("clears isShuffled and shuffledIds, resets currentIndex", () => {
      useIdiomsStore.setState({
        isShuffled: true,
        shuffledIds: ["a", "b"],
        currentIndex: 3,
      });
      useIdiomsStore.getState().disableShuffle();
      const state = useIdiomsStore.getState();
      expect(state.isShuffled).toBe(false);
      expect(state.shuffledIds).toEqual([]);
      expect(state.currentIndex).toBe(0);
    });
  });
});
