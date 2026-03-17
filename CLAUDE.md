# CLAUDE.md

## Project Overview

React Native app template for Luxyana. Universal app targeting iOS, Android, and Web.
Uses Expo SDK 54 with development builds (NOT Expo Go).

## Commands

```bash
# Development
npx expo start              # start Metro bundler (app hot-reloads)
npx expo start --clear      # start Metro with fresh cache (fixes stale bundle issues)

# Native builds (required after adding native dependencies or changing config)
npx expo run:android        # build + install on Android device
npx expo run:ios            # build + install on iOS device

# Quality
npx tsc --noEmit            # type check
npx biome check src/        # lint
npx biome check --write src/ # lint + auto-fix

# Testing
npm test                    # run unit tests
npm run test:ci             # run tests with coverage (CI mode)
```

## Tech Stack

| Category | Library | Version API |
|---|---|---|
| Framework | Expo SDK 54, Expo Router 6 | File-based routing in `src/app/` |
| Styling | react-native-unistyles **v3** | `StyleSheet.create()`, `StyleSheet.configure()`, `useUnistyles()` |
| Client state | Zustand **v5** | `create()` from `zustand`, persist middleware |
| Server state | TanStack React Query **v5** | `useQuery()`, `useMutation()` |
| Storage | react-native-mmkv **v4** | `createMMKV()`, `.getString()`, `.set()`, `.remove()` |
| Backend | Supabase JS **v2** | `createClient<Database>()` with MMKV auth storage |
| i18n | i18next + react-i18next | `useTranslation()`, flat key translations |
| Lists | @shopify/flash-list **v2** | No `estimatedItemSize` prop (removed in v2) |
| Fonts | expo-font + @expo-google-fonts/dm-sans | `useFonts()`, DM Sans 400/500/600/700 |
| Animations | react-native-reanimated **v4** | |
| Linting | Biome **v2** | Schema `2.4.7`, `organizeImports` under `assist.actions.source` |
| Testing | Jest + jest-expo | `jest.config.js`, `npm test` |
| Git hooks | Lefthook | `lefthook.yml`, pre-commit: lint + format + typecheck |

## Architecture

### Entry Point & Module Load Order (CRITICAL)

The app uses a custom entry point at `src/entry.ts` instead of the default `expo-router/entry`.
This is **required** because Expo Router eagerly loads ALL route modules during route tree
discovery. Unistyles `StyleSheet.configure()` MUST run before any `StyleSheet.create()` call.

```
src/entry.ts
  → import "./core/theme/unistyles"   (runs StyleSheet.configure)
  → import "./core/i18n"              (initializes i18next)
  → import "expo-router/entry"        (now safe to discover routes)
```

If you add new side-effect imports that must run before routes load, add them to `src/entry.ts`
BEFORE the `expo-router/entry` import.

### Babel Plugin Order

In `babel.config.js`, plugins must be in this order:
1. `react-native-unistyles/plugin` (with `{ root: __dirname }`) — transforms `StyleSheet.create()` calls
2. `react-native-reanimated/plugin` — MUST be last

### Metro Config

`metro.config.js` sets `resolver.unstable_conditionNames` to `["react-native", "require", "default"]`.
This forces CJS resolution for packages like Zustand that use `import.meta.env` in ESM builds,
which breaks Metro's non-module script output.

### Routing Structure

```
src/app/
├── _layout.tsx           # Root: AppProviders + AuthGate + Slot
├── index.tsx             # Redirects to /(main)/(home)
├── (auth)/
│   ├── _layout.tsx       # Headerless Stack
│   ├── login.tsx
│   └── signup.tsx
└── (main)/
    ├── _layout.tsx       # Tabs (Home, Explore, Settings)
    ├── (home)/
    │   ├── _layout.tsx   # Stack
    │   ├── index.tsx     # Home screen
    │   └── [id].tsx      # Detail screen
    ├── (explore)/
    │   ├── _layout.tsx   # Stack
    │   └── index.tsx     # FlashList + React Query
    └── (settings)/
        ├── _layout.tsx   # Stack
        └── index.tsx     # Theme, language, logout
```

### Auth Flow

- `AuthGate` in root layout redirects based on session state and current route segment
- Auth store (`features/auth/stores/auth.store.ts`) is NOT persisted via Zustand — Supabase
  handles session persistence through the MMKV storage adapter
- `initialize()` calls `supabase.auth.getSession()` and listens to `onAuthStateChange`
- Splash screen stays visible until BOTH auth is initialized AND fonts are loaded
- Font loading: `useLoadFonts()` from `src/core/theme/fonts.ts` loads DM Sans weights
- On font error, splash still hides (graceful degradation to system font)

### State Management Pattern

- **Zustand stores** for client state. Feature stores live in `features/<name>/stores/`
- **Settings store** IS persisted via Zustand persist + MMKV (`zustandMMKVStorage` adapter)
- **Auth store** is NOT persisted — Supabase manages session persistence via `supabaseMMKVStorage`
- **React Query** for server state (API calls, data fetching)
- Zustand stores do NOT need React providers. Only `QueryClientProvider` is in the provider tree

### Styling Pattern

All components use Unistyles v3 API:

```tsx
import { StyleSheet } from "react-native-unistyles";

// In components that need the theme object directly:
import { useUnistyles } from "react-native-unistyles";
const { theme } = useUnistyles();

// Stylesheets — theme is passed as a function argument:
const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
}));
```

Theme tokens are defined in `src/core/theme/tokens.ts` (spacing, radius, typography, font families).
Theme colors are in `src/core/theme/themes.ts` (light + dark) using the Luxyana warm/earthy palette.
Font families in `typography.fonts` map to DM Sans weights loaded via `expo-font`.

To toggle theme: settings store calls `StyleSheet.configure()` with either
`adaptiveThemes: true` (system) or `adaptiveThemes: false, initialTheme: mode`.

### i18n Pattern

- Flat key translations in `src/core/i18n/en.json` and `es.json`
- Keys follow `section.key` format: `"auth.login"`, `"settings.theme"`, `"common.logout"`
- Use `const { t } = useTranslation()` then `t("section.key")`
- Interpolation: `t("home.welcome", { name: "John" })` with `"home.welcome": "Welcome, {{name}}!"`
- Adding a language: create the JSON file, add it to `resources` in `src/core/i18n/index.ts`,
  add an entry to the languages array in the settings screen

### Supabase

- Client configured with `detectSessionInUrl: false` (React Native, not a browser)
- Uses MMKV for auth token storage (30x faster than AsyncStorage, synchronous)
- Database types in `src/types/supabase.ts` (currently a placeholder `Database` type)
- When adding tables, regenerate types with `npx supabase gen types typescript`

### Testing

- **Framework**: Jest with `jest-expo` preset (handles Babel transforms and RN mocking)
- **Config**: `jest.config.js` at project root
- **Path alias**: `@/*` mapped via `moduleNameMapper`
- **Test location**: colocated `__tests__/` directories inside feature folders
- **Test naming**: `*.test.ts` / `*.test.tsx`
- **Native mocks**: tests for stores that import native modules (Unistyles, MMKV) must mock them.
  See `src/features/settings/stores/__tests__/settings.store.test.ts` for the pattern
- **CI**: `npm run test:ci` runs in the GitHub Actions workflow after lint

### Git Hooks (Lefthook)

- **Config**: `lefthook.yml` at project root
- **Install**: runs automatically via `prepare` script on `npm install`
- **Pre-commit** runs in parallel:
  - `lint` — `biome check` on staged `*.{ts,tsx,js,jsx,json}` files
  - `format` — `biome format` on staged `*.{ts,tsx,js,jsx,json}` files
  - `typecheck` — `tsc --noEmit` on the whole project

## Code Style

- **Formatter**: Biome — 2 spaces, double quotes, semicolons always
- **Imports**: organized by Biome assist (auto-sorted)
- **Path alias**: `@/*` maps to `src/*`
- **TypeScript**: strict mode enabled
- **Components**: raw RN primitives (no component library), shared components in `src/shared/components/`
- **Feature structure**: `features/<name>/` with `stores/`, `hooks/`, `components/` subdirectories

## Common Pitfalls

### Expo Go Does NOT Work

This project uses Nitro Modules (Unistyles v3, MMKV v4) which require custom native code.
Expo Go is a pre-built app that cannot load custom native modules. Always use development builds
(`npx expo run:android` / `npx expo run:ios`).

### Stale Metro Cache

If you see "Unable to resolve module" errors after changing babel/metro config or updating
native packages, restart Metro with `--clear`:
```bash
npx expo start --clear
```

### FlashList v2

`estimatedItemSize` prop was removed in FlashList v2. Do not add it.

### Biome v2

- Schema URL must match installed version (currently `2.4.7`)
- `organizeImports` goes under `assist.actions.source`, NOT top-level

### Adding Native Dependencies

After installing any package that includes native code:
1. Stop Metro
2. Run `npx expo run:android` (or `run:ios`) to rebuild
3. Metro restarts automatically after the build

### Supabase Not Configured

The app runs without Supabase credentials (placeholder mode). A console warning appears.
Auth and database features won't work until `.env` is configured.

## File Conventions

- Route screens: `src/app/**/*.tsx` — default exports only
- Layouts: `_layout.tsx` in each route directory
- Stores: `*.store.ts` — export the hook directly (e.g., `useAuthStore`)
- Hooks: `use*.ts` wrapper hooks in `features/<name>/hooks/`
- Shared components: PascalCase files in `src/shared/components/`
- Translations: flat JSON in `src/core/i18n/`
- Tests: `__tests__/*.test.ts(x)` colocated in feature directories

## Common Tasks

### Adding a new feature module

1. Create `src/features/<name>/` with `stores/`, `hooks/`, `components/` subdirs
2. Create the Zustand store (`<name>.store.ts`) exporting `use<Name>Store`
3. Create the wrapper hook (`hooks/use<Name>.ts`)
4. Create a test in `stores/__tests__/` with native module mocks
5. Run `npx tsc --noEmit` to verify

Or use: `/new-feature <name>`

### Adding a new screen to an existing tab

1. Create the screen file in `src/app/(main)/(<group>)/<screen>.tsx` with default export
2. Register it in the group's `_layout.tsx` as a `<Stack.Screen>`
3. Add translation keys (`<group>.<screen>`) to both `en.json` and `es.json`

Or use: `/new-screen <group> <screenName>`

### Adding a new tab

1. Create `src/app/(main)/(<tab>)/` with `_layout.tsx` (Stack) and `index.tsx`
2. Add `<Tabs.Screen name="(<tab>)">` in `src/app/(main)/_layout.tsx` with icon and title
3. Add translation key (`<tab>.title`) to both language files

Or use: `/new-tab <name> [icon]`

### Adding a new Supabase table

1. Create the table in Supabase dashboard or via migration
2. Run `npx supabase gen types typescript` to regenerate `src/types/supabase.ts`
3. Create a query hook in the relevant feature using React Query (`useQuery`/`useMutation`)
4. Remember to set up RLS policies on the table

Or use: `/add-supabase-table <name>`

### Adding a new language

1. Create `src/core/i18n/<lang>.json` with all keys from `en.json`
2. Add it to `resources` in `src/core/i18n/index.ts`
3. Add a picker entry in the settings screen language list

### Adding a native dependency

1. `npm install <package>`
2. Stop Metro if running
3. `npx expo run:android` or `npx expo run:ios` to rebuild with native code
4. Metro restarts automatically after the build

### Changing theme colors

Edit `src/core/theme/themes.ts` — both `lightColors` and `darkColors` objects.
Do NOT edit `unistyles.ts` unless you're adding a completely new theme name.

### Changing spacing, radius, or typography scale

Edit `src/core/theme/tokens.ts`. These tokens are consumed everywhere via `theme.spacing.*`,
`theme.radius.*`, and `theme.typography.*`.

## For New Contributors

### Where does my code go?

| I'm building... | It goes in... |
|---|---|
| A new screen | `src/app/(main)/(<group>)/<screen>.tsx` |
| Business logic / state | `src/features/<name>/stores/<name>.store.ts` |
| A reusable UI component | `src/shared/components/<Name>.tsx` |
| A feature-specific component | `src/features/<name>/components/<Name>.tsx` |
| An API/data hook | `src/features/<name>/hooks/use<Name>.ts` |
| Core infrastructure | `src/core/` — but ask first, this area has footguns |

### What should I NOT touch without understanding why?

- **`src/entry.ts`** — controls module load order. Unistyles must configure before any route loads. Getting this wrong crashes the app on startup.
- **`babel.config.js` plugin order** — Reanimated plugin must be last. Unistyles plugin must come before it.
- **`metro.config.js` condition names** — forces CJS resolution. Removing this breaks Zustand imports.
- **`src/core/theme/unistyles.ts`** — registers themes/breakpoints. Only touch to add a new theme name.

### Why can't I use Expo Go?

This project uses Nitro Modules (Unistyles v3, MMKV v4) which compile native C++ code.
Expo Go is a pre-built app that can't load custom native modules. You must use development
builds: `npx expo run:android` or `npx expo run:ios`.

### How does auth work?

1. App starts → `entry.ts` runs → Expo Router loads routes
2. Root `_layout.tsx` calls `useAuthStore().initialize()` which checks Supabase for an existing session
3. `AuthGate` watches session state and redirects: no session → `/(auth)/login`, has session → `/(main)/(home)`
4. Supabase persists the session token in MMKV storage (not the Zustand store)
5. Splash screen stays up until auth is initialized AND fonts are loaded

### How does styling work?

Everything uses Unistyles v3. The key rule: import `StyleSheet` from `react-native-unistyles`,
**never** from `react-native`. Styles are defined as functions that receive the theme:

```tsx
const styles = StyleSheet.create((theme) => ({
  container: { padding: theme.spacing.md },
}));
```

Use `theme.colors.*` for colors, `theme.spacing.*` for spacing, `theme.typography.*` for font
sizes/weights. No magic numbers — always use tokens.

### How do I get a custom slash command?

This project has slash commands in `.claude/commands/`. Type `/` in Claude Code to see them.
Available: `/new-feature`, `/new-screen`, `/new-tab`, `/review`, `/review-pr`, `/incorporate-pr-review`, `/add-translation`, `/add-supabase-table`.

## Environment

- `android/` and `ios/` directories are gitignored — generated by `expo run:*`
- `.env` is gitignored — copy from `.env.example`
- Custom entry point declared in `package.json` as `"main": "./src/entry.ts"`
- Expo Router root set to `./src/app` via plugin config in `app.config.ts`
