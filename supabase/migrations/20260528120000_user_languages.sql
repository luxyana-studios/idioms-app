-- user_languages: per-user set of content languages the user wants to explore,
-- each with a user-chosen display color and flag. Row presence = "selected".
-- This is the durable, cross-device content scope: languages the user does not
-- select are filtered out of the feed, quick filters, and equivalent browsing.
--
-- No profiles table exists yet, so reference auth.users directly (consistent
-- with idiom_likes). color/flag are user-owned data (like cover_image_url),
-- not UI-theme tokens. language_code is validated app-side against the current
-- fixed frontend catalog (DEFAULT_IDIOM_LANGUAGE_CODES), so it carries no
-- FK/enum constraint here; deriving the set dynamically from distinct
-- idioms.language_code is deferred to increment 3.

create table public.user_languages (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  language_code text        not null,                       -- ISO 639-1, e.g. 'es'
  color         text        not null
    check (color ~ '^#[0-9A-Fa-f]{6}$'),                    -- '#RRGGBB'
  flag          text        not null,                       -- flag emoji, e.g. '🇪🇸'
  position      integer     not null default 0,             -- order in quick-filter bar
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, language_code)
);

create index user_languages_user_position_idx
  on public.user_languages (user_id, position);

create trigger set_updated_at
  before update on public.user_languages
  for each row
  execute function public.handle_updated_at();

alter table public.user_languages enable row level security;

create policy "users can read their own language config"
  on public.user_languages
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "users can add their own language config"
  on public.user_languages
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "users can update their own language config"
  on public.user_languages
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "users can remove their own language config"
  on public.user_languages
  for delete
  to authenticated
  using (user_id = auth.uid());
