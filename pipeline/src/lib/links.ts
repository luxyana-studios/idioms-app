import { sql } from "./db.js";

export async function upsertLink(input: {
  a: string;
  b: string;
  score: number;
  rationale: string;
  runId: string;
}): Promise<{ isNew: boolean }> {
  const [aId, bId] =
    input.a < input.b ? [input.a, input.b] : [input.b, input.a];

  const inserted = await sql<{ id: string }[]>`
    insert into pipeline.expression_links
      (a_expression_id, b_expression_id, score, rationale, source_run_id)
    values (${aId}, ${bId}, ${input.score}, ${input.rationale}, ${input.runId})
    on conflict (a_expression_id, b_expression_id) do nothing
    returning id
  `;
  return { isNew: inserted.length > 0 };
}
