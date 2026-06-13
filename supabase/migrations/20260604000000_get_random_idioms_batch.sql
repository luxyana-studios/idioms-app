-- Batch version of get_random_idiom: returns up to batch_size random published
-- idioms in a single round-trip, excluding any IDs already seen by the client.
create or replace function public.get_random_idioms(
  batch_size int default 20,
  exclude_ids uuid[] default '{}'
)
returns setof public.idioms
language sql
volatile
security invoker
set search_path = public
as $$
  select *
  from public.idioms
  where id != all(exclude_ids)
    and status = 'published'
  order by random()
  limit batch_size;
$$;

grant execute on function public.get_random_idioms(int, uuid[]) to anon, authenticated;
