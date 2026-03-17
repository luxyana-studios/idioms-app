# Core Infrastructure

## Entry Point & Module Load Order (CRITICAL)

`src/entry.ts` is the app entry point. It controls the order modules load:

```
entry.ts → import "./core/theme/unistyles"  (StyleSheet.configure)
         → import "./core/i18n"             (i18next init)
         → import "expo-router/entry"       (route discovery)
```

**Do not reorder or remove these imports.** Unistyles `StyleSheet.configure()` MUST run before
any route file is imported, because Expo Router eagerly loads all route modules and any
`StyleSheet.create()` call before `configure()` will crash.

If you need a new side-effect import that must run before routes, add it to `entry.ts`
BEFORE the `expo-router/entry` line.

## Theme

- **Tokens** (`tokens.ts`): spacing, radius, typography scale, font families — modify here to change dimensions
- **Colors** (`themes.ts`): light + dark theme color palettes — modify here to change colors
- **Unistyles config** (`unistyles.ts`): registers themes and breakpoints — only touch this to add a new theme name
- **Fonts** (`fonts.ts`): DM Sans loading via expo-font — the `useLoadFonts()` hook is consumed in root layout
- Font families are referenced via `theme.typography.fonts` (from tokens), not hardcoded strings

To toggle theme at runtime, use the settings store `setThemeMode()` — it calls
`UnistylesRuntime.setAdaptiveThemes()` / `UnistylesRuntime.setTheme()` correctly.

## i18n

- Flat key translations in `en.json` and `es.json`
- Keys follow `section.key` format: `"auth.login"`, `"settings.theme"`, `"common.logout"`
- Interpolation: `"home.welcome": "Welcome, {{name}}!"` → `t("home.welcome", { name })`
- **Adding a new language**: create the JSON file AND add it to `resources` in `index.ts`
- **Adding a new key**: add it to ALL language files — missing keys fall back to English silently

## Supabase

- Client uses MMKV for auth token storage (not AsyncStorage) — this is intentional for performance
- `detectSessionInUrl: false` is required for React Native (not a browser)
- Database types in `src/types/supabase.ts` — regenerate with `npx supabase gen types typescript`
- The app runs without Supabase credentials (placeholder mode) — auth won't work until `.env` is set up

## Providers

- Only `QueryClientProvider` needs a React provider (in `AppProviders.tsx`)
- Zustand stores work standalone — do NOT wrap them in providers
- Do not add new providers unless the library specifically requires one

## Storage

- `mmkv.ts` exports two adapters:
  - `supabaseMMKVStorage` — used by Supabase auth (implements Supabase's storage interface)
  - `zustandMMKVStorage` — used by Zustand persist middleware (implements Zustand's StateStorage)
- Both use the same underlying MMKV instance
- Never use AsyncStorage — MMKV is the standard storage layer in this project
