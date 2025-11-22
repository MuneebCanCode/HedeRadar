# 🚀 Deployment Guide - Railway & Vercel

## Overview

This guide will help you deploy:
- **Backend** → Railway (Node.js server)
- **Frontend** → Vercel (React app)

---

## 📋 Prerequisites

Before deploying, ensure you have:
- [x] GitHub account
- [x] Railway account (https://railway.app)
- [x] Vercel account (https://vercel.com)
- [x] Git repository with your code
- [x] Hedera testnet credentials

---

## Part 1: Deploy Backend to Railway

### Step 1: Prepare Backend for Deployment

#### 1.1 Create `backend/package.json` (if not exists)

The backend needs its own package.json. Check if `backend/package.json` exists.

#### 1.2 Add Start Script

Ensure `backend/package.json` has:
```json
{
  "type": "module",
  "scripts": {
    "start": "node server.js"
  }
}
```

#### 1.3 Create Railway Configuration

Create `railway.toml` in the **backend** folder:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node server.js"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Step 2: Push Code to GitHub

```bash
# If not already initialized
git init
git add .
git commit -m "Prepare for deployment"

# Create GitHub repository and push
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Railway

#### 3.1 Create New Project
1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your repository

#### 3.2 Configure Root Directory
1. In Railway dashboard, click on your service
2. Go to **Settings**
3. Under **"Root Directory"**, enter: `backend`
4. Click **"Save"**

#### 3.3 Add Environment Variables
1. Go to **Variables** tab
2. Add these variables:

```
PORT=3001
HEDERA_ACCOUNT_ID=0.0.7283186
HEDERA_PRIVATE_KEY=3030020100300706052b8104000a04220420ea0fbf0852a76ca4ebaf0afd87277f8970252c20b610a23bdadb1ef06ca1ed93
HEDERA_NETWORK=testnet
HEDERA_TOPIC_ID=0.0.7302124
BASE_REWARD_HBAR=0.001
ENABLE_REAL_TRANSFERS=false
NODE_ENV=production
```

#### 3.4 Deploy
1. Railway will automatically deploy
2. Wait for deployment to complete
3. Copy your Railway URL (e.g., `https://your-app.railway.app`)

### Step 4: Verify Backend Deployment

Test your backend:
```bash
curl https://your-app.railway.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "hedera": true,
  "timestamp": 1234567890
}
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Frontend for Deployment

#### 1.1 Update API URL

Create `src/config.js`:
```javascript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

#### 1.2 Update `src/App.jsx`

Replace:
```javascript
const API_URL = 'http://localhost:3001/api';
```

With:
```javascript
import { API_URL } from './config';
```

#### 1.3 Create `.env.production`

Create `.env.production` in root:
```env
VITE_API_URL=https://your-app.railway.app/api
```

Replace `your-app.railway.app` with your actual Railway URL.

#### 1.4 Update CORS on Backend

In `backend/server.js`, update CORS:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-vercel-app.vercel.app'  // Add your Vercel URL
  ]
}));
```

### Step 2: Push Changes to GitHub

```bash
git add .
git commit -m "Configure for production deployment"
git push origin main
```

### Step 3: Deploy on Vercel

#### 3.1 Import Project
1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository
5. Click **"Import"**

#### 3.2 Configure Build Settings

Vercel should auto-detect Vite. Verify:
- **Framework Preset**: Vite
- **Root Directory**: `./` (leave as root)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### 3.3 Add Environment Variables

In Vercel project settings:
1. Go to **Settings** → **Environment Variables**
2. Add:

```
VITE_API_URL=https://your-app.railway.app/api
```

Replace with your actual Railway URL.

#### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (2-3 minutes)
3. Vercel will provide a URL (e.g., `https://your-app.vercel.app`)

### Step 4: Update Backend CORS

Now that you have your Vercel URL, update backend CORS:

1. Go to Railway dashboard
2. Add environment variable:
```
FRONTEND_URL=https://your-app.vercel.app
```

3. Update `backend/server.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
```

4. Commit and push:
```bash
git add backend/server.js
git commit -m "Update CORS for production"
git push origin main
```

Railway will auto-redeploy.

---

## 🔍 Verification Checklist

### Backend (Railway)
- [ ] Health endpoint works: `https://your-app.railway.app/api/health`
- [ ] Hedera integration active
- [ ] Environment variables set
- [ ] No errors in Railway logs

### Frontend (Vercel)
- [ ] App loads: `https://your-app.vercel.app`
- [ ] Splash screen appears
- [ ] Map displays correctly
- [ ] Stats load from backend
- [ ] No CORS errors in browser console

### Integration
- [ ] Frontend connects to backend
- [ ] Aircraft positions display
- [ ] Alerts show up
- [ ] Receivers display with rewards
- [ ] HCS Topic ID visible

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Railway deployment fails
- Check `backend/package.json` exists
- Verify `"type": "module"` is set
- Check Railway logs for errors

**Problem**: Hedera not connecting
- Verify environment variables in Railway
- Check Hedera credentials are correct
- Ensure HEDERA_TOPIC_ID is set

**Problem**: Port binding error
- Railway automatically assigns PORT
- Don't hardcode port 3001 in production
- Use: `const PORT = process.env.PORT || 3001;`

### Frontend Issues

**Problem**: API calls fail (CORS error)
- Update CORS in backend to include Vercel URL
- Redeploy backend after CORS update
- Clear browser cache

**Problem**: Environment variables not working
- Ensure variables start with `VITE_`
- Redeploy after adding variables
- Check Vercel deployment logs

**Problem**: Build fails
- Check `package.json` dependencies
- Verify Node version compatibility
- Check Vercel build logs

### Common Issues

**Problem**: 404 on API calls
- Verify API_URL includes `/api`
- Check Railway URL is correct
- Test backend endpoint directly

**Problem**: Blank page on Vercel
- Check browser console for errors
- Verify build completed successfully
- Check Vercel function logs

---

## 📝 Post-Deployment Tasks

### 1. Update Documentation

Update README.md with live URLs:
```markdown
## Live Demo

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-app.railway.app
- **HCS Topic**: https://hashscan.io/testnet/topic/0.0.7302124
```

### 2. Monitor Deployments

**Railway:**
- Check logs regularly
- Monitor resource usage
- Set up alerts

**Vercel:**
- Check analytics
- Monitor function execution
- Review error logs

### 3. Set Up Custom Domains (Optional)

**Railway:**
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS records

**Vercel:**
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS records

---

## 🔄 Continuous Deployment

Both Railway and Vercel support automatic deployments:

### Auto-Deploy on Git Push

**Railway:**
- Automatically deploys on push to `main` branch
- Configure in Settings → Deployments

**Vercel:**
- Automatically deploys on push to `main` branch
- Preview deployments for pull requests
- Configure in Settings → Git

### Manual Deployment

**Railway:**
```bash
# Trigger redeploy
railway up
```

**Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 💰 Cost Considerations

### Railway
- **Free Tier**: $5 credit/month
- **Hobby Plan**: $5/month
- Charges based on usage (CPU, RAM, Network)

### Vercel
- **Hobby Plan**: Free
- **Pro Plan**: $20/month
- Free tier includes:
  - 100 GB bandwidth
  - Unlimited deployments
  - Automatic HTTPS

---

## 🔐 Security Best Practices

### 1. Environment Variables
- Never commit `.env` to Git
- Use different credentials for production
- Rotate keys regularly

### 2. CORS Configuration
- Only allow specific origins
- Don't use `*` in production
- Update when adding new domains

### 3. API Security
- Implement rate limiting
- Add authentication if needed
- Monitor for suspicious activity

### 4. Hedera Security
- Use separate testnet/mainnet accounts
- Keep private keys secure
- Monitor transaction costs

---

## 📊 Monitoring & Analytics

### Railway Monitoring
- CPU usage
- Memory usage
- Network traffic
- Error logs

### Vercel Analytics
- Page views
- Performance metrics
- Error tracking
- Function execution

---

## 🎉 Success!

Your HedeRadar application is now live!

**Frontend**: https://your-app.vercel.app
**Backend**: https://your-app.railway.app

Share your deployed application and showcase:
- Real-time aircraft tracking
- MLAT position calculations
- Hedera blockchain integration
- Automated reward system
- Safety alert monitoring

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Hedera Documentation](https://docs.hedera.com)

---

**Need Help?**
- Railway Support: https://railway.app/help
- Vercel Support: https://vercel.com/support
- Hedera Discord: https://hedera.com/discord
