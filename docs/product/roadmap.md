# Roadmap & Build Order

## Guiding Principle

Get the Idiom Card right before anything else. It is the core experience. Everything else is navigation to and from it.

---

## Build Order

### Phase 1 — Foundation
1. Supabase schema + migrations (dev environment)
2. Seed data: 30–50 high-quality idioms across EN, ES, DE, FR
3. LangChain seeding pipeline (scripts/pipeline)
4. Auth: Google + Apple SSO via Supabase

### Phase 2 — Core Experience
5. Idiom Card screen — the three-layer reveal
6. Cross-language equivalents — tappable links between cards
7. Home / Feed screen with language filter
8. Bookmark (save individual idioms)

### Phase 3 — Discovery
9. Search — expression, keyword, meaning, language filter
10. Browse by Language screen
11. Curated decks — product-provided collections

### Phase 4 — Collections
12. User-created decks (private)
13. Saved / Collection screen (bookmarks + decks)
14. Public user decks + follow

### Phase 5 — Monetisation
15. RevenueCat integration
16. Paywall — triggered at ~10k users
17. Premium curated decks

### Phase 6 — Growth
18. Quiz mode
19. Sharing / deep links
20. User-submitted idioms (moderated)

---

## Content Strategy

- Initial seed: 30–50 idioms, hand-reviewed, across 4 languages
- LangChain pipeline mines structured idiom data from LLMs
- All AI-mined content lands in **staging** first
- Human review required before promoting to **prod**
- Quality bar: literal translation must be accurate and vivid — the aha moment depends on it
- 30 great idioms beat 300 mediocre ones

### Initial Language Set
- English (EN)
- Spanish (ES)
- German (DE)
- French (FR)

---

## Paywall Trigger

- Target: 10,000 active users
- Until then: full free access to build audience and content quality signal
- RevenueCat handles entitlements cross-platform (iOS + Android + Web)
