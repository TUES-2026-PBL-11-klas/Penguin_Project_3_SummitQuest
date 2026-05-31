# SummitQuest — Frontend

A React Native (Expo) app that turns mountain hikes into personalized "quests."
White / green / brown, minimalist, Airbnb-style design.

## Tech stack

- **Expo** (SDK 56) + **React Native** 0.85 + **React** 19
- **React Navigation** (native stack) for screen flow
- **react-native-webview + Leaflet** for interactive maps (OpenStreetMap tiles)
- **@expo/vector-icons** (Ionicons / MaterialCommunityIcons)
- TypeScript

## Getting started

```bash
npm install
npm start        # Metro + QR code — scan with the Expo Go app
# or
npm run web      # for web view in chrome
npm run ios      # open in the iOS Simulator (needs Xcode installed)
npm run android  # open in an Android emulator
```

> Maps need an internet connection (Leaflet library + OpenStreetMap tiles load over the network).

## Project structure

```
src/
  theme/        Design system — colors, spacing, type, shadows
  data/         TypeScript types + mock data (quests, profile, badges)
  state/        AppState context (profile, finished quests)
  navigation/   Route param types
  components/    Reusable UI (TopBar, Button, LeafletMap, forms, ...)
  screens/      One file per screen
App.tsx         Navigation container + stack
```

## Screens

| Screen | What it does |
| --- | --- |
| **Home** | Scrollable landing: logo, motto, mountain photos, Sign up / Log in |
| **Sign up / Log in** | Account creation (name, email, weight, traveler type) and login |
| **Find Quest** | Pick transport + travel time → generate a quest with 4 swipe pages (route map, getting there, weather, fitness). Accept → Verify flow |
| **Finished Quests** | Overview map of all completed routes + a log of quest cards |
| **Quest detail** | Full stats for one finished quest |
| **Profile** | Identity, lifetime totals, editable traveler type & weight |
| **Badges & Awards** | Earned / locked achievements |

A persistent top task bar (logo + profile menu) appears on all logged-in screens.

## Status / notes

This is the **design + navigation** phase, so:

- All data is **mock data** seeded in `src/data/mock.ts` (resets on app restart).
- Map routes, the "you are here" pin, weather, and the Verify GPS check are **simulated** — not yet from real location/routing APIs.
- Accepting + verifying a quest does update lifetime totals at runtime via the `AppState` context.

Planned next steps: wire `expo-location` + OSRM for real routes, and connect to the FastAPI backend for persistence.
