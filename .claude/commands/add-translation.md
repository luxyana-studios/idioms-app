Add a new translation key to all language files.

Arguments format: `<key> <english text> | <spanish text>`
Example: `/add-translation profile.title My Profile | Mi Perfil`

Parse "$ARGUMENTS" to extract:
- The translation key (e.g., `profile.title`)
- English text (before the `|`)
- Spanish text (after the `|`)

If Spanish text is not provided, translate the English text to Spanish yourself.

## Steps

1. Read `src/core/i18n/en.json` and `src/core/i18n/es.json`.

2. Add the key to both files:
   - Keys follow `section.key` flat format — do NOT nest objects
   - Insert the key alphabetically within its section group
   - Preserve the existing JSON formatting (2-space indent)

3. If the key already exists in either file, warn me and ask before overwriting.

4. Show the diff of what was added.

## Conventions
- Follow the patterns in `src/core/CLAUDE.md`
- Interpolation uses `{{variable}}` syntax: `"Welcome, {{name}}!"`
