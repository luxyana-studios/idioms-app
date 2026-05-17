import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { model, openai } from "../lib/openai.js";
import { LANGUAGE_NAMES, type Language } from "../types.js";

const Output = z.object({
  literal_translation: z.string(),
  idiomatic_meaning: z.string(),
  explanation: z.string(),
});

export type Translation = z.infer<typeof Output>;

const SYSTEM = `You translate idioms across languages into three separate fields, in the TARGET language.

Critical distinction:
- "literal_translation": a WORD-FOR-WORD rendering of the source idiom into the target language. Preserve the imagery. Do NOT translate to meaning. This is what reveals the cultural "aha" moment to a learner.
- "idiomatic_meaning": the actual meaning of the source idiom, expressed in plain target-language prose. 1–2 sentences.
- "explanation": brief etymological or cultural context (1–3 sentences) in the target language. Empty string if no clear etymology exists. Do not invent.

Rules:
- All three fields MUST be written in the TARGET language.
- literal_translation MUST be distinct from idiomatic_meaning — one preserves the words, the other gives the meaning.
- Do not quote, italicize, or annotate any field. Plain text only.`;

export async function translateIdiom(input: {
  expression: string;
  sourceLang: Language;
  targetLang: Language;
  sourceMeaning: string;
}): Promise<Translation> {
  const prompt = [
    `SOURCE idiom: "${input.expression}"`,
    `SOURCE language: ${LANGUAGE_NAMES[input.sourceLang]} (${input.sourceLang})`,
    `SOURCE meaning (for your reference, do not translate it directly): ${input.sourceMeaning}`,
    `TARGET language: ${LANGUAGE_NAMES[input.targetLang]} (${input.targetLang})`,
  ].join("\n");

  const completion = await openai.beta.chat.completions.parse({
    model,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: prompt },
    ],
    response_format: zodResponseFormat(Output, "translation"),
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) throw new Error("OpenAI returned no parsed output");
  return parsed;
}
