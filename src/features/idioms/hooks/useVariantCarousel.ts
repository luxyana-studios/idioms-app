import { useCallback, useEffect, useMemo, useState } from "react";
import type { Idiom, IdiomTag } from "@/features/idioms/types";
import { useIdiomEquivalents } from "./useIdiomEquivalents";

export type Variant = {
  id: string;
  expression: string;
  languageCode: string;
  idiomaticMeaning: string;
  tags: IdiomTag[];
};

export function useVariantCarousel(idiom: Idiom) {
  const { data: equivalents = [] } = useIdiomEquivalents(idiom.id);

  const variants = useMemo<Variant[]>(
    () => [
      {
        id: idiom.id,
        expression: idiom.expression,
        languageCode: idiom.languageCode,
        idiomaticMeaning: idiom.idiomaticMeaning,
        tags: idiom.tags,
      },
      ...equivalents.map((eq) => ({
        id: eq.equivalentId,
        expression: eq.expression,
        languageCode: eq.languageCode,
        idiomaticMeaning: eq.idiomaticMeaning,
        tags: [] as IdiomTag[],
      })),
    ],
    [idiom, equivalents],
  );

  const [variantIndex, setVariantIndex] = useState(0);

  // Reset to the original language when the feed scrolls to a new idiom
  // biome-ignore lint/correctness/useExhaustiveDependencies: idiom.id is the trigger; setVariantIndex is stable
  useEffect(() => {
    setVariantIndex(0);
  }, [idiom.id]);

  const handleNext = useCallback(() => {
    setVariantIndex((i) => Math.min(i + 1, variants.length - 1));
  }, [variants.length]);

  const handlePrev = useCallback(() => {
    setVariantIndex((i) => Math.max(i - 1, 0));
  }, []);

  const currentVariant = variants[variantIndex] ?? variants[0];

  return { variants, variantIndex, currentVariant, handleNext, handlePrev };
}
