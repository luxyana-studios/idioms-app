-- Edges in the cross-language equivalence graph, pre-promotion.
-- Promoted to public.idiom_equivalents during enrichment.

create table pipeline.expression_links (
  id              uuid        primary key default gen_random_uuid(),
  a_expression_id uuid        not null references pipeline.expressions(id) on delete cascade,
  b_expression_id uuid        not null references pipeline.expressions(id) on delete cascade,
  score           numeric(3, 2) not null check (score between 0 and 1),
  rationale       text,
  source_run_id   uuid        references pipeline.runs(id) on delete set null,
  status          text        not null default 'pending'
                    check (status in ('pending', 'promoted')),
  created_at      timestamptz not null default now(),
  unique (a_expression_id, b_expression_id),
  check (a_expression_id < b_expression_id)
);

create index expression_links_a_idx on pipeline.expression_links (a_expression_id);
create index expression_links_b_idx on pipeline.expression_links (b_expression_id);
