import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/core/supabase/client";
import type { IdiomSource, IdiomTranslation } from "../types";

const fetchTranslation = async (
  idiomId: string,
  languageCode: string,
): Promise<IdiomTranslation | null> => {
  const { data, error } = await supabase
    .from("idiom_translations")
    .select(
      "id, idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source",
    )
    .eq("idiom_id", idiomId)
    .eq("language_code", languageCode)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    idiomId: data.idiom_id,
    languageCode: data.language_code,
    literalTranslation: data.literal_translation,
    idiomaticMeaning: data.idiomatic_meaning,
    explanation: data.explanation ?? undefined,
    source: data.source as IdiomSource,
  };
};

export const useIdiomTranslation = (
  idiomId: string,
  languageCode: string | null,
) =>
  useQuery({
    queryKey: ["idiom-translation", idiomId, languageCode],
    queryFn: () => fetchTranslation(idiomId, languageCode as string),
    enabled: !!idiomId && !!languageCode,
  });
