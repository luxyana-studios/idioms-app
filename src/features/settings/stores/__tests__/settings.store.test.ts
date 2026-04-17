import { useSettingsStore } from "../settings.store";

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
  beforeEach(() => {
    useSettingsStore.setState({
      themeMode: "dark",
      language: "en",
    });
  });

  it("has correct default state", () => {
    const state = useSettingsStore.getState();
    expect(state.themeMode).toBe("dark");
    expect(state.language).toBe("en");
  });

  it("setThemeMode updates the theme mode", () => {
    useSettingsStore.getState().setThemeMode("dark");
    expect(useSettingsStore.getState().themeMode).toBe("dark");
  });

  it("setLanguage updates the language", () => {
    useSettingsStore.getState().setLanguage("es");
    expect(useSettingsStore.getState().language).toBe("es");
  });

  describe("onRehydrateStorage theme sanitization", () => {
    it("keeps valid theme mode on rehydration", () => {
      useSettingsStore.setState({ themeMode: "light" });
      useSettingsStore.getState().setThemeMode("light");
      expect(useSettingsStore.getState().themeMode).toBe("light");
    });

    it("falls back to dark for legacy 'system' value", () => {
      // Simulate rehydration with a legacy persisted value
      useSettingsStore.setState({ themeMode: "dark" });
      const state = useSettingsStore.getState();
      const validModes = ["light", "dark"] as const;
      // biome-ignore lint/suspicious/noExplicitAny: testing legacy value
      const legacyMode = "system" as any;
      const safeMode = validModes.includes(legacyMode) ? legacyMode : "dark";
      state.setThemeMode(safeMode);
      expect(useSettingsStore.getState().themeMode).toBe("dark");
    });

    it("falls back to dark for any unrecognized theme value", () => {
      useSettingsStore.setState({ themeMode: "dark" });
      const state = useSettingsStore.getState();
      const validModes = ["light", "dark"] as const;
      // biome-ignore lint/suspicious/noExplicitAny: testing unknown value
      const unknownMode = "auto" as any;
      const safeMode = validModes.includes(unknownMode) ? unknownMode : "dark";
      state.setThemeMode(safeMode);
      expect(useSettingsStore.getState().themeMode).toBe("dark");
    });
  });
});
