import { translateTagLabels } from "../capabilities/translateTagLabels.js";
import { sql } from "../lib/db.js";
import { finishRun, startRun } from "../lib/runs.js";
import { tagsMissingTranslation, upsertTagTranslation } from "../lib/tags.js";
import { LANGUAGES, type Language } from "../types.js";

export async function runSeedTagTranslations(): Promise<void> {
  const run = await startRun("seed-tag-translations", {});
  console.log(`[seed-tag-translations] run ${run.id} starting`);

  const totals: Record<string, number> = {};

  try {
    for (const lang of LANGUAGES.filter((l) => l !== "en") as Language[]) {
      const pending = await tagsMissingTranslation(lang);
      if (pending.length === 0) {
        console.log(`[seed-tag-translations] ${lang}: 0 pending, skipping`);
        totals[lang] = 0;
        continue;
      }

      const translated = await translateTagLabels({
        source: pending.map((t) => ({
          key: t.key,
          facet: t.facet,
          label: t.label,
          description: t.description,
        })),
        targetLang: lang,
      });

      const byKey = new Map(translated.map((t) => [t.key, t]));
      let inserted = 0;
      let missing = 0;

      for (const tag of pending) {
        const t = byKey.get(tag.key);
        if (!t) {
          missing++;
          console.warn(
            `[seed-tag-translations] ${lang}: LLM omitted key "${tag.key}"`,
          );
          continue;
        }
        await upsertTagTranslation({
          tagId: tag.id,
          language: lang,
          label: t.label,
          description: t.description,
        });
        inserted++;
      }

      totals[lang] = inserted;
      console.log(
        `[seed-tag-translations] ${lang}: inserted ${inserted}, missing-from-llm ${missing}`,
      );
    }

    await finishRun(run.id, "succeeded");
    console.log(`[seed-tag-translations] run ${run.id} done`, totals);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await finishRun(run.id, "failed", message);
    throw err;
  } finally {
    await sql.end();
  }
}
