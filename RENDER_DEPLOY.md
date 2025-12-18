# CampusVibe - Render Backend + APK Build Guide

## Overview
Ye guide aapko step-by-step batayegi ki kaise:
1. Render.com pe backend deploy karna hai
2. Database setup karna hai
3. Expo EAS se APK build karna hai

**Important**: Is app mein keep-alive feature hai jo backend ko sleep hone se rokta hai!

---

## PART 1: Database Setup (Neon.tech - Forever Free)

Render ka free PostgreSQL 90 din baad expire hota hai, isliye Neon.tech use karo.

### Steps:
1. **Neon.tech pe jao**: https://neon.tech
2. **Sign up karo** (GitHub se recommended)
3. **"New Project" create karo**
4. **Connection string copy karo** - ye aisa dikhega:
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. **Ye string save kar lo** - Render mein use hogi

---

## PART 2: GitHub pe Code Upload Karo

### Steps:
1. **Replit se download karo**:
   - Files panel mein 3 dots click karo (top right)
   - "Download as zip" select karo

2. **GitHub pe upload karo**:
   - https://github.com/new pe jao
   - Naya repository create karo (e.g., `campusvibe-backend`)
   - Zip extract karke code upload karo
   - Ya git commands use karo:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin https://github.com/YOUR_USERNAME/campusvibe-backend.git
     git push -u origin main
     ```

---

## PART 3: Render.com pe Deploy Karo

### Steps:
1. **Render.com pe jao**: https://render.com
2. **Sign up karo** (GitHub se recommended)
3. **Dashboard pe "New +" click karo**
4. **"Web Service" select karo**
5. **GitHub repository connect karo**
6. **Settings configure karo**:
   - **Name**: `campusvibe-backend`
   - **Region**: Oregon (Free tier ke liye best)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run server:build`
   - **Start Command**: `node server_dist/index.cjs`
   - **Instance Type**: Free

7. **Environment Variables add karo**:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Neon.tech ka connection string |
   | `NODE_ENV` | `production` |
   | `ALLOWED_ORIGINS` | `*` |
   | `RENDER_EXTERNAL_URL` | (Render automatically set karega) |

8. **"Create Web Service" click karo**
9. **Wait karo** - 5-10 minute lagenge deploy hone mein

---

## PART 4: Database Tables Create Karo

Deploy hone ke baad:

1. **Render Dashboard pe jao**
2. **Apni service select karo**
3. **"Shell" tab click karo**
4. **Ye command run karo**:
   ```bash
   npm run db:push
   ```
5. **Success message aayega** - Tables create ho jayenge

---

## PART 5: Backend URL Note Karo

1. Render dashboard pe apni service dekho
2. URL copy karo - ye aisa hoga:
   ```
   https://campusvibe-backend.onrender.com
   ```
3. Test karo browser mein:
   ```
   https://campusvibe-backend.onrender.com/api/health
   ```
   Response aana chahiye: `{"status":"ok","timestamp":"..."}`

---

## PART 6: EAS.json mein URL Update Karo (if needed)

Agar tumhara Render URL different hai, to update karo:

1. **`eas.json`** file open karo
2. **`EXPO_PUBLIC_API_URL`** update karo apne actual Render URL se:
   ```json
   "env": {
     "EXPO_PUBLIC_API_URL": "https://YOUR-APP-NAME.onrender.com"
   }
   ```

---

## PART 7: APK Build Karo (Expo EAS)

### Prerequisites:
- Expo account hona chahiye (https://expo.dev)
- EAS CLI install hona chahiye

### Steps:

1. **Replit Shell mein jao**

2. **Expo login karo**:
   ```bash
   npx eas-cli login
   ```

3. **APK build start karo**:
   ```bash
   npx eas-cli build --platform android --profile preview
   ```

4. **Wait karo** - 10-20 minute lag sakte hain

5. **Build complete hone pe link milega** - APK download kar lo!

---

## Keep-Alive Feature (Backend Sleep Nahi Hoga!)

Is app mein automatic keep-alive feature hai:
- Har 14 minute mein server khud ko ping karta hai
- Render free tier 15 min inactivity ke baad sleep hota hai
- Ye feature us se pehle ping karke backend ko jaagta rakhta hai

**Note**: Render free tier mein 750 hours/month milte hain, jo ek service ke liye kaafi hai.

---

## Troubleshooting

### "Connection refused" error
- Check karo DATABASE_URL sahi hai
- Neon.tech pe project active hai

### "Table does not exist" error
- Render shell mein `npm run db:push` run karo

### Images not loading
- Render pe uploads folder temporary hai
- Future mein Cloudinary add karna padega for permanent storage

### First request slow
- Agar kisi wajah se server sleep ho gaya, pehli request mein 30-60 sec lag sakte hain
- Baad ke requests fast hongi

---

## Quick Commands Reference

| Command | Description |
|---------|-------------|
| `npm run db:push` | Database tables create karo |
| `npx eas-cli login` | Expo mein login karo |
| `npx eas-cli build --platform android --profile preview` | APK build karo |
| `npx eas-cli build --platform android --profile production` | Production APK build |

---

## Support

Koi problem ho to:
1. Render logs check karo (Dashboard > Logs)
2. Expo build logs check karo (expo.dev > Builds)
3. Health endpoint check karo: `https://your-app.onrender.com/api/health`
