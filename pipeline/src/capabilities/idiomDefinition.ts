import type { Language } from "../types.js";

// Shared prompt primitives used across mine / discover / enrich / verify.
// Single source of truth for the definition of an idiom, the failure
// modes to reject, and per-language anchor examples.
//
// Anchors for it/zh/hi/ar/ja/ko/pt are FIRST-PASS PLACEHOLDERS and must
// be reviewed by a native speaker before the first mining run for that
// language. Bad anchors poison the entire pass.

// Persona for generative work (mining, discovery). Pushes the model out of
// anchor-overfit into the language's full idiomatic range — everyday +
// literary + historical — while holding a hard line against hallucination
// and back-translation. Empirically diversifies output and surfaces
// well-attested idioms the bare prompt misses.
export const GENERATIVE_PERSONA = `
You are a prolific master of the target language — a native speaker with
profound, extensive command of its idiomatic register across eras and styles.
You produce lists of well-known, native IDIOMS for a learner-facing
dictionary. You hold in memory:
  - the everyday idioms ordinary speakers use this week,
  - the regional and traditional voices that color the language,
  - the literary, theatrical, and poetic canon, and
  - the older, refranero-adjacent or historical idioms learners still
    encounter in novels, films, songs, and journalism.

PRODUCE A MIX OF REGISTERS. Do not anchor only to contemporary daily speech.
Reach deliberately into the literary and historical register — include idioms
a literate native would recognize from canonical novels, theatre, popular
songs, or the proverbial / refranero tradition (where the form is genuinely
idiomatic — a phrase, not a full-sentence saying). Aim for variety of
register and era alongside the modern everyday core.

ABSOLUTE RULE — REAL, NOT INVENTED:
Every expression you emit must be ATTESTED — used by real speakers, recorded
in the language's respected reference works, or established in the literary
canon. If you cannot personally vouch for a phrase as genuinely attested,
EXCLUDE it. Hallucinated phrases, back-translations, calques, and fabricated
archaisms are the single worst failure mode and outweigh any loss of
coverage. Do not pad with curiosities a literate native would not actually
recognize.
`.trim();

// Persona for analytical work (enrichment, gate-checking). Same underlying
// identity as GENERATIVE_PERSONA, but framed as a careful lexicographer:
// the explanations and examples this persona produces are sober and
// unembellished. Use this anywhere the output is descriptive prose about an
// idiom, not a generative list of new idioms.
export const SCHOLARLY_PERSONA = `
You are a master native speaker of the target language with the disposition
of a careful lexicographer. You write with scholarly precision: factual,
sober, and unembellished. Your idiomatic meanings are exact; your example
sentences are naturalistic and unornamented; your etymologies are hedged
when uncertain and silent when unknown.

ABSOLUTE RULE — FACTUAL, NEVER INVENTED:
Do not fabricate. Do not invent etymologies. Do not invent example sentences
that imply false cultural specifics. Do not stretch the idiom's meaning to
fit a more interesting story. If an etymology is contested, mark it as such
("Tradicionalmente se atribuye…" / "Popularly said to derive from…"); if it
is unknown, say nothing rather than guess. Plain, accurate, attested.
`.trim();

export const IDIOM_DEFINITION = `
DEFINITION OF AN IDIOM:
A true idiom is a phrase (typically 2–7 words) whose figurative meaning
CANNOT be inferred from the literal meaning of its words. A learner who
knows every word individually must still be TAUGHT what the phrase means.

THE TEST:
Would a learner who understands each word individually correctly guess
the meaning of the phrase? If yes → NOT an idiom. If no → idiom.

WHEN GENUINELY UNCERTAIN, EXCLUDE (or set is_idiom=false). False
negatives are recoverable later; false positives pollute the corpus
and degrade the learner experience.
`.trim();

export const EXCLUDED_FORMS = `
EXCLUDED FORMS (never qualify as idioms):

1. Plain verb phrases / common collocations — meaning is the sum of its words
   ✗ EN "go to bed", "open the door", "have dinner"
   ✗ ES "ir a la cama", "tener hambre"

2. Literal phrasal verbs
   ✗ EN "stand up", "sit down", "wake up"

3. Proverbs and full-sentence sayings — idioms are SHORT PHRASES, not sentences
   ✗ EN "a stitch in time saves nine"
   ✗ ES "más vale tarde que nunca"

4. Calques — literal back-translations from another language that aren't
   native to the target language
   ✗ ZH "踢桶子" (literal of EN "kick the bucket"; not a Chinese idiom)
   ✗ JA "バケツを蹴る" (same)
   ✗ AR "ركل الدلو" (same)

5. Dead / transparent metaphors — the figurative origin is well-known, but a
   learner can infer the meaning from the words
   ✗ EN "fall in love", "broken heart"

6. Single-word slang or interjections — too short to qualify as a phrase
   ✗ ES "chévere"
   ✗ JA "やばい"

7. Famous quotations or catchphrases — context-bound, not idioms
   ✗ EN "May the Force be with you"

8. Generic discourse markers / adverbial expressions
   ✗ EN "in any case", "as a matter of fact"

9. Plain descriptions of an idea
   ✗ EN "to die", "to reveal a secret"
`.trim();

export const SCRIPT_RULE = `
SCRIPT RULE:
All idiom text and metadata MUST be written in the IDIOM'S NATIVE SCRIPT.
- ar (Arabic):  Arabic script. Harakat optional.
- zh (Chinese): Hanzi (Simplified, mainland convention).
- hi (Hindi):   Devanagari.
- ja (Japanese): conventional kanji+kana mix as in dictionaries.
- ko (Korean):  Hangul.
- en/es/de/fr/it/pt: standard Latin orthography.
No romanization. No transliteration. No Latin substitutes for non-Latin scripts.
`.trim();

export const SELF_CHECK = `
Before responding, re-read your output:
- Does the rationale match the verdict?
- If you said "this is an idiom": is the idiomatic meaning genuinely
  different from a literal reading of the expression?
- If you said "this is NOT an idiom": are the idiom-only fields empty
  as specified?
- Are all fields in the correct language and script (per SCRIPT RULE)?
`.trim();

export const FREQUENCY_RUBRIC = `
REGISTER — set "register" to ONE of:
  - contemporary_colloquial: everyday informal speech in current use
  - contemporary_formal:     current but formal — news, professional
                             writing, public speech
  - literary:                home is the canon — novels, theatre,
                             poetry, song lyrics
  - dated:                   feels archaic or pre-mid-20th-century to a
                             contemporary ear ("what grandparents say")
  - regional:                tied to one country, region, or dialect
                             group and not pan-dialectal

When an idiom genuinely straddles two registers, pick the LESS-
mainstream one (literary or dated over colloquial). Mirrors the same
"exclude when uncertain" stance used elsewhere.

FREQUENCY — set "frequency" to ONE of (FIVE buckets, ordered):
  - very_common: heard or read MULTIPLE times per week by an ordinary
                 speaker. The handful of idioms that are practically
                 cliché — not knowing them would be unusual for a
                 fluent speaker.
  - common:      heard or read REGULARLY (a few times per month).
                 Widely used, register-appropriate everywhere in the
                 language.
  - uncommon:    OCCASIONAL — recognized, used by educated speakers,
                 not in daily rotation. The default.
  - rare:        mainly LITERARY, DATED, REGIONAL, or refranero —
                 encountered in books, theatre, or specific dialects,
                 not in everyday speech.
  - very_rare:   even within its native register the idiom is
                 UNUSUAL or specialist — scholarly literary analysis,
                 pre-1900 usage, narrow dialect pockets.

The register you chose CONSTRAINS the allowed frequencies:

  contemporary_colloquial  →  very_common, common, or uncommon
  contemporary_formal      →  common or uncommon
  literary                 →  uncommon, rare, or very_rare
  dated                    →  rare or very_rare
  regional                 →  uncommon, rare, or very_rare

DEFAULT IS "uncommon" within each row — earn the more extreme buckets
via the promotion tests below. When in doubt, stay at "uncommon".

PROMOTION TEST for "common" — ALL FOUR must be true:
  1. CONTEMPORARY. Adults under 40 use it in casual speech today.
  2. REGISTER. contemporary_colloquial, or contemporary_formal if the
     idiom genuinely also works casually. literary, dated, and regional
     idioms are NEVER common.
  3. PAN-DIALECTAL. Recognized AND used across the language's major
     dialects.
  4. ATTESTED IN LIVING USAGE. You can internally identify three
     distinct present-day situations where you would actually hear or
     read it. Verify internally — do NOT list those situations in your
     rationale.

PROMOTION TEST for "very_common" — common PLUS universality.
Reserved for idioms used or heard MULTIPLE times per WEEK by ordinary
speakers, in any major dialect, by any age cohort. Internally: "is
this such a staple that NOT knowing it would mark a speaker as
non-fluent?" If yes → very_common. Any sliver of doubt → common, not
very_common. Be sparing — most language has very few of these.

PROMOTION TEST for "rare" — REGISTER, not recognition.
Earn this if the register is literary, dated, or restricted-regional
AND the idiom is rarely uttered in living speech. Recognition does NOT
block "rare" — many rare idioms are widely recognized; the test is
USE, not awareness.

PROMOTION TEST for "very_rare" — rare PLUS obscurity.
Reserved for idioms that, even within their native register, are
unusual or specialist: encountered mainly in scholarly literary
analysis, very old (pre-1900) usage, or narrow dialect pockets. If a
literate native in the relevant tradition would consider the idiom
familiar, it is "rare", not "very_rare". Be sparing.

"uncommon" is the default everywhere else: real, attested, recognized
by educated adults, failing the "common" test and not literary, dated,
or marginal-regional enough for "rare".

FREQUENCY RATIONALE — REQUIRED when is_idiom=true.
Written in the IDIOM'S NATIVE LANGUAGE (per CRITICAL LANGUAGE RULE).
ONE short sentence. It MUST name at least ONE concrete, specific signal
that distinguishes THIS idiom from idioms in other buckets. A signal is
one of:

  - a literary source or genre (a named work, the refranero / proverbial
    tradition, theatre, a poet)
  - a regional or country restriction (e.g. peninsular Spanish only,
    rioplatense, Mexican usage)
  - an age-cohort marker (under-30s, over-50s, all ages)
  - a domain where it actually appears (sports commentary, journalism,
    social media, religious register, refranero)
  - a register cue tied to feel (archaic, poetic, formal, everyday
    neutral)

A rationale that could be repeated VERBATIM about a different idiom is
INSUFFICIENT — generic phrases like "es una expresión común", "se usa
frecuentemente", or "ampliamente utilizada" describe nothing and apply
to every idiom in any bucket. If your sentence is not a fingerprint of
THIS specific idiom, rewrite it.

The rationale must be CONSISTENT with the register and frequency you
chose. Do NOT quote or paraphrase these instructions.
`.trim();

type AnchorSet = {
  positive: string[];
  anti: { example: string; category: string }[];
};

// en/es/de/fr ported from previous per-capability prompts.
// PLACEHOLDERS — Anchors for it/zh/hi/ar/ja/ko/pt require native-speaker review.
export const ANCHORS_BY_LANG: Record<Language, AnchorSet> = {
  en: {
    positive: [
      "kick the bucket",
      "spill the beans",
      "piece of cake",
      "hit the nail on the head",
    ],
    anti: [
      { example: "go to bed", category: "plain verb phrase" },
      { example: "a stitch in time saves nine", category: "proverb" },
      { example: "fall in love", category: "dead metaphor" },
      { example: "as a matter of fact", category: "discourse marker" },
    ],
  },
  es: {
    positive: [
      "pan comido",
      "estirar la pata",
      "irse de la lengua",
      "dar en el clavo",
    ],
    anti: [
      { example: "ir a la cama", category: "plain verb phrase" },
      { example: "más vale tarde que nunca", category: "proverb" },
      { example: "chévere", category: "single-word slang" },
      { example: "revelar un secreto", category: "plain description" },
    ],
  },
  de: {
    positive: [
      "ins Gras beißen",
      "den Löffel abgeben",
      "Kinderspiel",
      "ein Auge zudrücken",
    ],
    anti: [
      { example: "ins Bett gehen", category: "plain verb phrase" },
      { example: "Hunger haben", category: "plain verb phrase" },
      { example: "Übung macht den Meister", category: "proverb" },
      { example: "ein Geheimnis verraten", category: "plain description" },
    ],
  },
  fr: {
    positive: [
      "casser sa pipe",
      "être un jeu d'enfant",
      "donner sa langue au chat",
      "mettre la charrue avant les bœufs",
    ],
    anti: [
      { example: "aller au lit", category: "plain verb phrase" },
      { example: "avoir faim", category: "plain verb phrase" },
      { example: "mieux vaut tard que jamais", category: "proverb" },
      { example: "révéler un secret", category: "plain description" },
    ],
  },
  // ─── PLACEHOLDER — native review required ────────────────────────────────
  it: {
    positive: [
      "in bocca al lupo",
      "non avere peli sulla lingua",
      "essere al verde",
      "tirare il pacco",
    ],
    anti: [
      { example: "andare a letto", category: "plain verb phrase" },
      { example: "meglio tardi che mai", category: "proverb" },
      { example: "rivelare un segreto", category: "plain description" },
      { example: "in ogni caso", category: "discourse marker" },
    ],
  },
  pt: {
    positive: [
      "bater as botas",
      "pisar na bola",
      "pagar o pato",
      "engolir sapos",
    ],
    anti: [
      { example: "ir para a cama", category: "plain verb phrase" },
      { example: "antes tarde do que nunca", category: "proverb" },
      { example: "revelar um segredo", category: "plain description" },
      { example: "de qualquer forma", category: "discourse marker" },
    ],
  },
  zh: {
    positive: ["对牛弹琴", "画蛇添足", "亡羊补牢", "一举两得"],
    anti: [
      { example: "去睡觉", category: "plain verb phrase" },
      { example: "踢桶子", category: "calque from EN 'kick the bucket'" },
      { example: "时间就是金钱", category: "proverb / generic saying" },
      { example: "泄露秘密", category: "plain description" },
    ],
  },
  ja: {
    positive: ["猫の手も借りたい", "口が滑る", "朝飯前", "釘を刺す"],
    anti: [
      { example: "寝る", category: "single verb, not phrase" },
      { example: "バケツを蹴る", category: "calque from EN 'kick the bucket'" },
      { example: "やばい", category: "single-word slang" },
      { example: "秘密を漏らす", category: "plain description" },
    ],
  },
  ko: {
    positive: [
      "발 벗고 나서다",
      "식은 죽 먹기",
      "눈에 밟히다",
      "입에 침이 마르다",
    ],
    anti: [
      { example: "잠자리에 들다", category: "plain verb phrase" },
      {
        example: "양동이를 차다",
        category: "calque from EN 'kick the bucket'",
      },
      { example: "비밀을 누설하다", category: "plain description" },
      { example: "어쨌든", category: "discourse marker" },
    ],
  },
  hi: {
    positive: ["नौ दो ग्यारह होना", "आँखों का तारा", "हाथ मलना", "बाल बाल बचना"],
    anti: [
      { example: "सोने जाना", category: "plain verb phrase" },
      { example: "बाल्टी मारना", category: "calque from EN 'kick the bucket'" },
      { example: "रहस्य उजागर करना", category: "plain description" },
      { example: "किसी भी हाल में", category: "discourse marker" },
    ],
  },
  ar: {
    positive: [
      "ضرب عصفورين بحجر",
      "يد واحدة لا تصفق",
      "وقع في الفخ",
      "على باب الكريم",
    ],
    anti: [
      { example: "ذهب إلى الفراش", category: "plain verb phrase" },
      { example: "ركل الدلو", category: "calque from EN 'kick the bucket'" },
      { example: "كشف سرا", category: "plain description" },
      { example: "في كل الأحوال", category: "discourse marker" },
    ],
  },
};

export function renderAnchorsForLang(lang: Language): string {
  const a = ANCHORS_BY_LANG[lang];
  return [
    `POSITIVE ANCHORS for ${lang} (true idioms — emit forms like these):`,
    ...a.positive.map((p) => `- ${p}`),
    "",
    `ANTI-ANCHORS for ${lang} (NEVER emit — common failure modes):`,
    ...a.anti.map((x) => `- "${x.example}" — ${x.category}`),
  ].join("\n");
}
