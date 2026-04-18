# ADR 001 — Cross-Platform Navigation

**Date:** 2026-04  
**Status:** Accepted — Option B

---

## Context

The app targets full parity across iOS, Android, and Web. Expo Router supports all three platforms via the same file-based routing system, but the expected navigation UX differs significantly:

- **Mobile (iOS/Android):** Tab bar at the bottom is the platform convention
- **Web:** Tab bars feel out of place — users expect a sidebar or top navigation

The luxyana-template already uses Expo Router with a unified tab bar layout (`src/app/(main)/_layout.tsx`).

---

## Options

### Option A — Mobile-only tab bar, web gets a sidebar
- Tab bar renders on iOS/Android
- Web renders a persistent left sidebar or top nav
- Most native-feeling on each platform
- Requires platform-specific layout components

### Option B — Unified tab bar everywhere
- Same tab bar component on all platforms
- Simpler to build and maintain
- Feels slightly off on web but acceptable for v1
- Many successful web apps use this (e.g. Twitter/X web)

### Option C — Responsive layout
- Detect screen width — narrow = tab bar, wide = sidebar
- Works well for tablets and large web viewports
- Most complex to implement
- Best long-term option

---

## Recommendation

**Option B** (unified tab bar) accepted for v1. The luxyana-template already ships with this layout. Unistyles v3 supports breakpoints for responsive layouts, so migrating to **Option C** later is feasible when web usage warrants it.
