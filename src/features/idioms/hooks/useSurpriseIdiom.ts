import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/core/supabase/client";
import type { Idiom, IdiomTag } from "../types";

const BATCH_SIZE = 20;

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
    translations: [],
    equivalents: [],
    source: row.source as Idiom["source"],
    status: row.status as Idiom["status"],
  };
}

async function fetchBatch(
  excludeIds: string[],
  batchSize: number,
  uiLanguage: string,
): Promise<Idiom[]> {
  const { data, error } = await supabase
    .rpc("get_random_idioms", {
      batch_size: batchSize,
      exclude_ids: [...excludeIds],
    })
    .select(IDIOM_SELECT);

  if (error) throw error;
  if (!data || data.length === 0) return [];

  return (data as unknown as RandomIdiomRow[]).map((row) =>
    mapRow(row, uiLanguage),
  );
}

export function useSurpriseIdiom() {
  const { i18n } = useTranslation();
  const [deckVersion, setDeckVersion] = useState(0);
  const [cursor, setCursor] = useState(0);
  const seenIds = useRef<string[]>([]);
  // Unique per mount so each screen visit gets its own cache slot.
  const sessionId = useRef(crypto.randomUUID()).current;

  // Language change: reset history so the new-language deck starts fresh.
  // biome-ignore lint/correctness/useExhaustiveDependencies: i18n.language is the trigger, not consumed in the body
  useEffect(() => {
    seenIds.current = [];
    setCursor(0);
  }, [i18n.language]);

  // New deck loaded: reset cursor to first card.
  // biome-ignore lint/correctness/useExhaustiveDependencies: deckVersion is the trigger, not consumed in the body
  useEffect(() => {
    setCursor(0);
  }, [deckVersion]);

  const {
    data: deck = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["surprise-deck", i18n.language, sessionId, deckVersion],
    queryFn: async () => {
      let batch = await fetchBatch(seenIds.current, BATCH_SIZE, i18n.language);

      // All published idioms exhausted — clear history and start over.
      if (batch.length === 0) {
        seenIds.current = [];
        batch = await fetchBatch([], BATCH_SIZE, i18n.language);
        if (batch.length === 0) throw new Error("No idioms available");
      }

      for (const idiom of batch) {
        if (!seenIds.current.includes(idiom.id)) seenIds.current.push(idiom.id);
      }
      return batch;
    },
    staleTime: Number.POSITIVE_INFINITY,
    // Keep showing the current card while the next batch loads.
    placeholderData: (prev) => prev ?? [],
  });

  const rollAgain = useCallback(() => {
    const next = cursor + 1;
    if (next < deck.length) {
      setCursor(next);
    } else {
      setDeckVersion((v) => v + 1);
    }
  }, [cursor, deck.length]);

  return {
    idiom: deck[cursor] ?? null,
    // Only show a loading spinner on the very first fetch (empty deck).
    isLoading: isLoading && deck.length === 0,
    isError,
    rollAgain,
  };
}
