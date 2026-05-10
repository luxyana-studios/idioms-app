import type { RunRow } from "../types.js";
import { sql } from "./db.js";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [k: string]: JsonValue }
  | JsonValue[];

export async function startRun(
  job: string,
  params: Record<string, JsonValue>,
): Promise<RunRow> {
  const [row] = await sql<RunRow[]>`
    insert into pipeline.runs (job, params)
    values (${job}, ${sql.json(params)})
    returning id, job, params, status
  `;
  return row;
}

export async function finishRun(
  id: string,
  status: "succeeded" | "failed",
  error?: string,
): Promise<void> {
  await sql`
    update pipeline.runs
       set status = ${status},
           error = ${error ?? null},
           finished_at = now()
     where id = ${id}
  `;
}
