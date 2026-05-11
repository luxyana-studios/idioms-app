import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { assignTags } from "../capabilities/assignTags.js";
import { mapWithConcurrency } from "../lib/concurrency.js";
import { sql } from "../lib/db.js";
import { attachTag, listIdiomsMissingTags } from "../lib/idiomTags.js";
import { finishRun, startRun } from "../lib/runs.js";
import {
  type CanonicalTagWithEn,
  listCanonicalTagsWithEn,
} from "../lib/tags.js";

type TagConfig = {
  concurrency: number;
};

const DEFAULT_CONCURRENCY = 4;

function indexByKey(
  canonical: CanonicalTagWithEn[],
): Map<string, CanonicalTagWithEn> {
  return new Map(canonical.map((t) => [t.key, t]));
}

function filterByFacet(
  keys: string[],
  index: Map<string, CanonicalTagWithEn>,
  facet: string,
): { valid: string[]; rejected: string[] } {
  const valid: string[] = [];
  const rejected: string[] = [];
  for (const k of keys) {
    const tag = index.get(k);
    if (tag && tag.facet === facet) valid.push(k);
    else rejected.push(k);
  }
  return { valid, rejected };
}

export async function runTag(config: Partial<TagConfig> = {}): Promise<void> {
  const merged: TagConfig = {
    concurrency: config.concurrency ?? DEFAULT_CONCURRENCY,
  };
  const run = await startRun("tag", merged);
  console.log(`[tag] run ${run.id} starting`, merged);

  let tagged = 0;
  let skipped = 0;
  let failed = 0;
  let rejectedKeys = 0;

  try {
    const canonical = await listCanonicalTagsWithEn();
    const byKey = indexByKey(canonical);
    console.log(`[tag] canonical vocab: ${canonical.length} tags`);

    const pending = await listIdiomsMissingTags();
    console.log(`[tag] ${pending.length} idioms missing tags`);

    await mapWithConcurrency(pending, merged.concurrency, async (idiom) => {
      let result: Awaited<ReturnType<typeof assignTags>>;
      try {
        result = await assignTags({
          idiom: {
            expression: idiom.expression,
            language: idiom.language_code,
            idiomatic_meaning: idiom.idiomatic_meaning,
          },
          canonical,
        });
      } catch (err) {
        failed++;
        console.error(
          `[tag] assignTags failed for "${idiom.expression}" (${idiom.language_code}):`,
          err instanceof Error ? err.message : err,
        );
        return;
      }

      const meaning = filterByFacet(result.meaning, byKey, "meaning");
      const register = filterByFacet(result.register, byKey, "register");
      const theme = filterByFacet(result.theme, byKey, "theme");
      const occasion = filterByFacet(result.occasion, byKey, "occasion");

      rejectedKeys +=
        meaning.rejected.length +
        register.rejected.length +
        theme.rejected.length +
        occasion.rejected.length;

      if (meaning.valid.length === 0 || register.valid.length === 0) {
        skipped++;
        console.warn(
          `[tag] missing required facet for "${idiom.expression}" (${idiom.language_code}): meaning=${meaning.valid.length}, register=${register.valid.length}`,
        );
        return;
      }

      const allKeys = [
        ...meaning.valid,
        ...register.valid,
        ...theme.valid,
        ...occasion.valid,
      ];
      for (const key of allKeys) {
        const tag = byKey.get(key);
        if (!tag) continue;
        await attachTag({ idiomId: idiom.id, tagId: tag.id });
      }
      tagged++;
    });

    console.log(
      `[tag] tagged=${tagged}, skipped(missing-required)=${skipped}, failed=${failed}, rejected-keys=${rejectedKeys}`,
    );

    const outDir = join(process.cwd(), "out", "runs", run.id);
    await mkdir(outDir, { recursive: true });
    await writeFile(
      join(outDir, "tag.json"),
      JSON.stringify(
        {
          runId: run.id,
          attempted: pending.length,
          tagged,
          skipped,
          failed,
          rejectedKeys,
        },
        null,
        2,
      ),
    );

    await finishRun(run.id, "succeeded");
    console.log(`[tag] run ${run.id} done`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await finishRun(run.id, "failed", message);
    throw err;
  } finally {
    await sql.end();
  }
}
