import { useCallback } from "react";
import { useIdiomsStore } from "../stores/idioms.store";
import { useIdiomsFeed } from "./useIdiomsFeed";

export function useFeedList() {
  const shuffleSeed = useIdiomsStore((s) => s.shuffleSeed);
  const shuffleKey = useIdiomsStore((s) => s.shuffleKey);
  const shuffle = useIdiomsStore((s) => s.shuffle);
  const currentIndex = useIdiomsStore((s) => s.currentIndex);
  const setCurrentIndex = useIdiomsStore((s) => s.setCurrentIndex);

  // Ordering (natural or shuffled) is resolved server-side via the seed, so the
  // feed arrives already in display order — no client-side reshuffle needed.
  const {
    idioms = [],
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useIdiomsFeed(shuffleSeed);

  // Pull the next page as the user nears the end of the loaded feed. Paging works
  // in both natural and shuffled order, since the seed just fixes the ordering.
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    idioms,
    isLoading,
    isError,
    refetch,
    loadMore,
    isFetchingNextPage,
    currentIndex,
    setCurrentIndex,
    isShuffled: shuffleSeed !== null,
    shuffle,
    shuffleKey,
  };
}
