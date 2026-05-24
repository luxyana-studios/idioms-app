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

const Output = z.object({
  is_idiom: z.boolean(),
  confidence: z.enum(["high", "medium", "low"]),
  rationale: z.string(),
});

export type VerifyResult = z.infer<typeof Output>;

const SYSTEM = `You decide whether a given phrase is a TRUE idiom. This is
a second-opinion gate that runs after initial enrichment — be strict.

${IDIOM_DEFINITION}

${EXCLUDED_FORMS}

${SCRIPT_RULE}

GATE — Set is_idiom = false if the phrase falls into ANY of the EXCLUDED
FORMS categories.

ADDITIONAL REJECTION RULES:
- MEANING SANITY: cross-check the RECORDED MEANING against the expression.
  If the meaning is wrong, generic ("to be very happy"), or simply restates
  a literal reading of the expression → set is_idiom=false even when the
  expression itself might be idiomatic. A correct idiom with a wrong meaning
  is unusable.
- LENGTH SANITY: if the input is longer than ~8 words, spans multiple
  sentences, or contains URLs / numbers / punctuation oddities → set
  is_idiom=false. Idioms are short phrases.

CONFIDENCE:
  high   — clearly is (or clearly isn't) an idiom.
  medium — defensible decision but reasonable arguments exist either way.
  low    — genuinely borderline; lean toward is_idiom=false per the
           "WHEN UNCERTAIN, EXCLUDE" rule.

RATIONALE: one short sentence stating the specific reason
(e.g. "Plain verb phrase; meaning is literal",
      "True idiom: figurative meaning unrecoverable from the words",
      "Meaning mismatch: recorded meaning describes a different idiom").

${SELF_CHECK}`.trim();

export async function verifyIsIdiom(input: {
  expression: string;
  language: Language;
  idiomatic_meaning: string;
}): Promise<VerifyResult> {
  const userPrompt = [
    `EXPRESSION: "${input.expression}"`,
    `LANGUAGE: ${LANGUAGE_NAMES[input.language]} (${input.language})`,
    `RECORDED MEANING: ${input.idiomatic_meaning}`,
    "",
    renderAnchorsForLang(input.language),
  ].join("\n");

  const completion = await openai.beta.chat.completions.parse({
    model: getModel("verifyIsIdiom"),
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userPrompt },
    ],
    response_format: zodResponseFormat(Output, "verify"),
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) throw new Error("OpenAI returned no parsed output");
  return parsed;
}
