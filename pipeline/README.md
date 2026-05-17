# Pipeline

LLM-driven data-mining package that builds the multilingual idiom corpus end-to-end —
mining → discovery → enrichment → promotion → translation → tagging → verification.

It is a separate TypeScript package from the app. It runs as a Node CLI against the
local Supabase Postgres, writing into `pipeline.*` staging tables and promoting to
`public.*` once enrichment passes.

## Setup

Requires the local Supabase stack running (`npx supabase start` from repo root).

```bash
cd pipeline
npm install
cp .env.example .env
# Fill in OPENAI_API_KEY. DATABASE_URL defaults to local Supabase.
```

`OPENAI_MODEL` defaults to `gpt-4o-mini`. Override in `.env` if you want a different model.

## Workflow

```bash
# 1. Seed the corpus, one language at a time. Re-run any time you want more candidates.
npm run mine -- --lang en --count 100
npm run mine -- --lang es --count 100
npm run mine -- --lang de --count 100
npm run mine -- --lang fr --count 100

# 2. Discover cross-language equivalents. Iterates until convergence or --max-iter.
npm run discover -- --max-iter 3

# 3. Enrich seeds/discovered with idiomatic meaning, explanation, examples.
#    Same job also promotes enriched rows into public.idioms and their links into
#    public.idiom_equivalents.
npm run enrich

# 4. Translate public.idioms into the other three languages, one target at a time.
npm run translate -- --lang en
npm run translate -- --lang es
npm run translate -- --lang de
npm run translate -- --lang fr

# 5. One-off: backfill ES/DE/FR labels for the canonical tag taxonomy.
#    Only needs to run once per environment.
npm run seed-tag-translations

# 6. Assign canonical tags to every idiom missing them.
npm run tag

# 7. Optional QA sweep: second-pass LLM gate over promoted idioms.
#    Defaults to dry-run — review out/runs/<id>/verify.json before adding --commit.
npm run verify
npm run verify -- --commit
```

Each job is idempotent. Re-running picks up where it left off via the `pipeline.*`
status columns and the natural-key conflict resolution in every upsert.

## Jobs at a glance

| Command | What it does | DB tables touched |
|---|---|---|
| `mine` | LLM generates seed idioms in one language | `pipeline.expressions` |
| `discover` | LLM suggests cross-language equivalents iteratively | `pipeline.expressions`, `pipeline.expression_links` |
| `enrich` | LLM enriches each expression + promotes to public corpus | `pipeline.enrichments`, `public.idioms`, `public.idiom_equivalents` |
| `translate` | LLM translates each public idiom into a target language | `public.idiom_translations` |
| `seed-tag-translations` | One-off: localize canonical tag labels | `public.tag_translations` |
| `tag` | LLM assigns canonical tags to each idiom | `public.idiom_tags` |
| `verify` | LLM re-checks promoted idioms; flags or deletes leakage | `public.idioms`, `pipeline.expressions` |

## Flags

```
mine     --lang <en|es|de|fr>   (required)
         --count <n>            (default 50)

discover --top-n <n>            (max equivalents per source, default 3)
         --per-lang-cap <n>     (stop discovering once a language has N expressions, default 200)
         --max-iter <n>         (default 2)
         --concurrency <n>      (default 4)

enrich   --concurrency <n>      (default 4)

translate --lang <en|es|de|fr>  (required, target language)
          --concurrency <n>     (default 4)

tag       --concurrency <n>     (default 4)

verify    --lang <en|es|de|fr>  (optional, filter to one language)
          --source <ai_mined|all>  (default ai_mined)
          --concurrency <n>     (default 4)
          --commit              (DESTRUCTIVE: actually delete rejected rows)
```

## Run artifacts

Every job writes a JSON summary under `out/runs/<run-id>/`. This directory is gitignored.
The same fields are also stored in `pipeline.runs.params` so you can query historical
runs from psql:

```sql
select id, job, status, started_at, finished_at, params
  from pipeline.runs
  order by started_at desc
  limit 20;
```

## Safety

- `verify` defaults to **dry-run**. Inspect `out/runs/<run-id>/verify.json` and the
  `[verify] WOULD DELETE …` log lines before re-running with `--commit`.
- A `--commit` run is transactional per-idiom: the public delete and the pipeline
  `status='rejected'` flip happen together, so a crash cannot leave the two schemas out
  of sync.
- No job touches production: `DATABASE_URL` points at local Supabase. The repo's GH
  workflow deploys migrations only, never seed/pipeline output.

See [`CLAUDE.md`](./CLAUDE.md) for architecture, conventions, and gotchas when modifying
the pipeline itself.
