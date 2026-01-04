# Quick OAuth Client ID Setup - Abhi Karo

## 📸 Aapke Screen Par:

Aap abhi **"Credentials"** page par ho, aur **"OAuth 2.0 Client IDs"** section mein **"No OAuth clients to display"** dikha raha hai.

## ✅ Ab Ye Steps Follow Karo:

### Step 1: Create Credentials Button Click Karo
1. Top right corner mein **"+ Create credentials"** button dikh raha hai
2. Us par **click karo**
3. Ek dropdown menu aayega

### Step 2: OAuth client ID Select Karo
1. Dropdown menu se **"OAuth client ID"** option select karo
2. Agar pehli baar ho, toh ek warning aayega about OAuth consent screen
3. Agar warning aaye, toh pehle **"OAuth consent screen"** setup karna hoga (next steps mein)

### Step 3: OAuth Consent Screen Setup (Agar Required Ho)
1. Agar warning aaye, toh **"CONFIGURE CONSENT SCREEN"** button click karo
2. User type: **"External"** select karo
3. "Create" click karo
4. App information fill karo:
   - **App name**: MeGo App
   - **User support email**: Apna email select karo
   - **Developer contact information**: Apna email
5. "Save and Continue" click karo (3-4 times, har step par)
6. Phir wapas **"Credentials"** page par aao

### Step 4: OAuth Client ID Create Karo
1. Phir se **"+ Create credentials"** > **"OAuth client ID"** click karo
2. Ab ek form aayega:

   **Application type:**
   - Dropdown se **"Web application"** select karo

   **Name:**
   - Type karo: **"MeGo App Web Client"** (ya kuch bhi naam)

   **Authorized redirect URIs:**
   - **"+ ADD URI"** button click karo
   - Yeh add karo: `https://auth.expo.io/@your-expo-username/megoapp`
   - **Note**: `your-expo-username` ki jagah apna Expo username likho
   - Ya agar Expo username nahi pata, toh yeh bhi add karo: `megoapp://`

3. **"CREATE"** button click karo

### Step 5: Client ID Copy Karo
1. Ek popup window aayega
2. **"OAuth client created"** message dikhega
3. **"Client ID"** copy karo (yeh ek long string hogi)
   - Format: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
4. **"OK"** click karo

### Step 6: Code Mein Add Karo

**File: `MegoApp/app/login.js`**
- Line 42 par jao
- Yeh line:
  ```javascript
  expoClientId: "YOUR_GOOGLE_CLIENT_ID",
  ```
- Replace karo:
  ```javascript
  expoClientId: "paste-your-copied-client-id-here",
  ```

**File: `MegoApp/app/signup.js`**
- Line 46 par jao
- Same change karo

### Step 7: App Restart Karo
1. Terminal mein app stop karo (Ctrl+C)
2. Phir se start karo: `npm start`

### Step 8: Test Karo
1. Login screen par jao
2. "Google" button click karo
3. Google account select karo
4. Login ho jayega! ✅

---

## 🎯 Quick Checklist:

- [ ] "+ Create credentials" button click kiya
- [ ] "OAuth client ID" select kiya
- [ ] OAuth consent screen setup kiya (agar required ho)
- [ ] Application type: "Web application" select kiya
- [ ] Name: "MeGo App Web Client" diya
- [ ] Redirect URI add kiya
- [ ] "CREATE" button click kiya
- [ ] Client ID copy kar li
- [ ] login.js aur signup.js mein add kar di
- [ ] App restart kar di
- [ ] Test kar liya

---

## ⚠️ Important Notes:

1. **Expo Username Kaise Pata Karein:**
   - Terminal mein: `expo whoami`
   - Ya Expo website par login karke profile dekho

2. **Redirect URI Format:**
   - `https://auth.expo.io/@username/megoapp`
   - Ya: `megoapp://`

3. **Client ID Format:**
   - Long string hogi
   - Spaces nahi hone chahiye
   - Example: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

---

## 🆘 Agar Problem Aaye:

**"OAuth consent screen not configured" error:**
- Pehle OAuth consent screen setup karo (Step 3 dekho)

**"Redirect URI mismatch" error:**
- Redirect URI sahi hai ya nahi check karo
- Expo username sahi hai ya nahi verify karo

**Client ID copy nahi ho rahi:**
- Popup window mein "Client ID" ke neeche copy button hoga
- Ya manually select karke Ctrl+C karo



