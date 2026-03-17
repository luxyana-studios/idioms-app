Review the current staged and unstaged changes against the project's conventions and best practices.

## Steps

1. Run `git diff` and `git diff --staged` to see all changes.

2. Check each changed file against these rules:

### Routing (`src/app/`)
- Route screens use `export default function`
- Every route group has a `_layout.tsx`
- New screens are registered in their group's layout
- New tabs are registered in `(main)/_layout.tsx`
- Titles use `t()`, not hardcoded strings

### Styling
- `StyleSheet` is imported from `react-native-unistyles`, NOT from `react-native`
- Styles use `StyleSheet.create((theme) => (...))` — not inline styles or plain objects
- Theme tokens are used for spacing/colors — no magic numbers

### Features (`src/features/`)
- Stores follow `<name>.store.ts` naming and export `use<Name>Store`
- Components use named exports (not default)
- New stores have corresponding tests with native module mocks
- If a new `*.store.ts` file was added, verify a corresponding `*.store.test.ts` exists in `__tests__/`

### i18n
- All user-facing strings use `t()` from `useTranslation()`
- New translation keys are added to ALL language files (en.json and es.json)
- Keys follow `section.key` format

### Common Mistakes
- FlashList: `estimatedItemSize` prop must NOT be used (removed in v2)
- No use of AsyncStorage (use MMKV)
- No use of Expo Go commands (must use development builds)
- No modifications to `src/entry.ts` import order without good reason
- `react-native-reanimated/plugin` must remain last in babel plugins

3. Report findings grouped by severity:
   - **Errors**: things that will break (wrong imports, missing layouts, broken patterns)
   - **Warnings**: things that violate conventions but won't crash
   - **Suggestions**: optional improvements

If everything looks good, say so.
