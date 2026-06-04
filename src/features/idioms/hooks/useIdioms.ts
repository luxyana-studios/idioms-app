import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/core/supabase/client";
import { useUserLanguages } from "@/features/languages/hooks/useUserLanguages";
import type {
  Idiom,
  IdiomEquivalent,
  IdiomSource,
  IdiomTag,
  IdiomTranslation,
} from "../types";

// Nested collections arrive as jsonb from the get_idiom_feed RPC, typed only as
// `Json` by the generated Supabase types. The function builds them with the
// camelCase shapes below, so map defensively with runtime fallbacks.
type RawTag = { key: string; facet: string; label: string };
type RawTranslation = {
  id: string;
  idiomId: string;
  languageCode: string;
  literalTranslation: string;
  idiomaticMeaning: string;
  explanation: string | null;
  source: string;
};
type RawEquivalent = {
  edgeId: string;
  equivalentId: string;
  expression: string;
  languageCode: string;
  idiomaticMeaning: string;
  similarityScore: number | string;
  verified: boolean;
};

const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? value : []);

const mapTags = (value: unknown): IdiomTag[] =>
  asArray<RawTag>(value).map((tag) => ({
    key: tag.key,
    facet: tag.facet as IdiomTag["facet"],
    label: tag.label,
  }));

const mapTranslations = (value: unknown): IdiomTranslation[] =>
  asArray<RawTranslation>(value).map((tr) => ({
    id: tr.id,
    idiomId: tr.idiomId,
    languageCode: tr.languageCode,
    literalTranslation: tr.literalTranslation,
    idiomaticMeaning: tr.idiomaticMeaning,
    explanation: tr.explanation ?? undefined,
    source: tr.source as IdiomSource,
  }));

const mapEquivalents = (value: unknown): IdiomEquivalent[] =>
  asArray<RawEquivalent>(value).map((eq) => ({
    edgeId: eq.edgeId,
    equivalentId: eq.equivalentId,
    expression: eq.expression,
    languageCode: eq.languageCode,
    idiomaticMeaning: eq.idiomaticMeaning,
    // numeric(3,2) is serialized as a string over the wire — coerce to number.
    // Fall back to 0 so a malformed/absent value can't become NaN and corrupt
    // the score-desc ordering downstream.
    similarityScore: Number(eq.similarityScore ?? 0),
    verified: eq.verified,
  }));

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
  return (data ?? []).map((row) => ({
    id: row.id,
    expression: row.expression,
    languageCode: row.language_code,
    idiomaticMeaning: row.idiomatic_meaning,
    likesCount: row.likes_count,
    explanation: row.explanation ?? undefined,
    examples: row.examples ?? undefined,
    tags: mapTags(row.tags),
    translations: mapTranslations(row.translations),
    equivalents: mapEquivalents(row.equivalents),
    source: row.source as Idiom["source"],
    status: row.status as Idiom["status"],
  }));
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
