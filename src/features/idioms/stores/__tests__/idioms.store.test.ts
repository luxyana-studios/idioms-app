import { useIdiomsStore } from "../idioms.store";

describe("useIdiomsStore", () => {
  beforeEach(() => {
    useIdiomsStore.setState({ currentIndex: 0 });
  });

  describe("initial state", () => {
    it("starts with currentIndex 0", () => {
      expect(useIdiomsStore.getState().currentIndex).toBe(0);
    });
  });

  describe("setCurrentIndex", () => {
    it("sets currentIndex to the given value", () => {
      useIdiomsStore.getState().setCurrentIndex(7);
      expect(useIdiomsStore.getState().currentIndex).toBe(7);
    });
  });
});
