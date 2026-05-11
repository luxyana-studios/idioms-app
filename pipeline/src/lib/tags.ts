import type { Language } from "../types.js";
import { sql } from "./db.js";

export type CanonicalTag = {
  id: string;
  key: string;
  facet: string;
};

export type CanonicalTagWithEn = CanonicalTag & {
  label: string;
  description: string;
};

export async function listCanonicalTags(): Promise<CanonicalTag[]> {
  return await sql<CanonicalTag[]>`
    select id, key, facet from public.tags order by facet, key
  `;
}

export async function listCanonicalTagsWithEn(): Promise<CanonicalTagWithEn[]> {
  return await sql<CanonicalTagWithEn[]>`
    select t.id, t.key, t.facet, tt.label, tt.description
      from public.tags t
      join public.tag_translations tt
        on tt.tag_id = t.id and tt.language_code = 'en'
     order by t.facet, t.key
  `;
}

export async function tagsMissingTranslation(
  targetLang: Language,
): Promise<CanonicalTagWithEn[]> {
  return await sql<CanonicalTagWithEn[]>`
    select t.id, t.key, t.facet, en.label, en.description
      from public.tags t
      join public.tag_translations en
        on en.tag_id = t.id and en.language_code = 'en'
      left join public.tag_translations tgt
        on tgt.tag_id = t.id and tgt.language_code = ${targetLang}
     where tgt.id is null
     order by t.facet, t.key
  `;
}

export async function upsertTagTranslation(input: {
  tagId: string;
  language: Language;
  label: string;
  description: string;
}): Promise<void> {
  await sql`
    insert into public.tag_translations (tag_id, language_code, label, description)
    values (${input.tagId}, ${input.language}, ${input.label}, ${input.description})
    on conflict (tag_id, language_code) do update set
      label       = excluded.label,
      description = excluded.description,
      updated_at  = now()
  `;
}
