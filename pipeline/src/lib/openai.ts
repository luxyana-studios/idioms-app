import OpenAI from "openai";
import { env } from "./env.js";

export const openai = new OpenAI({ apiKey: env.openaiApiKey });

export type CapabilityName =
  | "generateCandidates"
  | "suggestEquivalents"
  | "enrichExpression"
  | "translateIdiom"
  | "translateTagLabels"
  | "assignTags"
  | "verifyIsIdiom";

const OVERRIDES: Partial<Record<CapabilityName, string | undefined>> = {
  generateCandidates: process.env.OPENAI_MODEL_GENERATE_CANDIDATES,
  suggestEquivalents: process.env.OPENAI_MODEL_SUGGEST_EQUIVALENTS,
  enrichExpression: process.env.OPENAI_MODEL_ENRICH,
  translateIdiom: process.env.OPENAI_MODEL_TRANSLATE,
  translateTagLabels: process.env.OPENAI_MODEL_TRANSLATE_TAGS,
  assignTags: process.env.OPENAI_MODEL_TAG,
  verifyIsIdiom: process.env.OPENAI_MODEL_VERIFY,
};

export function getModel(capability: CapabilityName): string {
  return OVERRIDES[capability] ?? env.openaiModel;
}

export const model = env.openaiModel;
