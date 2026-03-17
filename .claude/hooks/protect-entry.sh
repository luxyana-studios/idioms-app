#!/bin/bash
# Block edits to src/entry.ts — the module load order is critical.
# See src/core/CLAUDE.md for why this matters.

if ! command -v jq &>/dev/null; then
  echo "Warning: jq not installed, skipping hook" >&2
  exit 0
fi

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ "$FILE_PATH" == *"src/entry.ts" ]]; then
  echo "BLOCKED: src/entry.ts controls the critical module load order (Unistyles must configure before routes load). Editing this file requires explicit confirmation — if you really need to change it, tell the user why and ask them to approve." >&2
  exit 2
fi

exit 0
