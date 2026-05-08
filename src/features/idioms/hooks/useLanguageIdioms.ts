import { useIdioms } from "./useIdioms";

export const useLanguageIdioms = (lang: string | undefined) => {
  const { data: idioms = [], isLoading, isError } = useIdioms();

  const filtered = idioms.filter((idiom) => idiom.languageCode === lang);

  return { idioms: filtered, isLoading, isError };
};
