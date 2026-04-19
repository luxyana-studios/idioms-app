-- Tags taxonomy: replace idioms.tags text[] with first-class taxonomy
-- (tags, tag_translations, idiom_tags). See docs/decisions/002-tags-taxonomy-and-decks.md.

-- ── tags ─────────────────────────────────────────────────────────────────
create table public.tags (
  id            uuid        default gen_random_uuid() primary key,
  key           text        not null unique,
  facet         text        not null,
  is_browsable  boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index tags_facet_idx on public.tags (facet);

create trigger set_updated_at
  before update on public.tags
  for each row
  execute function public.handle_updated_at();

alter table public.tags enable row level security;

create policy "tags are publicly readable"
  on public.tags
  for select
  to anon, authenticated
  using (true);

-- ── tag_translations ─────────────────────────────────────────────────────
create table public.tag_translations (
  id            uuid        default gen_random_uuid() primary key,
  tag_id        uuid        not null references public.tags(id) on delete cascade,
  language_code text        not null,
  label         text        not null,
  description   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (tag_id, language_code)
);

create trigger set_updated_at
  before update on public.tag_translations
  for each row
  execute function public.handle_updated_at();

alter table public.tag_translations enable row level security;

create policy "tag translations are publicly readable"
  on public.tag_translations
  for select
  to anon, authenticated
  using (true);

-- ── idiom_tags ───────────────────────────────────────────────────────────
create table public.idiom_tags (
  id          uuid        default gen_random_uuid() primary key,
  idiom_id    uuid        not null references public.idioms(id) on delete cascade,
  tag_id      uuid        not null references public.tags(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (idiom_id, tag_id)
);

-- UNIQUE(idiom_id, tag_id) already indexes (idiom_id, ...). Add reverse for browse-by-tag.
create index idiom_tags_tag_id_idx on public.idiom_tags (tag_id);

alter table public.idiom_tags enable row level security;

create policy "idiom tags of published idioms are publicly readable"
  on public.idiom_tags
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.idioms i
      where i.id = idiom_tags.idiom_id and i.status = 'published'
    )
  );

-- ── drop legacy column ───────────────────────────────────────────────────
-- No remote DB yet: drop idioms.tags rather than backfilling. Seed repopulates
-- via idiom_tags on db reset.
alter table public.idioms drop column tags;
