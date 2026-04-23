import { supabase } from "@/core/supabase/client";
import { useIdiomsStore } from "../idioms.store";

jest.mock("@/core/supabase/client", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock("@/core/storage/mmkv", () => ({
  zustandMMKVStorage: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const mockFrom = supabase.from as jest.Mock;

const buildQuery = (result: { data: unknown; error: unknown }) => {
  const eq = jest.fn().mockResolvedValue(result);
  const select = jest.fn().mockReturnValue({ eq });
  mockFrom.mockReturnValue({ select });
};

const REAL_URL = "https://real.supabase.co";
const PLACEHOLDER_URL = "https://placeholder.supabase.co";

describe("useIdiomsStore", () => {
  const originalUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

  beforeEach(() => {
    useIdiomsStore.setState({
      idioms: [],
      savedIds: [],
      currentIndex: 0,
      loading: false,
      error: null,
    });
    mockFrom.mockReset();
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = originalUrl;
  });

  describe("loadIdioms", () => {
    it("falls back to mock idioms when SUPABASE_URL is not set", async () => {
      delete process.env.EXPO_PUBLIC_SUPABASE_URL;

      await useIdiomsStore.getState().loadIdioms();

      const { idioms, loading, error } = useIdiomsStore.getState();
      expect(idioms.length).toBeGreaterThan(0);
      expect(idioms[0].id).toMatch(/^mock-/);
      expect(loading).toBe(false);
      expect(error).toBeNull();
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it("falls back to mock idioms when SUPABASE_URL is the placeholder", async () => {
      process.env.EXPO_PUBLIC_SUPABASE_URL = PLACEHOLDER_URL;

      await useIdiomsStore.getState().loadIdioms();

      const { idioms, loading, error } = useIdiomsStore.getState();
      expect(idioms.length).toBeGreaterThan(0);
      expect(idioms[0].id).toMatch(/^mock-/);
      expect(loading).toBe(false);
      expect(error).toBeNull();
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it("sets error state on a real Supabase query failure", async () => {
      process.env.EXPO_PUBLIC_SUPABASE_URL = REAL_URL;
      buildQuery({ data: null, error: { message: "relation does not exist" } });

      await useIdiomsStore.getState().loadIdioms();

      const { idioms, loading, error } = useIdiomsStore.getState();
      expect(idioms).toHaveLength(0);
      expect(loading).toBe(false);
      expect(error).toBe("relation does not exist");
    });

    it("maps DB rows to the Idiom type on success", async () => {
      process.env.EXPO_PUBLIC_SUPABASE_URL = REAL_URL;
      buildQuery({
        data: [
          {
            id: "uuid-1",
            expression: "Break a leg",
            language_code: "en",
            idiomatic_meaning: "Good luck",
            explanation: "Theater origin",
            examples: ["Break a leg tonight!"],
            tags: ["theater"],
            source: "human",
            status: "published",
          },
        ],
        error: null,
      });

      await useIdiomsStore.getState().loadIdioms();

      const { idioms, loading, error } = useIdiomsStore.getState();
      expect(idioms).toHaveLength(1);
      expect(idioms[0]).toEqual({
        id: "uuid-1",
        expression: "Break a leg",
        languageCode: "en",
        idiomaticMeaning: "Good luck",
        explanation: "Theater origin",
        examples: ["Break a leg tonight!"],
        tags: ["theater"],
        source: "human",
        status: "published",
      });
      expect(loading).toBe(false);
      expect(error).toBeNull();
    });

    it("does not re-fetch when idioms are already loaded", async () => {
      process.env.EXPO_PUBLIC_SUPABASE_URL = REAL_URL;
      useIdiomsStore.setState({ idioms: [{ id: "existing" }] as never });

      await useIdiomsStore.getState().loadIdioms();

      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  describe("nextIdiom", () => {
    it("does not crash when idioms array is empty", () => {
      useIdiomsStore.setState({ idioms: [], currentIndex: 0 });
      expect(() => useIdiomsStore.getState().nextIdiom()).not.toThrow();
      expect(useIdiomsStore.getState().currentIndex).toBe(0);
    });

    it("advances the index and wraps around", () => {
      useIdiomsStore.setState({
        idioms: [{ id: "a" }, { id: "b" }] as never,
        currentIndex: 1,
      });
      useIdiomsStore.getState().nextIdiom();
      expect(useIdiomsStore.getState().currentIndex).toBe(0);
    });
  });
});
