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
    useIdiomsStore.setState({ deferredIds: [], currentIndex: 0 });
  });

  describe("initial state", () => {
    it("starts with empty deferredIds and currentIndex 0", () => {
      const state = useIdiomsStore.getState();
      expect(state.deferredIds).toEqual([]);
      expect(state.currentIndex).toBe(0);
    });
  });

  describe("deferIdiom", () => {
    it("adds an id to deferredIds", () => {
      useIdiomsStore.getState().deferIdiom("abc");
      expect(useIdiomsStore.getState().deferredIds).toContain("abc");
    });

    it("moves an already-deferred id to the end", () => {
      useIdiomsStore.getState().deferIdiom("abc");
      useIdiomsStore.getState().deferIdiom("def");
      useIdiomsStore.getState().deferIdiom("abc");
      expect(useIdiomsStore.getState().deferredIds).toEqual(["def", "abc"]);
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
    it("partialize only persists deferredIds, not currentIndex", () => {
      const partialize = (state: ReturnType<typeof useIdiomsStore.getState>) =>
        ({ deferredIds: state.deferredIds }) as ReturnType<
          typeof useIdiomsStore.getState
        >;
      const partial = partialize({
        ...useIdiomsStore.getState(),
        deferredIds: ["abc"],
        currentIndex: 3,
      });
      expect(partial.deferredIds).toEqual(["abc"]);
      expect(
        (partial as unknown as Record<string, unknown>).currentIndex,
      ).toBeUndefined();
    });
  });
});
