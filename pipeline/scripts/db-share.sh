#!/usr/bin/env bash
# Encrypt / decrypt a corpus dump for secure sharing (AES-256, symmetric, gpg).
# This is the transfer/security layer, kept separate from backup & restore so
# they can be chained as needed:
#
#   send:     npm run db:backup
#             db-share.sh encrypt backups/idioms-<ts>.dump   -> <ts>.dump.gpg
#             (upload the .gpg anywhere; share the passphrase out-of-band)
#
#   receive:  db-share.sh decrypt idioms-<ts>.dump.gpg       -> <ts>.dump
#             npm run db:restore -- backups/idioms-<ts>.dump
#
# Passphrase: DUMP_PASSPHRASE env if set, otherwise gpg prompts interactively.
# ALWAYS share the passphrase over a different channel than the file itself.
set -euo pipefail
command -v gpg >/dev/null || { echo "gpg not found." >&2; exit 1; }

CMD="${1:-}"; SRC="${2:-}"
[[ -n "$CMD" && -n "$SRC" ]] || { echo "usage: db-share.sh <encrypt|decrypt> <file>" >&2; exit 2; }
[[ -f "$SRC" ]] || { echo "no such file: $SRC" >&2; exit 1; }

pass=()
[[ -n "${DUMP_PASSPHRASE:-}" ]] && pass=(--batch --passphrase "$DUMP_PASSPHRASE")

case "$CMD" in
  encrypt)
    OUT="$SRC.gpg"
    gpg "${pass[@]}" --yes --symmetric --cipher-algo AES256 -o "$OUT" "$SRC"
    echo "wrote $OUT"
    ;;
  decrypt)
    OUT="${SRC%.gpg}"; [[ "$OUT" != "$SRC" ]] || OUT="$SRC.decrypted"
    gpg "${pass[@]}" --yes -o "$OUT" -d "$SRC"
    echo "wrote $OUT"
    ;;
  *)
    echo "unknown command: $CMD (use encrypt|decrypt)" >&2; exit 2 ;;
esac
