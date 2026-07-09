-- Paginate the idiom feed: add optional p_limit / p_offset to get_idiom_feed so
-- the home feed can load one page at a time instead of the whole catalog. Other
-- callers (explore, saved, language counts) omit both args and still receive the
-- full ordered payload — p_limit null means "no limit".
--
-- The feed ordering is deterministic (configured language order, then created_at,
-- then id), so offset paging over a stable catalog yields non-overlapping pages.

-- Adding parameters changes the function signature, so drop the old 2-arg form
-- first (CREATE OR REPLACE only replaces a matching signature).
drop function if exists public.get_idiom_feed(text[], text);

create function public.get_idiom_feed(
  p_language_codes text[],
  p_ui_language text default 'en',
  p_limit integer default null,
  p_offset integer default 0
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
stable
security invoker
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
      and (
        coalesce(cardinality(p_language_codes), 0) = 0
        or tr.language_code = any(p_language_codes)
      )
  ) translations on true
  -- TODO(#126): only direct (1-hop) edges are returned. Transitive clusters
  -- (cross-language siblings linked through a hub idiom) are not surfaced yet.
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
      and (
        coalesce(cardinality(p_language_codes), 0) = 0
        or other.language_code = any(p_language_codes)
      )
  ) equivalents on true
  where i.status = 'published'
    and (
      coalesce(cardinality(p_language_codes), 0) = 0
      or i.language_code = any(p_language_codes)
    )
  order by
    array_position(p_language_codes, i.language_code) nulls last,
    i.created_at,
    i.id
  limit p_limit
  offset greatest(p_offset, 0);
$$;

grant execute on function public.get_idiom_feed(text[], text, integer, integer)
  to anon, authenticated;
