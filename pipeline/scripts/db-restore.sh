#!/usr/bin/env bash
# Populate corpus tables from a dump. Assumes schema is already in place
# (run `supabase db reset` first if rebuilding from scratch).
#
#   db-restore.sh [--dry-run] [--allow-remote] [--force] <dump-file>
#
#   --dry-run        simulate inside a transaction and ROLL BACK; report the
#                    before -> after row counts. Writes nothing.
#   --allow-remote   required when DATABASE_URL points at a non-local host.
#   --force          skip the interactive confirm. Required for a real restore
#                    to a remote target.
#
# Target DB is DATABASE_URL (pipeline/.env). Point it elsewhere to restore to a
# different DB. To populate prod from a local backup, chain after db-share.sh.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
# An explicit DATABASE_URL in the environment wins over .env (e.g. to target prod
# for a one-off:  DATABASE_URL='postgresql://...prod...' npm run db:restore -- ...).
_DBURL_OVERRIDE="${DATABASE_URL:-}"
if [[ -f "$ENV_FILE" ]]; then
  set -a; . "$ENV_FILE"; set +a
fi
[[ -n "$_DBURL_OVERRIDE" ]] && DATABASE_URL="$_DBURL_OVERRIDE"
: "${DATABASE_URL:?DATABASE_URL must be set (see pipeline/.env)}"

DRY_RUN=0; ALLOW_REMOTE=0; FORCE=0; DUMP=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)      DRY_RUN=1 ;;
    --allow-remote) ALLOW_REMOTE=1 ;;
    --force)        FORCE=1 ;;
    -*)             echo "unknown option: $1" >&2; exit 2 ;;
    *)              DUMP="$1" ;;
  esac
  shift
done
: "${DUMP:?usage: db-restore.sh [--dry-run] [--allow-remote] [--force] <dump-file>}"
[[ -f "$DUMP" ]] || { echo "no such file: $DUMP" >&2; exit 1; }

# Corpus tables only (user-coupled idiom_likes + user_languages are excluded
# from backups, so they are never truncated here).
TABLES="public.idiom_tags, public.idiom_equivalents, public.idiom_translations, public.tag_translations, public.tags, public.idioms, pipeline.enrichments, pipeline.expression_links, pipeline.expressions, pipeline.runs"

# --- target + remote guard -------------------------------------------------
host="${DATABASE_URL#*://}"; host="${host#*@}"; host="${host%%[:/]*}"
case "$host" in localhost|127.0.0.1|::1|"") is_local=1 ;; *) is_local=0 ;; esac
redacted="${DATABASE_URL%%://*}://${DATABASE_URL#*@}"
echo "target: $redacted"

if [[ $is_local -eq 0 ]]; then
  echo "WARNING: target host '$host' is not local."
  [[ $ALLOW_REMOTE -eq 1 ]] || { echo "refusing: pass --allow-remote to target a non-local DB." >&2; exit 3; }
fi

# union-all count query over the corpus tables
count_sql() {
  local first=1 t
  for t in ${TABLES//,/ }; do
    [[ $first -eq 1 ]] && first=0 || printf ' union all '
    printf "select '%s' tbl, count(*) n from %s" "$t" "$t"
  done
}

# --- dry-run: simulate + roll back ----------------------------------------
if [[ $DRY_RUN -eq 1 ]]; then
  echo "dry-run: simulating restore from $DUMP (no writes)..."
  {
    echo "begin;"
    echo "\\echo === before ==="
    echo "$(count_sql) order by tbl;"
    echo "truncate $TABLES restart identity cascade;"
    pg_restore --data-only --no-owner --no-privileges -f - "$DUMP"
    echo "\\echo === after (what a real restore would produce) ==="
    echo "$(count_sql) order by tbl;"
    echo "rollback;"
  } | psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -P pager=off
  echo "dry-run complete: rolled back, nothing written."
  exit 0
fi

# --- real restore ----------------------------------------------------------
if [[ $is_local -eq 0 && $FORCE -eq 0 ]]; then
  echo "refusing: a real restore to a remote target requires --force." >&2; exit 3
fi
if [[ $FORCE -eq 0 ]]; then
  read -rp "truncate corpus tables and restore from $DUMP into $redacted? [y/N] " ans
  [[ "$ans" =~ ^[yY]$ ]] || { echo aborted; exit 1; }
fi

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
truncate $TABLES restart identity cascade;
SQL

pg_restore \
  --data-only \
  --no-owner --no-privileges \
  --dbname="$DATABASE_URL" \
  "$DUMP"

echo "restore complete"
