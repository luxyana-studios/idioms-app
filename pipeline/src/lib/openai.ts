import OpenAI from "openai";
import { env } from "./env.js";

export const openai = new OpenAI({ apiKey: env.openaiApiKey });
export const model = env.openaiModel;
