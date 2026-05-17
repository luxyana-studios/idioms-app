import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { model, openai } from "../lib/openai.js";
import { LANGUAGE_NAMES, type Language } from "../types.js";

const Output = z.object({
  is_idiom: z.boolean(),
  idiom_rationale: z.string(),
  idiomatic_meaning: z.string(),
  explanation: z.string(),
  examples: z.array(z.string()).max(5),
});

export type EnrichmentResult = z.infer<typeof Output>;

const SYSTEM = `You enrich an idiom with native-language metadata for a learner-facing dictionary. You also gate-check whether the input is actually an idiom.

DEFINITION OF AN IDIOM:
A true idiom is a phrase whose figurative meaning CANNOT be inferred from the literal meaning of its words. A learner who knows every word must still be TAUGHT what the phrase means.

GATE — Set is_idiom = false if the input is ANY of:
- a collocation or common verb phrase whose meaning is the sum of its words (e.g. "go to bed", "ins Bett gehen", "ir a la cama", "aller au lit", "open the door", "have dinner", "Hunger haben")
- a phrasal verb whose meaning is literal (e.g. "stand up", "sit down")
- a proverb / full-sentence saying ("a stitch in time saves nine") — idioms are shorter phrases
- a plain description, paraphrase, or generic adverbial expression

Set is_idiom = true ONLY when the phrase's figurative meaning genuinely differs from its literal words and a learner would need to be taught it.

If is_idiom = false:
- idiom_rationale: one short sentence explaining why (e.g. "Plain verb phrase; meaning is literal")
- idiomatic_meaning, explanation: empty strings
- examples: empty array

If is_idiom = true, fill all fields:
- idiom_rationale: one short sentence stating what makes it an idiom
- idiomatic_meaning: the actual figurative meaning. 1–2 sentences.
- explanation: brief etymological or cultural context (1–3 sentences). Empty string if no clear etymology exists. Do not invent.
- examples: 2–3 short sentences using the idiom in natural context.

ALL FIELDS WRITTEN IN THE IDIOM'S NATIVE LANGUAGE. Never translate. Use the canonical dictionary form of the idiom. Do not quote, gloss, or paraphrase the expression itself in any field.`;

export async function enrichExpression(input: {
  expression: string;
  language: Language;
}): Promise<EnrichmentResult> {
  const prompt = [
    `EXPRESSION: "${input.expression}"`,
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
