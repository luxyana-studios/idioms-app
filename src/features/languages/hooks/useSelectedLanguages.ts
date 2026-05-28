import { useMemo } from "react";
import { useUserLanguages } from "./useUserLanguages";

interface SelectedLanguages {
  // Ordered effective language scope. Defaults to frontend catalog when the
  // user has not persisted a custom language configuration.
  codes: string[];
  // Stable lookup of a code's display config (color/flag) for UI differentiation.
  byCode: Map<string, { color: string; flag: string }>;
  // True once the user has explicitly configured at least one language.
  hasSelection: boolean;
  hasUserConfiguration: boolean;
  isLoading: boolean;
  isError: boolean;
}

// Transitional compatibility wrapper around useUserLanguages. New code should
// prefer useUserLanguages() directly so it can distinguish effective defaults
// from persisted user configuration.
export const useSelectedLanguages = (): SelectedLanguages => {
  const { languages, hasUserConfiguration, isLoading, isError } =
    useUserLanguages();

  return useMemo(() => {
    const codes = languages.map((lang) => lang.languageCode);
    const byCode = new Map(
      languages.map((lang) => [
        lang.languageCode,
        { color: lang.color, flag: lang.flag },
      ]),
    );
    return {
      codes,
      byCode,
      hasSelection: hasUserConfiguration,
      hasUserConfiguration,
      isLoading,
      isError,
    };
  }, [languages, hasUserConfiguration, isLoading, isError]);
};
