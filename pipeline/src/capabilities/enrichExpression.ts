import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { model, openai } from "../lib/openai.js";
import { LANGUAGE_NAMES, type Language } from "../types.js";

const Output = z.object({
  idiomatic_meaning: z.string(),
  explanation: z.string(),
  examples: z.array(z.string()).min(1).max(5),
});

export type Enrichment = z.infer<typeof Output>;

const SYSTEM = `You enrich an idiom with native-language metadata for a learner-facing dictionary.

Rules:
- "idiomatic_meaning": the actual meaning of the idiom in plain language. 1–2 sentences.
- "explanation": brief etymological or cultural context (1–3 sentences). Empty string if no clear etymology exists. Do not invent.
- "examples": 2–3 short sentences using the idiom in natural context.
- ALL OUTPUT IS WRITTEN IN THE IDIOM'S NATIVE LANGUAGE. Never translate.
- Use the idiom in its canonical dictionary form. Do not quote, gloss, or paraphrase the expression itself.`;

export async function enrichExpression(input: {
  expression: string;
  language: Language;
}): Promise<Enrichment> {
  const prompt = [
    `IDIOM: "${input.expression}"`,
    `NATIVE LANGUAGE: ${LANGUAGE_NAMES[input.language]} (${input.language})`,
  ].join("\n");

  const completion = await openai.beta.chat.completions.parse({
    model,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: prompt },
    ],
    response_format: zodResponseFormat(Output, "enrichment"),
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) throw new Error("OpenAI returned no parsed output");
  return parsed;
}
