import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getModel, openai } from "../lib/openai.js";
import { LANGUAGE_NAMES, type Language } from "../types.js";
import {
  EXCLUDED_FORMS,
  GENERATIVE_PERSONA,
  IDIOM_DEFINITION,
  renderAnchorsForLang,
  SCRIPT_RULE,
  SELF_CHECK,
} from "./idiomDefinition.js";

const RejectedCandidate = z.object({
  expression: z.string(),
  reason: z.string(),
});

const Output = z.object({
  rejected_candidates: z.array(RejectedCandidate),
  expressions: z.array(z.string()).max(200),
});

export type GenerateCandidatesResult = {
  expressions: string[];
  rejected: { expression: string; reason: string }[];
};

export const SYSTEM = `${GENERATIVE_PERSONA}

${IDIOM_DEFINITION}

${EXCLUDED_FORMS}

${SCRIPT_RULE}

PROCESS:
For each candidate phrase you consider:
  1. Apply THE TEST.
  2. Check it against EXCLUDED FORMS.
  3. If it FAILS → put it in "rejected_candidates" with the failing
     category as the reason (e.g. "calque from EN", "proverb",
     "plain verb phrase", "dead metaphor").
  4. If it PASSES → put it in "expressions".

QUALITY RULES:
- Output the canonical, dictionary form of each idiom (no surrounding
  quotes, no leading "to ", no trailing punctuation, no annotations).
- All entries must be NATIVE to the requested language — originated in
  or fully naturalized into it. Avoid Latin tags or English borrowings
  unless ordinary speakers use them as native idioms of the target lang.
- Idioms are PHRASES (typically 2–7 words). One-word slang is not an
  idiom; full-sentence proverbs are not idioms.
- Do not repeat any expression that appears in the avoid list.
  Comparison is after Unicode NFKC normalization — variant whitespace,
  half/full-width, and combining marks collapse to the same key.
- PREFER FEWER HIGH-QUALITY IDIOMS OVER MORE WEAK CANDIDATES. If only
  30 true idioms come to mind when 50 are requested, return 30. NEVER
  pad to hit the count.

${SELF_CHECK}`.trim();

export async function generateCandidates(input: {
  language: Language;
  count: number;
  avoid: string[];
}): Promise<GenerateCandidatesResult> {
  const userPrompt = [
    `Language: ${LANGUAGE_NAMES[input.language]} (${input.language})`,
    `Count target: ${input.count} (return fewer if not enough true idioms come to mind)`,
    "",
    renderAnchorsForLang(input.language),
    "",
    input.avoid.length > 0
      ? `Avoid (already known — do not repeat):\n${input.avoid.map((a) => `- ${a}`).join("\n")}`
      : "Avoid: (none)",
  ].join("\n");

  const completion = await openai.beta.chat.completions.parse({
    model: getModel("generateCandidates"),
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userPrompt },
    ],
    response_format: zodResponseFormat(Output, "candidates"),
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) throw new Error("OpenAI returned no parsed output");
  return {
    expressions: parsed.expressions,
    rejected: parsed.rejected_candidates,
  };
}
