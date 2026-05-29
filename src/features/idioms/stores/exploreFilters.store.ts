import { create } from "zustand";

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

// Ephemeral, in-session filters for narrowing the Explore list. NOT persisted:
// the durable, cross-device content scope lives server-side in user_languages.
// These are just transient narrowing within a single Explore visit.
export const useExploreFiltersStore = create<ExploreFiltersState>()((set) => ({
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
}));
