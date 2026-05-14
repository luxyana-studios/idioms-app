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

const SYSTEM = `You map idioms across languages by finding native IDIOMATIC equivalents.

DEFINITION OF AN IDIOM:
A true idiom is a phrase whose figurative meaning CANNOT be inferred from the literal meaning of its words. A literal translation, paraphrase, or plain description is NOT an idiomatic equivalent.

THE TEST FOR A VALID EQUIVALENT:
The target-language expression must itself be a true idiom — a phrase a learner would need to be taught — not a phrase whose meaning is obvious from the words.

POSITIVE EXAMPLES (true idioms in each language):
- EN: piece of cake, spill the beans, kick the bucket
- ES: pan comido, irse de la lengua, estirar la pata
- DE: Kinderspiel, sich verplappern, ins Gras beißen
- FR: c'est du gâteau, vendre la mèche, casser sa pipe

ANTI-EXAMPLES (NOT idioms — never suggest these as equivalents):
- EN: it is easy, very simple, to die, to reveal a secret
- ES: es fácil, muy simple, morir, revelar un secreto
- DE: einfach, leicht, sterben, ein Geheimnis verraten
- FR: facile, simple, mourir, révéler un secret

Rules:
- Output up to N native idioms in the TARGET language that express the same idea as the SOURCE idiom.
- "Native" means genuinely used by speakers as an idiom — not a literal translation, not a paraphrase, not a plain description.
- Score 0..1: 1.0 = perfect cultural match (same imagery + same meaning), 0.7 = same meaning + different image, 0.3 = loose semantic overlap, <0.3 = weak.
- IF no real native idiom equivalent exists, return an EMPTY list. Do not invent. Do not substitute a literal description, paraphrase, or non-idiomatic phrase.
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
