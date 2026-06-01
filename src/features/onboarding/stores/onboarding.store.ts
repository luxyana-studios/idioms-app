import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandMMKVStorage } from "@/core/storage/mmkv";

// Flip to false when the onboarding flow is ready for production.
// While true, the welcome flow shows every time the app starts.
export const DEV_ALWAYS_SHOW_ONBOARDING = true;

interface OnboardingState {
  completed: boolean;
  goals: string[];
  selectedLanguageCodes: string[];
  setGoals: (goals: string[]) => void;
  setSelectedLanguageCodes: (codes: string[]) => void;
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
