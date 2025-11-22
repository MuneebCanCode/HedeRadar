# HederaSky Setup Guide

## Prerequisites

- Node.js 18+ installed
- Hedera testnet account (optional for full functionality)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Hedera (Optional)

If you want to enable Hedera integration:

1. Create a Hedera testnet account at https://portal.hedera.com/
2. Copy `.env.example` to `.env`
3. Add your credentials:

```env
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
HEDERA_NETWORK=testnet
REWARD_TOKEN_ID=0.0.YOUR_TOKEN_ID
PORT=3001
```

**Note:** The application works without Hedera credentials - it will run in demo mode.

### 3. Start the Backend

```bash
npm run server
```

The backend will start on http://localhost:3001

### 4. Start the Frontend (in a new terminal)

```bash
npm run dev
```

The frontend will start on http://localhost:5173

### 5. Open the Application

Navigate to http://localhost:5173 in your browser.

## Features Demo

### Without Hedera Integration
- MLAT position computation works fully
- Interactive map with aircraft tracking
- Receiver network visualization
- Real-time statistics

### With Hedera Integration
- All above features PLUS:
- Positions logged to Hedera Consensus Service
- Receiver rewards via Hedera Token Service
- On-chain audit trail
- DePIN incentive mechanism

## Testing the Application

1. Click "Process Data" button to run MLAT computation
2. View aircraft positions on the map
3. Click markers for detailed information
4. Switch between Aircraft and Receivers tabs
5. Monitor reward statistics for receivers

## Project Structure

```
hedera-sky/
├── backend/
│   ├── mlat-engine.js      # Core MLAT algorithm
│   ├── hedera-service.js   # Hedera blockchain integration
│   └── server.js           # Express API server
├── frontend/
│   └── src/
│       ├── components/     # React components
│       ├── App.jsx         # Main application
│       └── main.jsx        # Entry point
├── data/
│   └── sample-data.json    # Sample Mode-S data
└── package.json
```

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify Node.js version (18+)
- Run `npm install` again

### Frontend won't start
- Check if port 5173 is available
- Ensure backend is running first
- Clear browser cache

### Hedera errors
- Verify credentials in .env file
- Check testnet account has HBAR balance
- Application works without Hedera in demo mode

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## Demo Video Script

1. **Introduction** (30s)
   - Show landing page
   - Explain HederaSky concept
   - Mention DePIN + MLAT + Hedera

2. **Data Ingestion** (30s)
   - Show sample Mode-S data
   - Explain receiver network
   - Click "Process Data"

3. **MLAT Computation** (45s)
   - Show map updating with positions
   - Explain time-difference-of-arrival
   - Highlight quality scores

4. **Hedera Integration** (45s)
   - Show HCS logging
   - Demonstrate reward distribution
   - Explain DePIN incentives

5. **Dashboard Features** (30s)
   - Navigate through UI
   - Show statistics
   - Highlight receiver rewards

## Next Steps

- Integrate real-time 4DSky data feeds
- Deploy to production
- Create HTS reward token
- Build mobile app for receivers
- Add advanced analytics
