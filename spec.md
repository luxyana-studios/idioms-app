# Spec: Persist idiom likes in Supabase (issue #74)

## Goal

Replace the local-only "save" behavior (MMKV-persisted `savedIds` in
`useIdiomsStore`) with a server-backed **like** that is per-user, syncs across
devices, and supports a public denormalized count per idiom.

Conceptually a rename: the heart button is now a "like" rather than a "save".
The Saved tab continues to show the user's liked idioms (its route name and
display title don't need to change beyond what's specified below).

## Out of scope

- No social feed, no "who else liked this", no notifications.
- No migration of any prior `savedIds` MMKV state into the new table.
- No anonymous likes — must be signed in.

---

## Data model

### Migration: `supabase/migrations/<ts>_idiom_likes.sql`

1. Add denormalized counter to `idioms`:
   ```sql
   alter table public.idioms
     add column likes_count integer not null default 0;
   ```

2. New table `public.idiom_likes`:
   - `id uuid primary key default gen_random_uuid()`
   - `user_id uuid not null references auth.users(id) on delete cascade`
   - `idiom_id uuid not null references public.idioms(id) on delete cascade`
   - `created_at timestamptz not null default now()`
   - `unique (user_id, idiom_id)` — one like per (user, idiom)

3. Indexes:
   - `(user_id, created_at desc)` — power the user's liked-list, newest first
   - `(idiom_id)` — for any future aggregations / lookups

4. RLS:
   - Enable RLS on `idiom_likes`.
   - `select`: user can read their own rows (`user_id = auth.uid()`).
   - `insert`: user can like only their own row AND only published idioms
     (`with check user_id = auth.uid() and exists (select 1 from idioms where id = idiom_likes.idiom_id and status = 'published')`).
   - `delete`: user can delete their own rows.
   - No `update` policy (likes are immutable).

5. Trigger to maintain `idioms.likes_count`:
   - `security definer`, `set search_path = public`.
   - On `INSERT`: increment `likes_count` for the target idiom.
   - On `DELETE`: decrement, floored at 0 (`greatest(likes_count - 1, 0)`).
   - Fires `after insert or delete for each row`.

### Regenerate types

After applying migration locally:
```bash
npx supabase db reset
npx supabase gen types typescript --local > src/types/supabase.ts
npx biome check --write src/types/supabase.ts
```

The generator's nvmrc wrapper prefixes stdout — strip those lines if running
through `npx`, or generate via a direct `supabase` invocation.

---

## App layer

### Types (`src/features/idioms/types.ts`)

Add to `Idiom`:
```ts
likesCount: number;
```

### Fetch (`src/features/idioms/hooks/useIdioms.ts`)

- Select `likes_count` alongside existing columns.
- Map `row.likes_count` to `likesCount` in the camelCase transform.

### New hook: `src/features/idioms/hooks/useIdiomLikes.ts`

Two exports, both using React Query:

#### `useLikedIdiomIds()`

```ts
useQuery({
  queryKey: ["idiom-likes", user?.id],
  enabled: initialized && !!user && !!process.env.EXPO_PUBLIC_SUPABASE_URL,
  queryFn: async () => {
    const { data, error } = await supabase
      .from("idiom_likes")
      .select("idiom_id")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => row.idiom_id);
  },
});
```

Returns the signed-in user's liked idiom IDs, newest-first. RLS scopes
the query implicitly — no `eq("user_id", ...)` needed.

#### `useToggleIdiomLike()`

`useMutation` with optimistic updates:

- **Input**: `{ idiomId: string; isLiked: boolean }` — `isLiked` is the
  *current* state (caller asserts what they think is true; the mutation
  flips it).
- **Auth guards**: if `EXPO_PUBLIC_SUPABASE_URL` is unset, no-op (matches
  placeholder mode used elsewhere). If no `user`, throw with an i18n-able
  error message.
- **Mutation**: if `isLiked`, delete the row by `(user_id, idiom_id)`.
  Otherwise insert. Don't rely on the trigger return for the response.
- **`onMutate`** (optimistic):
  1. Cancel `["idiom-likes", user?.id]` and `["idioms"]` queries.
  2. Snapshot both for rollback (`previousLikedIds`, `previousIdioms` —
     the latter as `getQueriesData` since there may be multiple `["idioms"]`
     entries keyed by UI language).
  3. Update liked-IDs cache: remove on unlike; prepend on like (also
     dedup, in case of double-tap races).
  4. Update every `["idioms"]` cache: adjust `likesCount` by `±1` on the
     matching idiom, floored at 0.
- **`onError`**: restore both snapshots.
- **`onSettled`**: invalidate both query keys to resync with the server
  (this also reconciles any drift from the trigger's actual count).

### Store changes (`src/features/idioms/stores/idioms.store.ts`)

The local-only "save" responsibility moves to the server. The store
collapses to just `currentIndex` / `nextIdiom` for the home card stack —
remove `savedIds`, `saveIdiom`, `unsaveIdiom`, `isSaved`, the MOCK_IDIOMS
constant, MMKV `persist` middleware, and the `partialize` wiring.

Final shape:
```ts
interface IdiomsState {
  currentIndex: number;
  nextIdiom: (total: number) => void;
}
```

No persist middleware. No MMKV import. No mock seed.

### UI wiring

Three call sites consume the new hook:

1. **Home card / `CardActionRow`** — heart button:
   - Replace `isSaved` source from store with `likedIds.includes(idiom.id)`.
   - `onPress` → `toggleIdiomLike.mutate({ idiomId, isLiked })`.
   - Disable while `toggleIdiomLike.isPending && variables?.idiomId === idiom.id`
     to prevent double-fires.
   - On home stack, *also* advance to next card (`nextIdiom(total)`) on press —
     same UX as before for the swipe-like flow.
   - Accessibility label switches between `common.like` / `common.unlike`.
   - Show `likes.count` (formatted) under the card / progress row.

2. **Detail screen (`(home)/[id].tsx`)** — header heart button + caption:
   - Same hook, same disabled-while-pending pattern.
   - Show `likes.count` as a caption under the idiomatic meaning.

3. **Saved screen (`(saved)/index.tsx`)**:
   - Source the list from `useLikedIdiomIds()` + `useIdioms()`
     (filter idioms whose id is in `likedIds`).
   - Show a loading indicator when either query is loading.
   - Heart-remove button on each row calls
     `toggleIdiomLike.mutate({ idiomId, isLiked: true })` (we're unliking).
   - Disable per-row while that idiom's mutation is pending.
   - Show `likes.count` on each row.

The current `origin/main` has the home screen decomposed into
`CardActionRow`, `IdiomCardStack`, `IdiomInfoCard`, etc. Thread the
`isLiked`, `onSave` (rename or keep prop name — see "naming" below),
and `likesCount` through props rather than reaching into the store from
deep components.

### i18n (`src/core/i18n/{en,es}.json`)

Add:
- `common.like` → `"Like"` / `"Me gusta"`
- `common.unlike` → `"Unlike"` / `"Quitar me gusta"`
- `likes.count` → `"{{count}} likes"` / `"{{count}} me gusta"`

Update:
- `saved.empty` from `Save idioms…` / `Guarda modismos…` to
  `Like idioms as you discover them\nand find them here.` /
  `Marca modismos con me gusta mientras los descubres\ny encuéntralos aquí.`

Keep `saved.title`, `saved.count`, `home.saved`, `home.skip` etc.
as-is (route segment is still `(saved)`).

---

## Naming note

The original branch left `CardActionRow`'s prop names as `isSaved` /
`onSave` even though the semantic shifted to "like". For the
reimplementation, prefer renaming those to `isLiked` / `onToggleLike` to
match the new semantics — the component is no longer about saving locally.
This is a small extra refactor on top of the original branch's surface
area.

---

## Edge cases & invariants

- **Double-tap**: optimistic update is idempotent at the cache level
  (dedup on insert path) and the mutation is disabled while pending.
- **Unauth user**: hook is `enabled: false` without a user; mutation
  throws with a user-facing message before hitting the network.
- **Placeholder mode** (no `EXPO_PUBLIC_SUPABASE_URL`): both hooks no-op
  to match the rest of the data layer.
- **Counter drift**: `onSettled` invalidate refetches from the server, so
  optimistic ±1 errors self-heal on next mutation.
- **Trigger correctness**: `greatest(likes_count - 1, 0)` prevents negative
  counts if a row is deleted before its insert was tracked (shouldn't
  happen with RLS, but cheap safety).

---

## Test plan (manual, no automated tests added)

1. `npx supabase db reset` applies migration cleanly.
2. Sign in. Like an idiom on the home card → heart fills, count increments,
   card advances. Pull-to-refresh: state persists.
3. Open detail for that idiom → heart shows liked, count matches.
4. Open Saved tab → idiom appears at top.
5. Unlike from Saved tab → row disappears, count decrements.
6. Sign out, sign back in → liked state restored from server.
7. With Supabase unreachable (kill local stack), tap heart → nothing
   crashes; rollback path restores prior state.

## CI / Deployment notes

- `eefe3cf ci: deploy supabase migrations to prod on main` exists on
  `origin/main`. Once this branch lands on `main`, the workflow will
  apply the migration to the remote Postgres. No extra deploy wiring needed
  in this branch.
- Regenerated `src/types/supabase.ts` must be committed so the `quality`
  CI job's typecheck passes.
