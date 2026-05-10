import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { model, openai } from "../lib/openai.js";
import { LANGUAGE_NAMES, type Language } from "../types.js";

const Suggestion = z.object({
  expression: z.string(),
  score: z.number().min(0).max(1),
  rationale: z.string(),
});
const Output = z.object({
  suggestions: z.array(Suggestion).max(10),
});

export type EquivalentSuggestion = z.infer<typeof Suggestion>;

const SYSTEM = `You map idioms across languages by finding native idiomatic equivalents.

Rules:
- Output up to N native idioms in the TARGET language that express the same idea as the SOURCE idiom.
- "Native" means the target idiom is genuinely used by speakers — not a literal translation.
- Score 0..1: 1.0 = perfect cultural match (same imagery + same meaning), 0.7 = same meaning + different image, 0.3 = loose semantic overlap, <0.3 = weak.
- If no real equivalent exists in the target language, return an empty list. Do not invent.
- Return idioms in their canonical, dictionary form (no surrounding quotes, no leading "to ", no trailing punctuation).
- Rationale: one short sentence explaining the equivalence.`;

export async function suggestEquivalents(input: {
  expression: string;
  sourceLang: Language;
  targetLang: Language;
  n: number;
}): Promise<EquivalentSuggestion[]> {
  const prompt = [
    `SOURCE: "${input.expression}" (${LANGUAGE_NAMES[input.sourceLang]})`,
    `TARGET language: ${LANGUAGE_NAMES[input.targetLang]}`,
    `N (max suggestions): ${input.n}`,
  ].join("\n");

  const completion = await openai.beta.chat.completions.parse({
    model,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: prompt },
    ],
    response_format: zodResponseFormat(Output, "equivalents"),
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) throw new Error("OpenAI returned no parsed output");
  return parsed.suggestions;
}
