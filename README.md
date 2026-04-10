# IdiomDeck

Learn the art of language through beautifully crafted idiom cards. IdiomDeck is a mobile app for discovering, learning, and mastering idiomatic expressions through a swipe-based card deck experience.

## Features

- **Daily card deck** — swipeable idiom cards with skip/save actions
- **Explore** — browse categories and search the full idiom library
- **Saved** — personal collection of bookmarked idioms
- **Library** — curated decks and collections by category
- **Quiz mode** — test your knowledge with multiple-choice challenges
- **Card detail** — etymology, global equivalents, usage examples
- **Dark/light themes** — Terra Ethos (dark) and Futurist Serenity (light)
- **i18n** — English and Spanish

## Tech Stack

| Area | Library |
|---|---|
| Framework | Expo SDK 54, Expo Router 6 (file-based routing) |
| Styling | Unistyles v3 (dark/light/system themes, Manrope font) |
| Client state | Zustand v5 + MMKV persistence |
| Server state | TanStack React Query v5 |
| Backend | Supabase (auth + database) |
| i18n | i18next + react-i18next (EN/ES) |
| Lists | FlashList v2 |
| Animations | Reanimated v4 |
| Linting | Biome v2 |

## Design System

IdiomDeck uses two Material Design 3-based color palettes:

- **Terra Ethos** (dark) — deep earthy tones, `#16130e` background, `#ecbe8e` primary (warm tan), `#bfcab1` secondary (sage)
- **Futurist Serenity** (light) — cream base, `#fcf9f4` background, `#914731` primary (terracotta), `#596244` secondary (sage)

Typography is set exclusively in **Manrope** (300–800 weights).

## Prerequisites

- Node.js (LTS)
- Android SDK (for Android builds)
- JDK 17

### Android SDK Setup

```bash
sudo apt-get install openjdk-17-jdk
sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0"
```

Add to `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH
```

## Getting Started

```bash
npm install
cp .env.example .env     # add your Supabase credentials

npx expo run:android     # first build (Android)
npx expo run:ios         # first build (iOS)
```

## Daily Development

```bash
npx expo start           # start Metro, app hot-reloads on device
npx expo start --clear   # fresh cache (use after config changes)
```

Rebuild with `npx expo run:android` when adding native dependencies, changing `app.config.ts`, or modifying `babel.config.js` / `metro.config.js`.

### Quality Commands

```bash
npx biome check src/          # lint
npx biome check --write src/  # lint + auto-fix
npx tsc --noEmit              # type check
npm test                      # unit tests
```

## Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The app runs without these in placeholder mode (auth and database features disabled).

## Project Structure

```
src/
├── app/                        # Expo Router file-based routes
│   ├── _layout.tsx             # Root layout (providers, auth gate)
│   ├── index.tsx               # Entry redirect
│   ├── (auth)/                 # Login & signup screens
│   └── (main)/
│       ├── (tabs)/
│       │   ├── (home)/         # Card deck (Daily Selection)
│       │   ├── (explore)/      # Search + bento category grid
│       │   ├── (saved)/        # Saved idioms collection
│       │   └── (library)/      # Curated decks & collections
│       └── (settings)/         # Theme, language, logout
├── core/                       # Shared infrastructure
│   ├── supabase/               # Supabase client
│   ├── storage/                # MMKV instance + adapters
│   ├── theme/                  # Unistyles themes, tokens, Manrope fonts
│   ├── i18n/                   # i18next config + translations (en/es)
│   ├── query/                  # React Query client
│   └── providers/              # Provider composition
├── features/                   # Feature modules
│   ├── auth/                   # Auth store, hooks, components
│   ├── idioms/                 # Idiom types, mock data, Zustand store
│   └── settings/               # Settings store + hooks
├── shared/                     # Shared UI components
│   └── components/             # Button, TextInput, Typography, ScreenContainer
└── types/                      # TypeScript type definitions
```

## Connecting a Device

### USB

1. Enable **Developer options** (tap Build number 7 times)
2. Enable **USB debugging**
3. Connect via USB → accept the debugging prompt
4. Verify: `adb devices`

### Wireless (Android 11+)

1. Enable **Wireless debugging** in Developer options
2. Tap **Pair device with pairing code**
3. `adb pair <ip>:<pairing-port>` → enter the code
4. `adb connect <ip>:<port>`

#### Troubleshooting: mDNS not recognized

If `npx expo run:android` fails with "device not found" on an mDNS entry:

```bash
adb -s "adb-SERIAL._adb-tls-connect._tcp" shell ip -f inet addr show wlan0
adb connect <IP>:<PORT>
```

## Notes

- Uses **development builds**, not Expo Go — Unistyles v3 and MMKV v4 require Nitro Modules (custom native code)
- `android/` and `ios/` are gitignored — generated by `expo run:*`
- `src/entry.ts` controls module load order: Unistyles must configure before Expo Router discovers routes
