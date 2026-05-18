alter table public.idioms
  add column likes_count integer not null default 0
    check (likes_count >= 0);

create table public.idiom_likes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  idiom_id   uuid not null references public.idioms(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, idiom_id)
);

create index idiom_likes_user_created_idx
  on public.idiom_likes (user_id, created_at desc);

create index idiom_likes_idiom_idx
  on public.idiom_likes (idiom_id);

alter table public.idiom_likes enable row level security;

create policy "users can read their own idiom likes"
  on public.idiom_likes
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "users can like published idioms"
  on public.idiom_likes
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.idioms i
      where i.id = idiom_likes.idiom_id
        and i.status = 'published'
    )
  );

create policy "users can unlike their own idiom likes"
  on public.idiom_likes
  for delete
  to authenticated
  using (user_id = auth.uid());

create or replace function public.handle_idiom_likes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.idioms
    set likes_count = likes_count + 1
    where id = new.idiom_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.idioms
    set likes_count = greatest(likes_count - 1, 0)
    where id = old.idiom_id;
    return old;
  end if;

  return null;
end;
$$;

create trigger idiom_likes_count_trigger
  after insert or delete on public.idiom_likes
  for each row
  execute function public.handle_idiom_likes_count();
