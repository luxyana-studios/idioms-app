import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { model, openai } from "../lib/openai.js";
import { LANGUAGE_NAMES, type Language } from "../types.js";

const Output = z.object({
  is_idiom: z.boolean(),
  rationale: z.string(),
});

export type VerifyResult = z.infer<typeof Output>;

const SYSTEM = `You decide whether a given phrase is a TRUE idiom.

DEFINITION OF AN IDIOM:
A true idiom is a phrase whose figurative meaning CANNOT be inferred from the literal meaning of its words. A learner who knows every word must still be TAUGHT what the phrase means.

THE TEST:
Would a learner who understands each word individually correctly guess the meaning of the phrase? If yes → NOT an idiom. If no → idiom.

Set is_idiom = false if the phrase is ANY of:
- a collocation or common verb phrase whose meaning is the sum of its words (e.g. "go to bed", "ins Bett gehen", "ir a la cama", "aller au lit", "open the door", "have dinner", "Hunger haben")
- a phrasal verb whose meaning is literal (e.g. "stand up", "sit down")
- a proverb / full-sentence saying ("a stitch in time saves nine") — idioms are shorter phrases
- a plain description, paraphrase, or generic adverbial expression

Set is_idiom = true ONLY when the phrase's figurative meaning genuinely differs from its literal words and a learner would need to be taught it.

POSITIVE EXAMPLES (true idioms):
- EN: kick the bucket, spill the beans, piece of cake
- ES: pan comido, estirar la pata, irse de la lengua
- DE: ins Gras beißen, den Löffel abgeben, Kinderspiel
- FR: casser sa pipe, être un jeu d'enfant, donner sa langue au chat

Rationale: one short sentence explaining the decision.`;

export async function verifyIsIdiom(input: {
  expression: string;
  language: Language;
  idiomatic_meaning: string;
}): Promise<VerifyResult> {
  const prompt = [
    `EXPRESSION: "${input.expression}"`,
    `LANGUAGE: ${LANGUAGE_NAMES[input.language]} (${input.language})`,
    `RECORDED MEANING (for reference): ${input.idiomatic_meaning}`,
  ].join("\n");

  const completion = await openai.beta.chat.completions.parse({
    model,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: prompt },
    ],
    response_format: zodResponseFormat(Output, "verify"),
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) throw new Error("OpenAI returned no parsed output");
  return parsed;
}
