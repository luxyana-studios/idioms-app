import { I18nManager } from "react-native";
import { UnistylesRuntime } from "react-native-unistyles";
import i18n from "@/core/i18n";
import { zustandMMKVStorage } from "@/core/storage/mmkv";
import { useSettingsStore } from "../settings.store";

const setRtlFlag = (value: boolean) => {
  Object.defineProperty(I18nManager, "isRTL", {
    configurable: true,
    get: () => value,
  });
};

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
  normalizeLanguageTag: jest.fn((language?: string | null) => {
    const baseLanguage = language?.split("-")[0]?.toLowerCase();
    return [
      "ar",
      "zh",
      "en",
      "fr",
      "de",
      "hi",
      "it",
      "ja",
      "ko",
      "pt",
      "es",
    ].includes(baseLanguage ?? "")
      ? baseLanguage
      : "en";
  }),
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
      setRtlFlag(false);
      (I18nManager.allowRTL as jest.Mock | undefined)?.mockClear?.();
      (I18nManager.forceRTL as jest.Mock | undefined)?.mockClear?.();
      I18nManager.allowRTL = jest.fn();
      I18nManager.forceRTL = jest.fn();
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
      expect(i18n.changeLanguage).toHaveBeenCalledWith("es");
    });

    it("setLanguage normalizes region-specific locale codes", () => {
      useSettingsStore.getState().setLanguage("fr-CA");
      expect(useSettingsStore.getState().language).toBe("fr");
      expect(i18n.changeLanguage).toHaveBeenCalledWith("fr");
    });

    it("setLanguage falls back to English for unsupported locales", () => {
      useSettingsStore.getState().setLanguage("ru");
      expect(useSettingsStore.getState().language).toBe("en");
      expect(i18n.changeLanguage).toHaveBeenCalledWith("en");
    });

    it("setLanguage flips the native RTL flag when switching to Arabic", () => {
      setRtlFlag(false);
      const restartNeeded = useSettingsStore.getState().setLanguage("ar");
      expect(I18nManager.allowRTL).toHaveBeenCalledWith(true);
      expect(I18nManager.forceRTL).toHaveBeenCalledWith(true);
      expect(restartNeeded).toBe(true);
    });

    it("setLanguage flips the native RTL flag when leaving Arabic", () => {
      setRtlFlag(true);
      const restartNeeded = useSettingsStore.getState().setLanguage("en");
      expect(I18nManager.allowRTL).toHaveBeenCalledWith(false);
      expect(I18nManager.forceRTL).toHaveBeenCalledWith(false);
      expect(restartNeeded).toBe(true);
    });

    it("setLanguage does not touch I18nManager when direction is unchanged", () => {
      setRtlFlag(false);
      const restartNeeded = useSettingsStore.getState().setLanguage("fr");
      expect(I18nManager.allowRTL).not.toHaveBeenCalled();
      expect(I18nManager.forceRTL).not.toHaveBeenCalled();
      expect(restartNeeded).toBe(false);
    });

    it("setLanguage does not touch I18nManager when re-selecting an RTL lang", () => {
      setRtlFlag(true);
      const restartNeeded = useSettingsStore.getState().setLanguage("ar");
      expect(I18nManager.allowRTL).not.toHaveBeenCalled();
      expect(I18nManager.forceRTL).not.toHaveBeenCalled();
      expect(restartNeeded).toBe(false);
    });
  });

  describe("onRehydrateStorage", () => {
    beforeEach(() => {
      (UnistylesRuntime.setAdaptiveThemes as jest.Mock).mockClear();
      (UnistylesRuntime.setTheme as jest.Mock).mockClear();
      (i18n.changeLanguage as jest.Mock).mockClear();
      (zustandMMKVStorage.getItem as jest.Mock).mockReset();
      (zustandMMKVStorage.getItem as jest.Mock).mockReturnValue(null);
      setRtlFlag(false);
      I18nManager.allowRTL = jest.fn();
      I18nManager.forceRTL = jest.fn();
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

    it("normalizes persisted region-specific locales", async () => {
      await rehydrateWith({ themeMode: "dark", language: "de-AT" });
      expect(useSettingsStore.getState().language).toBe("de");
      expect(i18n.changeLanguage).toHaveBeenCalledWith("de");
    });

    it("falls back to English for unsupported persisted locales", async () => {
      await rehydrateWith({ themeMode: "dark", language: "ru" });
      expect(useSettingsStore.getState().language).toBe("en");
      expect(i18n.changeLanguage).toHaveBeenCalledWith("en");
    });
  });
});
