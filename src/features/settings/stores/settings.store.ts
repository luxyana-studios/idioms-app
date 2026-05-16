import { UnistylesRuntime } from "react-native-unistyles";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import i18n, {
  normalizeLanguageTag,
  type SupportedUiLanguage,
} from "@/core/i18n";
import { zustandMMKVStorage } from "@/core/storage/mmkv";

export type ThemeMode = "system" | "light" | "dark";

interface SettingsState {
  themeMode: ThemeMode;
  language: SupportedUiLanguage;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: "system",
      language: normalizeLanguageTag(i18n.language),

      setThemeMode: (mode) => {
        if (mode === "system") {
          UnistylesRuntime.setAdaptiveThemes(true);
        } else {
          UnistylesRuntime.setAdaptiveThemes(false);
          UnistylesRuntime.setTheme(mode);
        }
        set({ themeMode: mode });
      },

      setLanguage: (language) => {
        const safeLanguage = normalizeLanguageTag(language);
        i18n.changeLanguage(safeLanguage);
        set({ language: safeLanguage });
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => zustandMMKVStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const validModes: ThemeMode[] = ["system", "light", "dark"];
        const safeMode = (validModes as string[]).includes(state.themeMode)
          ? state.themeMode
          : "system";
        state.setThemeMode(safeMode);
        // Re-apply persisted language — i18n inits with device locale,
        // so we must sync it with the user's saved preference after rehydration
        state.setLanguage(normalizeLanguageTag(state.language));
      },
    },
  ),
);
