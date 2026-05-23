import { useIdiomsStore } from "../stores/idioms.store";
import { useIdioms } from "./useIdioms";

export function useFeedList() {
  const { data: idioms = [], isLoading } = useIdioms();
  const currentIndex = useIdiomsStore((s) => s.currentIndex);
  const setCurrentIndex = useIdiomsStore((s) => s.setCurrentIndex);
  return { idioms, isLoading, currentIndex, setCurrentIndex };
}
