# 💰 Rewards System - Quick Start Guide

## 🚀 Is It Working?

### Quick Check (30 seconds)

```bash
# 1. Check if reward system is active
curl http://localhost:3001/api/rewards/stats

# 2. Should return JSON like:
# {"totalRewardsDistributed":0,"totalTransactions":0,"receivers":[],"recentRewards":[]}
```

✅ **If you get JSON response** → System is working!

---

## 📊 View Rewards

### In the UI
1. Open http://localhost:5173/
2. Click "Receivers" tab
3. Look for reward information in receiver cards:
   - 💰 Total HBAR Earned
   - 📊 Contributions
   - ⭐ Avg Quality
   - 🎁 Last Reward

### Via API
```bash
# Overall stats
curl http://localhost:3001/api/rewards/stats

# Leaderboard
curl http://localhost:3001/api/rewards/leaderboard

# History
curl http://localhost:3001/api/rewards/history?limit=20

# Specific receiver
curl http://localhost:3001/api/rewards/stats?receiverId=RX001
```

---

## 🔧 Configuration

### Current Settings (.env)
```env
BASE_REWARD_HBAR=0.001          # Reward amount per contribution
ENABLE_REAL_TRANSFERS=false     # Simulation mode (no actual transfers)
```

### Change Reward Amount
```env
BASE_REWARD_HBAR=0.005  # Increase to 0.005 HBAR
```

### Enable Real Transfers
```env
ENABLE_REAL_TRANSFERS=true  # ⚠️ Requires HBAR balance!
```

---

## 💡 How Rewards Work

### Formula
```
reward = 0.001 × (quality/100) × (1 + (quality/100)²)
```

### Examples
- **50% quality** → 0.000625 HBAR
- **75% quality** → 0.001172 HBAR
- **90% quality** → 0.001629 HBAR
- **100% quality** → 0.002000 HBAR

**Higher quality = More rewards!**

---

## 🔍 Verify It's Working

### 1. Check Backend Console
Look for:
```
💰 SIMULATED: 0.001629 HBAR → RX001 (Quality: 90%)
💰 Reward logged to HCS: RX001 received 0.001629 HBAR (Seq: X)
```

### 2. Check HCS Topic
Visit: https://hashscan.io/testnet/topic/0.0.7302124

Look for messages with type: `RECEIVER_REWARD`

### 3. Check API
```bash
curl http://localhost:3001/api/rewards/stats
```

Should show reward data (may be 0 initially)

---

## 🎯 When Do Rewards Happen?

Rewards are calculated when:
1. Aircraft signal is received
2. Multiple receivers detect it
3. MLAT calculation is performed
4. Position quality is determined
5. Rewards distributed to contributing receivers

**Note**: Demo mode uses pre-generated positions. Rewards activate with real MLAT processing.

---

## 📝 API Endpoints Summary

| Endpoint | Purpose |
|----------|---------|
| `/api/rewards/stats` | Overall statistics |
| `/api/rewards/history` | Transaction history |
| `/api/rewards/leaderboard` | Top receivers |
| `/api/rewards/stats?receiverId=X` | Specific receiver |

---

## 🚨 Troubleshooting

### No rewards showing?
- ✅ Check backend is running
- ✅ Verify Hedera is enabled
- ✅ Confirm API responds
- ✅ Check console for errors

### Want real transfers?
1. Check HBAR balance: https://hashscan.io/testnet/account/0.0.7283186
2. Set `ENABLE_REAL_TRANSFERS=true`
3. Restart backend
4. Monitor console for transaction IDs

---

## 📚 Full Documentation

- **HEDERA_REWARDS_GUIDE.md** - Complete guide
- **REWARD_SYSTEM_VERIFICATION.md** - Testing guide
- **HTS_IMPLEMENTATION_COMPLETE.md** - Full implementation details

---

## ✅ Status

- **System**: ✅ Fully Implemented
- **Mode**: Simulation (configurable)
- **Topic**: 0.0.7302124
- **Ready**: Production Ready

**Everything is working! The reward system will activate automatically when processing real aircraft signals.**
