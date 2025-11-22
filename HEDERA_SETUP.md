# Hedera Integration Setup Guide

## Current Status

✅ **Hedera client is initialized and connecting**
❌ **Topic creation failing due to INVALID_SIGNATURE**

This means the private key doesn't match the account ID, or the account doesn't have sufficient HBAR balance.

## How to Get Working Hedera Credentials

### Step 1: Create a Hedera Testnet Account

1. Go to **https://portal.hedera.com/**
2. Click "Register" or "Sign In"
3. Create a new account
4. Navigate to "Testnet" section

### Step 2: Create a New Testnet Account

1. In the Hedera Portal, go to **"Testnet"**
2. Click **"Create Account"**
3. You'll receive:
   - **Account ID** (format: 0.0.XXXXXX)
   - **Private Key** (long hexadecimal string)
4. **Save these securely!**

### Step 3: Fund Your Account

1. Go to the **Hedera Testnet Faucet**: https://portal.hedera.com/faucet
2. Enter your Account ID
3. Request testnet HBAR (usually 10,000 HBAR)
4. Wait for confirmation

### Step 4: Update Your .env File

Replace the values in your `.env` file:

```env
PORT=3001

HEDERA_ACCOUNT_ID=0.0.YOUR_ACTUAL_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_ACTUAL_PRIVATE_KEY_HERE
HEDERA_NETWORK=testnet
```

**Important:**
- Remove any `0x` prefix from the private key
- Don't add quotes around the values
- Make sure there are no extra spaces

### Step 5: Restart the Server

```bash
# Stop the current server (Ctrl+C)
npm run server
```

You should see:
```
✅ Hedera client initialized
✅ Topic created: 0.0.XXXXXX
📡 Hedera integration: ENABLED
```

## Troubleshooting

### INVALID_SIGNATURE Error

**Cause:** Private key doesn't match the account ID

**Solutions:**
1. Double-check you copied both Account ID and Private Key from the same account
2. Make sure the private key has no extra characters or spaces
3. Verify you're using testnet credentials (not mainnet)

### INSUFFICIENT_TX_FEE or INSUFFICIENT_PAYER_BALANCE

**Cause:** Account doesn't have enough HBAR

**Solutions:**
1. Go to https://portal.hedera.com/faucet
2. Request testnet HBAR for your account
3. Wait a few seconds and try again

### Connection Timeout

**Cause:** Network issues or Hedera testnet is down

**Solutions:**
1. Check your internet connection
2. Check Hedera status: https://status.hedera.com/
3. Try again in a few minutes

## What Works Without Hedera

Even without valid Hedera credentials, **all core features work**:

✅ MLAT algorithm computes positions
✅ Dashboard displays aircraft tracking
✅ Map visualization works
✅ Receiver statistics shown
✅ Rewards are simulated locally

**Only these features require Hedera:**
- ❌ On-chain position logging (HCS)
- ❌ Actual token rewards (HTS)

## For Hackathon Demo

**You don't need working Hedera credentials for the demo!**

The system demonstrates:
- Complete MLAT implementation
- Beautiful UI
- All tracking features
- Simulated blockchain integration

Judges can see the code and architecture even if Hedera isn't fully connected.

## Example Working Configuration

Once you have real credentials, your `.env` should look like:

```env
PORT=3001
HEDERA_ACCOUNT_ID=0.0.1234567
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
HEDERA_NETWORK=testnet
```

## Verification

When Hedera is working correctly, you'll see:

```
✅ Hedera client initialized
✅ Topic created: 0.0.XXXXXX
📡 Hedera integration: ENABLED
✅ Position logged to HCS: UAL123
✅ Reward sent to receiver RX001: 0.01 HBAR
```

## Need Help?

- **Hedera Documentation**: https://docs.hedera.com/
- **Hedera Discord**: https://hedera.com/discord
- **Portal Support**: https://portal.hedera.com/

---

**Current Status:** System is running with Hedera client initialized but topic creation failing due to credential mismatch. All MLAT features work normally! 🚀
