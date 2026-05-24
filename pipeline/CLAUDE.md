# Pipeline (`pipeline/`)

LLM-driven data-mining package that seeds the multilingual idiom corpus. It is a **separate
TypeScript package** from the app (different `package.json`, different `tsconfig.json`,
different deps). It is not bundled with the app; it runs as a Node CLI against the local
Supabase Postgres, writing into `pipeline.*` staging tables and promoting to `public.*`.

## Quick commands

```bash
# From repo root
cd pipeline && npm install

# Languages: en es de fr it pt zh ja ko hi ar (11 total).
# Each job is idempotent and resumable. All write to `pipeline.runs` for observability.
npm run mine -- --lang <lang> [--count <n>]                  # generate seed candidates
npm run discover -- [--top-n <n>] [--per-lang-cap <n>] [--max-iter <n>] [--concurrency <n>]
npm run enrich -- [--concurrency <n>]                        # enrich + promote to public.idioms
npm run translate -- --lang <lang> [--concurrency <n>]       # hub-and-spoke; see "Translation" below
npm run seed-tag-translations                                # one-off: backfill non-EN tag labels
npm run tag -- [--concurrency <n>]
npm run verify -- [--lang <...>] [--source <ai_mined|all>] [--concurrency <n>] [--commit]

# Backups
npm run db:backup                       # snapshot corpus → pipeline/backups/<ts>.dump
npm run db:restore -- <dump-file>       # populate clean DB from dump (truncate + pg_restore)

npm run lint            # biome check
npm run lint:fix        # biome check --write
npm run typecheck       # tsc --noEmit
```

## Architecture

### Pipeline stages

```
mine        → pipeline.expressions (status='seed')
discover    → pipeline.expressions (status='discovered') + pipeline.expression_links
enrich      → pipeline.enrichments + status='enriched' → status='promoted' + public.idioms
                                                       + public.idiom_equivalents
translate   → public.idiom_translations
tag         → public.idiom_tags
verify      → second-pass LLM gate; can delete leaked non-idioms (writes pipeline status='rejected')
```

`seed-tag-translations` is a one-off that backfills non-EN labels for the canonical tag
taxonomy seeded by `supabase/migrations/20260511070000_seed_tags_canonical.sql`. It iterates
every non-EN language in the `LANGUAGES` tuple; run once after pulling the canonical
migration, again whenever a new language is added to the enum.

### Directory layout

```
pipeline/src/
├── cli.ts                  # entrypoint — switch on `process.argv[2]` to a job
├── types.ts                # Language enum, ExpressionRow / RunRow row types
├── capabilities/           # one file per LLM call — pure, no DB
│   ├── idiomDefinition.ts  # shared prompt primitives + per-lang anchors
│   ├── generateCandidates.ts
│   ├── suggestEquivalents.ts
│   ├── enrichExpression.ts
│   ├── translateIdiom.ts
│   ├── translateTagLabels.ts
│   ├── assignTags.ts
│   └── verifyIsIdiom.ts
├── jobs/                   # one file per CLI command — orchestrates capabilities + DB
│   ├── mine.ts
│   ├── discover.ts         # LangGraph state machine
│   ├── enrich.ts
│   ├── translate.ts
│   ├── seedTagTranslations.ts
│   ├── tag.ts
│   └── verify.ts
└── lib/                    # shared DB + utility code
    ├── db.ts               # postgres.js client
    ├── env.ts              # required env loader
    ├── openai.ts           # OpenAI client + default model
    ├── normalize.ts        # cleanExpression() + normalize()  (see "Normalization" below)
    ├── concurrency.ts      # mapWithConcurrency
    ├── runs.ts             # pipeline.runs CRUD
    ├── expressions.ts      # pipeline.expressions CRUD
    ├── links.ts            # pipeline.expression_links CRUD
    ├── enrichments.ts      # pipeline.enrichments CRUD + pending-queries
    ├── promote.ts          # pipeline → public.idioms + public.idiom_equivalents
    ├── translations.ts     # public.idiom_translations CRUD
    ├── tags.ts             # public.tags / public.tag_translations CRUD
    └── idiomTags.ts        # public.idiom_tags CRUD
```

### Capability ↔ Job split

- **Capabilities** wrap a single OpenAI call. They are pure: input → LLM → typed output via
  zod + `zodResponseFormat`. They do **not** touch the DB.
- **Jobs** orchestrate: load rows, fan out capabilities under `mapWithConcurrency`, write
  results back. Every job opens a row in `pipeline.runs` via `startRun()` and closes it
  with `finishRun()` so reruns are observable.

Add a new step: drop a capability file in `capabilities/`, a job file in `jobs/`, a CLI
case in `cli.ts`, and an npm script in `package.json`. Reuse `lib/` helpers — do not
inline SQL in job files except for tiny status flips.

### Shared prompt primitives (`idiomDefinition.ts`)

`mine` / `discover` / `enrich` / `verify` all rely on the same definition of an idiom
and the same enumerated failure modes. These live in
`pipeline/src/capabilities/idiomDefinition.ts` as exported strings:

- `GENERATIVE_PERSONA` — "prolific master native speaker" framing used by
  `generateCandidates` (and a good fit for any future *list-producing* capability).
  Pushes the model out of anchor-overfit into the language's full idiomatic range —
  everyday + literary + historical — while holding a hard line against hallucination.
- `SCHOLARLY_PERSONA` — same underlying identity reframed as a careful lexicographer,
  used by `enrichExpression`. Use this anywhere the output is *descriptive prose
  about* an idiom (meaning, etymology, examples) rather than a list of new ones.
  Explicitly forbids inventing etymologies, stretching meanings, or stylistic
  flourish — sober and factual.
- `IDIOM_DEFINITION` — what an idiom is + THE TEST + "when uncertain, exclude"
- `EXCLUDED_FORMS` — 9 categories of false positives (plain verb phrases, calques,
  proverbs, dead metaphors, single-word slang, etc.)
- `SCRIPT_RULE` — non-Latin scripts must not be romanized
- `SELF_CHECK` — re-read the output before responding
- `FREQUENCY_RUBRIC` — common/uncommon/rare bucket definitions
- `ANCHORS_BY_LANG` — 4 positive + 4 anti examples per language
- `renderAnchorsForLang(lang)` — builds the per-language prompt block

Edit prompts here when tuning the gate; downstream capability prompts compose from this file.
Anchors for non-EN/ES/DE/FR languages are placeholders that require native-speaker review
before mining runs.

The two personas split intentionally: generation should reach broadly across registers
(literary/historical idioms welcome), enrichment should stay conservative (no flourish,
no invented etymology). If you add a capability that creates new idioms, compose with
`GENERATIVE_PERSONA`; if it analyzes existing ones, compose with `SCHOLARLY_PERSONA`.

### Per-capability model setting

`lib/openai.ts` exports `getModel(capability)` which reads per-capability env overrides
and falls back to `OPENAI_MODEL`. Use this in every capability instead of the bare
`model` constant. Configure via `.env`:

```
OPENAI_MODEL=gpt-4o-mini                      # default
OPENAI_MODEL_GENERATE_CANDIDATES=gpt-4o       # spend more where it matters
OPENAI_MODEL_SUGGEST_EQUIVALENTS=gpt-4o
OPENAI_MODEL_VERIFY=gpt-4o                    # second-opinion gate
# (other capabilities use the OPENAI_MODEL default)
```

### Translation (hub-and-spoke)

`translate` operates in two modes per language:

- `--lang en`: collects EN translations for every non-EN promoted idiom. Run this FIRST
  before any spoke runs so the hub is populated.
- `--lang <other>`: broadcasts EN-source idioms into the target lang. Selects only
  `language_code = 'en'`; non-EN sources are not translated directly to non-EN targets.

Read-time display fallback (`prefer(userLang) → en → source`) is a deferred follow-up;
until it ships, non-EN ↔ non-EN viewing falls back to the source form.

### Frequency

Every promoted idiom carries a `frequency ∈ {common, uncommon, rare}` set by `enrich`.
The bucket definitions live in `idiomDefinition.ts:FREQUENCY_RUBRIC`. Browse-by-frequency
queries use the `(language_code, frequency)` index on `public.idioms`.

### Backups

`scripts/db-backup.sh` produces a timestamped data-only dump (excludes `idiom_likes`,
which is user-coupled). `scripts/db-restore.sh` truncates corpus tables and restores via
`pg_restore --data-only` — schema must already exist (run `supabase db reset` first if
rebuilding from scratch). Dumps live in `pipeline/backups/` (gitignored).

### Normalization (CRITICAL)

There are **two** functions in `lib/normalize.ts`:

- `cleanExpression(raw)` — applies Unicode NFKC, collapses runs of whitespace, trims.
  Applied **at ingress** (mining + discovery) on every raw LLM string before storage.
  Stops weird LLM whitespace and script variants from breaking dedup.
- `normalize(expression)` — `.normalize("NFKC").trim().toLowerCase()`. Must match the
  SQL generated column `expression_key = lower(trim(normalize(expression, NFKC)))` on
  both `pipeline.expressions` and `public.idioms`. Used for in-process key comparisons.

NFKC normalization is essential for non-Latin scripts: characters with multiple byte
representations (combining marks, CJK half/full-width, Arabic presentation forms,
ligatures) collapse to one canonical key.

If you change either function, **also change the matching SQL generated column** or
canonicalize inputs before they hit the DB. Misalignment causes silent dedup failures
and duplicate upserts.

### Idempotency rules

Every write path is idempotent on a natural key:

| Table | Conflict key | Behavior |
|---|---|---|
| `pipeline.expressions` | `(expression_key, language)` | `do nothing` |
| `pipeline.expression_links` | `(a_expression_id, b_expression_id)` (with `a<b`) | `do nothing` |
| `pipeline.enrichments` | `expression_id` | `do update` (re-enrichment overwrites) |
| `public.idioms` | `(expression_key, language_code)` | `do update` (promotion overwrites) |
| `public.idiom_equivalents` | `(idiom_id_a, idiom_id_b)` (with `a<b`) | `do update similarity_score` |
| `public.idiom_translations` | `(idiom_id, language_code)` | `do nothing` |
| `public.tag_translations` | `(tag_id, language_code)` | `do update` |
| `public.idiom_tags` | `(idiom_id, tag_id)` | `do nothing` |

Always preserve the `a < b` ordering trick for symmetric link tables — both
`pipeline.expression_links` and `public.idiom_equivalents` enforce it via CHECK
constraints. See `links.ts:upsertLink` and `promote.ts:promotePendingLinks` for the
canonical swap.

### Status lifecycle (`pipeline.expressions.status`)

```
seed ──┐
       ├── enrich (is_idiom=true) ──→ enriched ──→ promote ──→ promoted
discovered ─┘
                                                                  │
                                                                  └─ verify ──→ rejected
       └── enrich (is_idiom=false) ──→ rejected
```

`'rejected'` was added in migration `20260514120000_pipeline_rejected_status.sql`. It is
set in two places:

1. `enrich.ts` — when the gate inside `enrichExpression` returns `is_idiom=false`.
2. `verify.ts` — when a promoted public idiom is judged not-an-idiom and deleted. The
   delete + status flip + `public_idiom_id = null` happen in a single `sql.begin`
   transaction so a crash can't leave the two tables out of sync.

`discover.ts` uses `listForDiscovery()` which **excludes** `'rejected'`, so the discovery
graph does not waste LLM tokens suggesting equivalents for known non-idioms.

### Concurrency

- `mapWithConcurrency(items, limit, fn)` — bounded concurrency primitive. Default
  `limit=4` for OpenAI calls. Tune via `--concurrency`.
- `db.ts` opens a single pool with `max: 4`. If you raise `--concurrency` significantly,
  raise the pool size too or you will starve on connections.
- `discover.ts` snapshots `countByLanguage` per round into a `Map<Language, number>` and
  decrements locally as it inserts. This avoids hammering the DB and keeps the
  `--per-lang-cap` honored across concurrent workers within a round (the cap is still
  best-effort across rounds).

### LangGraph (`discover.ts`)

Discovery is a state machine because it iterates: each round, the discovered rows from
the previous round become the seeds of the next round, until either `max-iter` is hit or
a round yields zero new expressions. The `StateGraph` codifies this so the loop logic is
declarative.

State reducers matter: `pending` is **replaced** each round (`(_, b) => b`), but
`totalDiscovered` and `totalLinks` **accumulate** (`(a, b) => a + b`). Match this pattern
if you add new state fields.

### Destructive operations

`verify` is the only job that deletes. It defaults to **dry-run** — you must pass
`--commit` to actually delete. The delete cascades through `idiom_translations`,
`idiom_equivalents`, and `idiom_tags` via FK. Run `--commit` once after spot-checking the
`out/runs/<run-id>/verify.json` output from a dry-run.

### Run artifacts

Every job writes a JSON summary to `pipeline/out/runs/<run-id>/<job>.json`. This dir is
gitignored. The same summary fields are reflected in `pipeline.runs.params` so you can
query historical runs from psql.

## Config

`pipeline/.env` (gitignored — copy from `.env.example`):

```
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Defaults live in `lib/env.ts`. `DATABASE_URL` and `OPENAI_API_KEY` are required;
`OPENAI_MODEL` defaults to `gpt-4o-mini`.

## Conventions

- **`.js` extensions on imports.** ESM + `moduleResolution: "bundler"` requires literal
  `.js` even though source is `.ts`. tsx handles the runtime resolution.
- **Zod for every LLM response.** Use `zodResponseFormat(schema, name)` — never parse
  free-form JSON. The capability files are templates; copy the shape when adding a new
  one.
- **Errors bubble.** Capabilities throw on missing `parsed` output. Jobs wrap individual
  rows in try/catch and increment a `failed` counter, but the *run* fails (status='failed'
  in `pipeline.runs`) if anything escapes the per-row try/catch.
- **No tests.** Pipeline code is one-shot orchestration, not library code. The app's
  testing requirements (see root CLAUDE.md > *Testing*) do not extend here. If a piece of
  logic becomes complex enough to need testing, lift it to a pure helper in `lib/` and
  add a test there.
- **Biome v2** for lint/format (same config as root, separate `node_modules`).

## Common pitfalls

### Connection pool exhaustion

`sql.end()` is called in every job's `finally`. That's safe for the CLI (process exits
after one job). Do not import `db.ts` into multi-job orchestration without rethinking
lifecycle.

### LLM avoid-list growth

`mine.ts` reads every existing expression for the target language and injects them as the
avoid list. At ~1k entries this is fine; at 10k it gets expensive in tokens. When the
corpus grows past a few thousand entries per language, switch to a sampled or
embedding-filtered avoid list.

### Generated columns

Both `pipeline.expressions.expression_key` and `public.idioms.expression_key` are
`generated always as ... stored`. You can't insert into them. You can't reliably `update`
the underlying `expression` column without invalidating the unique constraint either, so
just don't mutate expressions in place — let new rows take over via the upsert.

### Promotion idempotency

Re-running `enrich` after a partial failure is safe: `listPendingPromotion` filters
`status='enriched' AND public_idiom_id IS NULL`, so already-promoted rows are skipped,
and `promoteIdiom` itself is wrapped in `sql.begin` so the public insert + pipeline
status flip happen atomically.
