import { useIdioms } from "./useIdioms";

export interface LanguageCount {
  code: string;
  count: number;
}

export const useLanguageCounts = () => {
  const { data: idioms = [], isLoading, isError } = useIdioms();

  const languages: LanguageCount[] = Object.entries(
    idioms.reduce<Record<string, number>>((acc, idiom) => {
      acc[idiom.languageCode] = (acc[idiom.languageCode] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort(([, a], [, b]) => b - a)
    .map(([code, count]) => ({ code, count }));

  return { languages, isLoading, isError };
};
