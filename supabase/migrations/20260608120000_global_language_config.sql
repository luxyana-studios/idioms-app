-- global_language_config: the app-wide default catalog of content languages.
-- This is the single source of truth for the fallback languages that used to be
-- hardcoded in the client (DEFAULT_IDIOM_LANGUAGE_CODES + per-code flag/color).
-- Changed once-for-all by an admin via SQL/dashboard (no client write policy);
-- per-user overrides live in user_languages and win over these defaults.
--
-- `enabled` lets a default be retired without losing its color/flag/position.
-- language_code carries no FK/enum (consistent with user_languages): the active
-- catalog is this table's enabled rows, validated through the merge view below.

create table public.global_language_config (
  language_code text        primary key,                    -- ISO 639-1, e.g. 'es'
  color         text        not null
    check (color ~ '^#[0-9A-Fa-f]{6}$'),                    -- '#RRGGBB'
  flag          text        not null,                       -- flag emoji, e.g. '🇪🇸'
  position      integer     not null default 0,             -- default order
  enabled       boolean     not null default true,          -- soft toggle
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index global_language_config_position_idx
  on public.global_language_config (position)
  where enabled;

create trigger set_updated_at
  before update on public.global_language_config
  for each row
  execute function public.handle_updated_at();

alter table public.global_language_config enable row level security;

-- Read-only to clients. No insert/update/delete policy: defaults are changed
-- only via service role (SQL console / dashboard), which bypasses RLS.
create policy "authenticated can read global language config"
  on public.global_language_config
  for select
  to authenticated
  using (true);

-- Seed the previously-hardcoded frontend defaults. Lives in the migration (not
-- seed.sql) because the Supabase deploy workflow runs migrations but NOT seeds,
-- so this is the only way prod gets the catalog.
insert into public.global_language_config (language_code, color, flag, position) values
  ('en', '#3B5BA5', '🇬🇧', 0),
  ('es', '#C96F4A', '🇪🇸', 1),
  ('de', '#5E6B73', '🇩🇪', 2),
  ('fr', '#5B4B8A', '🇫🇷', 3),
  ('it', '#7A8450', '🇮🇹', 4),
  ('pt', '#3E8C84', '🇵🇹', 5),
  ('zh', '#C25B6E', '🇨🇳', 6),
  ('hi', '#D9A441', '🇮🇳', 7),
  ('ar', '#A85638', '🇸🇦', 8),
  ('ja', '#8A4F7D', '🇯🇵', 9),
  ('ko', '#3B5BA5', '🇰🇷', 10)
on conflict (language_code) do nothing;

-- user_language_catalog: per-caller merge of global defaults with the user's own
-- language config. Reads run as the authenticated caller (security_invoker), so
-- the underlying RLS on both tables applies and auth.uid() resolves here.
--
-- The view does the override + bootstrap policy so the client carries no merge
-- logic, while still exposing the flags it needs to render active vs inactive:
--   * color/flag/position are coalesced — user values override defaults.
--   * is_configured  → the user has a row (active/inactive UI split).
--   * in_global      → the language is in the default catalog (addable bucket).
--   * is_active      → feed content scope. When the user has ANY config, only
--                      their rows are active; with zero config we bootstrap to
--                      the full enabled catalog so the feed still shows content.
--
-- FULL OUTER JOIN because a user may have configured a language code that is not
-- (or no longer) in the global catalog; such rows surface with in_global=false.
create view public.user_language_catalog
with (security_invoker = true) as
with user_rows as (
  select language_code, color, flag, position
  from public.user_languages
  where user_id = auth.uid()
),
has_config as (
  select exists (select 1 from user_rows) as v
)
select
  coalesce(u.language_code, g.language_code) as language_code,
  coalesce(u.color, g.color)                 as color,
  coalesce(u.flag, g.flag)                   as flag,
  coalesce(u.position, g.position)           as position,
  (u.language_code is not null)              as is_configured,
  (g.language_code is not null)              as in_global,
  case
    when (select v from has_config) then (u.language_code is not null)
    else true
  end                                        as is_active
from public.global_language_config g
full outer join user_rows u using (language_code)
where g.enabled or u.language_code is not null;

grant select on public.user_language_catalog to authenticated;
