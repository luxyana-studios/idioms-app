-- get_random_idiom (single-item) superseded by get_random_idioms (batch).
-- Drop it so the batch version is the only entry point.
drop function if exists public.get_random_idiom(uuid[]);
