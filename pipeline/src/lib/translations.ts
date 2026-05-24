import type { Translation } from "../capabilities/translateIdiom.js";
import type { Language } from "../types.js";
import { sql } from "./db.js";

export type IdiomNeedingTranslation = {
  id: string;
  expression: string;
  language_code: Language;
  idiomatic_meaning: string;
};

// Hub-and-spoke translation. Every non-EN idiom translates to EN once
// (collection); every EN-source idiom translates to each other language
// (broadcast). Non-EN ↔ non-EN pairs are NOT translated directly — those
// are resolved at read-time via the display fallback chain (deferred).
export async function listIdiomsMissingTranslation(
  targetLang: Language,
): Promise<IdiomNeedingTranslation[]> {
  if (targetLang === "en") {
    return await sql<IdiomNeedingTranslation[]>`
      select i.id, i.expression, i.language_code, i.idiomatic_meaning
        from public.idioms i
        left join public.idiom_translations t
          on t.idiom_id = i.id and t.language_code = 'en'
       where i.language_code <> 'en'
         and t.id is null
       order by i.language_code, i.expression_key
    `;
  }

  return await sql<IdiomNeedingTranslation[]>`
    select i.id, i.expression, i.language_code, i.idiomatic_meaning
      from public.idioms i
      left join public.idiom_translations t
        on t.idiom_id = i.id and t.language_code = ${targetLang}
     where i.language_code = 'en'
       and t.id is null
     order by i.language_code, i.expression_key
  `;
}

export async function upsertTranslation(input: {
  idiomId: string;
  targetLang: Language;
  translation: Translation;
}): Promise<{ isNew: boolean }> {
  const inserted = await sql<{ id: string }[]>`
    insert into public.idiom_translations
      (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
    values (
      ${input.idiomId},
      ${input.targetLang},
      ${input.translation.literal_translation},
      ${input.translation.idiomatic_meaning},
      ${input.translation.explanation},
      'ai_mined'
    )
    on conflict (idiom_id, language_code) do nothing
    returning id
  `;
  return { isNew: inserted.length > 0 };
}
