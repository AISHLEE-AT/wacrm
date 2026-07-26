# FAGO Native Android App

## Overview
Native Android (Kotlin + Jetpack Compose) companion to the FAGO Flutter app.
**Same Supabase backend. Same Firebase project. Same WhatsApp OTP auth.**

---

## Project Structure

```
fago_native/
├── .env                         ← Supabase & API keys (shared with fago_app)
├── build.gradle.kts             ← Root project Gradle
├── settings.gradle.kts
├── gradle/libs.versions.toml   ← Version catalog
└── app/
    ├── google-services.json     ← Firebase config (com.fago.native registered)
    ├── build.gradle.kts         ← App module Gradle (reads .env automatically)
    ├── proguard-rules.pro
    └── src/main/
        ├── AndroidManifest.xml  ← All permissions (location, NFC, BT, camera, biometric)
        ├── java/com/fago/fagoapp/
        │   ├── FagoApplication.kt       ← App entry — init Supabase + Firebase + Koin
        │   ├── MainActivity.kt          ← Single activity — Compose NavHost
        │   ├── auth/
        │   │   └── AuthViewModel.kt     ← Same logic as Flutter auth_provider.dart
        │   ├── services/
        │   │   ├── DeviceAuthService.kt         ← DataStore-based device auth
        │   │   ├── DriverLocationService.kt     ← 🔑 Foreground GPS service
        │   │   └── FagoFirebaseMessagingService.kt ← FCM push handling
        │   ├── receivers/
        │   │   └── BootReceiver.kt      ← Restart driver service after reboot
        │   ├── di/
        │   │   └── AppModule.kt         ← Koin DI module
        │   └── ui/
        │       ├── theme/FagoTheme.kt   ← Material3 dark theme
        │       ├── navigation/FagoNavHost.kt ← Role-based routing
        │       └── screens/
        │           ├── auth/LoginScreen.kt   ← WhatsApp OTP + biometric
        │           ├── profile/ProfileScreen.kt ← ADMIN/DRIVER/USER tag
        │           ├── admin/AdminCrmScreen.kt  ← CRM hub (TODO)
        │           ├── driver/DriverHomeScreen.kt (TODO)
        │           └── rider/RiderHomeScreen.kt  (TODO)
        └── res/
            ├── values/strings.xml
            ├── values/themes.xml
            └── xml/
                ├── backup_rules.xml
                └── data_extraction_rules.xml
```

---

## Shared Backend (No Changes Needed)

| Service | Shared Resource |
|---|---|
| Supabase | `gmahjdzqitbomtmdzlfp.supabase.co` — same tables |
| Firebase | `fago-letstravo` — same project |
| FCM | Same push notifications — both apps receive |
| WhatsApp OTP | Same Vercel API endpoints |
| Admin phone | `9486335870` — same hardcoded check |

---

## Key Features (Native Advantage over Flutter)

### 1. Foreground GPS Service (`DriverLocationService.kt`)
Stays alive even with battery optimization ON. Updates Supabase `driver_locations` every 5 seconds.

```kotlin
DriverLocationService.startService(context, driverId, driverName)
```

### 2. DataStore Device Auth (`DeviceAuthService.kt`)
Type-safe, encrypted, coroutine-friendly — replaces Flutter's SharedPreferences.

### 3. Role-based Navigation
Admin → AdminCrmScreen, Driver → DriverHomeScreen, User → RiderHomeScreen.

---

## How to Open in Android Studio

1. Open Android Studio
2. File → Open → select `wacrm/apps/fago_native/`
3. Let Gradle sync
4. Run on device or emulator

---

## Environment Variables

All keys are in `.env` — they are auto-injected as `BuildConfig` fields at compile time.
No secrets are hardcoded in source files.

```
SUPABASE_URL=https://gmahjdzqitbomtmdzlfp.supabase.co
SUPABASE_ANON_KEY=...
WHATSAPP_OTP_SEND_URL=...
ADMIN_PHONE=9486335870
```
