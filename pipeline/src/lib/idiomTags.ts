import type { Language } from "../types.js";
import { sql } from "./db.js";

export type IdiomNeedingTags = {
  id: string;
  expression: string;
  language_code: Language;
  idiomatic_meaning: string;
};

export async function listIdiomsMissingTags(): Promise<IdiomNeedingTags[]> {
  return await sql<IdiomNeedingTags[]>`
    select i.id, i.expression, i.language_code, i.idiomatic_meaning
      from public.idioms i
     where not exists (
       select 1 from public.idiom_tags t where t.idiom_id = i.id
     )
     order by i.language_code, i.expression_key
  `;
}

export async function attachTag(input: {
  idiomId: string;
  tagId: string;
}): Promise<void> {
  await sql`
    insert into public.idiom_tags (idiom_id, tag_id)
    values (${input.idiomId}, ${input.tagId})
    on conflict (idiom_id, tag_id) do nothing
  `;
}
