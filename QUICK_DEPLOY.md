# ⚡ Quick Deploy Guide

## 🚀 Deploy in 10 Minutes

### Step 1: Push to GitHub (2 min)

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy Backend to Railway (3 min)

1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. **Settings** → **Root Directory** → Enter: `backend`
5. **Variables** → Add:
   ```
   HEDERA_ACCOUNT_ID=0.0.7283186
   HEDERA_PRIVATE_KEY=3030020100300706052b8104000a04220420ea0fbf0852a76ca4ebaf0afd87277f8970252c20b610a23bdadb1ef06ca1ed93
   HEDERA_NETWORK=testnet
   HEDERA_TOPIC_ID=0.0.7302124
   BASE_REWARD_HBAR=0.001
   ENABLE_REAL_TRANSFERS=false
   ```
6. Copy your Railway URL

### Step 3: Update Frontend Config (1 min)

Edit `.env.production`:
```env
VITE_API_URL=https://YOUR_RAILWAY_URL/api
```

Replace `YOUR_RAILWAY_URL` with your actual Railway URL.

### Step 4: Deploy Frontend to Vercel (3 min)

1. Go to https://vercel.com
2. Click **"Add New Project"** → **"Import Git Repository"**
3. Select your repository
4. **Environment Variables** → Add:
   ```
   VITE_API_URL=https://YOUR_RAILWAY_URL/api
   ```
5. Click **"Deploy"**

### Step 5: Update CORS (1 min)

1. Copy your Vercel URL
2. Go to Railway → **Variables** → Add:
   ```
   FRONTEND_URL=https://YOUR_VERCEL_URL
   ```
3. Railway will auto-redeploy

---

## ✅ Done!

Your app is live:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-app.railway.app

---

## 🐛 Quick Fixes

### CORS Error?
Add Vercel URL to Railway environment variables:
```
FRONTEND_URL=https://your-app.vercel.app
```

### API Not Connecting?
Check `.env.production` has correct Railway URL:
```
VITE_API_URL=https://your-railway-url.railway.app/api
```

### Build Failed?
Check `package.json` has all dependencies:
```bash
npm install
```

---

## 📱 Test Your Deployment

1. Open your Vercel URL
2. Check splash screen appears
3. Verify map loads
4. Check stats display
5. Open browser console (F12) - should be no errors

---

**Need detailed instructions?** See `DEPLOYMENT_GUIDE.md`
