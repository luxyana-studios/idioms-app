#!/usr/bin/env bash
# Populate corpus tables from a dump. Assumes schema is already in place
# (run `supabase db reset` first if rebuilding from scratch).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a; . "$ENV_FILE"; set +a
fi
: "${DATABASE_URL:?DATABASE_URL must be set (see pipeline/.env)}"

DUMP="${1:?usage: db-restore.sh <dump-file>}"
[[ -f "$DUMP" ]] || { echo "no such file: $DUMP" >&2; exit 1; }

read -rp "Truncate corpus tables and restore from $DUMP? [y/N] " ans
[[ "$ans" =~ ^[yY]$ ]] || { echo aborted; exit 1; }

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
truncate
  public.idiom_tags,
  public.idiom_equivalents,
  public.idiom_translations,
  public.tag_translations,
  public.tags,
  public.idioms,
  pipeline.enrichments,
  pipeline.expression_links,
  pipeline.expressions,
  pipeline.runs
  restart identity cascade;
SQL

pg_restore \
  --data-only \
  --no-owner --no-privileges \
  --dbname="$DATABASE_URL" \
  "$DUMP"

echo "restore complete"
