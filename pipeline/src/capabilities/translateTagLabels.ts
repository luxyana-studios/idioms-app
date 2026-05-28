import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getModel, openai } from "../lib/openai.js";
import { LANGUAGE_NAMES, type Language } from "../types.js";

const Item = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string(),
});
const Output = z.object({
  translations: z.array(Item),
});

export type TranslatedTagLabel = z.infer<typeof Item>;

export type SourceTagLabel = {
  key: string;
  facet: string;
  label: string;
  description: string;
};

const SYSTEM = `You localize taxonomy labels for an idiom dictionary.

RULES:
- For each English entry, produce the target-language label and description.
- The "key" is a stable identifier — COPY IT THROUGH EXACTLY. Do not
  translate, modify case, or alter punctuation. Mismatched keys cause
  the translation to be dropped.
- SCOPE EQUIVALENCE: the target label must mean exactly what the English
  label means — same scope, same boundaries. If EN is "Money", the target
  must mean "Money" specifically, not "Finance", "Wealth", or "Economics".
- Labels are short noun phrases (typically 1–3 words).
- CAPITALIZATION:
  · Latin-script langs (en/es/de/fr/it/pt): title case for labels.
  · CJK (zh/ja/ko), Arabic, Hindi: use the conventional dictionary form
    for the script — no Latin case rules apply.
- Descriptions: one short sentence in the target language.
- Maintain consistent register and style across all entries in a batch —
  they appear together in the UI.
- Preserve meaning faithfully. Do not paraphrase loosely.`.trim();

export async function translateTagLabels(input: {
  source: SourceTagLabel[];
  targetLang: Language;
}): Promise<TranslatedTagLabel[]> {
  const lines = input.source
    .map(
      (s) =>
        `- key: ${s.key} | facet: ${s.facet} | label: ${s.label} | description: ${s.description}`,
    )
    .join("\n");

  const userPrompt = [
    `TARGET language: ${LANGUAGE_NAMES[input.targetLang]} (${input.targetLang})`,
    "",
    `English entries (${input.source.length}):`,
    lines,
  ].join("\n");

  const completion = await openai.beta.chat.completions.parse({
    model: getModel("translateTagLabels"),
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userPrompt },
    ],
    response_format: zodResponseFormat(Output, "tag_translations"),
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) throw new Error("OpenAI returned no parsed output");
  return parsed.translations;
}
