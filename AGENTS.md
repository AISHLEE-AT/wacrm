<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# 🚨 AGENT RULES — READ THIS FIRST EVERY SESSION

## ✅ Project Location — ALWAYS USE D:\w

**The REAL project is at: `D:\w`**

DO NOT use:
- `C:\Users\fastg\.gemini\antigravity\scratch\wacrm_aishlee` ❌ (old copy, outdated)
- Any path on C: drive for this project ❌

**Always run commands from `D:\w` or its subdirectories.**

---

## 📁 Project Structure

```
D:\w\                          ← ROOT (always work here)
├── apps\
│   ├── mobile\                ← React Native / Expo app
│   │   ├── android\           ← Android build folder
│   │   ├── src\screens\       ← All screens
│   │   ├── src\context\       ← AppContext, auth state
│   │   ├── App.tsx            ← Main app entry
│   │   └── package.json
│   ├── web\                   ← Web app (Next.js)
│   └── api\                   ← API routes
├── packages\                  ← Shared packages
├── supabase\                  ← Supabase config
├── build_apk.bat              ← Debug APK build (needs Metro)
└── build_release_apk.bat      ← Release APK build (standalone)
```

---

## 📱 Android Build Rules

| Build Type | Command | Use When |
|------------|---------|----------|
| **Release** (standalone) | `cd D:\w\apps\mobile\android` → `.\gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a` | **ALWAYS use this for phone install** |
| Debug | `assembleDebug` | Only for dev with Metro running |

- APK output: `D:\w\apps\mobile\android\app\build\outputs\apk\release\app-release.apk`
- Phone device ID: `10BDAK36750007D`
- Install command: `adb -s 10BDAK36750007D install -r D:\w\apps\mobile\android\app\build\outputs\apk\release\app-release.apk`

---

## 🔧 Tech Stack

- **Mobile:** React Native + Expo SDK 57 (com.poovisri.mobile)
- **Backend:** Supabase (https://gmahjdzqitbomtmdzlfp.supabase.co)
- **Web API:** https://watscrm.vercel.app
- **Package manager:** npm (run `npm install` from `D:\w\apps\mobile` if packages missing)
- **Admin phones:** 6381029380, 9876543210, 9486335870

---

## ⚠️ Common Issues & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| Red screen on phone | Debug APK installed (no Metro) | Build & install RELEASE APK |
| Build fails - missing android dir | node_modules incomplete | Run `npm install` in `D:\w\apps\mobile` |
| Wrong project path used | Agent searched C: scratch | **Always use D:\w** |
