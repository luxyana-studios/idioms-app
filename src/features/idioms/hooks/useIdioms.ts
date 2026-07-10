import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/core/supabase/client";
import { useUserLanguages } from "@/features/languages/hooks/useUserLanguages";
import type { Idiom } from "../types";
import { mapIdiomRow } from "./mapIdiomRow";

const fetchIdioms = async (
  uiLanguage: string,
  languageCodes: string[],
): Promise<Idiom[]> => {
  const { data, error } = await supabase.rpc("get_idiom_feed", {
    p_language_codes: languageCodes,
    p_ui_language: uiLanguage,
  });

  if (error) throw error;

  // The RPC already orders rows by configured language, then created_at, then id.
  return (data ?? []).map(mapIdiomRow);
};

export const useIdioms = () => {
  const { i18n } = useTranslation();
  const {
    languages,
    isLoading: languagesLoading,
    isError: languagesError,
    refetch: refetchLanguages,
  } = useUserLanguages();
  const languageCodes = languages.map((lang) => lang.languageCode);
  // Preserve configured language order in the key: the RPC orders the feed by
  // this order, so reordering languages (without changing the set) must refetch.
  const languageScopeKey = languageCodes.join(",");

  const query = useQuery({
    queryKey: ["idioms", i18n.language, languageScopeKey],
    queryFn: () => fetchIdioms(i18n.language, languageCodes),
    enabled: !languagesLoading && !languagesError,
  });

  // The idioms query is gated on the language scope. When useUserLanguages
  // errors, that query is *disabled* — neither loading nor errored — which would
  // otherwise surface as a silent empty feed. Fold the languages state in so
  // consumers see a real loading/error, and let retry recover the languages too.
  return {
    ...query,
    isLoading: query.isLoading || languagesLoading,
    isError: query.isError || languagesError,
    refetch: async () => {
      if (languagesError) await refetchLanguages();
      return query.refetch();
    },
  };
};
