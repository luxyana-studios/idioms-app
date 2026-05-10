import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { enrichExpression } from "../capabilities/enrichExpression.js";
import { mapWithConcurrency } from "../lib/concurrency.js";
import { sql } from "../lib/db.js";
import {
  listPendingEnrichment,
  listPendingPromotion,
  upsertEnrichment,
} from "../lib/enrichments.js";
import { promoteIdiom, promotePendingLinks } from "../lib/promote.js";
import { finishRun, startRun } from "../lib/runs.js";

type EnrichConfig = {
  concurrency: number;
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
  let enrichFailed = 0;
  let promoted = 0;
  let promoteFailed = 0;

  try {
    const pending = await listPendingEnrichment();
    console.log(`[enrich] ${pending.length} expressions pending enrichment`);

    await mapWithConcurrency(pending, merged.concurrency, async (row) => {
      try {
        const result = await enrichExpression({
          expression: row.expression,
          language: row.language,
        });
        await upsertEnrichment({
          expressionId: row.id,
          enrichment: result,
          runId: run.id,
        });
        await sql`update pipeline.expressions set status = 'enriched' where id = ${row.id}`;
        enriched++;
      } catch (err) {
        enrichFailed++;
        console.error(
          `[enrich] failed for "${row.expression}" (${row.language}):`,
          err instanceof Error ? err.message : err,
        );
      }
    });

    console.log(`[enrich] enriched ${enriched}, failed ${enrichFailed}`);

    const toPromote = await listPendingPromotion();
    console.log(`[enrich] ${toPromote.length} ready for promotion`);

    for (const row of toPromote) {
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
    }

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
          enrichFailed,
          promoted,
          promoteFailed,
          linksPromoted: linkResult.promoted,
          linksStillPending: linkResult.skipped,
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
