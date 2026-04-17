-- Data model v1: reshape idioms to match docs/architecture/data-model.md,
-- introduce idiom_translations (cross-language content) and idiom_equivalents
-- (ranked cross-language graph), and gate public reads behind
-- status = 'published'.

-- ── idioms: reshape columns ──────────────────────────────────────────────
alter table public.idioms rename column phrase to expression;
alter table public.idioms rename column definition to idiomatic_meaning;
alter table public.idioms rename column origin to explanation;

alter table public.idioms
  add column language_code text not null default 'en',
  add column tags text[] not null default '{}',
  add column source text not null default 'human',
  add column status text not null default 'draft'
    check (status in ('draft', 'reviewed', 'published'));

alter table public.idioms
  drop column category,
  drop column level,
  drop column users_learned;

alter table public.idioms alter column language_code drop default;

-- Normalized uniqueness: case/whitespace variants collapse.
alter table public.idioms
  add column expression_key text
  generated always as (lower(trim(expression))) stored
  not null;

alter table public.idioms
  add constraint idioms_expression_key_language_unique
  unique (expression_key, language_code);

-- ── idioms RLS: public reads only on published rows ──────────────────────
drop policy "idioms are publicly readable" on public.idioms;

create policy "published idioms are publicly readable"
  on public.idioms
  for select
  to anon, authenticated
  using (status = 'published');

-- ── idiom_equivalents ────────────────────────────────────────────────────
create table public.idiom_equivalents (
  id                uuid        default gen_random_uuid() primary key,
  idiom_id_a        uuid        not null references public.idioms(id) on delete cascade,
  idiom_id_b        uuid        not null references public.idioms(id) on delete cascade,
  verified          boolean     not null default false,
  similarity_score  numeric(3, 2) not null
    check (similarity_score >= 0 and similarity_score <= 1),
  created_at        timestamptz not null default now(),
  unique (idiom_id_a, idiom_id_b),
  check (idiom_id_a < idiom_id_b)
);

create index idiom_equivalents_a_score_idx
  on public.idiom_equivalents (idiom_id_a, similarity_score desc);

create index idiom_equivalents_b_score_idx
  on public.idiom_equivalents (idiom_id_b, similarity_score desc);

alter table public.idiom_equivalents enable row level security;

-- Only surface edges where both sides are published.
create policy "equivalents of published idioms are publicly readable"
  on public.idiom_equivalents
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.idioms i
      where i.id = idiom_equivalents.idiom_id_a and i.status = 'published'
    )
    and exists (
      select 1 from public.idioms i
      where i.id = idiom_equivalents.idiom_id_b and i.status = 'published'
    )
  );

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

alter table public.idiom_translations enable row level security;

create policy "translations of published idioms are publicly readable"
  on public.idiom_translations
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.idioms i
      where i.id = idiom_translations.idiom_id and i.status = 'published'
    )
  );
