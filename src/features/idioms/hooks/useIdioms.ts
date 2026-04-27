import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/core/supabase/client";
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

const fetchIdioms = async (uiLanguage: string): Promise<Idiom[]> => {
  const { data, error } = await supabase
    .from("idioms")
    .select(
      `
      id,
      expression,
      language_code,
      idiomatic_meaning,
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
    )
    .eq("status", "published");

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    expression: row.expression,
    languageCode: row.language_code,
    idiomaticMeaning: row.idiomatic_meaning,
    explanation: row.explanation ?? undefined,
    examples: row.examples ?? undefined,
    tags: resolveTags(row.idiom_tags, uiLanguage),
    source: row.source as Idiom["source"],
    status: row.status as Idiom["status"],
  }));
};

export const useIdioms = () => {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: ["idioms", i18n.language],
    queryFn: () => fetchIdioms(i18n.language),
  });
};
