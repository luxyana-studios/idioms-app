// One-off validation: re-enrich every idiom currently in `public.idioms` for a
// given language and report the OLD vs NEW frequency bucket plus the rationale.
// Does NOT write to the DB — purely a calibration check for the rubric in
// `idiomDefinition.ts`. Delete this script once the rubric is settled.
//
// Usage:  npx tsx scripts/validate-frequency.ts [lang]   (default: es)
import { enrichExpression } from "../src/capabilities/enrichExpression.js";
import { mapWithConcurrency } from "../src/lib/concurrency.js";
import { sql } from "../src/lib/db.js";
import type { Language } from "../src/types.js";

type Bucket = "very_common" | "common" | "uncommon" | "rare" | "very_rare";
type Register =
  | "contemporary_colloquial"
  | "contemporary_formal"
  | "literary"
  | "dated"
  | "regional";
type Row = { expression: string; frequency: Bucket };
type Result = {
  expression: string;
  old: Bucket;
  next: Bucket;
  register: Register;
  rationale: string;
};

const lang = ((process.argv[2] as Language) ?? "es") as Language;

async function main() {
  const rows = await sql<Row[]>`
    select expression, frequency
      from public.idioms
     where language_code = ${lang}
     order by expression
  `;
  console.log(`[validate-frequency] ${rows.length} idioms in ${lang}`);

  const results: Result[] = [];
  await mapWithConcurrency(rows, 6, async (row) => {
    const r = await enrichExpression({
      expression: row.expression,
      language: lang,
    });
    if (!r.frequency || !r.register) return;
    results.push({
      expression: row.expression,
      old: row.frequency,
      next: r.frequency,
      register: r.register,
      rationale: r.frequency_rationale,
    });
  });

  results.sort((a, b) => a.expression.localeCompare(b.expression));

  const buckets: Bucket[] = [
    "very_common",
    "common",
    "uncommon",
    "rare",
    "very_rare",
  ];
  const dist = (key: "old" | "next") =>
    buckets.reduce<Record<Bucket, number>>(
      (acc, b) => {
        acc[b] = results.filter((r) => r[key] === b).length;
        return acc;
      },
      {
        very_common: 0,
        common: 0,
        uncommon: 0,
        rare: 0,
        very_rare: 0,
      },
    );

  console.log("\n=== Per-idiom (old → new) ===");
  for (const r of results) {
    const marker = r.old === r.next ? "  " : "→ ";
    console.log(
      `${marker}${r.expression.padEnd(40)} ${r.old.padEnd(9)} → ${r.next.padEnd(9)} [${r.register.padEnd(24)}] ${r.rationale}`,
    );
  }

  console.log("\n=== Distribution (frequency) ===");
  console.log("old: ", dist("old"));
  console.log("new: ", dist("next"));

  const registerDist: Record<Register, number> = {
    contemporary_colloquial: 0,
    contemporary_formal: 0,
    literary: 0,
    dated: 0,
    regional: 0,
  };
  for (const r of results) registerDist[r.register]++;
  console.log("\n=== Distribution (register) ===");
  console.log(registerDist);

  const changed = results.filter((r) => r.old !== r.next);
  console.log(`\n=== Changed: ${changed.length}/${results.length} ===`);
  for (const c of changed) {
    console.log(`  ${c.expression}: ${c.old} → ${c.next}`);
  }

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  sql.end().finally(() => process.exit(1));
});
