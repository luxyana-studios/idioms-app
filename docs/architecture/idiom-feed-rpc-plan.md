# Idiom Feed RPC Plan

## Goal

Replace the current scattered idiom catalog reads with one app-facing feed read that returns the complete catalog payload needed by the React Native experience:

- published idioms in the user's active content languages
- localized tag labels for the current UI language
- translations for the active content languages
- equivalent idioms for the active content languages

Keep likes separate as small user-specific state. The feed payload should represent catalog content, while `idiom_likes` remains a personalized interaction cache.

## Current State

The app currently loads server state through several hooks:

- `useUserLanguages()` reads `user_languages` and derives the active content-language scope.
- `useIdioms()` reads `idioms` plus `idiom_tags -> tags -> tag_translations`.
- `useIdiomTranslations(idiomId)` reads `idiom_translations` per idiom.
- `useIdiomEquivalents(idiomId)` reads `idiom_equivalents` twice, once from each edge direction, then reads the equivalent `idioms`.
- `useLikedIdiomIds()` reads `idiom_likes` separately.

The practical result is that Home, Explore, Saved, and Detail mostly share the `useIdioms()` cache, but translations and equivalents are fetched lazily or per mounted feed/detail item.

## Target Data Flow

The target flow should be:

1. Auth initializes.
2. `useUserLanguages()` loads or derives the content-language scope.
3. `useIdioms()` calls one Supabase RPC with the language scope and UI language.
4. The app receives idioms with nested `tags`, `translations`, and `equivalents`.
5. Screens and components derive their views from the single enriched idiom cache.
6. `useLikedIdiomIds()` remains separate and is merged in UI-facing hooks/components where needed.

This gives the frontend one canonical catalog source while preserving the small, frequently-mutated likes cache.

## Database Design

### 1. Add A Normalized Equivalent-Edges View

`idiom_equivalents` stores exactly one physical row per equivalent pair and enforces `idiom_id_a < idiom_id_b`. That is good for data integrity, but reads often need the graph from either side.

Add a read-only view that exposes each physical edge from both idiom perspectives:

```sql
create or replace view public.idiom_equivalent_edges as
select
  id as edge_id,
  idiom_id_a as idiom_id,
  idiom_id_b as equivalent_id,
  similarity_score,
  verified
from public.idiom_equivalents
union all
select
  id as edge_id,
  idiom_id_b as idiom_id,
  idiom_id_a as equivalent_id,
  similarity_score,
  verified
from public.idiom_equivalents;
```

This does not duplicate stored data. It only makes reads simpler:

```sql
where idiom_equivalent_edges.idiom_id = <current idiom id>
```

### 2. Add `get_idiom_feed`

Add a Postgres function exposed through Supabase RPC:

```sql
public.get_idiom_feed(
  p_language_codes text[],
  p_ui_language text default 'en'
)
```

Recommended return style:

```sql
returns table (
  id uuid,
  expression text,
  language_code text,
  idiomatic_meaning text,
  likes_count integer,
  explanation text,
  examples text[],
  source text,
  status text,
  tags jsonb,
  translations jsonb,
  equivalents jsonb,
  created_at timestamptz
)
```

The top-level idiom fields stay typed. Only nested collections use `jsonb`, because SQL rows are flat while the app wants arrays for tags, translations, and equivalents.

Use `language sql`, `stable`, and `security invoker` so the function respects the caller's permissions and RLS policies.

### 3. Function Query Shape

The function should:

- select only `public.idioms` where `status = 'published'`
- filter idioms to `p_language_codes` when the array is non-empty
- aggregate tags with label fallback:
  - first `p_ui_language`
  - then `en`
  - then canonical `tags.key`
- aggregate translations for the current idiom, preferably scoped to `p_language_codes`
- aggregate equivalents through `public.idiom_equivalent_edges`
- join equivalent idiom details from `public.idioms`
- filter equivalent idioms to `status = 'published'`
- preferably filter equivalent idioms to `p_language_codes`
- preserve useful ordering:
  - top-level idioms ordered by selected language order, then `created_at`, then `id`
  - tags ordered by facet/key
  - translations ordered by language
  - equivalents ordered by score descending, then language/expression

Sketch:

```sql
create or replace function public.get_idiom_feed(
  p_language_codes text[],
  p_ui_language text default 'en'
)
returns table (
  id uuid,
  expression text,
  language_code text,
  idiomatic_meaning text,
  likes_count integer,
  explanation text,
  examples text[],
  source text,
  status text,
  tags jsonb,
  translations jsonb,
  equivalents jsonb,
  created_at timestamptz
)
language sql
stable
security invoker
as $$
  select
    i.id,
    i.expression,
    i.language_code,
    i.idiomatic_meaning,
    i.likes_count,
    i.explanation,
    coalesce(i.examples, '{}'::text[]) as examples,
    i.source,
    i.status,
    coalesce(tags.items, '[]'::jsonb) as tags,
    coalesce(translations.items, '[]'::jsonb) as translations,
    coalesce(equivalents.items, '[]'::jsonb) as equivalents,
    i.created_at
  from public.idioms i
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'key', t.key,
        'facet', t.facet,
        'label', coalesce(tt_ui.label, tt_en.label, t.key)
      )
      order by t.facet, t.key
    ) as items
    from public.idiom_tags it
    join public.tags t on t.id = it.tag_id
    left join public.tag_translations tt_ui
      on tt_ui.tag_id = t.id
      and tt_ui.language_code = p_ui_language
    left join public.tag_translations tt_en
      on tt_en.tag_id = t.id
      and tt_en.language_code = 'en'
    where it.idiom_id = i.id
  ) tags on true
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'id', tr.id,
        'idiomId', tr.idiom_id,
        'languageCode', tr.language_code,
        'literalTranslation', tr.literal_translation,
        'idiomaticMeaning', tr.idiomatic_meaning,
        'explanation', tr.explanation,
        'source', tr.source
      )
      order by tr.language_code
    ) as items
    from public.idiom_translations tr
    where tr.idiom_id = i.id
      and (
        coalesce(cardinality(p_language_codes), 0) = 0
        or tr.language_code = any(p_language_codes)
      )
  ) translations on true
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'edgeId', e.edge_id,
        'equivalentId', other.id,
        'expression', other.expression,
        'languageCode', other.language_code,
        'idiomaticMeaning', other.idiomatic_meaning,
        'similarityScore', e.similarity_score,
        'verified', e.verified
      )
      order by e.similarity_score desc, other.language_code, other.expression
    ) as items
    from public.idiom_equivalent_edges e
    join public.idioms other on other.id = e.equivalent_id
    where e.idiom_id = i.id
      and other.status = 'published'
      and (
        coalesce(cardinality(p_language_codes), 0) = 0
        or other.language_code = any(p_language_codes)
      )
  ) equivalents on true
  where i.status = 'published'
    and (
      coalesce(cardinality(p_language_codes), 0) = 0
      or i.language_code = any(p_language_codes)
    )
  order by
    array_position(p_language_codes, i.language_code) nulls last,
    i.created_at,
    i.id;
$$;
```

Notes to validate during implementation:

- Confirm the exact type of `likes_count` in `src/types/supabase.ts`; use the generated DB type as source of truth.
- Decide whether `p_language_codes` should ever be `null`. The function sketch treats `null` and an empty array as "all languages" by using `coalesce(cardinality(...), 0) = 0`.
- Decide whether translations should include all supported target languages or only `p_language_codes`. For the current feed mental model, scoping to active content languages is simpler and lighter.
- Decide whether equivalents should include only active content languages. This keeps feed variants aligned with the user's language scope.
- Confirm whether equivalent idioms should include their tags. The current `useIdiomEquivalents()` does not include tags, so the first pass can keep tags empty for equivalent variants.
- Confirm execute privileges after migration. PostgreSQL grants function execute to `public` by default, but the migration can make this explicit with `grant execute on function public.get_idiom_feed(text[], text) to anon, authenticated;` if the project prefers explicit grants.

## Why RPC Instead Of A Single View

A view can be filtered by the client:

```ts
supabase
  .from("idiom_feed_view")
  .select("*")
  .in("language_code", languageCodes);
```

That is valid for top-level idiom filtering, and Postgres can often push the filter into simple views.

The full feed payload has runtime-dependent nested data:

- tag label fallback depends on the current UI language
- translations may be scoped to selected content languages
- equivalents may be scoped to selected content languages
- future pagination or cursor params likely belong in the same read

A plain view cannot accept those parameters. It would need to expose broader raw data and push shaping back to the client. The RPC gives the app a smaller, stable, app-ready contract.

Use views for reusable raw projections. Use the RPC for final parameterized aggregation.

## React Native Changes

### 1. Update Types

Extend idiom feature types to include nested payloads:

- `IdiomTag` already exists and can remain the tag shape.
- `IdiomTranslation` already exists.
- `IdiomEquivalent` already exists.
- `Idiom` should gain:
  - `translations: IdiomTranslation[]`
  - `equivalents: IdiomEquivalent[]`

If keeping the existing base type is cleaner, introduce:

```ts
type EnrichedIdiom = Idiom & {
  translations: IdiomTranslation[];
  equivalents: IdiomEquivalent[];
};
```

Then migrate screens/hooks to the enriched type.

### 2. Update `useIdioms()`

Change `fetchIdioms()` from `supabase.from("idioms").select(...)` to:

```ts
const { data, error } = await supabase.rpc("get_idiom_feed", {
  p_language_codes: languageCodes,
  p_ui_language: uiLanguage,
});
```

Map RPC rows into app camelCase types:

- `language_code` -> `languageCode`
- `idiomatic_meaning` -> `idiomaticMeaning`
- `likes_count` -> `likesCount`
- `tags` -> `IdiomTag[]`
- `translations` -> `IdiomTranslation[]`
- `equivalents` -> `IdiomEquivalent[]`

Keep the query key:

```ts
["idioms", i18n.language, languageScopeKey]
```

The current dependency on `useUserLanguages()` remains.

### 3. Replace Translation Hook Reads

`useIdiomTranslations(idiomId)` should no longer call the database.

Options:

- Remove it and pass `idiom.translations` directly into components.
- Or keep a compatibility hook that derives from `useIdioms()`:

```ts
export const useIdiomTranslations = (idiomId: string) => {
  const { data: idioms = [], isLoading, isError } = useIdioms();
  const idiom = idioms.find((item) => item.id === idiomId);
  return {
    data: idiom?.translations ?? [],
    isLoading,
    isError,
  };
};
```

Prefer direct props for clarity in detail components, but a compatibility hook can reduce the size of the first refactor.

### 4. Replace Equivalent Hook Reads

`useIdiomEquivalents(idiomId)` should no longer call the database.

Same options as translations:

- Remove it and pass `idiom.equivalents` directly.
- Or keep a compatibility hook that derives from `useIdioms()`.

Because `useVariantCarousel()` currently receives the full `idiom`, it should use `idiom.equivalents` directly and stop mounting per-card equivalent queries.

### 5. Update Components

Update these call sites:

- `FeedCard`
  - `useVariantCarousel(idiom)` should use `idiom.equivalents`.
  - `TranslationOverlay` can receive `idiom.translations`.
- `TranslationOverlay`
  - remove `useIdiomTranslations(idiom.id)` and render from props.
- `TranslationSection`
  - either receive `translations` or receive the full `idiom`.
- `EquivalentsSection`
  - either receive `equivalents` or receive the full `idiom`.
- Detail route
  - still finds the idiom from `useIdioms()`.
  - passes nested arrays to the sections.
- Explore and Saved
  - likely unchanged, except their idiom objects are larger.

### 6. Keep Likes Separate

Leave `useLikedIdiomIds()` and `useToggleIdiomLike()` as the user-specific state path.

The optimistic mutation can continue to update:

- `["idiom-likes", user?.id]`
- `["idioms"]` for `likesCount`

Future improvement: if `likesCount` does not need immediate global accuracy, avoid invalidating the full idiom catalog after every like and only refetch likes. That can be decided separately.

## Testing Plan

### Database

Add migration-level validation manually or through local Supabase checks:

1. `npx supabase db reset`
2. Call the RPC with a typical language scope:

```sql
select *
from public.get_idiom_feed(array['en', 'de', 'es'], 'en')
limit 3;
```

Verify:

- unpublished idioms are excluded
- tag labels use requested UI language, English fallback, then key fallback
- translations are scoped as expected
- equivalents appear from either physical edge side
- equivalent idioms are published
- empty child collections return `[]`, not `null`

### Generated Types

Regenerate Supabase types after adding the migration:

```sh
npx supabase gen types typescript --local > src/types/supabase.ts
npx biome check --write src/types/supabase.ts
```

Confirm `Database["public"]["Functions"]["get_idiom_feed"]` is generated.

### Unit Tests

Update or add focused tests:

- `useIdioms.test.ts`
  - mocks `supabase.rpc`
  - verifies params include `p_language_codes` and `p_ui_language`
  - maps nested `tags`, `translations`, and `equivalents`
  - preserves language-scope gating/error behavior from `useUserLanguages()`
- `useVariantCarousel.test.ts` or equivalent component tests
  - verifies variants derive from `idiom.equivalents` without DB reads
- `TranslationOverlay` / `TranslationSection`
  - render from passed translations
  - handle empty translation arrays
- `EquivalentsSection`
  - render from passed equivalents
  - handle empty equivalent arrays
- `useIdiomLikes.test.tsx`
  - ensure likes behavior is unchanged

Remove or rewrite tests that mock `useIdiomTranslations()` and `useIdiomEquivalents()` as database hooks.

### App Checks

Run:

```sh
npm test
npx biome check .
npx tsc --noEmit
```

Manual UI checks:

- Home feed loads idioms with no per-card equivalent network reads.
- Long-press translation overlay still works.
- Detail translations/equivalents still render.
- Explore filters/search still work.
- Saved still combines idioms with `likedIds`.
- Changing configured languages refreshes the feed payload.
- Changing UI language refreshes tag labels.

## Implementation Phases

### Phase 1: Database Read Model

- Add a migration for `public.idiom_equivalent_edges`.
- Add `public.get_idiom_feed(...)`.
- Run local DB reset.
- Smoke-test SQL by calling the function.
- Regenerate Supabase types.

### Phase 2: Hook Migration

- Update `useIdioms()` to call `supabase.rpc("get_idiom_feed", ...)`.
- Add mapping helpers for nested JSON arrays.
- Extend idiom types.
- Keep `useUserLanguages()` and query key behavior intact.

### Phase 3: Remove Per-Idiom Catalog Reads

- Update `useVariantCarousel()` to use `idiom.equivalents`.
- Update `TranslationOverlay`, `TranslationSection`, and `EquivalentsSection` to consume nested props or derived cached data.
- Remove DB logic from `useIdiomTranslations()` and `useIdiomEquivalents()`, or delete those hooks if call sites no longer need them.

### Phase 4: Tests And Cleanup

- Update tests for the new RPC call and nested data flow.
- Remove obsolete mocks for per-idiom Supabase reads.
- Run tests, typecheck, and lint.
- Review whether any imports or files are now unused.

## Risks And Decisions

### Payload Size

The initial feed read becomes heavier because it includes translations and equivalents. This is intentional for the current product shape, but it should be revisited if the catalog grows significantly.

Potential future mitigations:

- pagination/cursor support in `get_idiom_feed`
- language-scoped translations/equivalents only
- lighter feed RPC plus detail RPC if the product grows beyond feed-first usage

### Generated Function Types

Supabase can generate RPC types, but nested `jsonb` columns may still arrive as broad JSON types. Keep app-level mapping and runtime defaults defensive.

### RLS Behavior

Use `security invoker` unless there is a strong reason not to. The function should respect existing RLS policies for published idioms, translations, tags, and equivalents.

### Ordering

The function should keep the current user-language ordering behavior. If reordering configured languages should reorder feed items without changing the language set, the query key may need to include ordered language codes, not just the sorted `languageScopeKey`.

This is an existing subtle issue: the current key sorts the language codes, while the data sort uses original language order.

## Open Questions

- Should translations include only active content languages, or all supported languages?
- Should equivalents include only active content languages, or all published equivalents?
- Should equivalent variants include tags in the first pass?
- Should the feed query key preserve configured language order so reorder-only changes refresh/re-sort?
- Should like toggles continue invalidating the full `["idioms"]` cache, or should they only patch `likesCount` locally?
