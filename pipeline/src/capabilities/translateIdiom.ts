import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getModel, openai } from "../lib/openai.js";
import { LANGUAGE_NAMES, type Language } from "../types.js";
import { SCRIPT_RULE } from "./idiomDefinition.js";

const Output = z.object({
  literal_translation: z.string(),
  idiomatic_meaning: z.string(),
  explanation: z.string(),
});

export type Translation = z.infer<typeof Output>;

const SYSTEM = `You translate idioms into three separate fields, all in the
TARGET language.

${SCRIPT_RULE}

THE THREE FIELDS:
- literal_translation: an IMAGERY-PRESERVING rendering of the source idiom.
  Aim for word-for-word fidelity; if that produces ungrammatical text in
  the target, render the closest imagery-preserving form — keep the
  METAPHOR, not the exact word order. This is what reveals the cultural
  "aha" moment to a learner: they see the original image in their own
  language.

- idiomatic_meaning: the actual meaning of the source idiom, in plain
  target-language prose. 1–2 sentences. NEVER preserve the source imagery
  here — that's literal_translation's job.

- explanation: 1–3 sentences of etymological or cultural context, in the
  target language. If the source idiom is culture-specific (regional food,
  sport, ritual), add one sentence of cultural anchoring so a target-
  language reader unfamiliar with the source culture understands the
  reference. Hedge contested or folk etymologies explicitly. Empty string
  if no clear etymology exists. Do not invent.

INVARIANTS:
- literal_translation MUST be distinct from idiomatic_meaning. One
  preserves the words/imagery, the other gives the meaning. If you cannot
  produce a distinct literal (the source is so abstract its literal form
  IS its meaning), output the SAME text in BOTH — downstream code will
  skip the row. Do not pad with filler to fake a difference.
- All three fields in the TARGET language, in the TARGET's native script.
- Plain text. No quotes, italics, parentheticals, or annotations.

WORKED EXAMPLE:
  SOURCE: "spill the beans" (EN)
  TARGET: Italian (it)
  {
    literal_translation: "rovesciare i fagioli",
    idiomatic_meaning: "Rivelare un segreto, spesso involontariamente.",
    explanation: "L'origine è incerta; popolarmente associata a sistemi di votazione antichi in cui i fagioli rappresentavano i voti."
  }
  Note: literal preserves the food imagery (beans); meaning describes the
  act of revealing a secret. The two are clearly different.`.trim();

export async function translateIdiom(input: {
  expression: string;
  sourceLang: Language;
  targetLang: Language;
  sourceMeaning: string;
}): Promise<Translation> {
  const userPrompt = [
    `SOURCE idiom: "${input.expression}"`,
    `SOURCE language: ${LANGUAGE_NAMES[input.sourceLang]} (${input.sourceLang})`,
    `SOURCE meaning (reference; do not translate directly): ${input.sourceMeaning}`,
    `TARGET language: ${LANGUAGE_NAMES[input.targetLang]} (${input.targetLang})`,
  ].join("\n");

  const completion = await openai.beta.chat.completions.parse({
    model: getModel("translateIdiom"),
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userPrompt },
    ],
    response_format: zodResponseFormat(Output, "translation"),
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) throw new Error("OpenAI returned no parsed output");
  return parsed;
}
