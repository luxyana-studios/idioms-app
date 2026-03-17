# Routing (Expo Router)

## Route Files

- Every route screen **must** use `export default function` — Expo Router requires default exports
- Every route group directory (e.g., `(home)/`) **must** have a `_layout.tsx`
- `index.tsx` at the app root only redirects — never put real UI there

## Layouts

- **Stack layouts** use themed header styles via `useUnistyles()`:
  ```tsx
  const { theme } = useUnistyles();
  // headerStyle: { backgroundColor: theme.colors.background }
  // headerTintColor: theme.colors.text
  ```
- **Tabs layout** is `(main)/_layout.tsx`. To add a new tab, you must:
  1. Create the `(groupName)/` directory with `_layout.tsx` + `index.tsx`
  2. Add a `<Tabs.Screen name="(groupName)" />` entry in `(main)/_layout.tsx`
- Tab titles and screen titles always use `t()` from `useTranslation()` — never hardcode strings

## Auth

- `AuthGate` in root `_layout.tsx` handles all auth redirects — do not duplicate auth checks in screens
- Auth redirect logic uses `useSegments()` to detect the current route group

## Screens

- Use `<ScreenContainer>` from `@/shared/components/ScreenContainer` as the root wrapper
- Use `<Typography>` for all text — not raw `<Text>`
- Styles go at the bottom of the file: `const styles = StyleSheet.create((theme) => ({ ... }))`
- Import `StyleSheet` from `react-native-unistyles`, not from `react-native`
