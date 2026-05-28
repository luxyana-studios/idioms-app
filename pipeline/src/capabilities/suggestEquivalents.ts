import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getModel, openai } from "../lib/openai.js";
import { LANGUAGE_NAMES, type Language } from "../types.js";
import {
  EXCLUDED_FORMS,
  IDIOM_DEFINITION,
  renderAnchorsForLang,
  SCRIPT_RULE,
  SELF_CHECK,
} from "./idiomDefinition.js";

const Suggestion = z.object({
  expression: z.string(),
  score: z.number().min(0).max(1),
  rationale: z.string(),
});

const ConsideredRejected = z.object({
  expression: z.string(),
  reason: z.string(),
});

const Output = z.object({
  considered_but_rejected: z.array(ConsideredRejected),
  suggestions: z.array(Suggestion).max(10),
});

export type EquivalentSuggestion = z.infer<typeof Suggestion>;
export type SuggestEquivalentsResult = {
  suggestions: EquivalentSuggestion[];
  rejected: { expression: string; reason: string }[];
};

const SYSTEM =
  `You map idioms across languages by finding NATIVE IDIOMATIC equivalents.

${IDIOM_DEFINITION}

${EXCLUDED_FORMS}

${SCRIPT_RULE}

THE TEST FOR A VALID EQUIVALENT (must satisfy ALL):
  1. The target-language expression is itself a true idiom (not a paraphrase,
     not a literal translation, not a plain description).
  2. It expresses the SAME FIGURATIVE MEANING as the source — not merely the
     same topic. Two idioms about money are not equivalents if they mean
     different things.
  3. RECIPROCAL DIRECTION: a native speaker of the target language hearing
     this idiom would naturally think of a situation the source idiom also
     applies to. If not, drop the suggestion.

ANTI-PATTERN (the most common mistake):
  SOURCE: "spill the beans" (EN)
  ✗ ES "revelar un secreto" — PLAIN DESCRIPTION, not an idiom.
  ✓ ES "irse de la lengua" — native idiom with the same meaning.

SCORE CALIBRATION (0.0–1.0):
  1.0  perfect cultural match: same imagery + same meaning + same register
       (EN "piece of cake" ↔ ES "pan comido")
  0.7  same meaning + different image, same register
       (EN "kick the bucket" ↔ ES "estirar la pata")
  0.5  same meaning + different image AND different register
  0.3  loose semantic overlap; weak
  <0.3 not a real equivalent

THRESHOLD: only emit suggestions with score ≥ 0.5. Below 0.5 → put in
"considered_but_rejected" with reason "low score (<0.5)".

PROCESS:
For each potential target-language idiom you consider:
  1. Apply THE TEST FOR A VALID EQUIVALENT (all three points).
  2. Check it against EXCLUDED FORMS.
  3. If any check fails → "considered_but_rejected" with specific reason
     (e.g. "not idiomatic", "different meaning", "calque", "low score").
  4. Otherwise → emit in "suggestions" with score and rationale.

If NO real native idiom equivalent exists, return an EMPTY "suggestions"
list. Do not invent. Do not pad to hit N.

OUTPUT RULES:
- Canonical, dictionary form (no surrounding quotes, no leading "to ",
  no trailing punctuation, no annotations).
- Rationale: one short sentence explaining the equivalence.

${SELF_CHECK}`.trim();

export async function suggestEquivalents(input: {
  expression: string;
  sourceLang: Language;
  targetLang: Language;
  n: number;
}): Promise<SuggestEquivalentsResult> {
  const userPrompt = [
    `SOURCE: "${input.expression}" (${LANGUAGE_NAMES[input.sourceLang]})`,
    `TARGET language: ${LANGUAGE_NAMES[input.targetLang]} (${input.targetLang})`,
    `N (max suggestions): ${input.n}`,
    "",
    renderAnchorsForLang(input.targetLang),
  ].join("\n");

  const completion = await openai.beta.chat.completions.parse({
    model: getModel("suggestEquivalents"),
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userPrompt },
    ],
    response_format: zodResponseFormat(Output, "equivalents"),
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) throw new Error("OpenAI returned no parsed output");
  return {
    suggestions: parsed.suggestions,
    rejected: parsed.considered_but_rejected,
  };
}
