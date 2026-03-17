Create a new screen in an existing route group.

Arguments format: `<group> <screenName>`
Example: `/new-screen home profile` creates `src/app/(main)/(home)/profile.tsx`

Parse "$ARGUMENTS" to extract the group and screen name.

## Steps

1. Verify the target route group exists at `src/app/(main)/(<group>)/`. If it doesn't exist, stop and tell me — I may want `/new-tab` instead.

2. **Create the screen file** at `src/app/(main)/(<group>)/<screenName>.tsx`:
   - `export default function <ScreenName>Screen()`
   - Use `<ScreenContainer>` as root wrapper
   - Use `<Typography>` for text
   - Import `StyleSheet` from `react-native-unistyles` (NOT from `react-native`)
   - Styles at the bottom: `const styles = StyleSheet.create((theme) => ({ ... }))`
   - If the screen name suggests it takes a parameter (e.g., `[id]`), use `useLocalSearchParams`
   - Add `useTranslation()` and use `t()` for any visible text

3. **Register in the group layout**: Add a `<Stack.Screen name="<screenName>" />` entry in the group's `_layout.tsx`

4. **Add translation keys**: Add `<group>.<screenName>` title key to both `src/core/i18n/en.json` and `src/core/i18n/es.json`

5. Run `npx tsc --noEmit` to verify there are no type errors.

## Conventions
- Follow the patterns in `src/app/CLAUDE.md`
- Use the existing screens in the same group as reference for style/structure
