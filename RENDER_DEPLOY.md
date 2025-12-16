# Render.com Free Backend Deployment Guide

## Step 1: Free PostgreSQL Database Setup (Neon.tech)

Render ka free PostgreSQL database 90 din ke baad expire ho jata hai. Isliye Neon.tech use karo jo forever free hai.

1. **Neon.tech pe jao**: https://neon.tech
2. **Sign up karo** (GitHub se sign up kar sakte ho)
3. **New Project create karo**
4. **Connection string copy karo** - ye kuch aisa dikhega:
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## Step 2: Render.com Account Setup

1. **Render.com pe jao**: https://render.com
2. **Sign up karo** (GitHub se sign up recommended)

## Step 3: Backend Deploy Karo

### Option A: GitHub se (Recommended)

1. **Replit se code download karo**:
   - Files tab mein click karo
   - Top right mein 3 dots click karo
   - "Download as zip" select karo

2. **GitHub pe upload karo**:
   - GitHub pe new repository create karo
   - Code upload karo

3. **Render pe Web Service create karo**:
   - Render dashboard pe "New +" click karo
   - "Web Service" select karo
   - GitHub repo connect karo
   - Settings:
     - **Build Command**: `npm install && npm run server:build`
     - **Start Command**: `node server_dist/index.js`
     - **Instance Type**: Free

4. **Environment Variables add karo**:
   - `DATABASE_URL` = Neon.tech ka connection string
   - `NODE_ENV` = production

5. **Deploy karo** - 5-10 minute lagenge

### Option B: Manual Deploy (Blueprint se)

1. Render dashboard pe "New +" click karo
2. "Blueprint" select karo
3. Is repo ko connect karo
4. render.yaml automatically configure karega

## Step 4: Database Tables Create Karo

Deploy hone ke baad, Render shell mein jao aur run karo:
```bash
npm run db:push
```

## Step 5: APK Build Karo (Production URL ke saath)

Jab Render pe deploy ho jaye, tumhe URL milega jaise:
`https://campusvibe-backend.onrender.com`

Ab Replit pe wapas aao aur shell mein run karo:
```bash
EXPO_PUBLIC_API_URL=https://campusvibe-backend.onrender.com npm run expo:static:build
```

(Replace `campusvibe-backend` with your actual Render app name)

## Step 6: APK Download Karo

Build complete hone ke baad APK download kar lo.

## Important Notes

- **Free tier limitations**: Render free tier 15 minute inactivity ke baad sleep ho jata hai. First request mein 30-60 second lag sakti hai.
- **750 hours/month**: Free tier mein 750 hours milte hain (enough for 1 service)
- **File uploads**: Render pe file storage temporary hai. Production ke liye Cloudinary ya S3 recommend hai.

## Troubleshooting

### "Connection refused" error
- Check karo DATABASE_URL sahi hai
- Neon.tech pe project active hai

### "Table does not exist" error
- `npm run db:push` run karo Render shell mein

### Images not loading
- Render pe uploads folder temporary hai
- Cloudinary integration add karna padega for permanent image storage
