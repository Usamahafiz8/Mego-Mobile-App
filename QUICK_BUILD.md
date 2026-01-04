# ⚡ Quick APK Build Guide

## 🚀 Sabse Aasan Tareeqa (EAS Build)

### Step 1: Terminal Mein Jao
```bash
cd MegoApp
```

### Step 2: Expo Login (Agar Pehle Se Nahi Hai)
```bash
npx expo login
```

### Step 3: EAS CLI Install
```bash
npm install -g eas-cli
```

### Step 4: APK Build
```bash
eas build --platform android --profile preview
```

### Step 5: APK Download
- Build complete hone ke baad Expo dashboard par jao: https://expo.dev
- Apne project mein jao
- Builds section se APK download karo

**Yeh sabse aasan tareeqa hai! Cloud par build hoga, aapko kuch setup nahi karna padega.**

---

## 📝 Important: API URL Update

**Abhi aapke paas production URL nahi hai, to local URL use ho raha hai.**

Jab production URL mile, to yeh files update karo:

### File 1: `src/config/api.js`
Line 3 par:
```javascript
export const API_BASE_URL = "https://your-production-url.com";
```

### File 2: `src/hub/userHub.js`
Line 7 par:
```javascript
const BASE_URL = "https://your-production-url.com".replace(/\/v1$/, "");
```

**Phir dobara APK build karo!**

---

## 🎯 Alternative: Build Script Use Karo

Windows par:
```bash
.\build-apk.ps1
```

Ya:
```bash
.\build-apk.bat
```

Yeh script aapko options dega - EAS Build ya Local Build.

---

## ✅ Checklist

APK banane se pehle:
- [ ] `npm install` kiya (dependencies install ki)
- [ ] Expo account hai (agar EAS build use kar rahe ho)
- [ ] API URL check kiya (abhi local hai, theek hai)

---

## 📱 APK Install

1. APK file phone mein transfer karo
2. Phone settings → Security → "Unknown Sources" enable karo
3. APK file par click karo
4. Install karo

**Done! App fully functional use kar sakte hain!**

---

## 🔧 Agar Problem Ho

### EAS Build Nahi Ho Raha?
- Expo account check karo: `expo whoami`
- Login karo: `expo login`

### Local Build Nahi Ho Raha?
- Android Studio install karo
- Android SDK setup karo
- `ANDROID_HOME` environment variable set karo

### Detailed Guide Chahiye?
`BUILD_APK_GUIDE.md` file dekho - wahan sab kuch detail mein hai!

---

**Note:** Production URL milne ke baad API URLs update karna mat bhoolna! 🚀

