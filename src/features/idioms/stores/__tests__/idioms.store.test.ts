import { useIdiomsStore } from "../idioms.store";

const INITIAL_STATE = {
  currentIndex: 0,
  shuffleSeed: null,
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

    it("starts with shuffle disabled (no seed)", () => {
      expect(useIdiomsStore.getState().shuffleSeed).toBeNull();
    });
  });

  describe("setCurrentIndex", () => {
    it("sets currentIndex to the given value", () => {
      useIdiomsStore.getState().setCurrentIndex(7);
      expect(useIdiomsStore.getState().currentIndex).toBe(7);
    });
  });

  describe("shuffle", () => {
    it("sets a non-null seed", () => {
      useIdiomsStore.getState().shuffle();
      expect(useIdiomsStore.getState().shuffleSeed).toEqual(expect.any(String));
    });

    it("rolls a different seed on each call", () => {
      useIdiomsStore.getState().shuffle();
      const first = useIdiomsStore.getState().shuffleSeed;
      useIdiomsStore.getState().shuffle();
      const second = useIdiomsStore.getState().shuffleSeed;
      expect(second).not.toBe(first);
    });

    it("resets currentIndex to 0", () => {
      useIdiomsStore.setState({ currentIndex: 5 });
      useIdiomsStore.getState().shuffle();
      expect(useIdiomsStore.getState().currentIndex).toBe(0);
    });

    it("increments shuffleKey on each call", () => {
      useIdiomsStore.getState().shuffle();
      expect(useIdiomsStore.getState().shuffleKey).toBe(1);
      useIdiomsStore.getState().shuffle();
      expect(useIdiomsStore.getState().shuffleKey).toBe(2);
    });
  });
});
