-- Returns a single random published idiom, excluding any IDs in exclude_ids.
-- Uses SECURITY INVOKER so the existing RLS policy (status = 'published') applies.
-- SETOF idioms lets PostgREST follow foreign keys (idiom_tags, etc.) via .select().
create or replace function public.get_random_idiom(exclude_ids uuid[] default '{}')
returns setof public.idioms
language sql
stable
security invoker
set search_path = public
as $$
  select *
  from public.idioms
  where id != all(exclude_ids)
    and status = 'published'
  order by random()
  limit 1;
$$;

grant execute on function public.get_random_idiom to anon, authenticated;
