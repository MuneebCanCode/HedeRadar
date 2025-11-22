# ✅ Deployment Checklist

## Pre-Deployment

- [ ] All code committed to Git
- [ ] `.env` file NOT committed (in `.gitignore`)
- [ ] `.env.example` committed
- [ ] All dependencies in `package.json`
- [ ] Backend `package.json` has `"type": "module"`
- [ ] No console errors in development
- [ ] All features tested locally

## Railway (Backend) Deployment

### Setup
- [ ] Railway account created
- [ ] GitHub repository connected
- [ ] Root directory set to `backend`

### Environment Variables
- [ ] `PORT` (Railway auto-assigns, but set to 3001 as fallback)
- [ ] `HEDERA_ACCOUNT_ID`
- [ ] `HEDERA_PRIVATE_KEY`
- [ ] `HEDERA_NETWORK=testnet`
- [ ] `HEDERA_TOPIC_ID`
- [ ] `BASE_REWARD_HBAR=0.001`
- [ ] `ENABLE_REAL_TRANSFERS=false`
- [ ] `NODE_ENV=production`

### Verification
- [ ] Deployment successful (no errors)
- [ ] Health endpoint works: `/api/health`
- [ ] Railway URL copied
- [ ] Logs show no errors

## Vercel (Frontend) Deployment

### Setup
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Framework detected as Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### Configuration
- [ ] `src/config.js` created
- [ ] `App.jsx` updated to use config
- [ ] `.env.production` created with Railway URL
- [ ] `vercel.json` created

### Environment Variables
- [ ] `VITE_API_URL=https://YOUR_RAILWAY_URL/api`

### Verification
- [ ] Deployment successful
- [ ] App loads without errors
- [ ] Splash screen appears
- [ ] Map displays
- [ ] Data loads from backend
- [ ] No CORS errors

## Post-Deployment

### Backend Updates
- [ ] CORS updated with Vercel URL
- [ ] Backend redeployed
- [ ] CORS working (no errors in browser)

### Testing
- [ ] Frontend connects to backend
- [ ] Aircraft positions display
- [ ] Alerts show correctly
- [ ] Receivers display with rewards
- [ ] HCS Topic ID visible
- [ ] All interactive features work

### Documentation
- [ ] README updated with live URLs
- [ ] Deployment guide reviewed
- [ ] Environment variables documented

### Monitoring
- [ ] Railway logs checked
- [ ] Vercel analytics enabled
- [ ] Error tracking configured

## URLs to Save

```
Frontend (Vercel): https://_____________________.vercel.app
Backend (Railway): https://_____________________.railway.app
HCS Topic: https://hashscan.io/testnet/topic/0.0.7302124
GitHub Repo: https://github.com/_____________________
```

## Common Issues Fixed

- [ ] CORS configured correctly
- [ ] API URL points to Railway
- [ ] Environment variables set
- [ ] Port configuration correct
- [ ] Build completes successfully

## Final Checks

- [ ] App works on mobile
- [ ] App works on different browsers
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] All features functional

---

## Quick Commands

### Redeploy Backend (Railway)
```bash
git add backend/
git commit -m "Update backend"
git push origin main
```

### Redeploy Frontend (Vercel)
```bash
git add src/
git commit -m "Update frontend"
git push origin main
```

### Check Logs
```bash
# Railway: Check in dashboard
# Vercel: Check in dashboard or use CLI
vercel logs
```

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

Mark each item as you complete it!
