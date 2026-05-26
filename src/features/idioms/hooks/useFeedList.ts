import { useMemo } from "react";
import { useIdiomsStore } from "../stores/idioms.store";
import { useIdioms } from "./useIdioms";

export function useFeedList() {
  const { data: idioms = [], isLoading, isError, refetch } = useIdioms();
  const currentIndex = useIdiomsStore((s) => s.currentIndex);
  const setCurrentIndex = useIdiomsStore((s) => s.setCurrentIndex);
  const isShuffled = useIdiomsStore((s) => s.isShuffled);
  const shuffledIds = useIdiomsStore((s) => s.shuffledIds);
  const enableShuffle = useIdiomsStore((s) => s.enableShuffle);
  const disableShuffle = useIdiomsStore((s) => s.disableShuffle);

  const feedIdioms = useMemo(() => {
    if (!isShuffled || shuffledIds.length === 0) return idioms;
    const map = new Map(idioms.map((i) => [i.id, i]));
    return shuffledIds.flatMap((id) => {
      const idiom = map.get(id);
      return idiom ? [idiom] : [];
    });
  }, [idioms, isShuffled, shuffledIds]);

  return {
    idioms: feedIdioms,
    allIdiomIds: idioms.map((i) => i.id),
    isLoading,
    isError,
    refetch,
    currentIndex,
    setCurrentIndex,
    isShuffled,
    enableShuffle,
    disableShuffle,
  };
}
