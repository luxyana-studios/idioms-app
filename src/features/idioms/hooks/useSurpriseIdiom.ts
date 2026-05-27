import { useQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/core/supabase/client";
import type { Idiom, IdiomTag } from "../types";

type TagsJoin = Array<{
  tags: {
    key: string;
    facet: string;
    tag_translations: Array<{ language_code: string; label: string }>;
  };
}>;

type RandomIdiomRow = {
  id: string;
  expression: string;
  language_code: string;
  idiomatic_meaning: string;
  likes_count: number;
  explanation: string | null;
  examples: string[] | null;
  source: string;
  status: string;
  idiom_tags: TagsJoin;
};

function resolveTags(joins: TagsJoin | null, uiLanguage: string): IdiomTag[] {
  return (joins ?? []).map(({ tags: t }) => {
    const label =
      t.tag_translations.find((tr) => tr.language_code === uiLanguage)?.label ??
      t.tag_translations.find((tr) => tr.language_code === "en")?.label ??
      t.key;
    return { key: t.key, facet: t.facet as IdiomTag["facet"], label };
  });
}

async function fetchRandomIdiom(
  excludeIds: string[],
  uiLanguage: string,
): Promise<Idiom> {
  const { data, error } = await supabase
    .rpc("get_random_idiom", { exclude_ids: excludeIds })
    .select(
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
    )
    .single();

  if (error) throw error;

  const row = data as unknown as RandomIdiomRow;

  return {
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
  };
}

export function useSurpriseIdiom() {
  const { i18n } = useTranslation();
  const [rollKey, setRollKey] = useState(0);
  const recentIds = useRef<string[]>([]);

  const {
    data: idiom,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["random-idiom", rollKey],
    queryFn: async () => {
      const result = await fetchRandomIdiom(recentIds.current, i18n.language);
      recentIds.current = [
        result.id,
        ...recentIds.current.filter((id) => id !== result.id),
      ].slice(0, 10);
      return result;
    },
    // Keep showing the previous idiom while the next one loads — avoids
    // a blank flash between rolls.
    placeholderData: (prev) => prev,
  });

  const rollAgain = useCallback(() => setRollKey((k) => k + 1), []);

  return { idiom: idiom ?? null, isLoading, isError, rollAgain };
}
