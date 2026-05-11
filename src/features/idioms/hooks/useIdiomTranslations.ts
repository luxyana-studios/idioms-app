import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/core/supabase/client";
import type { IdiomSource, IdiomTranslation } from "../types";

const fetchTranslations = async (
  idiomId: string,
): Promise<IdiomTranslation[]> => {
  const { data, error } = await supabase
    .from("idiom_translations")
    .select(
      "id, idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source",
    )
    .eq("idiom_id", idiomId);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    idiomId: row.idiom_id,
    languageCode: row.language_code,
    literalTranslation: row.literal_translation,
    idiomaticMeaning: row.idiomatic_meaning,
    explanation: row.explanation ?? undefined,
    source: row.source as IdiomSource,
  }));
};

export const useIdiomTranslations = (idiomId: string) =>
  useQuery({
    queryKey: ["idiom-translations", idiomId],
    queryFn: () => fetchTranslations(idiomId),
    enabled: !!idiomId,
  });
