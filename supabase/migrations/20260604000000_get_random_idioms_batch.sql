-- Batch random idioms for the Surprise Me feature: returns up to batch_size
-- published idioms in random order, excluding IDs the client has already seen.
-- Returns the same shape as get_idiom_feed (tags, translations, equivalents as
-- jsonb) so the app gets fully-hydrated cards in one round-trip.
--
-- batch_size:    max cards to return
-- exclude_ids:   client-side seen set; excluded from results
-- p_ui_language: used for tag label resolution (falls back to en then key)
create or replace function public.get_random_idioms(
  batch_size int default 20,
  exclude_ids uuid[] default '{}',
  p_ui_language text default 'en'
)
returns table (
  id uuid,
  expression text,
  language_code text,
  idiomatic_meaning text,
  likes_count integer,
  explanation text,
  examples text[],
  source text,
  status text,
  tags jsonb,
  translations jsonb,
  equivalents jsonb,
  created_at timestamptz
)
language sql
volatile
security invoker
set search_path = public
as $$
  select
    i.id,
    i.expression,
    i.language_code,
    i.idiomatic_meaning,
    i.likes_count,
    i.explanation,
    coalesce(i.examples, '{}'::text[]) as examples,
    i.source,
    i.status,
    coalesce(tags.items, '[]'::jsonb) as tags,
    coalesce(translations.items, '[]'::jsonb) as translations,
    coalesce(equivalents.items, '[]'::jsonb) as equivalents,
    i.created_at
  from public.idioms i
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'key', t.key,
        'facet', t.facet,
        'label', coalesce(tt_ui.label, tt_en.label, t.key)
      )
      order by t.facet, t.key
    ) as items
    from public.idiom_tags it
    join public.tags t on t.id = it.tag_id
    left join public.tag_translations tt_ui
      on tt_ui.tag_id = t.id
      and tt_ui.language_code = p_ui_language
    left join public.tag_translations tt_en
      on tt_en.tag_id = t.id
      and tt_en.language_code = 'en'
    where it.idiom_id = i.id
  ) tags on true
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'id', tr.id,
        'idiomId', tr.idiom_id,
        'languageCode', tr.language_code,
        'literalTranslation', tr.literal_translation,
        'idiomaticMeaning', tr.idiomatic_meaning,
        'explanation', tr.explanation,
        'source', tr.source
      )
      order by tr.language_code
    ) as items
    from public.idiom_translations tr
    where tr.idiom_id = i.id
  ) translations on true
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'edgeId', e.edge_id,
        'equivalentId', other.id,
        'expression', other.expression,
        'languageCode', other.language_code,
        'idiomaticMeaning', other.idiomatic_meaning,
        'similarityScore', e.similarity_score,
        'verified', e.verified
      )
      order by e.similarity_score desc, other.language_code, other.expression
    ) as items
    from public.idiom_equivalent_edges e
    join public.idioms other on other.id = e.equivalent_id
    where e.idiom_id = i.id
      and other.status = 'published'
  ) equivalents on true
  where i.status = 'published'
    and id != all(exclude_ids)
  order by random()
  limit batch_size;
$$;

grant execute on function public.get_random_idioms(int, uuid[], text) to anon, authenticated;
