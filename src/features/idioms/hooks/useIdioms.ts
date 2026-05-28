import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/core/supabase/client";
import { useUserLanguages } from "@/features/languages/hooks/useUserLanguages";
import type { Idiom, IdiomTag } from "../types";

type IdiomTagsJoin = Array<{
  tags: {
    key: string;
    facet: string;
    tag_translations: Array<{ language_code: string; label: string }>;
  };
}>;

const resolveTags = (
  joins: IdiomTagsJoin | null,
  uiLanguage: string,
): IdiomTag[] =>
  (joins ?? []).map(({ tags: t }) => {
    const label =
      t.tag_translations.find((tr) => tr.language_code === uiLanguage)?.label ??
      t.tag_translations.find((tr) => tr.language_code === "en")?.label ??
      t.key;
    return { key: t.key, facet: t.facet as IdiomTag["facet"], label };
  });

const fetchIdioms = async (
  uiLanguage: string,
  languageCodes: string[],
): Promise<Idiom[]> => {
  let query = supabase.from("idioms").select(
    `
      id,
      expression,
      language_code,
      idiomatic_meaning,
      likes_count,
      explanation,
      examples,
      source,
      status,
      idiom_tags (
        tags (
          key,
          facet,
          tag_translations ( language_code, label )
        )
      )
    `,
  );

  if (languageCodes.length > 0) {
    query = query.in("language_code", languageCodes);
  }

  const { data, error } = await query
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw error;

  const languagePosition = new Map(
    languageCodes.map((code, index) => [code, index]),
  );
  const fallbackPosition = languageCodes.length;

  return (data ?? [])
    .map((row) => ({
      id: row.id,
      expression: row.expression,
      languageCode: row.language_code,
      idiomaticMeaning: row.idiomatic_meaning,
      likesCount: row.likes_count,
      explanation: row.explanation ?? undefined,
      examples: row.examples ?? undefined,
      tags: resolveTags(row.idiom_tags, uiLanguage),
      source: row.source as Idiom["source"],
      status: row.status as Idiom["status"],
    }))
    .sort(
      (a, b) =>
        (languagePosition.get(a.languageCode) ?? fallbackPosition) -
        (languagePosition.get(b.languageCode) ?? fallbackPosition),
    );
};

export const useIdioms = () => {
  const { i18n } = useTranslation();
  const {
    languages,
    isLoading: languagesLoading,
    isError: languagesError,
  } = useUserLanguages();
  const languageCodes = languages.map((lang) => lang.languageCode);
  const languageScopeKey = [...languageCodes].sort().join(",");

  return useQuery({
    queryKey: ["idioms", i18n.language, languageScopeKey],
    queryFn: () => fetchIdioms(i18n.language, languageCodes),
    enabled: !languagesLoading && !languagesError,
  });
};
