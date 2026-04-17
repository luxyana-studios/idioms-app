-- Reshape idioms to match the data model (docs/architecture/data-model.md)
-- and introduce idiom_equivalents for the cross-language graph.

-- ── idioms: reshape columns ──────────────────────────────────────────────
alter table public.idioms rename column phrase to expression;
alter table public.idioms rename column definition to idiomatic_meaning;
alter table public.idioms rename column origin to explanation;

alter table public.idioms
  add column language_code text not null default 'en',
  add column literal_translation text,
  add column tags text[] not null default '{}',
  add column source text not null default 'human',
  add column status text not null default 'draft'
    check (status in ('draft', 'reviewed', 'published'));

-- Drop fields not in the data model
alter table public.idioms
  drop column category,
  drop column level,
  drop column users_learned;

-- Tighten constraints now that the table is reshaped
alter table public.idioms alter column language_code drop default;
alter table public.idioms alter column literal_translation set not null;

alter table public.idioms
  add constraint idioms_expression_language_unique
  unique (expression, language_code);

-- ── idioms RLS: restrict public reads to published rows ──────────────────
drop policy "idioms are publicly readable" on public.idioms;

create policy "published idioms are publicly readable"
  on public.idioms
  for select
  to anon, authenticated
  using (status = 'published');

-- ── idiom_equivalents ────────────────────────────────────────────────────
create table public.idiom_equivalents (
  id          uuid        default gen_random_uuid() primary key,
  idiom_id_a  uuid        not null references public.idioms(id) on delete cascade,
  idiom_id_b  uuid        not null references public.idioms(id) on delete cascade,
  verified    boolean     not null default false,
  created_at  timestamptz not null default now(),
  unique (idiom_id_a, idiom_id_b),
  check (idiom_id_a < idiom_id_b)
);

alter table public.idiom_equivalents enable row level security;

create policy "idiom_equivalents are publicly readable"
  on public.idiom_equivalents
  for select
  to anon, authenticated
  using (true);
