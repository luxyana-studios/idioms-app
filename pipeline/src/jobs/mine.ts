import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { generateCandidates } from "../capabilities/generateCandidates.js";
import { sql } from "../lib/db.js";
import { readExistingKeys, upsertExpression } from "../lib/expressions.js";
import { normalize } from "../lib/normalize.js";
import { finishRun, startRun } from "../lib/runs.js";
import type { Language } from "../types.js";

export async function runMine(input: {
  language: Language;
  count: number;
}): Promise<void> {
  const run = await startRun("mine", input);
  console.log(
    `[mine] run ${run.id} starting (lang=${input.language}, count=${input.count})`,
  );

  try {
    const avoid = await readExistingKeys(input.language);
    console.log(`[mine] ${avoid.length} existing expressions to avoid`);

    const candidates = await generateCandidates({
      language: input.language,
      count: input.count,
      avoid,
    });
    console.log(`[mine] LLM returned ${candidates.length} candidates`);

    const seenKeys = new Set<string>();
    let inserted = 0;
    let duplicate = 0;
    const accepted: string[] = [];

    for (const expression of candidates) {
      const key = normalize(expression);
      if (seenKeys.has(key)) {
        duplicate++;
        continue;
      }
      seenKeys.add(key);

      const { isNew } = await upsertExpression({
        language: input.language,
        expression,
        runId: run.id,
      });
      if (isNew) {
        inserted++;
        accepted.push(expression);
      } else {
        duplicate++;
      }
    }

    console.log(`[mine] inserted=${inserted}, duplicate=${duplicate}`);

    const outDir = join(process.cwd(), "out", "runs", run.id);
    await mkdir(outDir, { recursive: true });
    await writeFile(
      join(outDir, "seed.json"),
      JSON.stringify(
        {
          runId: run.id,
          language: input.language,
          requested: input.count,
          received: candidates.length,
          inserted,
          duplicate,
          accepted,
        },
        null,
        2,
      ),
    );

    await finishRun(run.id, "succeeded");
    console.log(`[mine] run ${run.id} done`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await finishRun(run.id, "failed", message);
    throw err;
  } finally {
    await sql.end();
  }
}
