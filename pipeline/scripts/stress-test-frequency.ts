// One-off stress test: feed a CURATED list of idioms spanning the full
// frequency spectrum directly into enrichExpression and report what the
// rubric (now with per-language anchors) assigns. Bypasses mining bias —
// mining tends to surface mainstream idioms, so the rare/very_rare buckets
// are never exercised end-to-end. This script tests them directly.
//
// Usage:  npx tsx scripts/stress-test-frequency.ts
import { enrichExpression } from "../src/capabilities/enrichExpression.js";
import { mapWithConcurrency } from "../src/lib/concurrency.js";
import { sql } from "../src/lib/db.js";
import type { Language } from "../src/types.js";

type Bucket = "very_common" | "common" | "uncommon" | "rare" | "very_rare";

type Case = {
  expression: string;
  expected: Bucket;
};

// Hand-curated ES test cases spanning all 5 buckets. The "expected" column
// is the author's best read for what a calibrated rubric should produce —
// not ground truth, since native speakers will disagree on edge cases.
const ES_CASES: Case[] = [
  // Very common — daily-speech staples
  { expression: "meter la pata", expected: "very_common" },
  { expression: "tomar el pelo", expected: "very_common" },
  { expression: "llover a cántaros", expected: "very_common" },

  // Common — widely used but not cliché
  { expression: "pan comido", expected: "common" },
  { expression: "hacer la vista gorda", expected: "common" },
  { expression: "echar una mano", expected: "common" },

  // Uncommon — recognized, not in daily rotation
  { expression: "hacer de tripas corazón", expected: "uncommon" },
  { expression: "dormirse en los laureles", expected: "uncommon" },
  { expression: "tirar la toalla", expected: "uncommon" },

  // Rare — literary / dated / refranero-adjacent
  { expression: "irse por los cerros de Úbeda", expected: "rare" },
  { expression: "vivir en el quinto pino", expected: "rare" },
  { expression: "estar en babia", expected: "rare" },
  { expression: "ir de punta en blanco", expected: "rare" },

  // Very rare — older / specialist / narrow regional
  { expression: "a la chita callando", expected: "very_rare" },
  { expression: "andar a la sopa boba", expected: "very_rare" },
  { expression: "tomar las de Villadiego", expected: "very_rare" },
];

const ORDER: Bucket[] = [
  "very_common",
  "common",
  "uncommon",
  "rare",
  "very_rare",
];
const ORDER_INDEX = new Map(ORDER.map((b, i) => [b, i]));

async function main() {
  const lang: Language = "es";
  console.log(`[stress-test] ${ES_CASES.length} curated ${lang} cases`);

  type Result = Case & { actual: Bucket; register: string; rationale: string };
  const results: Result[] = [];

  await mapWithConcurrency(ES_CASES, 6, async (c) => {
    const r = await enrichExpression({
      expression: c.expression,
      language: lang,
    });
    if (!r.is_idiom || !r.frequency || !r.register) {
      console.warn(`[stress-test] skipped (not an idiom): ${c.expression}`);
      return;
    }
    results.push({
      ...c,
      actual: r.frequency,
      register: r.register,
      rationale: r.frequency_rationale,
    });
  });

  results.sort(
    (a, b) =>
      (ORDER_INDEX.get(a.expected) ?? 99) -
        (ORDER_INDEX.get(b.expected) ?? 99) ||
      a.expression.localeCompare(b.expression),
  );

  console.log("\n=== Per-case (expected → actual) ===");
  for (const r of results) {
    const match = r.expected === r.actual ? "✅" : "❌";
    console.log(
      `${match} ${r.expression.padEnd(34)} ${r.expected.padEnd(11)} → ${r.actual.padEnd(11)} [${r.register.padEnd(24)}] ${r.rationale}`,
    );
  }

  const exact = results.filter((r) => r.expected === r.actual).length;
  const offByOne = results.filter((r) => {
    const e = ORDER_INDEX.get(r.expected) ?? 0;
    const a = ORDER_INDEX.get(r.actual) ?? 0;
    return Math.abs(e - a) === 1;
  }).length;

  const actualDist: Record<Bucket, number> = {
    very_common: 0,
    common: 0,
    uncommon: 0,
    rare: 0,
    very_rare: 0,
  };
  for (const r of results) actualDist[r.actual]++;

  console.log("\n=== Summary ===");
  console.log(
    `exact match:   ${exact}/${results.length}  (${Math.round((100 * exact) / results.length)}%)`,
  );
  console.log(
    `off-by-one:    ${offByOne}/${results.length}  (${Math.round((100 * offByOne) / results.length)}%)`,
  );
  console.log("actual dist:  ", actualDist);

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  sql.end().finally(() => process.exit(1));
});
