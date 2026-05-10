-- Pipeline staging schema. Holds in-progress mining state separate from the
-- public.* corpus. Promoted to public.* by the (future) enrichment job.
-- Service-role only: not exposed via PostgREST, no RLS policies.

create schema if not exists pipeline;

create table pipeline.runs (
  id           uuid        primary key default gen_random_uuid(),
  job          text        not null,
  params       jsonb       not null,
  status       text        not null default 'running'
                  check (status in ('running', 'succeeded', 'failed')),
  error        text,
  started_at   timestamptz not null default now(),
  finished_at  timestamptz
);

create table pipeline.expressions (
  id              uuid        primary key default gen_random_uuid(),
  language        text        not null,
  expression      text        not null,
  expression_key  text        generated always as (lower(trim(expression))) stored,
  status          text        not null default 'seed'
                    check (status in ('seed', 'discovered', 'enriched', 'promoted')),
  source_run_id   uuid        references pipeline.runs(id) on delete set null,
  created_at      timestamptz not null default now(),
  unique (expression_key, language)
);

create index expressions_language_idx on pipeline.expressions (language);
create index expressions_status_idx   on pipeline.expressions (status);
