# Data Model

## Entity Overview

```
profiles ──< bookmarks >── idioms ──< idiom_equivalents >── idioms
                           idioms ──< idiom_translations
                           idioms ──< idiom_tags >── tags ──< tag_translations
profiles ──< user_deck_saves >── decks ──< deck_idioms >── idioms
profiles ──< decks (owner)
profiles ──< follows >── profiles
```

---

## Tables

### `profiles`
Extends `auth.users`. Created automatically on sign-up via trigger.

```sql
id            uuid PRIMARY KEY REFERENCES auth.users(id)
username      text UNIQUE NOT NULL
avatar_url    text
bio           text
is_premium    boolean DEFAULT false
created_at    timestamptz DEFAULT now()
```

---

### `idioms`
The atomic unit of content. One entry per expression per language.

```sql
id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
expression            text NOT NULL
expression_key        text GENERATED ALWAYS AS (lower(trim(expression))) STORED
language_code         text NOT NULL        -- ISO 639-1: 'en', 'es', 'de', 'fr'
idiomatic_meaning     text NOT NULL        -- in the idiom's own language
explanation           text                 -- etymology, in the idiom's own language
examples              text[]               -- usage in sentences (native language)
source                text DEFAULT 'human' -- 'human' | 'ai_mined'
status                text NOT NULL DEFAULT 'draft' -- 'draft' | 'reviewed' | 'published'
created_at            timestamptz DEFAULT now()
updated_at            timestamptz DEFAULT now()

UNIQUE(expression_key, language_code)  -- normalized: case/whitespace variants collapse
```

Note: `tags text[]` is no longer the intended long-term shape. Tags need canonical identity,
localization, and future browsing/deck semantics, so model them as first-class taxonomy entities.

---

### `idiom_translations`
Cross-language rendering of an idiom's translatable fields. One row per (idiom, target language).
Every supported language except the idiom's own gets a row — enforced by the AI-mining pipeline
(invariant: published idioms have translations in all supported languages). Trigger rejects rows
whose `language_code` matches the parent idiom's.

```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
idiom_id            uuid NOT NULL REFERENCES idioms(id) ON DELETE CASCADE
language_code       text NOT NULL                  -- the target language
literal_translation text NOT NULL                  -- word-for-word rendering in target language
idiomatic_meaning   text NOT NULL                  -- meaning, translated to target language
explanation         text                           -- etymology, translated to target language
source              text NOT NULL DEFAULT 'ai_mined' -- per-translation provenance
created_at          timestamptz NOT NULL DEFAULT now()
updated_at          timestamptz NOT NULL DEFAULT now()

UNIQUE(idiom_id, language_code)
-- trigger: language_code must differ from parent idiom's language_code
```

---

### `idiom_equivalents`
Cross-language graph. Links idioms that express the same idea in different languages.
Stored as undirected pairs (a < b enforced by constraint). Ranked by `similarity_score` so
the app can show multiple candidates ordered by closeness.

```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
idiom_id_a        uuid NOT NULL REFERENCES idioms(id) ON DELETE CASCADE
idiom_id_b        uuid NOT NULL REFERENCES idioms(id) ON DELETE CASCADE
verified          boolean NOT NULL DEFAULT false
similarity_score  numeric(3,2) NOT NULL CHECK (similarity_score BETWEEN 0 AND 1)
created_at        timestamptz NOT NULL DEFAULT now()

UNIQUE(idiom_id_a, idiom_id_b)
CHECK(idiom_id_a < idiom_id_b)   -- prevents duplicates in reverse order

INDEX(idiom_id_a, similarity_score DESC)
INDEX(idiom_id_b, similarity_score DESC)
```

---

### `tags`
Canonical taxonomy concepts attached to idioms. Tags are domain data, not UI-only strings.

```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
key             text UNIQUE NOT NULL      -- stable canonical id, e.g. 'food', 'informal', 'luck'
facet           text NOT NULL             -- e.g. 'theme', 'occasion', 'register', 'meaning'
is_browsable    boolean NOT NULL DEFAULT true
created_at      timestamptz NOT NULL DEFAULT now()
updated_at      timestamptz NOT NULL DEFAULT now()
```

Notes:
- `key` is canonical and language-agnostic
- tag order has no semantic meaning
- if a future "primary classification" is needed, model it explicitly, do not infer it from ordering

---

### `tag_translations`
Localized labels for tags. This is preferred over frontend i18n because tags are taxonomy data,
not static interface copy.

```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
tag_id          uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE
language_code   text NOT NULL
label           text NOT NULL
description     text
created_at      timestamptz NOT NULL DEFAULT now()
updated_at      timestamptz NOT NULL DEFAULT now()

UNIQUE(tag_id, language_code)
```

Notes:
- UI chooses the displayed tag label using the current app language
- missing translations can fall back to a default language or canonical key, per product decision

---

### `idiom_tags`
Many-to-many association between idioms and canonical tags.

```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
idiom_id    uuid NOT NULL REFERENCES idioms(id) ON DELETE CASCADE
tag_id      uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE
created_at  timestamptz NOT NULL DEFAULT now()

UNIQUE(idiom_id, tag_id)
```

Notes:
- pipeline/admin workflows attach canonical tags, not localized labels
- tags are an unordered set of semantic facets on an idiom

---

### `decks`
Curated product decks and user-created collections in the same table.

```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
title           text NOT NULL
description     text
language_code   text                -- null = multi-language deck
owner_type      text NOT NULL       -- 'product' | 'user'
owner_id        uuid REFERENCES profiles(id)  -- null if owner_type = 'product'
visibility      text DEFAULT 'public'          -- 'public' | 'private'
is_premium      boolean DEFAULT false
cover_image_url text
created_at      timestamptz DEFAULT now()
```

Notes:
- decks remain first-class product objects, separate from tags
- tags may help generate, suggest, or maintain decks, but do not replace explicit deck membership
- because decks have ownership, visibility, premium gating, and ordering, they are richer than a tag query alone

---

### `deck_idioms`
Ordered membership of idioms in a deck.

```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
deck_id     uuid NOT NULL REFERENCES decks(id) ON DELETE CASCADE
idiom_id    uuid NOT NULL REFERENCES idioms(id) ON DELETE CASCADE
position    integer NOT NULL DEFAULT 0
created_at  timestamptz DEFAULT now()

UNIQUE(deck_id, idiom_id)
```

---

### `bookmarks`
A user saves an individual idiom (independent of any deck).

```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
idiom_id    uuid NOT NULL REFERENCES idioms(id) ON DELETE CASCADE
created_at  timestamptz DEFAULT now()

UNIQUE(user_id, idiom_id)
```

---

### `user_deck_saves`
A user saves or follows a curated or another user's public deck.

```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
deck_id     uuid NOT NULL REFERENCES decks(id) ON DELETE CASCADE
created_at  timestamptz DEFAULT now()

UNIQUE(user_id, deck_id)
```

---

### `follows`
Social graph. Modelled now, activated in a future phase.

```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
follower_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
following_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
created_at    timestamptz DEFAULT now()

UNIQUE(follower_id, following_id)
CHECK(follower_id != following_id)
```

---

## Row Level Security (RLS)

All tables have RLS enabled. Key policies:

| Table | Read | Write |
|---|---|---|
| `idioms` | Public (only rows where `status = 'published'`) | Service role only (seeding pipeline) |
| `idiom_translations` | Public (only for published parent idioms) | Service role only |
| `idiom_equivalents` | Public | Service role only |
| `tags` | Public | Service role only |
| `tag_translations` | Public | Service role only |
| `idiom_tags` | Public (for published parent idioms) | Service role only |
| `decks` | Public if visibility='public', owner if private | Owner or service role |
| `deck_idioms` | Follows deck visibility | Deck owner or service role |
| `bookmarks` | Owner only | Owner only |
| `user_deck_saves` | Owner only | Owner only |
| `profiles` | Public (username, avatar) | Owner only |
| `follows` | Public | Owner (follower_id) only |

---

## Notes

- `idiom_equivalents` is intentionally undirected — query both directions when fetching equivalents for a given idiom
- The `source` field on `idioms` enables filtering AI-mined vs human-curated content in the admin/review flow
- `is_premium` on both `profiles` and `decks` — user entitlement managed via RevenueCat, synced to `profiles.is_premium`
- `status` on `idioms` gates content visibility: AI-mined entries start as `draft`, move to `reviewed` after human QA, and to `published` when user-visible. Public read policy filters on `status = 'published'`
- Translatable content lives on `idiom_translations`, not on `idioms`. The `idioms` row holds native-language content only; `idiom_translations` holds `literal_translation` + translated `idiomatic_meaning`/`explanation` for every other supported language. Pipeline invariant: a published idiom has translations in all supported languages
- `similarity_score` on `idiom_equivalents` ranks equivalent candidates; the app shows top-N ordered by score (useful when no single exact match exists)
- Tags should be treated as localized taxonomy, not frontend i18n keys. Canonical identity lives on `tags`, localized display lives on `tag_translations`, and idiom membership lives on `idiom_tags`
- Introduce a small set of tag facets early, for example `theme`, `occasion`, `register`, and `meaning`, to support browsing without collapsing all semantics into one flat list
- Decks and tags serve different purposes: tags classify idioms, decks package idioms. Decks may be seeded from tags, but remain curated/user-authored collections with explicit membership and order
