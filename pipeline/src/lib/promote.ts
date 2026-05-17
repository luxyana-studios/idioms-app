import type { ExpressionRow } from "../types.js";
import { sql } from "./db.js";
import type { EnrichmentRow } from "./enrichments.js";

export type PromotionResult = {
  expressionId: string;
  publicIdiomId: string;
};

export async function promoteIdiom(
  row: ExpressionRow & EnrichmentRow,
): Promise<PromotionResult> {
  return await sql.begin(async (tx) => {
    const inserted = await tx<{ id: string }[]>`
      insert into public.idioms
        (expression, language_code, idiomatic_meaning, explanation, examples, source, status)
      values (
        ${row.expression},
        ${row.language},
        ${row.idiomatic_meaning},
        ${row.explanation},
        ${row.examples},
        'ai_mined',
        'draft'
      )
      on conflict (expression_key, language_code) do update set
        idiomatic_meaning = excluded.idiomatic_meaning,
        explanation       = excluded.explanation,
        examples          = excluded.examples,
        source            = excluded.source,
        updated_at        = now()
      returning id
    `;
    const publicIdiomId = inserted[0].id;

    await tx`
      update pipeline.expressions
         set status = 'promoted',
             public_idiom_id = ${publicIdiomId}
       where id = ${row.id}
    `;

    return { expressionId: row.id, publicIdiomId };
  });
}

export type LinkPromotionResult = {
  promoted: number;
  skipped: number;
};

export async function promotePendingLinks(): Promise<LinkPromotionResult> {
  const ready = await sql<
    {
      link_id: string;
      a_public: string;
      b_public: string;
      score: string;
    }[]
  >`
    select l.id as link_id,
           ea.public_idiom_id as a_public,
           eb.public_idiom_id as b_public,
           l.score
      from pipeline.expression_links l
      join pipeline.expressions ea on ea.id = l.a_expression_id
      join pipeline.expressions eb on eb.id = l.b_expression_id
     where l.status = 'pending'
       and ea.public_idiom_id is not null
       and eb.public_idiom_id is not null
  `;

  let promoted = 0;
  for (const link of ready) {
    const [smaller, larger] =
      link.a_public < link.b_public
        ? [link.a_public, link.b_public]
        : [link.b_public, link.a_public];

    await sql.begin(async (tx) => {
      await tx`
        insert into public.idiom_equivalents
          (idiom_id_a, idiom_id_b, similarity_score, verified)
        values (${smaller}, ${larger}, ${link.score}, false)
        on conflict (idiom_id_a, idiom_id_b) do update set
          similarity_score = excluded.similarity_score
      `;
      await tx`
        update pipeline.expression_links
           set status = 'promoted'
         where id = ${link.link_id}
      `;
    });
    promoted++;
  }

  const totalPending = await sql<{ n: number }[]>`
    select count(*)::int as n from pipeline.expression_links where status = 'pending'
  `;

  return { promoted, skipped: totalPending[0].n };
}
