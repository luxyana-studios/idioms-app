-- Create idioms table
create table public.idioms (
  id             uuid        default gen_random_uuid() primary key,
  phrase         text        not null,
  definition     text        not null,
  category       text        not null,
  level          text        not null,
  users_learned  integer     not null default 0,
  origin         text,
  examples       text[]      default '{}',
  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null
);

-- Enable RLS
alter table public.idioms enable row level security;

-- Public read access (anon + authenticated)
create policy "idioms are publicly readable"
  on public.idioms
  for select
  to anon, authenticated
  using (true);

-- Auto-update updated_at on row change
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.idioms
  for each row
  execute function public.handle_updated_at();
