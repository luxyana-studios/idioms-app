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
}): Promise<UpsertResult> {
  const key = normalize(input.expression);

  const inserted = await sql<ExpressionRow[]>`
    insert into pipeline.expressions (language, expression, source_run_id)
    values (${input.language}, ${input.expression}, ${input.runId})
    on conflict (expression_key, language) do nothing
    returning id, language, expression, expression_key, status
  `;

  if (inserted.length > 0) {
    return { row: inserted[0], isNew: true };
  }

  const [existing] = await sql<ExpressionRow[]>`
    select id, language, expression, expression_key, status
      from pipeline.expressions
     where language = ${input.language}
       and expression_key = ${key}
  `;
  return { row: existing, isNew: false };
}
