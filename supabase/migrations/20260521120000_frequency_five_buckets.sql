-- Expand `frequency` from 3 buckets (common | uncommon | rare) to 5
-- (very_common | common | uncommon | rare | very_rare) so the LLM rubric
-- has more headroom at the tails and surface for "almost cliché" and
-- "specialist / obscure" idioms.
--
-- Existing rows keep their values. The new tails (very_common, very_rare)
-- are only ever set by the LLM during re-enrichment.

do $$
declare
  c text;
begin
  for c in
    select conname
      from pg_constraint
     where conrelid = 'pipeline.enrichments'::regclass
       and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%frequency%'
  loop
    execute format('alter table pipeline.enrichments drop constraint %I', c);
  end loop;
  for c in
    select conname
      from pg_constraint
     where conrelid = 'public.idioms'::regclass
       and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%frequency%'
  loop
    execute format('alter table public.idioms drop constraint %I', c);
  end loop;
end $$;

alter table pipeline.enrichments
  add constraint enrichments_frequency_check
    check (frequency in ('very_common', 'common', 'uncommon', 'rare', 'very_rare'));

alter table public.idioms
  add constraint idioms_frequency_check
    check (frequency in ('very_common', 'common', 'uncommon', 'rare', 'very_rare'));
