import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import {
  type EquivalentSuggestion,
  suggestEquivalents,
} from "../capabilities/suggestEquivalents.js";
import { mapWithConcurrency } from "../lib/concurrency.js";
import { sql } from "../lib/db.js";
import {
  countByLanguage,
  findByKey,
  listAll,
  listDiscoveredFromRun,
  upsertExpression,
} from "../lib/expressions.js";
import { upsertLink } from "../lib/links.js";
import { normalize } from "../lib/normalize.js";
import { finishRun, startRun } from "../lib/runs.js";
import { type ExpressionRow, LANGUAGES, type Language } from "../types.js";

type DiscoveryConfig = {
  topN: number;
  perLanguageCap: number;
  maxIterations: number;
  expressionConcurrency: number;
};

const DEFAULT_CONFIG: DiscoveryConfig = {
  topN: 3,
  perLanguageCap: 200,
  maxIterations: 2,
  expressionConcurrency: 4,
};

const StateAnnotation = Annotation.Root({
  runId: Annotation<string>({ default: () => "", reducer: (_, b) => b }),
  config: Annotation<DiscoveryConfig>({
    default: () => DEFAULT_CONFIG,
    reducer: (_, b) => b,
  }),
  iteration: Annotation<number>({ default: () => 0, reducer: (_, b) => b }),
  pending: Annotation<ExpressionRow[]>({
    default: () => [],
    reducer: (_, b) => b,
  }),
  lastRoundDiscovered: Annotation<number>({
    default: () => 0,
    reducer: (_, b) => b,
  }),
  totalDiscovered: Annotation<number>({
    default: () => 0,
    reducer: (a, b) => a + b,
  }),
  totalLinks: Annotation<number>({
    default: () => 0,
    reducer: (a, b) => a + b,
  }),
});
type State = typeof StateAnnotation.State;

async function processExpression(
  ref: ExpressionRow,
  runId: string,
  config: DiscoveryConfig,
): Promise<{ linksAdded: number }> {
  const otherLangs = LANGUAGES.filter((l) => l !== ref.language) as Language[];
  let linksAdded = 0;

  for (const targetLang of otherLangs) {
    const cap = await countByLanguage(targetLang);
    if (cap >= config.perLanguageCap) continue;

    let suggestions: EquivalentSuggestion[];
    try {
      suggestions = await suggestEquivalents({
        expression: ref.expression,
        sourceLang: ref.language,
        targetLang,
        n: config.topN,
      });
    } catch (err) {
      console.error(
        `[discover] suggestEquivalents failed for "${ref.expression}" → ${targetLang}:`,
        err instanceof Error ? err.message : err,
      );
      continue;
    }

    for (const s of suggestions) {
      const key = normalize(s.expression);
      let target = await findByKey(targetLang, key);

      if (!target) {
        const result = await upsertExpression({
          language: targetLang,
          expression: s.expression,
          runId,
          status: "discovered",
        });
        target = result.row;
      }

      const linkResult = await upsertLink({
        a: ref.id,
        b: target.id,
        score: s.score,
        rationale: s.rationale,
        runId,
      });
      if (linkResult.isNew) linksAdded++;
    }
  }

  return { linksAdded };
}

async function seedNode(_state: State): Promise<Partial<State>> {
  const all = await listAll();
  console.log(`[discover] seed: ${all.length} expressions to process`);
  return { pending: all, iteration: 0 };
}

async function processRoundNode(state: State): Promise<Partial<State>> {
  const round = state.iteration + 1;
  console.log(
    `[discover] round ${round}: processing ${state.pending.length} expressions`,
  );

  const results = await mapWithConcurrency(
    state.pending,
    state.config.expressionConcurrency,
    (ref) => processExpression(ref, state.runId, state.config),
  );
  const linksAdded = results.reduce((s, r) => s + r.linksAdded, 0);

  const newRows = await listDiscoveredFromRun(state.runId);
  const seenIds = new Set(state.pending.map((p) => p.id));
  const fresh = newRows.filter((r) => !seenIds.has(r.id));

  console.log(
    `[discover] round ${round} done: +${linksAdded} links, ${fresh.length} new expressions`,
  );

  return {
    pending: fresh,
    iteration: round,
    lastRoundDiscovered: fresh.length,
    totalDiscovered: fresh.length,
    totalLinks: linksAdded,
  };
}

function shouldContinue(state: State): "process_round" | typeof END {
  if (state.iteration >= state.config.maxIterations) return END;
  if (state.lastRoundDiscovered === 0) return END;
  if (state.pending.length === 0) return END;
  return "process_round";
}

const graph = new StateGraph(StateAnnotation)
  .addNode("seed", seedNode)
  .addNode("process_round", processRoundNode)
  .addEdge(START, "seed")
  .addEdge("seed", "process_round")
  .addConditionalEdges("process_round", shouldContinue, {
    process_round: "process_round",
    [END]: END,
  })
  .compile();

export async function runDiscover(
  config: Partial<DiscoveryConfig> = {},
): Promise<void> {
  const merged: DiscoveryConfig = {
    topN: config.topN ?? DEFAULT_CONFIG.topN,
    perLanguageCap: config.perLanguageCap ?? DEFAULT_CONFIG.perLanguageCap,
    maxIterations: config.maxIterations ?? DEFAULT_CONFIG.maxIterations,
    expressionConcurrency:
      config.expressionConcurrency ?? DEFAULT_CONFIG.expressionConcurrency,
  };
  const run = await startRun("discover", merged);
  console.log(`[discover] run ${run.id} starting`, merged);

  try {
    const finalState = await graph.invoke({
      runId: run.id,
      config: merged,
    });

    const outDir = join(process.cwd(), "out", "runs", run.id);
    await mkdir(outDir, { recursive: true });
    await writeFile(
      join(outDir, "discovery.json"),
      JSON.stringify(
        {
          runId: run.id,
          config: merged,
          iterations: finalState.iteration,
          totalDiscovered: finalState.totalDiscovered,
          totalLinks: finalState.totalLinks,
        },
        null,
        2,
      ),
    );

    await finishRun(run.id, "succeeded");
    console.log(
      `[discover] run ${run.id} done: iterations=${finalState.iteration} discovered=${finalState.totalDiscovered} links=${finalState.totalLinks}`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await finishRun(run.id, "failed", message);
    throw err;
  } finally {
    await sql.end();
  }
}
