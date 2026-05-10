import type { ExpressionRow, Language } from "../types.js";
import { sql } from "./db.js";
import { normalize } from "./normalize.js";

export async function readExistingKeys(language: Language): Promise<string[]> {
  const rows = await sql<{ expression_key: string }[]>`
    select expression_key
      from pipeline.expressions
     where language = ${language}
  `;
  return rows.map((r) => r.expression_key);
}

export type UpsertResult = {
  row: ExpressionRow;
  isNew: boolean;
};

export async function upsertExpression(input: {
  language: Language;
  expression: string;
  runId: string;
  status?: "seed" | "discovered";
}): Promise<UpsertResult> {
  const status = input.status ?? "seed";

  const inserted = await sql<ExpressionRow[]>`
    insert into pipeline.expressions (language, expression, source_run_id, status)
    values (${input.language}, ${input.expression}, ${input.runId}, ${status})
    on conflict (expression_key, language) do nothing
    returning id, language, expression, expression_key, status
  `;

  if (inserted.length > 0) {
    return { row: inserted[0], isNew: true };
  }

  const key = normalize(input.expression);
  const [existing] = await sql<ExpressionRow[]>`
    select id, language, expression, expression_key, status
      from pipeline.expressions
     where language = ${input.language}
       and expression_key = ${key}
  `;
  return { row: existing, isNew: false };
}

export async function findByKey(
  language: Language,
  key: string,
): Promise<ExpressionRow | null> {
  const [row] = await sql<ExpressionRow[]>`
    select id, language, expression, expression_key, status
      from pipeline.expressions
     where language = ${language}
       and expression_key = ${key}
  `;
  return row ?? null;
}

export async function listAll(): Promise<ExpressionRow[]> {
  return await sql<ExpressionRow[]>`
    select id, language, expression, expression_key, status
      from pipeline.expressions
     order by language, expression_key
  `;
}

export async function countByLanguage(language: Language): Promise<number> {
  const [{ n }] = await sql<{ n: number }[]>`
    select count(*)::int as n
      from pipeline.expressions
     where language = ${language}
  `;
  return n;
}

export async function listDiscoveredFromRun(
  runId: string,
): Promise<ExpressionRow[]> {
  return await sql<ExpressionRow[]>`
    select id, language, expression, expression_key, status
      from pipeline.expressions
     where source_run_id = ${runId}
       and status = 'discovered'
  `;
}
