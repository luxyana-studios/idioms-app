import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { verifyIsIdiom } from "../capabilities/verifyIsIdiom.js";
import { mapWithConcurrency } from "../lib/concurrency.js";
import { sql } from "../lib/db.js";
import { finishRun, startRun } from "../lib/runs.js";
import { isLanguage, type Language } from "../types.js";

type VerifyConfig = {
  language?: Language;
  source: "ai_mined" | "all";
  concurrency: number;
  dryRun: boolean;
};

type IdiomRow = {
  id: string;
  expression: string;
  language_code: Language;
  idiomatic_meaning: string;
  source: string;
};

async function loadIdioms(config: VerifyConfig): Promise<IdiomRow[]> {
  if (config.source === "ai_mined" && config.language) {
    return await sql<IdiomRow[]>`
      select id, expression, language_code, idiomatic_meaning, source
        from public.idioms
       where source = 'ai_mined'
         and language_code = ${config.language}
       order by language_code, expression_key
    `;
  }
  if (config.source === "ai_mined") {
    return await sql<IdiomRow[]>`
      select id, expression, language_code, idiomatic_meaning, source
        from public.idioms
       where source = 'ai_mined'
       order by language_code, expression_key
    `;
  }
  if (config.language) {
    return await sql<IdiomRow[]>`
      select id, expression, language_code, idiomatic_meaning, source
        from public.idioms
       where language_code = ${config.language}
       order by language_code, expression_key
    `;
  }
  return await sql<IdiomRow[]>`
    select id, expression, language_code, idiomatic_meaning, source
      from public.idioms
     order by language_code, expression_key
  `;
}

export async function runVerify(
  input: Partial<VerifyConfig> = {},
): Promise<void> {
  const merged: VerifyConfig = {
    language: input.language,
    source: input.source ?? "ai_mined",
    concurrency: input.concurrency ?? 4,
    dryRun: input.dryRun ?? true,
  };

  if (merged.language && !isLanguage(merged.language)) {
    throw new Error(`Invalid language: ${merged.language}`);
  }

  const run = await startRun("verify", {
    language: merged.language ?? null,
    source: merged.source,
    concurrency: merged.concurrency,
    dryRun: merged.dryRun,
  });
  console.log(`[verify] run ${run.id} starting`, merged);

  let kept = 0;
  let rejected = 0;
  let failed = 0;
  const rejections: {
    id: string;
    expression: string;
    language: string;
    rationale: string;
  }[] = [];

  try {
    const idioms = await loadIdioms(merged);
    console.log(`[verify] ${idioms.length} idioms to inspect`);

    await mapWithConcurrency(idioms, merged.concurrency, async (row) => {
      let result: Awaited<ReturnType<typeof verifyIsIdiom>>;
      try {
        result = await verifyIsIdiom({
          expression: row.expression,
          language: row.language_code,
          idiomatic_meaning: row.idiomatic_meaning,
        });
      } catch (err) {
        failed++;
        console.error(
          `[verify] verify failed for "${row.expression}" (${row.language_code}):`,
          err instanceof Error ? err.message : err,
        );
        return;
      }

      if (result.is_idiom) {
        kept++;
        return;
      }

      rejected++;
      rejections.push({
        id: row.id,
        expression: row.expression,
        language: row.language_code,
        rationale: result.rationale,
      });
      console.log(
        `[verify] ${merged.dryRun ? "WOULD DELETE" : "DELETE"} "${row.expression}" (${row.language_code}) — ${result.rationale}`,
      );

      if (!merged.dryRun) {
        await sql.begin(async (tx) => {
          await tx`
            update pipeline.expressions
               set status = 'rejected',
                   public_idiom_id = null
             where public_idiom_id = ${row.id}
          `;
          await tx`delete from public.idioms where id = ${row.id}`;
        });
      }
    });

    console.log(
      `[verify] kept=${kept}, rejected=${rejected}, failed=${failed}, dryRun=${merged.dryRun}`,
    );

    const outDir = join(process.cwd(), "out", "runs", run.id);
    await mkdir(outDir, { recursive: true });
    await writeFile(
      join(outDir, "verify.json"),
      JSON.stringify(
        {
          runId: run.id,
          inspected: idioms.length,
          kept,
          rejected,
          failed,
          dryRun: merged.dryRun,
          rejections,
        },
        null,
        2,
      ),
    );

    await finishRun(run.id, "succeeded");
    console.log(`[verify] run ${run.id} done`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await finishRun(run.id, "failed", message);
    throw err;
  } finally {
    await sql.end();
  }
}
