-- Idiom feed read model: a single app-facing RPC that returns the full catalog
-- payload (idioms + localized tags + translations + equivalents) for the active
-- content languages, replacing the previous scattered per-idiom reads.

-- ── idiom_equivalent_edges ───────────────────────────────────────────────
-- idiom_equivalents stores one physical row per pair (idiom_id_a < idiom_id_b).
-- Reads need the graph from either side, so expose each edge from both
-- perspectives. security_invoker keeps the caller's RLS on idiom_equivalents
-- in force when the view is read.
create view public.idiom_equivalent_edges
  with (security_invoker = true) as
select
  id as edge_id,
  idiom_id_a as idiom_id,
  idiom_id_b as equivalent_id,
  similarity_score,
  verified
from public.idiom_equivalents
union all
select
  id as edge_id,
  idiom_id_b as idiom_id,
  idiom_id_a as equivalent_id,
  similarity_score,
  verified
from public.idiom_equivalents;

-- ── get_idiom_feed ───────────────────────────────────────────────────────
-- One read returning published idioms in the active content languages, with
-- nested tags (UI-language label, English fallback, then canonical key),
-- translations, and equivalents. Nested collections are jsonb because SQL rows
-- are flat while the app wants arrays. Translations and equivalents are scoped
-- to the active content languages to keep the feed payload light.
--
-- p_language_codes: ordered active content languages. Empty/null = all languages.
-- p_ui_language: UI language used for tag label resolution.
create or replace function public.get_idiom_feed(
  p_language_codes text[],
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
    i.id;
$$;

grant execute on function public.get_idiom_feed(text[], text) to anon, authenticated;
