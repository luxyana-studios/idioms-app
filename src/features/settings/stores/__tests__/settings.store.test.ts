import { UnistylesRuntime } from "react-native-unistyles";
import i18n from "@/core/i18n";
import { zustandMMKVStorage } from "@/core/storage/mmkv";
import { useSettingsStore } from "../settings.store";

// jest.mock is hoisted before imports, so importing the mocked modules
// above gives us direct references to the jest.fn() instances created below.

jest.mock("react-native-unistyles", () => ({
  UnistylesRuntime: {
    setAdaptiveThemes: jest.fn(),
    setTheme: jest.fn(),
  },
}));

jest.mock("@/core/i18n", () => ({
  __esModule: true,
  default: {
    language: "en",
    changeLanguage: jest.fn(),
  },
}));

jest.mock("@/core/storage/mmkv", () => ({
  zustandMMKVStorage: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

describe("useSettingsStore", () => {
  describe("default state", () => {
    it("has dark theme and device language as defaults", () => {
      // getInitialState() returns the state from create() before any hydration,
      // verifying defaults without the beforeEach setState override.
      const state = useSettingsStore.getInitialState();
      expect(state.themeMode).toBe("dark");
      expect(state.language).toBe("en"); // mocked i18n.language
    });
  });

  describe("actions", () => {
    beforeEach(() => {
      useSettingsStore.setState({ themeMode: "dark", language: "en" });
    });

    it("setThemeMode updates the theme mode", () => {
      useSettingsStore.getState().setThemeMode("light");
      expect(useSettingsStore.getState().themeMode).toBe("light");
    });

    it("setLanguage updates the language", () => {
      useSettingsStore.getState().setLanguage("es");
      expect(useSettingsStore.getState().language).toBe("es");
    });
  });

  describe("onRehydrateStorage", () => {
    beforeEach(() => {
      (UnistylesRuntime.setTheme as jest.Mock).mockClear();
      (i18n.changeLanguage as jest.Mock).mockClear();
      (zustandMMKVStorage.getItem as jest.Mock).mockReset();
      (zustandMMKVStorage.getItem as jest.Mock).mockReturnValue(null);
    });

    const rehydrateWith = async (state: object) => {
      (zustandMMKVStorage.getItem as jest.Mock).mockReturnValue(
        JSON.stringify({ state, version: 0 }),
      );
      await useSettingsStore.persist.rehydrate();
    };

    it("applies a valid persisted theme", async () => {
      await rehydrateWith({ themeMode: "light", language: "en" });
      expect(useSettingsStore.getState().themeMode).toBe("light");
      expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith("light");
    });

    it("falls back to dark for legacy 'system' value", async () => {
      await rehydrateWith({ themeMode: "system", language: "en" });
      expect(useSettingsStore.getState().themeMode).toBe("dark");
      expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith("dark");
    });

    it("falls back to dark for any unrecognized theme value", async () => {
      await rehydrateWith({ themeMode: "auto", language: "en" });
      expect(useSettingsStore.getState().themeMode).toBe("dark");
      expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith("dark");
    });

    it("reapplies persisted language", async () => {
      await rehydrateWith({ themeMode: "dark", language: "es" });
      expect(useSettingsStore.getState().language).toBe("es");
      expect(i18n.changeLanguage).toHaveBeenCalledWith("es");
    });
  });
});
