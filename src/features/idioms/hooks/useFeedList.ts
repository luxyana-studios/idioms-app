import { useMemo } from "react";
import { useIdiomsStore } from "../stores/idioms.store";
import type { Idiom } from "../types";
import { useIdioms } from "./useIdioms";

export function useFeedList() {
  const { data: raw = [], isLoading } = useIdioms();
  const deferredIds = useIdiomsStore((s) => s.deferredIds);
  const deferIdiom = useIdiomsStore((s) => s.deferIdiom);
  const currentIndex = useIdiomsStore((s) => s.currentIndex);
  const setCurrentIndex = useIdiomsStore((s) => s.setCurrentIndex);

  const idioms = useMemo(() => {
    const byId = new Map(raw.map((i) => [i.id, i]));
    const deferred = new Set(deferredIds);
    return [
      ...raw.filter((i) => !deferred.has(i.id)),
      ...deferredIds
        .map((id) => byId.get(id))
        .filter((i): i is Idiom => i != null),
    ];
  }, [raw, deferredIds]);

  return {
    idioms,
    isLoading,
    deferredIds,
    deferIdiom,
    currentIndex,
    setCurrentIndex,
  };
}
