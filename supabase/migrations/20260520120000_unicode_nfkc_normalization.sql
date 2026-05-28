-- Recreate expression_key generated columns to use NFKC Unicode normalization.
-- This ensures characters with multiple byte representations (combining marks,
-- CJK half/full-width forms, Arabic presentation forms, ligatures) collapse
-- to the same key for dedup purposes. Required for non-Latin language support.
--
-- Coordinated with pipeline/src/lib/normalize.ts: JS `normalize()` must apply
-- the same `.normalize("NFKC")` so JS-computed keys match SQL-computed keys.

-- ── Pre-flight: refuse to run if existing data would collide under new key ──
do $$
declare
  pipeline_collisions integer;
  public_collisions integer;
begin
  select count(*) into pipeline_collisions
    from (
      select lower(trim(normalize(expression, NFKC))) as new_key, language
        from pipeline.expressions
       group by 1, 2
      having count(*) > 1
    ) c;

  select count(*) into public_collisions
    from (
      select lower(trim(normalize(expression, NFKC))) as new_key, language_code
        from public.idioms
       group by 1, 2
      having count(*) > 1
    ) c;

  if pipeline_collisions > 0 or public_collisions > 0 then
    raise exception
      'NFKC migration: % pipeline collisions, % public collisions detected. Aborting before unique constraint violation. Inspect with: select lower(trim(normalize(expression, NFKC))) as new_key, language[_code], array_agg(id), array_agg(expression) from <table> group by 1,2 having count(*) > 1;',
      pipeline_collisions, public_collisions;
  end if;
end$$;

-- ── pipeline.expressions ─────────────────────────────────────────────────
alter table pipeline.expressions
  drop constraint expressions_expression_key_language_key;

alter table pipeline.expressions
  drop column expression_key;

alter table pipeline.expressions
  add column expression_key text
  generated always as (lower(trim(normalize(expression, NFKC)))) stored;

alter table pipeline.expressions
  add constraint expressions_expression_key_language_key
  unique (expression_key, language);

-- ── public.idioms ────────────────────────────────────────────────────────
alter table public.idioms
  drop constraint idioms_expression_key_language_unique;

alter table public.idioms
  drop column expression_key;

alter table public.idioms
  add column expression_key text
  generated always as (lower(trim(normalize(expression, NFKC)))) stored
  not null;

alter table public.idioms
  add constraint idioms_expression_key_language_unique
  unique (expression_key, language_code);
