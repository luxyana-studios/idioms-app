import { useIdioms } from "./useIdioms";

export interface LanguageCount {
  code: string;
  count: number;
}

// Derives counts from the shared useIdioms cache. Known trade-off: the cache key
// includes UI language, so this refetches on locale change even though catalog
// language distribution is locale-independent. Acceptable at current dataset size.
export const useLanguageCounts = () => {
  const { data: idioms = [], isLoading, isError } = useIdioms();

  const languages: LanguageCount[] = Object.entries(
    idioms.reduce<Record<string, number>>((acc, idiom) => {
      acc[idiom.languageCode] = (acc[idiom.languageCode] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort(([codeA, a], [codeB, b]) => b - a || codeA.localeCompare(codeB))
    .map(([code, count]) => ({ code, count }));

  return { languages, isLoading, isError };
};
