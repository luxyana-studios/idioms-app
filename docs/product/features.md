# Features & Screens

## The 5 Core Screens

### 1. Home / Feed
The daily entry point.
- Idiom of the Day featured at the top
- Scrollable feed of idiom cards
- Language filter chips (All / EN / ES / DE / FR / …)
- No gamification, no streaks — just idioms

### 2. Idiom Card (Detail)
The most important screen. The three-layer reveal lives here.
- Expression
- Literal meaning (what the words actually say)
- Idiomatic meaning (what it really means)
- Usage examples in context
- Cross-language equivalents — tappable, each links to that idiom's card
- Language + cultural origin tag
- Save / bookmark button
- Deck membership (which curated or user deck this belongs to)

### 3. Search
Fast, language-aware lookup.
- Search by expression, keyword, or meaning
- Filter by language
- Results show card previews (expression + literal meaning at a glance)

### 4. Saved / Collection
The user's personal library.
- Bookmarked individual idioms
- User-created decks
- Saved curated decks
- Optionally grouped by language

### 5. Browse by Language
Makes multi-language feel intentional, not bolted on.
- Grid or list of available languages
- Tap into a language to explore its idiom set
- Entry point for curated decks per language

---

## Decks / Collections Model

Both product-curated and user-created decks exist from day one, in the same model.

**Curated decks** — created and maintained by the product team. Examples:
- "Food Idioms in Spanish"
- "Business English Idioms"
- "Emotions in German"

**User decks** — created by users. Can be private or public. Users can follow other users' public decks.

Users can also bookmark individual idioms independently of any deck.

---

## Auth

- Google SSO
- Apple SSO (required for iOS App Store)
- Email / password fallback
- Bookmarks and personal decks require an account
- Browsing and reading is available without an account

---

## Paywall

- Introduced at ~10k users
- Implemented via RevenueCat
- Exact feature gating TBD — likely: unlimited personal decks, premium curated decks, no ads
- Free tier remains generous to support growth

---

## Social Features (Future)

Not in v1, but modelled in the DB from the start:
- Follow other users
- Public user decks discoverable in Browse
- Sharing individual idiom cards

---

## What's Cut for Now

- Quiz mode (v3+)
- Notifications / streaks
- User-generated idiom submissions (only deck creation is in scope early)
