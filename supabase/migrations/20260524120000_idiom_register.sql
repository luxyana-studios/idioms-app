-- Add `register` (contemporary_colloquial | contemporary_formal | literary
-- | dated | regional) so the app can surface the stylistic register an
-- idiom belongs to. Populated by the enrich capability and propagated
-- to public.idioms via promote.
--
-- Nullable on both tables: existing rows have no register until they are
-- re-enriched. No backfill — the LLM never silently invents a register
-- for legacy data.

alter table pipeline.enrichments
  add column register text
    check (register in (
      'contemporary_colloquial',
      'contemporary_formal',
      'literary',
      'dated',
      'regional'
    ));

alter table public.idioms
  add column register text
    check (register in (
      'contemporary_colloquial',
      'contemporary_formal',
      'literary',
      'dated',
      'regional'
    ));
