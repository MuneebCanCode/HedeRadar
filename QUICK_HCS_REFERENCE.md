# 🚀 Quick HCS Reference Card

## Your Topic
```
Topic ID: 0.0.7302124
View: https://hashscan.io/testnet/topic/0.0.7302124
```

## Verify It's Working

### Check Backend Console
Look for these logs on startup:
```
✅ Hedera client initialized
✅ Using existing topic: 0.0.7302124  ← Same topic every time!
📋 System event logged to HCS: SYSTEM_INITIALIZED (Seq: X)
```

### Check HashScan
Visit: https://hashscan.io/testnet/topic/0.0.7302124
- You should see messages accumulating
- Sequence numbers increase continuously
- Each message has a timestamp

### Check UI
- Open: http://localhost:5173/
- Look at the header
- You should see the topic ID with a clickable link

## Generate More Messages

### Method 1: Click UI Button
Click "Process Data" button in the application

### Method 2: API Call
```bash
curl -X POST http://localhost:3001/api/process
```

### Method 3: Wait for Auto-Processing
The system automatically processes data every 5 seconds

## What Gets Logged

| Event | When | Message Type |
|-------|------|--------------|
| Aircraft position calculated | Every MLAT calculation | MLAT_POSITION |
| Safety alert detected | When conditions met | ALERT |
| Receiver rewarded | After MLAT contribution | RECEIVER_REWARD |
| System starts | On backend startup | SYSTEM_EVENT |
| Alert acknowledged | User action | SYSTEM_EVENT |
| Demo data generated | On startup | SYSTEM_EVENT |

## Topic Persistence

### ✅ Same Topic Every Restart
The topic ID is saved in `.env`:
```env
HEDERA_TOPIC_ID=0.0.7302124
```

### Create New Topic
To start fresh:
1. Remove `HEDERA_TOPIC_ID` line from `.env`
2. Restart backend
3. New topic will be created and saved

### Use Different Topic
Update `.env`:
```env
HEDERA_TOPIC_ID=0.0.YOUR_OTHER_TOPIC
```

## Troubleshooting

### No Messages Appearing?
1. Check backend console for errors
2. Verify Hedera credentials in `.env`
3. Ensure account has HBAR balance
4. Wait 5-10 seconds (mirror node delay)

### New Topic Created Each Time?
1. Check `.env` has `HEDERA_TOPIC_ID=0.0.7302124`
2. Verify file permissions (can write to `.env`)
3. Check backend logs for save confirmation

### "Demo Mode" Message?
- Hedera credentials not found in `.env`
- Check `HEDERA_ACCOUNT_ID` and `HEDERA_PRIVATE_KEY`

## Quick Commands

```bash
# View topic info
curl http://localhost:3001/api/hedera/topic

# Get all alerts
curl http://localhost:3001/api/alerts

# Get system stats
curl http://localhost:3001/api/stats

# Process MLAT data (generates messages)
curl -X POST http://localhost:3001/api/process

# View messages via Mirror Node
curl https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.7302124/messages
```

## Key Files

| File | Purpose |
|------|---------|
| `.env` | Contains topic ID and credentials |
| `backend/hedera-service.js` | HCS integration logic |
| `backend/server.js` | Logging triggers |
| `HCS_LOGGING_COMPLETE.md` | Full implementation details |
| `TOPIC_PERSISTENCE.md` | Topic reuse explanation |

## Success Indicators

✅ Backend shows: "Using existing topic: 0.0.7302124"
✅ HashScan shows increasing message count
✅ Sequence numbers continue across restarts
✅ UI displays topic ID with link
✅ Console shows "logged to HCS" messages

---

**Everything Working?** Visit https://hashscan.io/testnet/topic/0.0.7302124 to see your messages!
