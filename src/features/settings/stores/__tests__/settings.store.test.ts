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
});
