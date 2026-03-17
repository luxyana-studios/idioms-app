# Features

## Directory Structure

Each feature lives in `features/<name>/` with subdirectories as needed:

```
features/<name>/
├── stores/          # Zustand stores
│   ├── <name>.store.ts
│   └── __tests__/
│       └── <name>.store.test.ts
├── hooks/           # Thin wrapper hooks
│   └── use<Name>.ts
└── components/      # Feature-specific components
    └── <Name>Component.tsx
```

Not every feature needs all subdirectories — create them as needed.

## Stores

- Use Zustand `create()` — export the hook directly as `use<Name>Store`
- File naming: `<name>.store.ts` (e.g., `auth.store.ts`, `settings.store.ts`)
- Auth store is **NOT** persisted via Zustand — Supabase handles session persistence through MMKV
- For stores that need persistence, use `persist()` middleware with `zustandMMKVStorage`:
  ```tsx
  import { createJSONStorage, persist } from "zustand/middleware";
  import { zustandMMKVStorage } from "@/core/storage/mmkv";
  ```
- Zustand stores do **not** need React providers — they work standalone

## Hooks

- Thin wrappers in `hooks/use<Name>.ts` that re-export the store
- This keeps components decoupled from the store implementation
- Example: `useAuth()` wraps `useAuthStore()` — components import the hook, not the store directly

## Components

- Use **named exports** (not default exports — default exports are only for route screens)
- Use Unistyles v3 `StyleSheet.create((theme) => (...))` for all styles
- Import `StyleSheet` from `react-native-unistyles`, not from `react-native`
- Use shared components (`Typography`, `Button`, `TextInput`, `ScreenContainer`) from `@/shared/components/`
- All user-facing strings must use `t()` from `useTranslation()`

## Testing

- Tests live in `__tests__/` directories colocated with the code they test
- File naming: `*.test.ts` or `*.test.tsx`
- **Native module mocks are required** — stores that import Unistyles, MMKV, or i18n must mock them
- Canonical mock pattern (see `settings/stores/__tests__/settings.store.test.ts`):
  ```tsx
  jest.mock("react-native-unistyles", () => ({
    UnistylesRuntime: { setAdaptiveThemes: jest.fn(), setTheme: jest.fn() },
  }));
  jest.mock("@/core/i18n", () => ({
    __esModule: true,
    default: { language: "en", changeLanguage: jest.fn() },
  }));
  jest.mock("@/core/storage/mmkv", () => ({
    zustandMMKVStorage: {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    },
  }));
  ```
- Use `useStore.setState()` in `beforeEach` to reset store state between tests
