import type { ExpressionRow } from "../types.js";
import { sql } from "./db.js";

export type FrequencyBucket =
  | "very_common"
  | "common"
  | "uncommon"
  | "rare"
  | "very_rare";

export type StoredEnrichment = {
  idiomatic_meaning: string;
  explanation: string;
  examples: string[];
  frequency: FrequencyBucket;
};

export async function upsertEnrichment(input: {
  expressionId: string;
  enrichment: StoredEnrichment;
  runId: string;
}): Promise<void> {
  await sql`
    insert into pipeline.enrichments
      (expression_id, idiomatic_meaning, explanation, examples, frequency, source_run_id)
    values (
      ${input.expressionId},
      ${input.enrichment.idiomatic_meaning},
      ${input.enrichment.explanation},
      ${input.enrichment.examples},
      ${input.enrichment.frequency},
      ${input.runId}
    )
    on conflict (expression_id) do update set
      idiomatic_meaning = excluded.idiomatic_meaning,
      explanation       = excluded.explanation,
      examples          = excluded.examples,
      frequency         = excluded.frequency,
      source_run_id     = excluded.source_run_id
  `;
}

export type EnrichmentRow = {
  expression_id: string;
  idiomatic_meaning: string;
  explanation: string | null;
  examples: string[];
  frequency: FrequencyBucket;
};

export async function listPendingEnrichment(): Promise<ExpressionRow[]> {
  return await sql<ExpressionRow[]>`
    select e.id, e.language, e.expression, e.expression_key, e.status
      from pipeline.expressions e
      left join pipeline.enrichments x on x.expression_id = e.id
     where e.status in ('seed', 'discovered')
       and x.id is null
  `;
}

export async function listPendingPromotion(): Promise<
  (ExpressionRow & EnrichmentRow)[]
> {
  return await sql<(ExpressionRow & EnrichmentRow)[]>`
    select
      e.id, e.language, e.expression, e.expression_key, e.status,
      x.expression_id, x.idiomatic_meaning, x.explanation, x.examples, x.frequency
    from pipeline.expressions e
    join pipeline.enrichments x on x.expression_id = e.id
    where e.status = 'enriched'
      and e.public_idiom_id is null
  `;
}
