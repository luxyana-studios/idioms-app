# EAS Deployment Reference

A reference guide for how MyIdioms is built and deployed to the App Store and Play Store
using Expo Application Services (EAS).

> Ported from the panda-quotes setup. Anything marked `REPLACE_WITH_...` is a placeholder you
> need to fill in once the corresponding store/credential exists.

---

## Table of contents

1. [How deployment works — the big picture](#1-how-deployment-works--the-big-picture)
2. [What needs to be wired together](#2-what-needs-to-be-wired-together)
3. [Distribution tracks: iOS vs Android](#3-distribution-tracks-ios-vs-android)
4. [eas build vs eas submit](#4-eas-build-vs-eas-submit)
5. [How eas.json and app.config.ts fit together](#5-how-easjson-and-appconfigts-fit-together)
6. [Secrets: what they are, where they live, how to create them](#6-secrets-what-they-are-where-they-live-how-to-create-them)
7. [The full CI/CD pipeline](#7-the-full-cicd-pipeline)
8. [Releasing to production (manual steps)](#8-releasing-to-production-manual-steps)
9. [Version numbering](#9-version-numbering)
10. [First-time setup checklist](#10-first-time-setup-checklist)
11. [Testing the setup locally](#11-testing-the-setup-locally)

---

## 1. How deployment works — the big picture

A release goes through three stages:

```
1. BUILD        2. SUBMIT           3. RELEASE
──────────      ──────────────      ──────────────────────
Compile the  →  Upload artifact  →  Promote build from
native app      to store backend    testing track to
on EAS cloud    (App Store          public store listing
                Connect /           (manual step in
                Play Console)       App Store Connect
                                    or Play Console)
```

**Stage 1 — Build** happens on Expo's cloud infrastructure. You trigger it from GitHub Actions; the
compilation itself (~15 min iOS, ~8 min Android) runs on Expo's servers, not on GitHub's runners.

**Stage 2 — Submit** happens automatically after the build finishes, because the workflow uses
`--auto-submit`. EAS uploads the artifact to the appropriate store backend. The build becomes
available to internal testers immediately — no review required.

**Stage 3 — Release** is always manual. You go into App Store Connect or Google Play Console and
promote the tested build to the public store listing. Neither EAS nor this workflow ever touches
production automatically.

---

## 2. What needs to be wired together

For the full pipeline to work, five things must be in place:

| # | What | Where | Purpose |
|---|---|---|---|
| 1 | `EXPO_TOKEN` | GitHub org/repo secret | Authenticates EAS CLI in GitHub Actions |
| 2 | `GOOGLE_SERVICE_ACCOUNT_KEY` | EAS project secret (file) | Used by EAS servers when submitting the Android build |
| 3 | `APPLE_API_KEY_ID`, `APPLE_API_ISSUER_ID`, `APPLE_API_KEY` | EAS project secrets | Used by EAS servers when submitting the iOS build to App Store Connect |
| 4 | Android credentials (Keystore) | EAS credential storage | Used by EAS build servers to sign the Android binary |
| 5 | iOS credentials (Distribution Certificate + Provisioning Profile) | EAS credential storage | Used by EAS build servers to sign the iOS binary |

Item 1 lives in GitHub. Items 2–5 live in EAS (expo.dev). EAS manages iOS and Android build
credentials automatically the first time you run a build interactively (`eas build` without
`--non-interactive`).

---

## 3. Distribution tracks: iOS vs Android

### iOS

Apple controls who can install an app through code signing. The signing method determines the
distribution channel.

| Track | Who can install | Setup | Review | Notes |
|---|---|---|---|---|
| **Ad-hoc** | Up to 100 specific devices by UDID | Register each device in Apple Developer portal before building | None | Most painful option; avoid in CI |
| **TestFlight — Internal** | Up to 100 people in your App Store Connect team | Just upload; no device registration | None | Instant availability after upload |
| **TestFlight — External** | Up to 10,000 opt-in testers | Upload + invite | Lightweight beta review (~1 day) | For testers outside your team |
| **App Store** | Everyone | Full submission | Full review (1–3 days) | Publicly listed |

This project targets **TestFlight Internal**: every build submitted by EAS appears there immediately,
available to your App Store Connect team members with no review and no device registration.

### Android

Android separates "can this be installed" (just needs signing) from "where is it distributed"
(Play Store tracks or direct sideloading).

| Track | Who can install | Setup | Review | Notes |
|---|---|---|---|---|
| **APK sideload** | Anyone with the file (unknown sources enabled) | None | None | Direct file share; no Play Store |
| **Internal testing** | Up to 100 opted-in testers | Upload AAB | None | Instant; testers join via link |
| **Closed testing (alpha)** | Invited groups | Upload AAB | None | Invite by email or Google Group |
| **Open testing (beta)** | Public opt-in | Upload AAB | Minimal | Anyone can join |
| **Production** | Everyone | Upload AAB | Full review | Publicly listed |

This project targets **Play Store Internal Testing**: instant availability, no review, testers
opt in via a link from the Play Console.

---

## 4. eas build vs eas submit

### `eas build`

Compiles the native app on Expo's cloud infrastructure and produces a signed artifact:

- **iOS** → `.ipa` file, signed with a Distribution Certificate + Provisioning Profile
- **Android** → `.aab` (Android App Bundle), signed with a Keystore

The artifact is stored on Expo's servers. Nothing has reached any store yet.

### `eas submit`

Takes a built artifact and uploads it to the store backend:

- **iOS** → uploads to App Store Connect → build appears in TestFlight for internal testers
- **Android** → uploads to the Play Store track specified in `eas.json` (`internal` in this project)

Uploading does not release the app to users. The stores make it available to testers immediately
(for internal tracks), but promoting to public requires a separate manual step.

### `--auto-submit`

Combines both in one command. After the build completes on EAS servers, EAS automatically
runs submit using the `submit` block in `eas.json`. This is what the CI workflow uses.

---

## 5. How eas.json and app.config.ts fit together

Note: unlike panda-quotes (which uses a static `app.json`), MyIdioms uses a dynamic
`app.config.ts`. The fields below are set on the object returned by that config function.

### `app.config.ts` — app identity and metadata

Defines who the app is:

```ts
export default ({ config }): ExpoConfig => ({
  ...config,
  name: "MyIdioms",
  slug: "idioms",
  owner: "luxyana-studios",
  version: "1.0.0",
  ios: {
    bundleIdentifier: "com.luxyana.idioms",
  },
  android: {
    package: "com.luxyana.idioms",
  },
  extra: {
    eas: {
      projectId: "40534188-2d07-47e3-b5a9-699399810371",
    },
  },
});
```

- `version` — human-readable version shown to users (e.g. "1.2.0")
- `owner` — the Expo organization that owns the project (`luxyana-studios`)
- `extra.eas.projectId` — links this codebase to the EAS project on expo.dev
- iOS `buildNumber` / Android `versionCode` are **not** set here. With
  `appVersionSource: "remote"`, EAS manages these internal build counters remotely, so you do
  not need to commit changes to this file between builds.

### `eas.json` — build and submission configuration

Defines *how* to build and *where* to submit:

```json
{
  "cli": {
    "version": ">= 16.28.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal", "android": { "buildType": "apk" } },
    "preview":     { "distribution": "internal", "android": { "buildType": "apk" } },
    "production":  { "autoIncrement": true, "android": { "buildType": "app-bundle" } }
  },
  "submit": {
    "production": {
      "ios":     { "ascAppId": "REPLACE_WITH_APP_STORE_CONNECT_APP_ID" },
      "android": { "track": "internal" }
    }
  }
}
```

**`build.production`** (the profile CI uses)
- `autoIncrement: true` — EAS increments `buildNumber` (iOS) and `versionCode` (Android)
  automatically before each build
- `buildType: "app-bundle"` — produces `.aab` for Android (required for Play Store)
- iOS defaults to store distribution when no `distribution` key is present

The `development` and `preview` profiles produce internal-distribution APKs for testing on
devices and are **not** used by the deployment workflow.

**`submit.production`**
- The key name (`production`) matches the build profile name — EAS links them automatically
- iOS `ascAppId` is the numeric App Store Connect app ID. **You must create the app in App Store
  Connect first and replace the placeholder.** The Apple API credentials themselves live in EAS
  project secrets (see next section)
- Android `track: "internal"` targets the Play Store internal testing track specifically. The
  Google service account used to authenticate the upload lives in EAS project secrets — it is
  **not** committed to the repo

---

## 6. Secrets: what they are, where they live, how to create them

Two places hold credentials: **GitHub** (to queue the build) and **EAS** (to build and submit).

### GitHub secrets

Stored at: GitHub → repo (or org) → Settings → Secrets and variables → Actions

| Secret | Value | Used by |
|---|---|---|
| `EXPO_TOKEN` | Expo access token | EAS CLI authentication in GitHub Actions |

**How to create `EXPO_TOKEN`:**
1. expo.dev → Account Settings → Access Tokens → Create token
2. Add to GitHub as `EXPO_TOKEN`

### EAS project secrets

Stored at: expo.dev → your project → Secrets. These are injected automatically when the build
and submit run on EAS servers.

| Secret | Type | Value | Used by |
|---|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | File | Google Play service account `.json` file | `eas submit` on EAS servers (Android) |
| `APPLE_API_KEY_ID` | String | Key ID from App Store Connect API key | `eas submit` on EAS servers (iOS) |
| `APPLE_API_ISSUER_ID` | String | Issuer ID from App Store Connect | `eas submit` on EAS servers (iOS) |
| `APPLE_API_KEY` | File | `.p8` private key file downloaded from App Store Connect | `eas submit` on EAS servers (iOS) |

Create them via CLI:
```bash
npx eas-cli@latest secret:create --scope project \
  --name GOOGLE_SERVICE_ACCOUNT_KEY --type file --value ./service-account.json

npx eas-cli@latest secret:create --scope project \
  --name APPLE_API_KEY_ID --value "<Key ID>"

npx eas-cli@latest secret:create --scope project \
  --name APPLE_API_ISSUER_ID --value "<Issuer ID>"

npx eas-cli@latest secret:create --scope project \
  --name APPLE_API_KEY --type file --value ./AuthKey_XXXXX.p8
```

**To replace an existing secret:**
```bash
npx eas-cli@latest secret:delete --name SECRET_NAME
npx eas-cli@latest secret:create --scope project --name SECRET_NAME ...
```

**Where to find the Apple values:**
- App Store Connect → Users & Access → Integrations → App Store Connect API
- **Issuer ID**: shown at the top of that page (a UUID)
- **Key ID** and **`.p8` file**: generated when you create a new key (download the `.p8` once —
  Apple does not let you download it again)

**Where to find the Google service account key:**
- Google Play Console → Setup → API access → Service accounts → your service account →
  Manage keys → Add key → Create new key (JSON)

> If `eas.json` references a submit credential that isn't yet configured in EAS, `--auto-submit`
> for that platform will fail. Until Apple credentials exist you can trigger the workflow with
> `platform: android` to build+submit Android only.

---

## 7. The full CI/CD pipeline

### Trigger

Manual only (`workflow_dispatch`). Go to GitHub → Actions → **EAS Build** → Run workflow.
Select platform: `all`, `ios`, or `android`.

### Workflow steps

```
GitHub Actions runner (ubuntu, ~2–3 min total)
│
└─ Build job
    ├─ checkout + setup-node (from .nvmrc) + expo-github-action (EXPO_TOKEN)
    ├─ npm ci
    └─ eas build --platform <input> --profile production --non-interactive --no-wait --auto-submit
        │
        ├─ Queues Android build on EAS servers
        ├─ Queues iOS build on EAS servers
        └─ Exits (GitHub Actions job completes here)

EAS servers (async, after GitHub Actions exits)
│
├─ Android build (~8 min)
│   └─ Signs with Keystore stored in EAS credentials
│   └─ On complete → eas submit (Android)
│       └─ Resolves GOOGLE_SERVICE_ACCOUNT_KEY from EAS secrets
│       └─ Uploads AAB to Play Store internal testing track
│
└─ iOS build (~15 min)
    └─ Signs with Distribution Certificate + Provisioning Profile stored in EAS credentials
    └─ On complete → eas submit (iOS)
        └─ Resolves APPLE_API_KEY_* from EAS secrets
        └─ Uploads IPA to App Store Connect (TestFlight internal)
```

### Monitoring builds

After triggering, builds appear at expo.dev → your project → Builds.
GitHub Actions only shows the queue step (~2–3 min); the build logs are on expo.dev.

---

## 8. Releasing to production (manual steps)

Neither submission channel publishes to the public store automatically. To release:

**iOS:**
1. Open TestFlight on your device → install and test the build
2. App Store Connect → your app → App Store → select the build → Submit for Review

**Android:**
1. Google Play Console → your app → Testing → Internal testing → install and test
2. Google Play Console → your app → Production → Create new release → promote the build

---

## 9. Version numbering

| Field | Source | Platform | Visible to | Managed by |
|---|---|---|---|---|
| `version` | `app.config.ts` | Both | Users (e.g. "1.2.0") | You, manually in `app.config.ts` |
| `buildNumber` | EAS remote | iOS | Apple / internal only | EAS (`autoIncrement: true`) |
| `versionCode` | EAS remote | Android | Google / internal only | EAS (`autoIncrement: true`) |

With `appVersionSource: "remote"` and `autoIncrement: true`, you only need to bump `version`
in `app.config.ts` when you want the user-facing version to change. Build numbers increment
automatically with every build and do not need to be committed.

---

## 10. First-time setup checklist

Do these once before the first CI-driven release:

- [ ] Create the `EXPO_TOKEN` GitHub secret
- [ ] Confirm the EAS project (`projectId` in `app.config.ts`) exists under the `luxyana-studios` org
- [ ] Run `eas build --profile production --platform all` **interactively once** so EAS generates
      and stores the Android Keystore and iOS signing credentials
- [ ] **Android:** create the app in Google Play Console, create a service account with the
      "Release manager" role, and upload its JSON as the `GOOGLE_SERVICE_ACCOUNT_KEY` EAS secret
- [ ] **iOS:** create the app in App Store Connect, copy its numeric App ID into `eas.json`
      (`submit.production.ios.ascAppId`), and create an App Store Connect API key — then set
      `APPLE_API_KEY_ID`, `APPLE_API_ISSUER_ID`, and `APPLE_API_KEY` as EAS secrets
- [ ] Trigger the **EAS Build** workflow from the Actions tab and watch the build on expo.dev

---

## 11. Testing the setup locally

You don't have to push to `main` and trigger the workflow blind. You can validate each layer of
the setup from your machine first, cheapest checks before slowest. Work down this list — stop at
whatever depth you need.

All commands assume you've run `npm ci` and are inside `idioms-app/`. `npx eas-cli@latest`
downloads the CLI on demand, so you don't need it installed globally.

### Layer 1 — Authentication & project link (seconds, free)

```bash
npx eas-cli@latest whoami
```

Confirms you're logged in. The account must have access to the **`luxyana-studios`** org that
owns the project. If it prints `Not logged in`, run `npx eas-cli@latest login` (or set
`EXPO_TOKEN` in your shell — the same token CI uses).

### Layer 2 — Config resolution (seconds, free)

This merges `app.config.ts` + `eas.json` exactly the way EAS will, and prints the result without
building anything. It's the fastest way to catch a typo in a profile name, a bad `projectId`, or
a malformed `eas.json`:

```bash
npx eas-cli@latest config --platform android --profile production
npx eas-cli@latest config --platform ios --profile production
```

Check the output shows the right `slug` (`idioms`), `owner` (`luxyana-studios`), bundle
identifiers, and that the `submit.production` block resolves. If `ascAppId` is still the
`REPLACE_WITH_...` placeholder, you'll see it here — a reminder iOS submit isn't ready yet.

### Layer 3 — Secrets & credentials exist (seconds, free)

```bash
npx eas-cli@latest secret:list                       # EAS project secrets (Apple + Google keys)
npx eas-cli@latest credentials                        # interactive: inspect signing credentials
```

`secret:list` should show `GOOGLE_SERVICE_ACCOUNT_KEY`, `APPLE_API_KEY_ID`,
`APPLE_API_ISSUER_ID`, and `APPLE_API_KEY` once you've created them (§6). `credentials` lets you
confirm the Android Keystore and iOS Distribution Certificate / Provisioning Profile are stored —
these are generated the first time you build interactively.

Separately, the **`EXPO_TOKEN`** GitHub secret can't be read back, but you can prove it works by
running the CLI locally with that exact token:

```bash
EXPO_TOKEN=<the-token-you-put-in-github> npx eas-cli@latest whoami
```

If that prints the expected account, CI will authenticate the same way.

### Layer 4 — Compile locally, no cloud, no store (~10–20 min, needs the native toolchain)

`--local` runs the actual production build on your machine instead of EAS servers. It proves the
`production` profile compiles and signs, without consuming EAS build minutes or touching any
store. You already have the Android toolchain (JDK 17 + Android SDK) from the main README, so:

```bash
npx eas-cli@latest build --platform android --profile production --local
```

This produces a signed `.aab` in the working directory. (iOS `--local` requires macOS + Xcode, so
skip it on Linux.) Nothing is submitted — `--local` and `--auto-submit` are independent.

### Layer 5 — Full cloud build, but withhold submit (~8–15 min on EAS)

The safest end-to-end rehearsal of what CI does. Run the **exact** workflow command, minus
`--auto-submit`, so EAS builds on its servers and stores the artifact but never uploads to a
store:

```bash
npx eas-cli@latest build --platform android --profile production --non-interactive
```

Watch it on expo.dev → Builds. If this succeeds, the only thing the CI workflow adds is the
`--auto-submit` step — which you can then validate in isolation against the finished artifact:

```bash
npx eas-cli@latest submit --platform android --profile production --latest
```

> `submit` **does** upload to the Play Store internal track — it's the real thing, just decoupled
> from the build. Use it once you're confident the submit credentials are in place; the internal
> track has no review and only reaches opted-in testers.

### Layer 6 — Exercise the GitHub Actions workflow itself (optional)

To test the workflow YAML (not just the underlying `eas` command), either:

- **Preferred:** push the branch and use the Actions tab → **EAS Build** → *Run workflow* with
  `platform: android`. `workflow_dispatch` runs from any branch, so you don't need to merge to
  `main` to try it.
- **Locally with [`act`](https://github.com/nektos/act)** (needs Docker):
  ```bash
  act workflow_dispatch -W .github/workflows/eas-build.yml \
    --input platform=android \
    -s EXPO_TOKEN=<the-token>
  ```
  `act` reproduces the runner steps (checkout → node → `npm ci` → `eas build`). Note it still
  queues a **real** EAS build, so pass `platform: android` and be ready for it to auto-submit.

### Suggested order for a first-time dry run

1. Layer 1–3 — confirm auth, config, and secrets in under a minute.
2. Layer 5 (build without `--auto-submit`) — one real cloud build, no store impact.
3. Layer 5's `submit --latest` — confirm the artifact reaches the internal track.
4. Only then trigger the real workflow (Layer 6) end-to-end.
