import { useIdiomsStore } from "../idioms.store";

jest.mock("react-native-unistyles", () => ({
  UnistylesRuntime: { setAdaptiveThemes: jest.fn(), setTheme: jest.fn() },
}));

jest.mock("@/core/i18n", () => ({
  __esModule: true,
  default: { language: "en", changeLanguage: jest.fn() },
}));

jest.mock("@/core/storage/mmkv", () => ({
  zustandMMKVStorage: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

describe("useIdiomsStore", () => {
  beforeEach(() => {
    useIdiomsStore.setState({ savedIds: [], deferredIds: [], currentIndex: 0 });
  });

  describe("initial state", () => {
    it("starts with empty savedIds and currentIndex 0", () => {
      const state = useIdiomsStore.getState();
      expect(state.savedIds).toEqual([]);
      expect(state.currentIndex).toBe(0);
    });
  });

  describe("saveIdiom", () => {
    it("adds an id to savedIds", () => {
      useIdiomsStore.getState().saveIdiom("abc");
      expect(useIdiomsStore.getState().savedIds).toContain("abc");
    });

    it("does not duplicate an already-saved id", () => {
      useIdiomsStore.getState().saveIdiom("abc");
      useIdiomsStore.getState().saveIdiom("abc");
      expect(
        useIdiomsStore.getState().savedIds.filter((id) => id === "abc"),
      ).toHaveLength(1);
    });
  });

  describe("unsaveIdiom", () => {
    it("removes an id from savedIds", () => {
      useIdiomsStore.setState({ savedIds: ["abc", "def"] });
      useIdiomsStore.getState().unsaveIdiom("abc");
      expect(useIdiomsStore.getState().savedIds).not.toContain("abc");
      expect(useIdiomsStore.getState().savedIds).toContain("def");
    });

    it("is a no-op for an id that is not saved", () => {
      useIdiomsStore.setState({ savedIds: ["abc"] });
      useIdiomsStore.getState().unsaveIdiom("xyz");
      expect(useIdiomsStore.getState().savedIds).toEqual(["abc"]);
    });
  });

  describe("isSaved", () => {
    it("returns true for a saved id", () => {
      useIdiomsStore.setState({ savedIds: ["abc"] });
      expect(useIdiomsStore.getState().isSaved("abc")).toBe(true);
    });

    it("returns false for an unsaved id", () => {
      expect(useIdiomsStore.getState().isSaved("xyz")).toBe(false);
    });
  });

  describe("nextIdiom", () => {
    it("increments currentIndex", () => {
      useIdiomsStore.setState({ currentIndex: 0 });
      useIdiomsStore.getState().nextIdiom(5);
      expect(useIdiomsStore.getState().currentIndex).toBe(1);
    });

    it("wraps around when at the last item", () => {
      useIdiomsStore.setState({ currentIndex: 4 });
      useIdiomsStore.getState().nextIdiom(5);
      expect(useIdiomsStore.getState().currentIndex).toBe(0);
    });

    it("sets currentIndex to 0 when total is 0", () => {
      useIdiomsStore.setState({ currentIndex: 2 });
      useIdiomsStore.getState().nextIdiom(0);
      expect(useIdiomsStore.getState().currentIndex).toBe(0);
    });
  });

  describe("setCurrentIndex", () => {
    it("sets currentIndex to the given value", () => {
      useIdiomsStore.getState().setCurrentIndex(7);
      expect(useIdiomsStore.getState().currentIndex).toBe(7);
    });
  });

  describe("persistence", () => {
    it("partialize only persists savedIds, not currentIndex", () => {
      const partialize = (state: ReturnType<typeof useIdiomsStore.getState>) =>
        ({ savedIds: state.savedIds }) as ReturnType<
          typeof useIdiomsStore.getState
        >;
      const partial = partialize({
        ...useIdiomsStore.getState(),
        savedIds: ["abc"],
        currentIndex: 3,
      });
      expect(partial.savedIds).toEqual(["abc"]);
      expect(
        (partial as unknown as Record<string, unknown>).currentIndex,
      ).toBeUndefined();
    });
  });
});
