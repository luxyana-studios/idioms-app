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
        // Reapply persisted theme after store hydration
        state.setThemeMode(state.themeMode);
      },
    },
  ),
);
