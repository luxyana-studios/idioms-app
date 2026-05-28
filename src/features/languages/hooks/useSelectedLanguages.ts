import { useMemo } from "react";
import { useUserLanguages } from "./useUserLanguages";

interface SelectedLanguages {
  // Ordered list of selected language codes. Empty = unconfigured = no filter.
  codes: string[];
  // Stable lookup of a code's display config (color/flag) for UI differentiation.
  byCode: Map<string, { color: string; flag: string }>;
  // True once the user has explicitly configured at least one language.
  hasSelection: boolean;
  isLoading: boolean;
  isError: boolean;
}

// Derives the active content-language scope from the user's configuration.
// Consumers filter feed/equivalents/translations against `codes` (skipping the
// filter when empty) and read color/flag from `byCode` for display.
export const useSelectedLanguages = (): SelectedLanguages => {
  const { data: languages = [], isLoading, isError } = useUserLanguages();

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
      hasSelection: codes.length > 0,
      isLoading,
      isError,
    };
  }, [languages, isLoading, isError]);
};
