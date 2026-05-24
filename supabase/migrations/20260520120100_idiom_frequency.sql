-- Add `frequency` (common | uncommon | rare) so users can browse idioms
-- by how common they are. Populated by the enrich capability and propagated
-- to public.idioms via promote.

alter table pipeline.enrichments
  add column frequency text
    check (frequency in ('common', 'uncommon', 'rare'));

-- Default 'uncommon' lets seed.sql / manual inserts work without specifying
-- frequency. promote.ts always sets it explicitly from the LLM-populated
-- pipeline.enrichments row, so AI-mined idioms never silently inherit the
-- default.
alter table public.idioms
  add column frequency text not null default 'uncommon'
    check (frequency in ('common', 'uncommon', 'rare'));

create index idioms_language_frequency_idx
  on public.idioms (language_code, frequency);
