import "dotenv/config";

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

export type CapabilityName =
  | "generateCandidates"
  | "suggestEquivalents"
  | "enrichExpression"
  | "translateIdiom"
  | "translateTagLabels"
  | "assignTags"
  | "verifyIsIdiom";

export const env = {
  databaseUrl: required("DATABASE_URL"),
  openaiApiKey: required("OPENAI_API_KEY"),
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  openaiModelOverrides: {
    generateCandidates: process.env.OPENAI_MODEL_GENERATE_CANDIDATES,
    suggestEquivalents: process.env.OPENAI_MODEL_SUGGEST_EQUIVALENTS,
    enrichExpression: process.env.OPENAI_MODEL_ENRICH,
    translateIdiom: process.env.OPENAI_MODEL_TRANSLATE,
    translateTagLabels: process.env.OPENAI_MODEL_TRANSLATE_TAGS,
    assignTags: process.env.OPENAI_MODEL_TAG,
    verifyIsIdiom: process.env.OPENAI_MODEL_VERIFY,
  } satisfies Partial<Record<CapabilityName, string | undefined>>,
};
