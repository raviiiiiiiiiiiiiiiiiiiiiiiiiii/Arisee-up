# Arise Up — Solo Leveling Tasks App

Dark-themed gamified tasks app inspired by Solo Leveling anime.

## File Structure

```
AriseUp/
├── App.js                    ← Navigation root
├── app.json                  ← Expo config
├── package.json              ← Dependencies
└── screens/
    ├── AuthScreen.js         ← Login / Signup
    ├── HomeScreen.js         ← Daily Quest / Tasks
    ├── LevelScreen.js        ← XP, Level, Stats, Ranks
    └── AccountScreen.js      ← Profile, Settings, Logout
```

## Setup (from mobile using Gitpod)

1. Go to gitpod.io → New Workspace → paste your GitHub repo URL
2. In terminal:
   ```
   npm install -g eas-cli
   npm install
   eas login
   eas build:configure
   eas build --platform android --profile preview
   ```
3. EAS builds APK in cloud → download link emailed to you

## Local dev (if you get access to a machine)

```bash
npm install
npx expo start
```

Scan QR with Expo Go app on phone to preview instantly.

## Adding AdMob

1. Install: `npx expo install expo-ads-admob`
2. Add to app.json under android: `"googleMobileAdsAppId": "ca-app-pub-XXXXXXXX~XXXXXXXX"`
3. In HomeScreen.js, import and add banner:
   ```js
   import { AdMobBanner } from 'expo-ads-admob';
   <AdMobBanner adUnitID="ca-app-pub-3940256099942544/6300978111" /> // test ID
   ```
4. Replace test ID with real ID after AdMob account approval

## Connecting Real Backend

Replace the fake auth in AuthScreen.js `handleSubmit()` with your actual API:
```js
const res = await fetch('https://your-vercel-api.vercel.app/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await res.json();
if (data.token) {
  // store token, navigate to Main
}
```

## Tech Stack
- Expo SDK 51
- React Navigation (Stack + Bottom Tabs)
- React Native Animated API
- No external UI libraries — all custom
