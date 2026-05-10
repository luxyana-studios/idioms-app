import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { model, openai } from "../lib/openai.js";
import { LANGUAGE_NAMES, type Language } from "../types.js";

const Output = z.object({
  expressions: z.array(z.string()).max(200),
});

const SYSTEM = `You produce lists of well-known, commonly-used idioms in a given language.

Rules:
- Output the canonical, dictionary form of each idiom (no surrounding quotes, no leading "to ", no trailing punctuation).
- Only include true idioms (figurative meaning differs from literal). Exclude proverbs, sayings, and single non-idiomatic words.
- All entries must be native to the requested language. Do not include borrowed phrases that are not idiomatic in that language.
- Do not repeat any expression that appears in the avoid list (case-insensitive).
- Order from most common to less common.`;

export async function generateCandidates(input: {
  language: Language;
  count: number;
  avoid: string[];
}): Promise<string[]> {
  const userPrompt = [
    `Language: ${LANGUAGE_NAMES[input.language]} (${input.language})`,
    `Count: ${input.count}`,
    input.avoid.length > 0
      ? `Avoid (already known):\n${input.avoid.map((a) => `- ${a}`).join("\n")}`
      : "Avoid: (none)",
  ].join("\n\n");

  const completion = await openai.beta.chat.completions.parse({
    model,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userPrompt },
    ],
    response_format: zodResponseFormat(Output, "candidates"),
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) throw new Error("OpenAI returned no parsed output");

  return parsed.expressions;
}
