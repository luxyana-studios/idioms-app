import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/core/supabase/client";
import type {
  Idiom,
  IdiomEquivalent,
  IdiomTag,
  IdiomTranslation,
} from "../types";

const BATCH_SIZE = 20;

let mountCounter = 0;

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
  tags: IdiomTag[];
  translations: Array<{
    id: string;
    idiomId: string;
    languageCode: string;
    literalTranslation: string;
    idiomaticMeaning: string;
    explanation: string | null;
    source: string;
  }>;
  equivalents: Array<{
    edgeId: string;
    equivalentId: string;
    expression: string;
    languageCode: string;
    idiomaticMeaning: string;
    similarityScore: number;
    verified: boolean;
  }>;
};

function mapRow(row: RandomIdiomRow): Idiom {
  return {
    id: row.id,
    expression: row.expression,
    languageCode: row.language_code,
    idiomaticMeaning: row.idiomatic_meaning,
    likesCount: row.likes_count,
    explanation: row.explanation ?? undefined,
    examples: row.examples ?? undefined,
    tags: row.tags as IdiomTag[],
    translations: row.translations.map(
      (t): IdiomTranslation => ({
        id: t.id,
        idiomId: t.idiomId,
        languageCode: t.languageCode,
        literalTranslation: t.literalTranslation,
        idiomaticMeaning: t.idiomaticMeaning,
        explanation: t.explanation ?? undefined,
        source: t.source as IdiomTranslation["source"],
      }),
    ),
    equivalents: row.equivalents.map(
      (e): IdiomEquivalent => ({
        edgeId: e.edgeId,
        equivalentId: e.equivalentId,
        expression: e.expression,
        languageCode: e.languageCode,
        idiomaticMeaning: e.idiomaticMeaning,
        similarityScore: e.similarityScore,
        verified: e.verified,
      }),
    ),
    source: row.source as Idiom["source"],
    status: row.status as Idiom["status"],
  };
}

async function fetchBatch(
  excludeIds: string[],
  batchSize: number,
  uiLanguage: string,
): Promise<Idiom[]> {
  const { data, error } = await supabase.rpc("get_random_idioms", {
    batch_size: batchSize,
    exclude_ids: [...excludeIds],
    p_ui_language: uiLanguage,
  });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  return (data as unknown as RandomIdiomRow[]).map(mapRow);
}

export function useSurpriseIdiom() {
  const { i18n } = useTranslation();
  const [deckVersion, setDeckVersion] = useState(0);
  const [cursor, setCursor] = useState(0);
  const seenIds = useRef<string[]>([]);
  // Unique per mount — gives each screen visit its own React Query cache slot.
  const sessionId = useRef(`s${++mountCounter}`).current;

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
