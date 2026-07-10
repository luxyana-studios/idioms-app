import type { Database } from "@/types/supabase";
import type {
  Idiom,
  IdiomEquivalent,
  IdiomSource,
  IdiomTag,
  IdiomTranslation,
} from "../types";

// One feed row as returned by the get_idiom_feed RPC. Nested collections arrive
// as jsonb (typed only as `Json` by the generated types); the function builds
// them with the camelCase shapes below, so map defensively with runtime fallbacks.
export type IdiomFeedRow =
  Database["public"]["Functions"]["get_idiom_feed"]["Returns"][number];

type RawTag = { key: string; facet: string; label: string };
type RawTranslation = {
  id: string;
  idiomId: string;
  languageCode: string;
  literalTranslation: string;
  idiomaticMeaning: string;
  explanation: string | null;
  source: string;
};
type RawEquivalent = {
  edgeId: string;
  equivalentId: string;
  expression: string;
  languageCode: string;
  idiomaticMeaning: string;
  similarityScore: number | string;
  verified: boolean;
};

const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? value : []);

const mapTags = (value: unknown): IdiomTag[] =>
  asArray<RawTag>(value).map((tag) => ({
    key: tag.key,
    facet: tag.facet as IdiomTag["facet"],
    label: tag.label,
  }));

const mapTranslations = (value: unknown): IdiomTranslation[] =>
  asArray<RawTranslation>(value).map((tr) => ({
    id: tr.id,
    idiomId: tr.idiomId,
    languageCode: tr.languageCode,
    literalTranslation: tr.literalTranslation,
    idiomaticMeaning: tr.idiomaticMeaning,
    explanation: tr.explanation ?? undefined,
    source: tr.source as IdiomSource,
  }));

const mapEquivalents = (value: unknown): IdiomEquivalent[] =>
  asArray<RawEquivalent>(value).map((eq) => ({
    edgeId: eq.edgeId,
    equivalentId: eq.equivalentId,
    expression: eq.expression,
    languageCode: eq.languageCode,
    idiomaticMeaning: eq.idiomaticMeaning,
    // numeric(3,2) is serialized as a string over the wire — coerce to number.
    // Fall back to 0 so a malformed/absent value can't become NaN and corrupt
    // the score-desc ordering downstream.
    similarityScore: Number(eq.similarityScore ?? 0),
    verified: eq.verified,
  }));

export const mapIdiomRow = (row: IdiomFeedRow): Idiom => ({
  id: row.id,
  expression: row.expression,
  languageCode: row.language_code,
  idiomaticMeaning: row.idiomatic_meaning,
  likesCount: row.likes_count,
  explanation: row.explanation ?? undefined,
  examples: row.examples ?? undefined,
  tags: mapTags(row.tags),
  translations: mapTranslations(row.translations),
  equivalents: mapEquivalents(row.equivalents),
  source: row.source as Idiom["source"],
  status: row.status as Idiom["status"],
});
