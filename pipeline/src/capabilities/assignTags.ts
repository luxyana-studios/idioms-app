import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { model, openai } from "../lib/openai.js";
import type { CanonicalTagWithEn } from "../lib/tags.js";
import { LANGUAGE_NAMES, type Language } from "../types.js";

const Output = z.object({
  meaning: z.array(z.string()),
  register: z.array(z.string()),
  theme: z.array(z.string()),
  occasion: z.array(z.string()),
});

export type TagAssignment = z.infer<typeof Output>;

const SYSTEM = `You assign canonical taxonomy tags to an idiom for a multilingual dictionary.

Rules:
- Pick tags ONLY from the canonical list below. Never invent. Output the tag KEY (lowercase identifier), never the label.
- Tags are grouped into 4 facets: theme, meaning, register, occasion.
- REQUIRED: choose at least 1 "meaning" tag (up to 2 if multiple apply) AND exactly 1 "register" tag.
- OPTIONAL: choose 0–2 "theme" tags (the visible imagery or domain of the idiom), and 0–1 "occasion" tag (only when the idiom is reliably used in a specific situation).
- Place each chosen key into the array corresponding to its facet. A key may only appear in its native facet's array.`;

function renderCanonical(tags: CanonicalTagWithEn[]): string {
  const byFacet = new Map<string, CanonicalTagWithEn[]>();
  for (const t of tags) {
    const list = byFacet.get(t.facet) ?? [];
    list.push(t);
    byFacet.set(t.facet, list);
  }
  const order = ["theme", "meaning", "register", "occasion"];
  const sections: string[] = [];
  for (const facet of order) {
    const items = byFacet.get(facet);
    if (!items || items.length === 0) continue;
    sections.push(`${facet} tags:`);
    for (const t of items) {
      sections.push(`- ${t.key}: ${t.description}`);
    }
    sections.push("");
  }
  return sections.join("\n");
}

export async function assignTags(input: {
  idiom: {
    expression: string;
    language: Language;
    idiomatic_meaning: string;
  };
  canonical: CanonicalTagWithEn[];
}): Promise<TagAssignment> {
  const prompt = [
    "CANONICAL TAG LIST",
    "",
    renderCanonical(input.canonical),
    "IDIOM",
    `expression: "${input.idiom.expression}"`,
    `language: ${LANGUAGE_NAMES[input.idiom.language]} (${input.idiom.language})`,
    `meaning: ${input.idiom.idiomatic_meaning}`,
  ].join("\n");

  const completion = await openai.beta.chat.completions.parse({
    model,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: prompt },
    ],
    response_format: zodResponseFormat(Output, "tag_assignment"),
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) throw new Error("OpenAI returned no parsed output");
  return parsed;
}
