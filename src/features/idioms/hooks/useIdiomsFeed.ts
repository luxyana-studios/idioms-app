import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/core/supabase/client";
import { useUserLanguages } from "@/features/languages/hooks/useUserLanguages";
import type { Idiom } from "../types";
import { mapIdiomRow } from "./mapIdiomRow";

// How many idioms each feed page pulls. The home feed is one card per screen, so
// a page of 10 keeps the first paint light while staying ahead of the scroll.
export const FEED_PAGE_SIZE = 10;

const fetchIdiomsPage = async (
  uiLanguage: string,
  languageCodes: string[],
  offset: number,
  seed: string | null,
): Promise<Idiom[]> => {
  const { data, error } = await supabase.rpc("get_idiom_feed", {
    p_language_codes: languageCodes,
    p_ui_language: uiLanguage,
    p_limit: FEED_PAGE_SIZE,
    p_offset: offset,
    // null seed → natural order; a seed switches the RPC to md5(id || seed).
    p_seed: seed ?? undefined,
  });

  if (error) throw error;

  // The RPC orders rows deterministically (by language+created_at, or by the seed),
  // so a stable offset yields non-overlapping pages in either order.
  return (data ?? []).map(mapIdiomRow);
};

// Paginated variant of useIdioms for the home feed. Loads the catalog one page
// at a time via useInfiniteQuery instead of the whole set up front. Kept separate
// from useIdioms (whole-catalog) because explore/saved/counts need every idiom.
// A non-null `seed` shuffles the whole feed server-side (see get_idiom_feed).
export const useIdiomsFeed = (seed: string | null = null) => {
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

  const query = useInfiniteQuery({
    // Seed is part of the key: each shuffle is a distinct feed, and clearing it
    // returns to the cached natural-order feed instantly.
    queryKey: ["idioms-feed", i18n.language, languageScopeKey, seed],
    queryFn: ({ pageParam }) =>
      fetchIdiomsPage(i18n.language, languageCodes, pageParam, seed),
    initialPageParam: 0,
    // A short final page (fewer than a full page) means the catalog is exhausted.
    // Otherwise every prior page was full, so the next offset is a clean multiple.
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < FEED_PAGE_SIZE
        ? undefined
        : allPages.length * FEED_PAGE_SIZE,
    enabled: !languagesLoading && !languagesError,
  });

  const idioms = useMemo(
    () => query.data?.pages.flat() ?? [],
    [query.data?.pages],
  );

  // The feed query is gated on the language scope. When useUserLanguages errors,
  // that query is *disabled* — neither loading nor errored — which would surface
  // as a silent empty feed. Fold the languages state in so consumers see a real
  // loading/error, and let retry recover the languages too.
  return {
    ...query,
    idioms,
    isLoading: query.isLoading || languagesLoading,
    isError: query.isError || languagesError,
    refetch: async () => {
      if (languagesError) await refetchLanguages();
      return query.refetch();
    },
  };
};
