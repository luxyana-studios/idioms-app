# 002: Tags as localized taxonomy, separate from decks

## Status
Accepted

## Context
The initial idiom model used `idioms.tags text[]` as a lightweight place to store labels such as `food`, `ease`, or `informal`.

That shape is no longer sufficient for the intended product direction.

Tags are expected to support more than card display:
- semantic annotation from the mining pipeline
- browsing and filtering
- grouping and discovery
- future deck generation and deck curation assistance
- possible recommendation or similarity signals later

Tags also need to be translatable, and display should align with the current UI language.

At the same time, the data model already introduces first-class `decks` with ownership, visibility, premium gating, ordering, and explicit idiom membership. This means tags and decks should not be collapsed into the same concept.

## Decision
Treat tags as first-class localized taxonomy data.

Concretely:
- tags have a canonical language-agnostic identity
- translated tag labels live in data, not in frontend i18n files
- idioms link to tags through a join table
- tag order carries no semantic meaning
- if a future primary classification is needed, it must be modeled explicitly
- decks remain separate first-class collections of idioms

## Why not frontend i18n
Tag translation should not be handled as static UI copy because tags are domain data, not interface strings.

If tags were defined only in frontend i18n:
- taxonomy would be coupled to frontend deploys
- pipeline/admin workflows could emit tags unknown to the app
- canonical identity and display label would be conflated
- browsing and querying would depend on presentation-layer keys

Instead, canonical identity should stay stable in the database, while the app resolves localized labels at read time using the current UI language.

## Why not `tags[0]` as primary
Array position should not imply meaning.

Using `tags[0]` as a primary tag would make product semantics depend on pipeline ordering, which is fragile and hard to validate. If the product later needs a single highlighted category or canonical grouping, that should be represented explicitly rather than inferred from insertion order.

## Tag facets
A flat tag list would quickly become muddy because it mixes several dimensions together.

The preferred direction is to introduce a small number of tag facets early, for example:
- `theme` or `category`
- `occasion`
- `register`
- `meaning`

This keeps everything under one tag system while supporting clearer browsing, cleaner mining prompts, and more flexible future deck generation.

## Deck relationship
Tags and decks have different jobs.

- tags classify idioms semantically
- decks package idioms for discovery and learning

Decks may be inspired by or even initially generated from tags, but they remain richer product objects because they support:
- identity
- explicit membership
- ordering
- ownership
- visibility
- premium gating

So a deck is not just "all idioms with tag X" even if tags may help produce such a deck.

## Consequences
This direction should support:
- mining pipeline assignment of canonical tags
- localized display of tags based on UI language
- browsing by facet, such as theme, occasion, or register
- future curation or generation of decks from tag signals
- stable querying and analytics over canonical tags

It also means the implementation should move away from raw string-array tags toward a relational taxonomy model.
