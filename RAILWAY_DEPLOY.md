# 🚂 Railway Deployment Guide

## Configuration Files Created

You now have two Railway configuration options:

### Option 1: Deploy from Backend Folder (Recommended)
**File**: `backend/railway.json`
- Set Railway root directory to `backend`
- Cleaner deployment
- Smaller build size

### Option 2: Deploy from Root
**File**: `railway.json` (root level)
- Deploy entire project
- Backend runs from subdirectory
- Useful if you need root-level files

---

## 🚀 Quick Deploy Steps

### Step 1: Push to GitHub

```bash
git add backend/railway.json railway.json
git commit -m "chore: add Railway deployment configuration"
git push origin main
```

### Step 2: Create Railway Project

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your repository

### Step 3: Configure Root Directory

**For Option 1 (Recommended):**
1. Click on your service
2. Go to **Settings**
3. Under **"Root Directory"**, enter: `backend`
4. Click **"Save"**

**For Option 2:**
- Leave root directory as default (`.`)

### Step 4: Add Environment Variables

Go to **Variables** tab and add:

```env
PORT=3001
NODE_ENV=production

# Hedera Configuration
HEDERA_ACCOUNT_ID=0.0.7283186
HEDERA_PRIVATE_KEY=3030020100300706052b8104000a04220420ea0fbf0852a76ca4ebaf0afd87277f8970252c20b610a23bdadb1ef06ca1ed93
HEDERA_NETWORK=testnet
HEDERA_TOPIC_ID=0.0.7302124

# Reward Configuration
BASE_REWARD_HBAR=0.001
ENABLE_REAL_TRANSFERS=false

# CORS (Add after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app
```

### Step 5: Deploy

Railway will automatically:
1. Detect Node.js project
2. Run `npm install`
3. Start with `node server.js`
4. Assign a public URL

### Step 6: Get Your URL

1. Go to **Settings** → **Domains**
2. Railway provides: `https://your-app.railway.app`
3. Copy this URL for frontend configuration

---

## 📋 Railway Configuration Explained

### `railway.json` Structure

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",           // Railway's build system
    "buildCommand": "npm install"     // Install dependencies
  },
  "deploy": {
    "startCommand": "node server.js", // Start the server
    "restartPolicyType": "ON_FAILURE", // Auto-restart on crash
    "restartPolicyMaxRetries": 10,    // Max restart attempts
    "healthcheckPath": "/api/health", // Health check endpoint
    "healthcheckTimeout": 300         // 5 minutes timeout
  }
}
```

### Key Features

**Health Check:**
- Railway pings `/api/health` to verify server is running
- If health check fails, Railway restarts the service
- 300 second timeout for startup

**Auto Restart:**
- Automatically restarts on failure
- Maximum 10 retry attempts
- Prevents infinite restart loops

**NIXPACKS Builder:**
- Automatically detects Node.js
- Installs dependencies
- Optimizes for production

---

## 🔍 Verify Deployment

### Test Health Endpoint

```bash
curl https://your-app.railway.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "hedera": true,
  "timestamp": 1234567890
}
```

### Test Other Endpoints

```bash
# Get receivers
curl https://your-app.railway.app/api/receivers

# Get stats
curl https://your-app.railway.app/api/stats

# Get Hedera topic
curl https://your-app.railway.app/api/hedera/topic
```

---

## 🐛 Troubleshooting

### Deployment Fails

**Check Build Logs:**
1. Go to Railway dashboard
2. Click on your service
3. View **Deployments** tab
4. Click on failed deployment
5. Check logs for errors

**Common Issues:**
- Missing `package.json` in backend folder
- Missing `"type": "module"` in package.json
- Incorrect start command
- Missing dependencies

### Health Check Fails

**Verify Health Endpoint:**
```javascript
// In backend/server.js
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hedera: hederaInitialized,
    timestamp: Date.now()
  });
});
```

**Check:**
- Endpoint exists at `/api/health`
- Returns 200 status code
- Server starts within 300 seconds

### Port Issues

Railway automatically assigns PORT environment variable.

**Ensure your server uses it:**
```javascript
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Hedera Connection Issues

**Check Environment Variables:**
1. Go to **Variables** tab
2. Verify all Hedera variables are set
3. Check for typos in variable names
4. Ensure private key is complete

**Check Logs:**
```
✅ Hedera client initialized
✅ Using existing topic: 0.0.7302124
```

If you see errors, verify credentials.

---

## 📊 Monitoring

### View Logs

**Real-time Logs:**
1. Go to Railway dashboard
2. Click on your service
3. View **Logs** tab
4. See live server output

**Filter Logs:**
- Search for specific terms
- Filter by log level
- Export logs for analysis

### Metrics

**Monitor:**
- CPU usage
- Memory usage
- Network traffic
- Request count
- Response times

**Access Metrics:**
1. Go to **Metrics** tab
2. View graphs and statistics
3. Set up alerts for issues

---

## 🔄 Continuous Deployment

### Auto-Deploy on Push

Railway automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Railway will:
1. Detect the push
2. Pull latest code
3. Run build command
4. Deploy new version
5. Run health checks

### Manual Deploy

**Trigger Redeploy:**
1. Go to Railway dashboard
2. Click on your service
3. Click **"Redeploy"** button

**Or use Railway CLI:**
```bash
npm install -g @railway/cli
railway login
railway up
```

---

## 💰 Cost Optimization

### Free Tier

Railway provides:
- $5 credit per month
- Pay only for usage
- No credit card required initially

### Usage Tips

**Reduce Costs:**
- Use sleep mode for inactive services
- Optimize memory usage
- Minimize network traffic
- Use efficient queries

**Monitor Usage:**
1. Go to **Usage** tab
2. View current month's usage
3. Set up billing alerts

---

## 🔐 Security

### Environment Variables

**Best Practices:**
- Never commit `.env` to Git
- Use Railway's variable management
- Rotate credentials regularly
- Use different keys for production

### CORS Configuration

**Update after Vercel deployment:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### Rate Limiting

**Add rate limiting (optional):**
```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📱 Custom Domain (Optional)

### Add Custom Domain

1. Go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain name
4. Update DNS records:

```
Type: CNAME
Name: api (or subdomain)
Value: your-app.railway.app
```

5. Wait for DNS propagation (5-30 minutes)

---

## ✅ Deployment Checklist

- [ ] `railway.json` created
- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Root directory configured
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Health check passing
- [ ] Railway URL copied
- [ ] Logs show no errors
- [ ] All endpoints working
- [ ] Hedera integration active

---

## 🎉 Success!

Your backend is now deployed on Railway!

**Next Steps:**
1. Copy your Railway URL
2. Update `.env.production` with Railway URL
3. Deploy frontend to Vercel
4. Update CORS with Vercel URL
5. Test full integration

**Your Railway URL:**
```
https://your-app.railway.app
```

Use this URL in your frontend configuration!

---

## 📚 Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Railway Templates](https://railway.app/templates)
- [Railway Discord](https://discord.gg/railway)

---

**Need Help?**
- Check Railway logs for errors
- Review environment variables
- Test endpoints individually
- Contact Railway support
