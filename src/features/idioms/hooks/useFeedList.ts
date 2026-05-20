import { useMemo } from "react";
import { useIdiomsStore } from "../stores/idioms.store";
import { useIdioms } from "./useIdioms";

export function useFeedList() {
  const { data: raw = [], isLoading } = useIdioms();
  const store = useIdiomsStore();

  const idioms = useMemo(() => {
    const deferred = new Set(store.deferredIds);
    return [
      ...raw.filter((i) => !deferred.has(i.id)),
      ...store.deferredIds
        .map((id) => raw.find((i) => i.id === id))
        .filter(Boolean),
    ] as typeof raw;
  }, [raw, store.deferredIds]);

  return { idioms, isLoading, ...store };
}
