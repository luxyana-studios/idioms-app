import { useCallback, useMemo } from "react";
import { useIdiomsStore } from "../stores/idioms.store";
import { useIdiomsFeed } from "./useIdiomsFeed";

export function useFeedList() {
  const {
    idioms = [],
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useIdiomsFeed();
  const currentIndex = useIdiomsStore((s) => s.currentIndex);
  const setCurrentIndex = useIdiomsStore((s) => s.setCurrentIndex);
  const isShuffled = useIdiomsStore((s) => s.isShuffled);
  const shuffledIds = useIdiomsStore((s) => s.shuffledIds);
  const shuffleKey = useIdiomsStore((s) => s.shuffleKey);
  const enableShuffle = useIdiomsStore((s) => s.enableShuffle);

  const feedIdioms = useMemo(() => {
    if (!isShuffled || shuffledIds.length === 0) return idioms;
    const map = new Map(idioms.map((i) => [i.id, i]));
    return shuffledIds.flatMap((id) => {
      const idiom = map.get(id);
      return idiom ? [idiom] : [];
    });
  }, [idioms, isShuffled, shuffledIds]);

  const allIdiomIds = useMemo(() => idioms.map((i) => i.id), [idioms]);

  // Pull the next page as the user nears the end of the loaded feed. Shuffle
  // freezes the deck to what's already loaded, so only page ahead while the feed
  // is in natural order. Guard on the fetching flag so we don't queue duplicates.
  const loadMore = useCallback(() => {
    if (!isShuffled && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isShuffled, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    idioms: feedIdioms,
    allIdiomIds,
    isLoading,
    isError,
    refetch,
    loadMore,
    isFetchingNextPage,
    currentIndex,
    setCurrentIndex,
    isShuffled,
    enableShuffle,
    currentIdiomId: feedIdioms[currentIndex]?.id,
    shuffleKey,
  };
}
