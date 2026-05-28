import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { enrichExpression } from "../capabilities/enrichExpression.js";
import { mapWithConcurrency } from "../lib/concurrency.js";
import { sql } from "../lib/db.js";
import {
  type FrequencyBucket,
  listPendingEnrichment,
  listPendingPromotion,
  type Register,
  upsertEnrichment,
} from "../lib/enrichments.js";
import { promoteIdiom, promotePendingLinks } from "../lib/promote.js";
import { finishRun, startRun } from "../lib/runs.js";
import type { Language } from "../types.js";

type EnrichConfig = {
  concurrency: number;
};

type FrequencySample = {
  expression: string;
  language: Language;
  register: Register;
  frequency: FrequencyBucket;
  rationale: string;
};

const DEFAULT: EnrichConfig = { concurrency: 4 };

export async function runEnrich(
  config: Partial<EnrichConfig> = {},
): Promise<void> {
  const merged: EnrichConfig = {
    concurrency: config.concurrency ?? DEFAULT.concurrency,
  };
  const run = await startRun("enrich", merged);
  console.log(`[enrich] run ${run.id} starting`, merged);

  let enriched = 0;
  let rejected = 0;
  let enrichFailed = 0;
  let promoted = 0;
  let promoteFailed = 0;
  const frequencySamples: FrequencySample[] = [];

  try {
    const pending = await listPendingEnrichment();
    console.log(`[enrich] ${pending.length} expressions pending enrichment`);

    await mapWithConcurrency(pending, merged.concurrency, async (row) => {
      try {
        const result = await enrichExpression({
          expression: row.expression,
          language: row.language,
        });
        if (!result.is_idiom) {
          await sql`update pipeline.expressions set status = 'rejected' where id = ${row.id}`;
          rejected++;
          console.log(
            `[enrich] rejected non-idiom: "${row.expression}" (${row.language}) — ${result.idiom_rationale}`,
          );
          return;
        }
        // enrichExpression guarantees non-null frequency + register when
        // is_idiom=true (it throws otherwise). Assert that contract here so
        // TS narrows the type without re-running the same validation.
        // biome-ignore lint/style/noNonNullAssertion: trusted by enrichExpression contract
        const frequency = result.frequency!;
        // biome-ignore lint/style/noNonNullAssertion: trusted by enrichExpression contract
        const register = result.register!;
        await upsertEnrichment({
          expressionId: row.id,
          enrichment: {
            idiomatic_meaning: result.idiomatic_meaning,
            explanation: result.explanation,
            examples: result.examples,
            frequency,
            register,
          },
          runId: run.id,
        });
        await sql`update pipeline.expressions set status = 'enriched' where id = ${row.id}`;
        enriched++;
        frequencySamples.push({
          expression: row.expression,
          language: row.language,
          register,
          frequency,
          rationale: result.frequency_rationale,
        });
      } catch (err) {
        enrichFailed++;
        console.error(
          `[enrich] failed for "${row.expression}" (${row.language}):`,
          err instanceof Error ? err.message : err,
        );
      }
    });

    const frequencyDistribution = frequencySamples.reduce<
      Record<FrequencyBucket, number>
    >(
      (acc, s) => {
        acc[s.frequency]++;
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
    console.log(
      `[enrich] frequency distribution: ${JSON.stringify(frequencyDistribution)}`,
    );

    console.log(
      `[enrich] enriched ${enriched}, rejected ${rejected}, failed ${enrichFailed}`,
    );

    const toPromote = await listPendingPromotion();
    console.log(`[enrich] ${toPromote.length} ready for promotion`);

    await mapWithConcurrency(toPromote, merged.concurrency, async (row) => {
      try {
        await promoteIdiom(row);
        promoted++;
      } catch (err) {
        promoteFailed++;
        console.error(
          `[enrich] promote failed for "${row.expression}" (${row.language}):`,
          err instanceof Error ? err.message : err,
        );
      }
    });

    const linkResult = await promotePendingLinks();
    console.log(
      `[enrich] promoted ${promoted}/${toPromote.length} idioms, ${linkResult.promoted} links (${linkResult.skipped} pending — both sides not yet promoted)`,
    );

    const outDir = join(process.cwd(), "out", "runs", run.id);
    await mkdir(outDir, { recursive: true });
    await writeFile(
      join(outDir, "enrich.json"),
      JSON.stringify(
        {
          runId: run.id,
          enriched,
          rejected,
          enrichFailed,
          promoted,
          promoteFailed,
          linksPromoted: linkResult.promoted,
          linksStillPending: linkResult.skipped,
          frequencyDistribution,
          frequencySamples,
        },
        null,
        2,
      ),
    );

    await finishRun(run.id, "succeeded");
    console.log(`[enrich] run ${run.id} done`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await finishRun(run.id, "failed", message);
    throw err;
  } finally {
    await sql.end();
  }
}
