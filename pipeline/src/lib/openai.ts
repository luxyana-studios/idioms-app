import OpenAI from "openai";
import { type CapabilityName, env } from "./env.js";

export const openai = new OpenAI({ apiKey: env.openaiApiKey });

export type { CapabilityName };

export function getModel(capability: CapabilityName): string {
  return env.openaiModelOverrides[capability] ?? env.openaiModel;
}
