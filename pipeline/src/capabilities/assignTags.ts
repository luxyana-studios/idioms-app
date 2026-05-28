import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getModel, openai } from "../lib/openai.js";
import type { CanonicalTagWithEn } from "../lib/tags.js";
import { LANGUAGE_NAMES, type Language } from "../types.js";

const Output = z.object({
  meaning: z.array(z.string()),
  register: z.array(z.string()),
  theme: z.array(z.string()),
  occasion: z.array(z.string()),
});

export type TagAssignment = z.infer<typeof Output>;

const SYSTEM = `You assign canonical taxonomy tags to an idiom for a
multilingual dictionary.

OUTPUT FORMAT:
- Pick tags ONLY from the canonical list provided in the user message.
  Never invent.
- Output the tag KEY (lowercase identifier), never the label.
- Each chosen key goes into the array for its facet (theme, meaning,
  register, occasion). A key may only appear in its native facet's array.

FACET RULES:
- meaning (REQUIRED): pick exactly 1 best-fit tag. Add a second ONLY if
  the idiom is genuinely ambiguous and both meanings apply equally.
  PREFER ONE STRONG TAG OVER TWO WEAK ONES.
- register (REQUIRED, exactly 1): the dominant register. If the idiom
  flexes between formal and informal use, pick "neutral" if that key
  exists in the canonical list; otherwise the register most common in
  actual use.
- theme (OPTIONAL, 0–2): the visible imagery or domain (body parts,
  food, weather, etc.). Pick theme tags only when the imagery is
  CONCRETE and CENTRAL to the idiom. Skip when the idiom is abstract.
- occasion (OPTIONAL, 0–1): only when the idiom is reliably used in a
  specific situation. Skip otherwise.

WORKED EXAMPLE (keys below are illustrative — pick only from the
canonical list provided in the user message):
  IDIOM: "spill the beans" (EN), meaning: "to reveal a secret"
  Assignment:
    meaning:  ["reveal-secret"]      ← one strong tag
    register: ["informal"]            ← single dominant register
    theme:    ["communication"]       ← food imagery is incidental, not the theme
    occasion: []                      ← not occasion-bound`.trim();

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
  const userPrompt = [
    "CANONICAL TAG LIST",
    "",
    renderCanonical(input.canonical),
    "IDIOM",
    `expression: "${input.idiom.expression}"`,
    `language: ${LANGUAGE_NAMES[input.idiom.language]} (${input.idiom.language})`,
    `meaning: ${input.idiom.idiomatic_meaning}`,
  ].join("\n");

  const completion = await openai.beta.chat.completions.parse({
    model: getModel("assignTags"),
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userPrompt },
    ],
    response_format: zodResponseFormat(Output, "tag_assignment"),
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) throw new Error("OpenAI returned no parsed output");
  return parsed;
}
