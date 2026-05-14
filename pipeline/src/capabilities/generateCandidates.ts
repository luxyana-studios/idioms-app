import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { model, openai } from "../lib/openai.js";
import { LANGUAGE_NAMES, type Language } from "../types.js";

const Output = z.object({
  expressions: z.array(z.string()).max(200),
});

const SYSTEM = `You produce lists of well-known, commonly-used IDIOMS in a given language.

DEFINITION OF AN IDIOM:
A true idiom is a phrase whose figurative meaning CANNOT be inferred from the literal meaning of its words. A learner who knows every word must still be TAUGHT what the phrase means.

THE TEST:
Would a learner who understands each word individually correctly guess the meaning of the phrase? If yes → NOT an idiom (it is a collocation, phrasal verb, proverb, or common expression). If no → idiom.

POSITIVE EXAMPLES (true idioms):
- EN: kick the bucket, spill the beans, piece of cake, hit the nail on the head
- ES: pan comido, estirar la pata, irse de la lengua, dar en el clavo
- DE: ins Gras beißen, den Löffel abgeben, Kinderspiel, ein Auge zudrücken
- FR: casser sa pipe, être un jeu d'enfant, donner sa langue au chat, mettre la charrue avant les bœufs

ANTI-EXAMPLES (NOT idioms — never include):
- EN: go to bed, have dinner, open the door, read a book, take a shower
- ES: ir a la cama, tener hambre, abrir la puerta, leer un libro, tomar agua
- DE: ins Bett gehen, Hunger haben, die Tür öffnen, ein Buch lesen, Wasser trinken
- FR: aller au lit, avoir faim, ouvrir la porte, lire un livre, boire de l'eau

Rules:
- Output the canonical, dictionary form of each idiom (no surrounding quotes, no leading "to ", no trailing punctuation).
- All entries must be native to the requested language.
- Do not repeat any expression that appears in the avoid list (case-insensitive).
- Order from most common to less common.
- PREFER FEWER HIGH-QUALITY IDIOMS OVER MORE WEAK CANDIDATES. If only 30 true idioms come to mind when 50 are requested, return 30.`;

export async function generateCandidates(input: {
  language: Language;
  count: number;
  avoid: string[];
}): Promise<string[]> {
  const userPrompt = [
    `Language: ${LANGUAGE_NAMES[input.language]} (${input.language})`,
    `Count: ${input.count}`,
    input.avoid.length > 0
      ? `Avoid (already known):\n${input.avoid.map((a) => `- ${a}`).join("\n")}`
      : "Avoid: (none)",
  ].join("\n\n");

  const completion = await openai.beta.chat.completions.parse({
    model,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userPrompt },
    ],
    response_format: zodResponseFormat(Output, "candidates"),
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) throw new Error("OpenAI returned no parsed output");

  return parsed.expressions;
}
