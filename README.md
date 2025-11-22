# 🛰️ HedeRadar - Advanced Aircraft Tracking System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-brightgreen)](https://hede-radar.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-Railway-blue)](https://hederadar-production.up.railway.app)
[![Hedera Network](https://img.shields.io/badge/Hedera-Testnet-purple)](https://hashscan.io/testnet)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Real-time aircraft tracking system with blockchain integration, MLAT positioning, automated rewards, and comprehensive safety monitoring.**

## 🌟 Live Demo

- **🌐 Frontend**: [https://hede-radar.vercel.app](https://hede-radar.vercel.app)
- **🔗 Backend API**: [https://hederadar-production.up.railway.app](https://hederadar-production.up.railway.app)
- **⛓️ Hedera Integration**: Testnet HCS & HTS

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Local Development](#-local-development)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Hedera Integration](#-hedera-integration)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 Core Features
- **Real-time Aircraft Tracking** - Live position updates with interactive map visualization
- **MLAT Positioning** - Multilateration-based aircraft position calculation
- **Safety Alert System** - 5 types of comprehensive safety alerts with real-time monitoring
- **Blockchain Integration** - Hedera Consensus Service (HCS) for immutable event logging
- **Automated Rewards** - Quality-based HBAR token rewards for receiver operators
- **Interactive Dashboard** - Modern, responsive UI with real-time data updates

### 🚨 Safety Alerts
1. **Proximity Alert** - Detects aircraft flying too close to each other
2. **Unstable Approach** - Identifies unsafe approach parameters
3. **Restricted Airspace** - Monitors airspace violation warnings
4. **Path Deviation** - Tracks route deviation from flight plans
5. **Unsafe Landing** - Alerts on critical landing condition issues

### 💰 Reward System
- **Quality-Based Calculation** - Higher signal accuracy = more rewards
- **Real-Time Distribution** - Automatic HBAR payments via Hedera Token Service
- **Transparent Tracking** - Complete reward history and audit trail
- **Leaderboard System** - Rankings for top-performing receiver operators

### ⛓️ Blockchain Features
- **HCS Logging** - All critical events logged to Hedera Consensus Service
- **Immutable Records** - Permanent, tamper-proof audit trail
- **Public Verification** - Transparent verification on HashScan explorer
- **Topic Persistence** - Consistent topic ID across system restarts
- **HTS Rewards** - Native HBAR token distribution for rewards

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework with hooks
- **Vite** - Lightning-fast build tool and dev server
- **Leaflet** - Interactive map visualization
- **Axios** - Promise-based HTTP client
- **CSS3** - Modern styling with animations and transitions

### Backend
- **Node.js 18** - JavaScript runtime environment
- **Express.js** - Minimal web application framework
- **Hedera SDK** - Official Hedera Hashgraph SDK
- **CORS** - Cross-origin resource sharing middleware
- **ES6 Modules** - Modern JavaScript module system

### Infrastructure
- **Vercel** - Frontend hosting and deployment
- **Railway** - Backend hosting with Docker
- **Docker** - Containerization for consistent deployments
- **GitHub** - Version control and CI/CD

### Blockchain
- **Hedera Hashgraph** - Enterprise-grade distributed ledger
- **HCS** - Hedera Consensus Service for message logging
- **HTS** - Hedera Token Service for HBAR rewards
- **Testnet** - Development and testing network

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Hedera        │
│   (Vercel)      │    │   (Railway)     │    │   Network       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React App     │◄──►│ • Express API   │◄──►│ • HCS Topic     │
│ • Interactive   │    │ • MLAT Engine   │    │ • HTS Rewards   │
│   Map           │    │ • Alert System  │    │ • Audit Trail   │
│ • Real-time UI  │    │ • Reward System │    │ • Public Ledger │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow
1. **Aircraft Signals** → MLAT Engine → Position Calculation
2. **Position Data** → Alert System → Safety Monitoring
3. **Quality Metrics** → Reward System → HBAR Distribution
4. **All Events** → HCS → Blockchain Logging
5. **Real-time Updates** → REST API → Frontend Display

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git installed
- Hedera testnet account (optional for full features)

### 1. Clone Repository
```bash
git clone https://github.com/MuneebCanCode/HedeRadar.git
cd HedeRadar
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# For demo mode, default values work fine
```

### 4. Start Development Servers
```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend (in new terminal)
npm run dev
```

### 5. Open Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 💻 Local Development

### Project Structure
```
HedeRadar/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── Header.jsx      # Top navigation bar
│   │   ├── Map.jsx         # Interactive map
│   │   ├── Sidebar.jsx     # Receiver list
│   │   ├── Reports.jsx     # Alert reports
│   │   └── SplashScreen.jsx # Loading screen
│   ├── config.js          # API configuration
│   ├── App.jsx            # Main application
│   └── main.jsx           # Entry point
├── backend/               # Backend source code
│   ├── server.js          # Express server
│   ├── hedera-service.js  # Blockchain integration
│   ├── mlat-engine.js     # Position calculation
│   ├── alert-system.js    # Safety monitoring
│   ├── package.json       # Backend dependencies
│   └── Dockerfile         # Docker configuration
├── public/                # Static assets
├── data/                  # Sample data files
├── .env.example           # Environment template
└── package.json           # Frontend dependencies
```

### Development Commands

```bash
# Frontend
npm run dev          # Start dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
cd backend
npm start            # Start server (port 3001)

# Testing
node test-rewards.js        # Test reward system
node demo-hts-visual.js     # Visual HTS demo
```

### Environment Variables

#### Backend (.env)
```env
# Hedera Configuration (Required for blockchain features)
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
HEDERA_NETWORK=testnet
HEDERA_TOPIC_ID=0.0.YOUR_TOPIC_ID

# Reward Configuration
BASE_REWARD_HBAR=0.001
ENABLE_REAL_TRANSFERS=false

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env.production)
```env
VITE_API_URL=https://hederadar-production.up.railway.app/api
```

## 🚀 Deployment

### Frontend Deployment (Vercel)

#### Step 1: Connect Repository
1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your repository

#### Step 2: Configure Project
- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### Step 3: Environment Variables
```
VITE_API_URL=https://your-backend.railway.app/api
```

#### Step 4: Deploy
- Click "Deploy"
- Wait 2-3 minutes for build
- Get your live URL

### Backend Deployment (Railway)

#### Step 1: Connect Repository
1. Go to [Railway](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Deploy from GitHub repo
5. Select `backend` as root directory

#### Step 2: Configure Builder
- **Builder**: Dockerfile
- **Dockerfile Path**: `backend/Dockerfile`

#### Step 3: Environment Variables
```
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
HEDERA_NETWORK=testnet
HEDERA_TOPIC_ID=0.0.YOUR_TOPIC_ID
BASE_REWARD_HBAR=0.001
ENABLE_REAL_TRANSFERS=false
FRONTEND_URL=https://your-frontend.vercel.app
```

#### Step 4: Deploy
- Railway auto-deploys on push
- Build time: ~1 minute
- Get your backend URL

### Post-Deployment

#### Update CORS
Backend automatically allows:
- `http://localhost:5173` (development)
- `https://hede-radar.vercel.app` (production)
- `process.env.FRONTEND_URL` (custom)

#### Verify Deployment
```bash
# Test backend health
curl https://your-backend.railway.app/api/health

# Test frontend
open https://your-frontend.vercel.app
```

## 📚 API Documentation

### Base URLs
- **Local**: `http://localhost:3001/api`
- **Production**: `https://hederadar-production.up.railway.app/api`

### Endpoints

#### System Health
```http
GET /api/health
```
Response:
```json
{
  "status": "ok",
  "hedera": true,
  "timestamp": 1700000000000
}
```

#### System Statistics
```http
GET /api/stats
```
Response:
```json
{
  "totalAircraft": 15,
  "activeReceivers": 8,
  "totalAlerts": 3,
  "rewardsDistributed": "1.234 ℏ"
}
```

#### Aircraft Positions
```http
GET /api/positions
```
Response:
```json
[
  {
    "aircraftId": "UAL123",
    "lat": 40.7128,
    "lon": -74.0060,
    "alt": 3000,
    "speed": 450,
    "heading": 270,
    "quality": 85,
    "timestamp": 1700000000000
  }
]
```

#### Receiver Stations
```http
GET /api/receivers
```
Response:
```json
[
  {
    "id": "RX001",
    "name": "Station Alpha",
    "lat": 40.7128,
    "lon": -74.0060,
    "status": "active",
    "quality": 92,
    "totalRewards": "0.456 ℏ"
  }
]
```

#### Process MLAT Data
```http
POST /api/process
```
Response:
```json
{
  "success": true,
  "processed": 15,
  "alerts": 2,
  "rewards": "0.015 ℏ"
}
```

#### Safety Alerts
```http
GET /api/alerts
```
Response:
```json
[
  {
    "id": "alert-001",
    "type": "PROXIMITY_ALERT",
    "severity": "CRITICAL",
    "aircraftId": "UAL123",
    "message": "Aircraft too close to AAL456",
    "timestamp": 1700000000000,
    "acknowledged": false
  }
]
```

#### Reward Statistics
```http
GET /api/rewards/stats
```
Response:
```json
{
  "totalDistributed": "12.345 ℏ",
  "totalReceivers": 8,
  "averageReward": "1.543 ℏ",
  "topReceiver": "RX001"
}
```

#### Reward History
```http
GET /api/rewards/history
```
Response:
```json
[
  {
    "receiverId": "RX001",
    "amount": "0.015 ℏ",
    "quality": 92,
    "timestamp": 1700000000000,
    "transactionId": "0.0.123@1700000000.000000000"
  }
]
```

#### Hedera Topic Info
```http
GET /api/hedera/topic
```
Response:
```json
{
  "topicId": "0.0.7302124",
  "network": "testnet",
  "explorerUrl": "https://hashscan.io/testnet/topic/0.0.7302124"
}
```

## ⛓️ Hedera Integration

### Hedera Consensus Service (HCS)

#### Message Types Logged
1. **MLAT Position Updates**
2. **Safety Alert Events**
3. **Reward Distributions**
4. **System Status Changes**

#### Message Format
```json
{
  "type": "MLAT_POSITION",
  "data": {
    "aircraftId": "UAL123",
    "position": { "lat": 40.7128, "lon": -74.0060, "alt": 3000 },
    "quality": 85,
    "receivers": ["RX001", "RX002", "RX003"]
  },
  "timestamp": 1700000000000
}
```

### Hedera Token Service (HTS)

#### Reward Distribution
- **Token**: HBAR (native)
- **Base Reward**: 0.001 ℏ per quality point
- **Quality Range**: 0-100
- **Max Reward**: 0.1 ℏ per calculation

#### Calculation Formula
```javascript
reward = BASE_REWARD * (quality / 100) * signalCount
```

### Viewing on HashScan
1. Visit [HashScan Testnet](https://hashscan.io/testnet)
2. Search for your topic ID
3. View all logged messages
4. Verify reward transactions

## 🧪 Testing

### Manual Testing

#### Test Reward System
```bash
node test-rewards.js
```

#### Visual HTS Demo
```bash
node demo-hts-visual.js
```

### API Testing

#### Using cURL
```bash
# Health check
curl http://localhost:3001/api/health

# Get stats
curl http://localhost:3001/api/stats

# Process data
curl -X POST http://localhost:3001/api/process
```

#### Using Browser
1. Open http://localhost:5173
2. Click "Process Data" button
3. Check console for API calls (F12)
4. Verify data updates in UI

### Hedera Testing

#### Verify HCS Messages
1. Get topic ID from `/api/hedera/topic`
2. Visit HashScan with topic ID
3. Verify messages appear
4. Check message content

#### Verify Rewards
1. Process data multiple times
2. Check `/api/rewards/history`
3. Verify HBAR amounts
4. Check transaction IDs on HashScan

## 📖 Additional Documentation

- [Architecture Details](ARCHITECTURE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Railway Deployment](RAILWAY_DEPLOY.md)
- [Quick Reference](QUICK_REFERENCE.md)
- [Technical Details](TECHNICAL.md)
- [Hedera Setup](HEDERA_SETUP.md)
- [FAQ](FAQ.md)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Muneeb** - *Initial work* - [MuneebCanCode](https://github.com/MuneebCanCode)

## 🙏 Acknowledgments

- Hedera Hashgraph for blockchain infrastructure
- OpenStreetMap for map tiles
- Leaflet for map visualization
- Railway and Vercel for hosting

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/MuneebCanCode/HedeRadar/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MuneebCanCode/HedeRadar/discussions)

## 🔗 Links

- **Live Demo**: [https://hede-radar.vercel.app](https://hede-radar.vercel.app)
- **Backend API**: [https://hederadar-production.up.railway.app](https://hederadar-production.up.railway.app)
- **Hedera Docs**: [https://docs.hedera.com](https://docs.hedera.com)
- **HashScan Explorer**: [https://hashscan.io/testnet](https://hashscan.io/testnet)

---

**Built with ❤️ using React, Node.js, and Hedera Hashgraph**
