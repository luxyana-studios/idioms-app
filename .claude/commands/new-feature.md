Create a new feature module named "$ARGUMENTS".

## Steps

1. Create the directory structure at `src/features/$ARGUMENTS/`:
   - `stores/$ARGUMENTS.store.ts`
   - `stores/__tests__/$ARGUMENTS.store.test.ts`
   - `hooks/use<Name>.ts` (PascalCase version of the feature name)
   - `components/` (empty directory — create a `.gitkeep` if needed)

2. **Store** (`stores/$ARGUMENTS.store.ts`):
   - Use Zustand `create()` with a typed state interface
   - Export the hook as `use<Name>Store`
   - Include a minimal initial state with one example property and one setter
   - Do NOT add persistence unless I ask for it

3. **Hook** (`hooks/use<Name>.ts`):
   - Thin wrapper that re-exports the store: `export function use<Name>() { return use<Name>Store(); }`

4. **Test** (`stores/__tests__/$ARGUMENTS.store.test.ts`):
   - Mock native modules (Unistyles, MMKV, i18n) using the canonical pattern from `src/features/settings/stores/__tests__/settings.store.test.ts`
   - Include a "has correct default state" test
   - Include one test per setter/action

5. Run `npx tsc --noEmit` to verify there are no type errors.

## Conventions
- Follow the patterns in `src/features/CLAUDE.md`
- Use `@/*` path aliases for imports
- All strings that will be user-facing should use `t()` — but stores typically don't have UI strings
