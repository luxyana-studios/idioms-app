import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { model, openai } from "../lib/openai.js";
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

Rules:
- For each English entry, produce the target-language label and description.
- The "key" is a stable identifier — copy it through EXACTLY, do not translate.
- Labels are short noun phrases (1–3 words typically). Capitalize like a title.
- Descriptions are one short sentence in the target language.
- Preserve the meaning faithfully; do not paraphrase loosely.`;

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

  const prompt = [
    `TARGET language: ${LANGUAGE_NAMES[input.targetLang]} (${input.targetLang})`,
    "",
    `English entries (${input.source.length}):`,
    lines,
  ].join("\n");

  const completion = await openai.beta.chat.completions.parse({
    model,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: prompt },
    ],
    response_format: zodResponseFormat(Output, "tag_translations"),
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) throw new Error("OpenAI returned no parsed output");
  return parsed.translations;
}
