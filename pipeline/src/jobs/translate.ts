import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { translateIdiom } from "../capabilities/translateIdiom.js";
import { mapWithConcurrency } from "../lib/concurrency.js";
import { sql } from "../lib/db.js";
import { normalize } from "../lib/normalize.js";
import { finishRun, startRun } from "../lib/runs.js";
import {
  listIdiomsMissingTranslation,
  upsertTranslation,
} from "../lib/translations.js";
import type { Language } from "../types.js";

type TranslateConfig = {
  targetLanguage: Language;
  concurrency: number;
};

const DEFAULT_CONCURRENCY = 4;

export async function runTranslate(input: {
  targetLanguage: Language;
  concurrency?: number;
}): Promise<void> {
  const merged: TranslateConfig = {
    targetLanguage: input.targetLanguage,
    concurrency: input.concurrency ?? DEFAULT_CONCURRENCY,
  };
  const run = await startRun("translate", merged);
  console.log(`[translate] run ${run.id} starting`, merged);

  let translated = 0;
  let failed = 0;
  let collapsedLiteral = 0;

  try {
    const pending = await listIdiomsMissingTranslation(merged.targetLanguage);
    console.log(
      `[translate] ${pending.length} idioms missing ${merged.targetLanguage} translation`,
    );

    await mapWithConcurrency(pending, merged.concurrency, async (idiom) => {
      try {
        const t = await translateIdiom({
          expression: idiom.expression,
          sourceLang: idiom.language_code,
          targetLang: merged.targetLanguage,
          sourceMeaning: idiom.idiomatic_meaning,
        });

        if (
          normalize(t.literal_translation) === normalize(t.idiomatic_meaning)
        ) {
          collapsedLiteral++;
          console.warn(
            `[translate] literal == meaning for "${idiom.expression}" (${idiom.language_code} → ${merged.targetLanguage}); skipping`,
          );
          return;
        }

        const { isNew } = await upsertTranslation({
          idiomId: idiom.id,
          targetLang: merged.targetLanguage,
          translation: t,
        });
        if (isNew) translated++;
      } catch (err) {
        failed++;
        console.error(
          `[translate] failed for "${idiom.expression}" → ${merged.targetLanguage}:`,
          err instanceof Error ? err.message : err,
        );
      }
    });

    console.log(
      `[translate] inserted ${translated}, failed ${failed}, collapsed-literal ${collapsedLiteral}`,
    );

    const outDir = join(process.cwd(), "out", "runs", run.id);
    await mkdir(outDir, { recursive: true });
    await writeFile(
      join(outDir, "translate.json"),
      JSON.stringify(
        {
          runId: run.id,
          targetLanguage: merged.targetLanguage,
          attempted: pending.length,
          translated,
          failed,
          collapsedLiteral,
        },
        null,
        2,
      ),
    );

    await finishRun(run.id, "succeeded");
    console.log(`[translate] run ${run.id} done`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await finishRun(run.id, "failed", message);
    throw err;
  } finally {
    await sql.end();
  }
}
