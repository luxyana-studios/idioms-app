#!/usr/bin/env bash
# Snapshot the corpus to a timestamped dump in pipeline/backups/.
# Data-only: schema is owned by migrations. idiom_likes and user_languages
# excluded (user-coupled, not corpus).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
# An explicit DATABASE_URL in the environment wins over .env (e.g. to dump FROM prod).
_DBURL_OVERRIDE="${DATABASE_URL:-}"
if [[ -f "$ENV_FILE" ]]; then
  set -a; . "$ENV_FILE"; set +a
fi
[[ -n "$_DBURL_OVERRIDE" ]] && DATABASE_URL="$_DBURL_OVERRIDE"
: "${DATABASE_URL:?DATABASE_URL must be set (see pipeline/.env)}"

BACKUP_DIR="$SCRIPT_DIR/../backups"
mkdir -p "$BACKUP_DIR"
OUT="$BACKUP_DIR/idioms-$(date -u +%Y%m%dT%H%M%SZ).dump"

pg_dump \
  --data-only \
  --format=custom \
  --schema=public --schema=pipeline \
  --exclude-table=public.idiom_likes \
  --exclude-table=public.user_languages \
  --file="$OUT" \
  "$DATABASE_URL"

echo "wrote $OUT"
ls -lh "$OUT"
