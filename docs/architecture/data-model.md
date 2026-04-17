# Data Model

## Entity Overview

```
profiles ──< bookmarks >── idioms ──< idiom_equivalents >── idioms
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
language_code         text NOT NULL        -- ISO 639-1: 'en', 'es', 'de', 'fr'
literal_translation   text NOT NULL
idiomatic_meaning     text NOT NULL
explanation           text
examples              text[]               -- usage in sentences
tags                  text[]               -- ['food', 'ease', 'informal']
source                text DEFAULT 'human' -- 'human' | 'ai_mined'
created_at            timestamptz DEFAULT now()

UNIQUE(expression, language_code)
```

---

### `idiom_equivalents`
Cross-language graph. Links idioms that express the same idea in different languages.
Stored as undirected pairs (a < b enforced by constraint).

```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
idiom_id_a    uuid NOT NULL REFERENCES idioms(id)
idiom_id_b    uuid NOT NULL REFERENCES idioms(id)
verified      boolean DEFAULT false
created_at    timestamptz DEFAULT now()

UNIQUE(idiom_id_a, idiom_id_b)
CHECK(idiom_id_a < idiom_id_b)   -- prevents duplicates in reverse order
```

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
| `idioms` | Public | Service role only (seeding pipeline) |
| `idiom_equivalents` | Public | Service role only |
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
