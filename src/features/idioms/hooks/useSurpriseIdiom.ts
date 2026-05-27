import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
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

const IDIOM_SELECT = `
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
`;

function resolveTags(joins: TagsJoin | null, uiLanguage: string): IdiomTag[] {
  return (joins ?? []).map(({ tags: t }) => {
    const label =
      t.tag_translations.find((tr) => tr.language_code === uiLanguage)?.label ??
      t.tag_translations.find((tr) => tr.language_code === "en")?.label ??
      t.key;
    return { key: t.key, facet: t.facet as IdiomTag["facet"], label };
  });
}

function mapRow(row: RandomIdiomRow, uiLanguage: string): Idiom {
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

async function fetchRandomIdiom(
  excludeIds: string[],
  uiLanguage: string,
): Promise<Idiom> {
  const { data, error } = await supabase
    .rpc("get_random_idiom", { exclude_ids: excludeIds })
    .select(IDIOM_SELECT)
    .maybeSingle();

  if (error) throw error;

  // All recent idioms excluded — clear history and fetch without exclusions.
  if (!data) {
    const { data: fallback, error: fallbackError } = await supabase
      .rpc("get_random_idiom", { exclude_ids: [] })
      .select(IDIOM_SELECT)
      .maybeSingle();

    if (fallbackError) throw fallbackError;
    if (!fallback) throw new Error("No idioms available");

    return mapRow(fallback as unknown as RandomIdiomRow, uiLanguage);
  }

  return mapRow(data as unknown as RandomIdiomRow, uiLanguage);
}

export function useSurpriseIdiom() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const recentIds = useRef<string[]>([]);

  // Stable key — language-scoped so a locale change fetches fresh data.
  // Each roll is triggered by invalidating this key, not by a counter in the key,
  // which avoids unbounded cache growth.
  const queryKey = ["random-idiom", i18n.language] as const;

  const {
    data: idiom,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await fetchRandomIdiom(recentIds.current, i18n.language);
      recentIds.current = [
        result.id,
        ...recentIds.current.filter((id) => id !== result.id),
      ].slice(0, 10);
      return result;
    },
    // Keep showing the previous idiom while the next one loads.
    placeholderData: (prev) => prev,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const rollAgain = useCallback(() => {
    queryClient.removeQueries({ queryKey });
    refetch();
  }, [queryClient, queryKey, refetch]);

  return { idiom: idiom ?? null, isLoading, isError, rollAgain };
}
