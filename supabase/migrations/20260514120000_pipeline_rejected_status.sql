-- Allow 'rejected' on pipeline.expressions.status so the enrichment gate can
-- mark non-idiomatic expressions and the verify job can flag leakage.

alter table pipeline.expressions
  drop constraint expressions_status_check;

alter table pipeline.expressions
  add constraint expressions_status_check
  check (status in ('seed', 'discovered', 'enriched', 'promoted', 'rejected'));
