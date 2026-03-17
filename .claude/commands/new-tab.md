Create a new tab group under the main tab navigator.

Arguments format: `<tabName> <icon>`
Example: `/new-tab profile person-outline` creates the `(profile)` tab group with the given Ionicons icon.

Parse "$ARGUMENTS" to extract the tab name and icon. If no icon is provided, pick a reasonable Ionicons `*-outline` icon based on the tab name.

## Steps

1. **Create the route group directory** at `src/app/(main)/(<tabName>)/`:

2. **Create the layout** at `src/app/(main)/(<tabName>)/_layout.tsx`:
   - Stack navigator with themed header (same pattern as `(home)/_layout.tsx`)
   - Use `useUnistyles()` for theme and `useTranslation()` for the screen title
   - Register the `index` screen

3. **Create the index screen** at `src/app/(main)/(<tabName>)/index.tsx`:
   - `export default function <TabName>Screen()`
   - Use `<ScreenContainer>` and `<Typography>`
   - Minimal placeholder content
   - Styles at the bottom with `StyleSheet.create((theme) => (...))`

4. **Register the tab** in `src/app/(main)/_layout.tsx`:
   - Add a `<Tabs.Screen name="(<tabName>)" />` entry with the icon and translated title
   - Place it in a logical position among existing tabs

5. **Add translation keys** to both `en.json` and `es.json`:
   - `<tabName>.title` for the tab/screen title

6. Run `npx tsc --noEmit` to verify there are no type errors.

## Conventions
- Follow the patterns in `src/app/CLAUDE.md`
- Use existing tab groups (home, explore, settings) as reference
- Icons must be from `@expo/vector-icons/Ionicons` using the `*-outline` variant
