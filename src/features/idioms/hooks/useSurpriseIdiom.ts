import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/core/supabase/client";
import type { Idiom, IdiomTag } from "../types";

const BATCH_SIZE = 20;

let mountCounter = 0;

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

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function fetchBatch(
  batchSize: number,
  uiLanguage: string,
): Promise<Idiom[]> {
  const { data, error } = await supabase
    .rpc("get_random_idioms", {
      batch_size: batchSize,
      exclude_ids: [],
    })
    .select(IDIOM_SELECT);

  if (error) throw error;
  if (!data || data.length === 0) throw new Error("No idioms available");

  return (data as unknown as RandomIdiomRow[]).map((row) =>
    mapRow(row, uiLanguage),
  );
}

export function useSurpriseIdiom() {
  const { i18n } = useTranslation();
  const [cursor, setCursor] = useState(0);
  const [localDeck, setLocalDeck] = useState<Idiom[]>([]);
  // Unique per mount — gives each screen visit its own React Query cache slot.
  const sessionId = useRef(`s${++mountCounter}`).current;

  const {
    data: fetchedDeck,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["surprise-deck", i18n.language, sessionId],
    queryFn: () => fetchBatch(BATCH_SIZE, i18n.language),
    staleTime: Number.POSITIVE_INFINITY,
  });

  // When a new batch arrives from the server, shuffle it and reset to card 0.
  useEffect(() => {
    if (fetchedDeck && fetchedDeck.length > 0) {
      setLocalDeck(shuffleArray(fetchedDeck));
      setCursor(0);
    }
  }, [fetchedDeck]);

  const rollAgain = useCallback(() => {
    const next = cursor + 1;
    if (next < localDeck.length) {
      setCursor(next);
    } else {
      // Deck exhausted — reshuffle in memory, no DB call.
      setLocalDeck((prev) => shuffleArray(prev));
      setCursor(0);
    }
  }, [cursor, localDeck.length]);

  return {
    idiom: localDeck[cursor] ?? null,
    // Only show a loading spinner on the very first fetch (empty local deck).
    isLoading: isLoading && localDeck.length === 0,
    isError,
    rollAgain,
  };
}
