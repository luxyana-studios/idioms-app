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
    it("has system theme and device language as defaults", () => {
      const state = useSettingsStore.getInitialState();
      expect(state.themeMode).toBe("system");
      expect(state.language).toBe("en"); // mocked i18n.language
    });
  });

  describe("actions", () => {
    beforeEach(() => {
      useSettingsStore.setState({ themeMode: "system", language: "en" });
      (UnistylesRuntime.setAdaptiveThemes as jest.Mock).mockClear();
      (UnistylesRuntime.setTheme as jest.Mock).mockClear();
    });

    it("setThemeMode to system enables adaptive themes", () => {
      useSettingsStore.getState().setThemeMode("system");
      expect(useSettingsStore.getState().themeMode).toBe("system");
      expect(UnistylesRuntime.setAdaptiveThemes).toHaveBeenCalledWith(true);
      expect(UnistylesRuntime.setTheme).not.toHaveBeenCalled();
    });

    it("setThemeMode to light disables adaptive themes and sets light", () => {
      useSettingsStore.getState().setThemeMode("light");
      expect(useSettingsStore.getState().themeMode).toBe("light");
      expect(UnistylesRuntime.setAdaptiveThemes).toHaveBeenCalledWith(false);
      expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith("light");
    });

    it("setLanguage updates the language", () => {
      useSettingsStore.getState().setLanguage("es");
      expect(useSettingsStore.getState().language).toBe("es");
    });
  });

  describe("onRehydrateStorage", () => {
    beforeEach(() => {
      (UnistylesRuntime.setAdaptiveThemes as jest.Mock).mockClear();
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

    it("applies a valid persisted light theme", async () => {
      await rehydrateWith({ themeMode: "light", language: "en" });
      expect(useSettingsStore.getState().themeMode).toBe("light");
      expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith("light");
    });

    it("applies a valid persisted system theme", async () => {
      await rehydrateWith({ themeMode: "system", language: "en" });
      expect(useSettingsStore.getState().themeMode).toBe("system");
      expect(UnistylesRuntime.setAdaptiveThemes).toHaveBeenCalledWith(true);
    });

    it("falls back to system for any unrecognized theme value", async () => {
      await rehydrateWith({ themeMode: "auto", language: "en" });
      expect(useSettingsStore.getState().themeMode).toBe("system");
      expect(UnistylesRuntime.setAdaptiveThemes).toHaveBeenCalledWith(true);
    });

    it("reapplies persisted language", async () => {
      await rehydrateWith({ themeMode: "dark", language: "es" });
      expect(useSettingsStore.getState().language).toBe("es");
      expect(i18n.changeLanguage).toHaveBeenCalledWith("es");
    });
  });
});
