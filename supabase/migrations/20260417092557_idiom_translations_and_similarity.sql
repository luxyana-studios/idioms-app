-- Split translatable content into idiom_translations,
-- add a normalized uniqueness key for expressions,
-- and add similarity_score to idiom_equivalents.

-- ── idioms: drop literal_translation (moves to translations) ─────────────
alter table public.idioms drop column literal_translation;

-- ── idioms: normalized uniqueness via generated column ───────────────────
alter table public.idioms
  drop constraint idioms_expression_language_unique;

alter table public.idioms
  add column expression_key text
  generated always as (lower(trim(expression))) stored;

alter table public.idioms
  add constraint idioms_expression_key_language_unique
  unique (expression_key, language_code);

-- ── idiom_translations ───────────────────────────────────────────────────
create table public.idiom_translations (
  id                  uuid        default gen_random_uuid() primary key,
  idiom_id            uuid        not null references public.idioms(id) on delete cascade,
  language_code       text        not null,
  literal_translation text        not null,
  idiomatic_meaning   text        not null,
  explanation         text,
  source              text        not null default 'ai_mined',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (idiom_id, language_code)
);

create trigger set_updated_at
  before update on public.idiom_translations
  for each row
  execute function public.handle_updated_at();

-- Enforce: a translation's language must differ from the parent idiom's.
create or replace function public.enforce_translation_language_differs()
returns trigger as $$
declare
  parent_language text;
begin
  select language_code into parent_language
  from public.idioms
  where id = new.idiom_id;

  if parent_language = new.language_code then
    raise exception
      'idiom_translations.language_code (%) must differ from parent idiom language (%)',
      new.language_code, parent_language;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger enforce_translation_language_differs
  before insert or update on public.idiom_translations
  for each row
  execute function public.enforce_translation_language_differs();

-- RLS: public read only for translations of published idioms.
alter table public.idiom_translations enable row level security;

create policy "translations of published idioms are publicly readable"
  on public.idiom_translations
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.idioms i
      where i.id = idiom_translations.idiom_id
        and i.status = 'published'
    )
  );

-- ── idiom_equivalents: similarity score ──────────────────────────────────
alter table public.idiom_equivalents
  add column similarity_score numeric(3, 2) not null
  check (similarity_score >= 0 and similarity_score <= 1);

create index idiom_equivalents_a_score_idx
  on public.idiom_equivalents (idiom_id_a, similarity_score desc);

create index idiom_equivalents_b_score_idx
  on public.idiom_equivalents (idiom_id_b, similarity_score desc);
