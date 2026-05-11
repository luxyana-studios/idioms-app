import { useIdioms } from "./useIdioms";

// Filters the shared useIdioms cache client-side. Known trade-off: fetches full
// idiom payloads (tags + translations) for all languages when only one is needed.
// Acceptable at current dataset size; revisit with a dedicated query if it grows.
export const useLanguageIdioms = (lang: string | undefined) => {
  const { data: idioms = [], isLoading, isError } = useIdioms();

  const filtered = idioms.filter((idiom) => idiom.languageCode === lang);

  return { idioms: filtered, isLoading, isError };
};
