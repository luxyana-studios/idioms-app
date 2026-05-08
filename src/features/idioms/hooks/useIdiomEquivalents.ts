import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/core/supabase/client";
import type { IdiomEquivalent } from "../types";

const fetchEquivalents = async (
  idiomId: string,
): Promise<IdiomEquivalent[]> => {
  const [{ data: asA, error: errA }, { data: asB, error: errB }] =
    await Promise.all([
      supabase
        .from("idiom_equivalents")
        .select("id, similarity_score, verified, idiom_id_b")
        .eq("idiom_id_a", idiomId),
      supabase
        .from("idiom_equivalents")
        .select("id, similarity_score, verified, idiom_id_a")
        .eq("idiom_id_b", idiomId),
    ]);

  if (errA) throw errA;
  if (errB) throw errB;

  const refs = [
    ...(asA ?? []).map((r) => ({
      rowId: r.id,
      equivalentId: r.idiom_id_b,
      score: r.similarity_score,
      verified: r.verified,
    })),
    ...(asB ?? []).map((r) => ({
      rowId: r.id,
      equivalentId: r.idiom_id_a,
      score: r.similarity_score,
      verified: r.verified,
    })),
  ];

  if (refs.length === 0) return [];

  const { data: idioms, error } = await supabase
    .from("idioms")
    .select("id, expression, language_code, idiomatic_meaning")
    .in(
      "id",
      refs.map((r) => r.equivalentId),
    )
    .eq("status", "published");

  if (error) throw error;

  const idiomMap = new Map((idioms ?? []).map((i) => [i.id, i]));

  return refs
    .map(({ rowId, equivalentId, score, verified }) => {
      const idiom = idiomMap.get(equivalentId);
      if (!idiom) return null;
      return {
        id: rowId,
        equivalentId: idiom.id,
        expression: idiom.expression,
        languageCode: idiom.language_code,
        idiomaticMeaning: idiom.idiomatic_meaning,
        similarityScore: score,
        verified,
      };
    })
    .filter((e): e is IdiomEquivalent => e !== null);
};

export const useIdiomEquivalents = (idiomId: string) =>
  useQuery({
    queryKey: ["idiom-equivalents", idiomId],
    queryFn: () => fetchEquivalents(idiomId),
    enabled: !!idiomId,
  });
