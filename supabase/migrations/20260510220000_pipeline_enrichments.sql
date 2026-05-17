-- Per-expression enrichment payload (native-language meaning, explanation,
-- examples). Lives in pipeline.* until promoted to public.idioms.

create table pipeline.enrichments (
  id                uuid        primary key default gen_random_uuid(),
  expression_id     uuid        not null references pipeline.expressions(id) on delete cascade,
  idiomatic_meaning text        not null,
  explanation       text,
  examples          text[]      not null default '{}',
  source_run_id     uuid        references pipeline.runs(id) on delete set null,
  created_at        timestamptz not null default now(),
  unique (expression_id)
);

-- Map from pipeline.expressions to the public.idioms row it was promoted to,
-- so re-promotion is idempotent and equivalent links can resolve both sides.
alter table pipeline.expressions
  add column public_idiom_id uuid references public.idioms(id) on delete set null;

create index expressions_public_idiom_idx on pipeline.expressions (public_idiom_id);
