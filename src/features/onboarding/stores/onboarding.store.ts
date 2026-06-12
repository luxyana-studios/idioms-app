import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandMMKVStorage } from "@/core/storage/mmkv";

// Resets onboarding on every dev launch so the flow is always testable.
// Set EXPO_PUBLIC_DEV_RESET_ONBOARDING=false in .env to persist progress.
export const DEV_ALWAYS_SHOW_ONBOARDING =
  __DEV__ && process.env.EXPO_PUBLIC_DEV_RESET_ONBOARDING !== "false";

// Set EXPO_PUBLIC_DEV_SKIP_ONBOARDING=true to jump straight to the main app.
export const DEV_SKIP_ONBOARDING =
  __DEV__ && process.env.EXPO_PUBLIC_DEV_SKIP_ONBOARDING === "true";

interface OnboardingState {
  completed: boolean;
  goals: string[];
  selectedLanguageCodes: string[];
  setGoals: (goals: string[]) => void;
  setSelectedLanguageCodes: (codes: string[]) => void;
  toggleGoal: (id: string) => void;
  toggleLanguage: (code: string) => void;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      goals: [],
      selectedLanguageCodes: [],

      setGoals: (goals) => set({ goals }),
      setSelectedLanguageCodes: (codes) =>
        set({ selectedLanguageCodes: codes }),
      toggleGoal: (id) =>
        set((state) => ({
          goals: state.goals.includes(id)
            ? state.goals.filter((g) => g !== id)
            : [...state.goals, id],
        })),
      toggleLanguage: (code) =>
        set((state) => ({
          selectedLanguageCodes: state.selectedLanguageCodes.includes(code)
            ? state.selectedLanguageCodes.filter((c) => c !== code)
            : [...state.selectedLanguageCodes, code],
        })),
      complete: () => set({ completed: true }),
      reset: () =>
        set({ completed: false, goals: [], selectedLanguageCodes: [] }),
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
