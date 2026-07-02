-- Allow unauthenticated (anon) clients to read the global language catalog.
-- This is needed for the onboarding language-picker screen, which renders
-- before the user has created an account.
create policy "anon can read global language config"
  on public.global_language_config
  for select
  to anon
  using (true);
