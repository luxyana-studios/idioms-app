import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getModel, openai } from "../lib/openai.js";
import { LANGUAGE_NAMES, type Language } from "../types.js";
import {
  EXCLUDED_FORMS,
  FREQUENCY_RUBRIC,
  IDIOM_DEFINITION,
  renderAnchorsForLang,
  renderFrequencyAnchorsForLang,
  SCHOLARLY_PERSONA,
  SCRIPT_RULE,
  SELF_CHECK,
} from "./idiomDefinition.js";

const Output = z.object({
  is_idiom: z.boolean(),
  idiom_rationale: z.string(),
  idiomatic_meaning: z.string(),
  explanation: z.string(),
  examples: z.array(z.string()).max(3),
  register: z
    .enum([
      "contemporary_colloquial",
      "contemporary_formal",
      "literary",
      "dated",
      "regional",
    ])
    .nullable(),
  frequency: z
    .enum(["very_common", "common", "uncommon", "rare", "very_rare"])
    .nullable(),
  frequency_rationale: z.string(),
});

export type EnrichmentResult = z.infer<typeof Output>;

const SYSTEM = `${SCHOLARLY_PERSONA}

You enrich an idiom with native-language metadata for a learner-facing
dictionary. You also gate-check whether the input is actually an idiom.

CRITICAL LANGUAGE RULE — READ FIRST:
All filled fields MUST be written in the IDIOM'S NATIVE LANGUAGE and in
its NATIVE SCRIPT. If the idiom is Italian, idiomatic_meaning is written
in ITALIAN, not English. If Japanese, in JAPANESE. If Arabic, in ARABIC.
Never default to English. Never mix languages. Rows with wrong-language
metadata are UNUSABLE and will be discarded. This rule overrides any
temptation to default to English on well-known idioms.

${IDIOM_DEFINITION}

${EXCLUDED_FORMS}

${SCRIPT_RULE}

${FREQUENCY_RUBRIC}

GATE — Set is_idiom = false if the input falls into ANY of the EXCLUDED
FORMS categories. Set is_idiom = true ONLY when the figurative meaning
genuinely differs from a literal reading of the words and a learner
would need to be taught it.

IF is_idiom = false:
  - idiom_rationale: one sentence stating the failing category
    (e.g. "Plain verb phrase; meaning is literal",
          "Calque from EN; not native to JA")
  - idiomatic_meaning, explanation: empty strings
  - examples: empty array
  - register: null
  - frequency: null
  - frequency_rationale: empty string

IF is_idiom = true, fill ALL fields:
  - idiom_rationale: one sentence stating what makes it an idiom.
  - idiomatic_meaning: the actual figurative meaning, 1–2 sentences.
    NOT a literal restatement — if your meaning would be obvious from
    reading the words, the phrase is not an idiom (set is_idiom=false).
  - explanation: 1–3 sentences of etymological or cultural context.
    Hedge contested or folk etymologies explicitly
    ("Tradicionalmente se atribuye…" / "Popularly said to derive from…").
    Do NOT present unverified origin as fact. Empty string if no clear
    etymology exists. Do not invent.
  - examples: EXACTLY 2 or 3 short sentences using the idiom in
    naturalistic context. EXAMPLES MUST BE DIVERSE — different subjects,
    situations, registers. Do not write three variations of the same scene.
    You MAY conjugate / inflect the verb naturally for tense and subject.
    Do not change the wording otherwise.
  - register: per REGISTER rubric above. Decide register FIRST, then
    use it to constrain the frequency choice. When straddling two
    registers, pick the less-mainstream one.
  - frequency: common | uncommon | rare per FREQUENCY rubric above.
    Apply the PROMOTION TEST strictly. Default to "uncommon".
  - frequency_rationale: one short sentence per FREQUENCY RATIONALE
    rules above. Must contain ONE concrete signal specific to THIS
    idiom — no generic claims.

LANGUAGE (reminder, per CRITICAL LANGUAGE RULE above):
All filled fields in the IDIOM'S NATIVE LANGUAGE and NATIVE SCRIPT. Never
translate. Use the canonical dictionary form of the idiom (modulo
inflection in examples).

${SELF_CHECK}`.trim();

export async function enrichExpression(input: {
  expression: string;
  language: Language;
}): Promise<EnrichmentResult> {
  const userPrompt = [
    `EXPRESSION: "${input.expression}"`,
    `NATIVE LANGUAGE: ${LANGUAGE_NAMES[input.language]} (${input.language})`,
    "",
    renderAnchorsForLang(input.language),
    "",
    renderFrequencyAnchorsForLang(input.language),
  ].join("\n");

  const completion = await openai.beta.chat.completions.parse({
    model: getModel("enrichExpression"),
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userPrompt },
    ],
    response_format: zodResponseFormat(Output, "enrichment"),
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) throw new Error("OpenAI returned no parsed output");
  if (parsed.is_idiom && !parsed.frequency) {
    throw new Error(
      `enrichExpression: is_idiom=true but frequency missing for "${input.expression}" (${input.language})`,
    );
  }
  if (parsed.is_idiom && !parsed.register) {
    throw new Error(
      `enrichExpression: is_idiom=true but register missing for "${input.expression}" (${input.language})`,
    );
  }
  if (parsed.is_idiom && !parsed.frequency_rationale.trim()) {
    throw new Error(
      `enrichExpression: is_idiom=true but frequency_rationale missing for "${input.expression}" (${input.language})`,
    );
  }
  // Prompt requires EXACTLY 2 or 3 examples when is_idiom=true. Schema can
  // only express the upper bound (.max(3)) because is_idiom=false rows
  // legitimately return []. Catch the under-2 case here so it never reaches
  // the corpus.
  if (parsed.is_idiom && parsed.examples.length < 2) {
    throw new Error(
      `enrichExpression: is_idiom=true but examples.length=${parsed.examples.length} (need 2 or 3) for "${input.expression}" (${input.language})`,
    );
  }
  return parsed;
}
