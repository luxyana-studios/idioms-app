import { UnistylesRuntime } from "react-native-unistyles";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import i18n from "@/core/i18n";
import { zustandMMKVStorage } from "@/core/storage/mmkv";

type ThemeMode = "light" | "dark";

interface SettingsState {
  themeMode: ThemeMode;
  language: string;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: "dark",
      language: "en",

      setThemeMode: (mode) => {
        UnistylesRuntime.setAdaptiveThemes(false);
        UnistylesRuntime.setTheme(mode);
        set({ themeMode: mode });
      },

      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => zustandMMKVStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Sanitize legacy "system" value that may exist in persisted storage
        const validModes: ThemeMode[] = ["light", "dark"];
        const safeMode = validModes.includes(state.themeMode)
          ? state.themeMode
          : "dark";
        state.setThemeMode(safeMode);
        // Re-apply persisted language — i18n inits with device locale,
        // so we must sync it with the user's saved preference after rehydration
        state.setLanguage(state.language);
      },
    },
  ),
);
