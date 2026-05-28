#!/usr/bin/env bash
# Snapshot the corpus to a timestamped dump in pipeline/backups/.
# Data-only: schema is owned by migrations. idiom_likes excluded
# (user-coupled, not corpus).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a; . "$ENV_FILE"; set +a
fi
: "${DATABASE_URL:?DATABASE_URL must be set (see pipeline/.env)}"

BACKUP_DIR="$SCRIPT_DIR/../backups"
mkdir -p "$BACKUP_DIR"
OUT="$BACKUP_DIR/idioms-$(date -u +%Y%m%dT%H%M%SZ).dump"

pg_dump \
  --data-only \
  --format=custom \
  --schema=public --schema=pipeline \
  --exclude-table=public.idiom_likes \
  --file="$OUT" \
  "$DATABASE_URL"

echo "wrote $OUT"
ls -lh "$OUT"
