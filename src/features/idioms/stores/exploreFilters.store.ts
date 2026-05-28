import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandMMKVStorage } from "@/core/storage/mmkv";

interface ExploreFiltersState {
  selectedLanguageCodes: string[];
  selectedTagKeys: string[];
  toggleLanguage: (code: string) => void;
  toggleTag: (key: string) => void;
  setTags: (keys: string[]) => void;
  clearLanguages: () => void;
  clearTags: () => void;
  clearAll: () => void;
}

const toggleValue = (values: string[], value: string) =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

const uniqueValues = (values: string[]) => Array.from(new Set(values));

export const useExploreFiltersStore = create<ExploreFiltersState>()(
  persist(
    (set) => ({
      selectedLanguageCodes: [],
      selectedTagKeys: [],
      toggleLanguage: (code) =>
        set((state) => ({
          selectedLanguageCodes: toggleValue(state.selectedLanguageCodes, code),
        })),
      toggleTag: (key) =>
        set((state) => ({
          selectedTagKeys: toggleValue(state.selectedTagKeys, key),
        })),
      setTags: (keys) => set({ selectedTagKeys: uniqueValues(keys) }),
      clearLanguages: () => set({ selectedLanguageCodes: [] }),
      clearTags: () => set({ selectedTagKeys: [] }),
      clearAll: () =>
        set({
          selectedLanguageCodes: [],
          selectedTagKeys: [],
        }),
    }),
    {
      name: "explore-filters-storage",
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
