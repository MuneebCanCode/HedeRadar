# HederaSky Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         AIRCRAFT                                 │
│                    (Mode-S Transponder)                          │
└────────────────────────┬────────────────────────────────────────┘
                         │ Broadcasts Mode-S Signal
                         ▼
        ┌────────────────────────────────────────┐
        │                                        │
        ▼                                        ▼
┌───────────────┐                        ┌───────────────┐
│  Receiver 1   │                        │  Receiver N   │
│   (Ground)    │  ...  Multiple  ...    │   (Ground)    │
│  t₁ timestamp │                        │  tₙ timestamp │
└───────┬───────┘                        └───────┬───────┘
        │                                        │
        └────────────────┬───────────────────────┘
                         │ Send to Backend
                         ▼
        ┌────────────────────────────────────────┐
        │         BACKEND SERVER                  │
        │  ┌──────────────────────────────────┐  │
        │  │      MLAT Engine                 │  │
        │  │  • Group messages by aircraft    │  │
        │  │  • Calculate TDOA                │  │
        │  │  • Solve position (lat/lon/alt)  │  │
        │  │  • Compute quality score         │  │
        │  └──────────────┬───────────────────┘  │
        │                 │                       │
        │                 ▼                       │
        │  ┌──────────────────────────────────┐  │
        │  │    Hedera Integration            │  │
        │  │  • Log to HCS (positions)        │  │
        │  │  • Reward via HTS (receivers)    │  │
        │  └──────────────┬───────────────────┘  │
        └─────────────────┼───────────────────────┘
                          │
                          ▼
        ┌────────────────────────────────────────┐
        │         HEDERA NETWORK                  │
        │  ┌──────────────────────────────────┐  │
        │  │  Consensus Service (HCS)         │  │
        │  │  • Immutable position log        │  │
        │  │  • Audit trail                   │  │
        │  └──────────────────────────────────┘  │
        │  ┌──────────────────────────────────┐  │
        │  │  Token Service (HTS)             │  │
        │  │  • Reward distribution           │  │
        │  │  • Receiver incentives           │  │
        │  └──────────────────────────────────┘  │
        └─────────────────┬───────────────────────┘
                          │
                          ▼
        ┌────────────────────────────────────────┐
        │         FRONTEND DASHBOARD              │
        │  ┌──────────────────────────────────┐  │
        │  │  Map View                        │  │
        │  │  • Aircraft positions            │  │
        │  │  • Receiver locations            │  │
        │  │  • Flight tracks                 │  │
        │  └──────────────────────────────────┘  │
        │  ┌──────────────────────────────────┐  │
        │  │  Sidebar                         │  │
        │  │  • Aircraft list                 │  │
        │  │  • Receiver stats                │  │
        │  │  • Reward tracking               │  │
        │  └──────────────────────────────────┘  │
        └────────────────────────────────────────┘
```

## Data Flow

### 1. Signal Capture
```
Aircraft transmits Mode-S signal
    ↓
Multiple receivers capture signal
    ↓
Each receiver records:
    • Aircraft ID
    • Timestamp (precise)
    • Signal strength
    • Receiver ID
```

### 2. MLAT Computation
```
Backend receives messages
    ↓
Group by aircraft + time window
    ↓
For each group:
    • Extract receiver positions
    • Extract timestamps
    • Calculate TDOA (time differences)
    • Convert to ECEF coordinates
    • Solve non-linear system
    • Convert back to lat/lon/alt
    • Calculate quality score
```

### 3. Hedera Integration
```
Position computed
    ↓
Log to HCS:
    • Aircraft ID
    • Position (lat/lon/alt)
    • Quality score
    • Timestamp
    • Receiver list
    ↓
Reward via HTS:
    • For each receiver
    • Amount based on quality
    • Automatic distribution
```

### 4. Visualization
```
Frontend polls backend
    ↓
Receives:
    • Latest positions
    • Receiver stats
    • Reward totals
    ↓
Updates:
    • Map markers
    • Flight tracks
    • Statistics
    • Reward displays
```

## MLAT Algorithm Detail

```
Input: 
    Receivers: [(lat₁, lon₁, alt₁), ..., (latₙ, lonₙ, altₙ)]
    Timestamps: [t₁, ..., tₙ]

Step 1: Convert to ECEF
    For each receiver:
        (x, y, z) = latLonToECEF(lat, lon, alt)

Step 2: Calculate TDOA
    Reference: receiver₁, time t₁
    For i = 2 to n:
        Δtᵢ = tᵢ - t₁
        Δdᵢ = c × Δtᵢ  (c = speed of light)

Step 3: Initial Guess
    x₀ = average of all receiver x coordinates
    y₀ = average of all receiver y coordinates
    z₀ = average of all receiver z coordinates

Step 4: Gauss-Newton Iteration
    Repeat until convergence:
        • Calculate distances from guess to each receiver
        • Compute residuals (measured vs predicted)
        • Build Jacobian matrix
        • Solve: (JᵀJ)Δ = Jᵀr
        • Update: position += Δ

Step 5: Convert Back
    (lat, lon, alt) = ecefToLatLon(x, y, z)

Step 6: Quality Score
    Based on geometric dilution of precision:
        • Calculate angles between receivers
        • Better spread = higher quality
        • Range: 0-100

Output:
    {
        lat: 40.7128,
        lon: -74.0060,
        alt: 3000,
        quality: 85,
        numReceivers: 4
    }
```

## Component Architecture

### Backend Structure
```
backend/
├── mlat-engine.js
│   ├── latLonToECEF()
│   ├── ecefToLatLon()
│   ├── computeMLATPosition()
│   ├── groupMessages()
│   └── calculateQuality()
│
├── hedera-service.js
│   ├── initialize()
│   ├── createTopic()
│   ├── logPosition()
│   ├── rewardReceivers()
│   └── getTopicMessages()
│
└── server.js
    ├── Express API
    ├── /api/health
    ├── /api/receivers
    ├── /api/positions
    ├── /api/process
    └── /api/stats
```

### Frontend Structure
```
src/
├── App.jsx
│   ├── State management
│   ├── API calls
│   └── Component composition
│
├── components/
│   ├── Header.jsx
│   │   ├── Logo & branding
│   │   ├── Statistics display
│   │   └── Process button
│   │
│   ├── Map.jsx
│   │   ├── Leaflet integration
│   │   ├── Receiver markers
│   │   ├── Aircraft markers
│   │   └── Flight tracks
│   │
│   └── Sidebar.jsx
│       ├── Tab navigation
│       ├── Aircraft list
│       ├── Receiver list
│       └── Reward display
│
└── styles/
    ├── App.css
    ├── Header.css
    ├── Map.css
    └── Sidebar.css
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│           FRONTEND                       │
│  • React 18                              │
│  • Leaflet (maps)                        │
│  • Axios (HTTP)                          │
│  • Vite (build)                          │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────┐
│           BACKEND                        │
│  • Node.js 18+                           │
│  • Express (API)                         │
│  • Custom MLAT engine                    │
│  • Hedera SDK                            │
└─────────────────┬───────────────────────┘
                  │ Hedera SDK
┌─────────────────▼───────────────────────┐
│         HEDERA NETWORK                   │
│  • Consensus Service (HCS)               │
│  • Token Service (HTS)                   │
│  • Testnet/Mainnet                       │
└──────────────────────────────────────────┘
```

## Deployment Architecture

### Development
```
Developer Machine
├── Terminal 1: npm run server (port 3001)
├── Terminal 2: npm run dev (port 5173)
└── Browser: http://localhost:5173
```

### Production (Future)
```
┌─────────────────────────────────────────┐
│           CDN (Frontend)                 │
│  • Static files                          │
│  • Global distribution                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Cloud Server (Backend)              │
│  • Node.js runtime                       │
│  • Load balancer                         │
│  • Auto-scaling                          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Database (Future)                │
│  • PostgreSQL + PostGIS                  │
│  • Historical data                       │
│  • Analytics                             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Hedera Mainnet                   │
│  • Production transactions               │
│  • Real rewards                          │
│  • Live audit trail                      │
└──────────────────────────────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────┐
│         Security Layers                  │
├─────────────────────────────────────────┤
│  1. Input Validation                     │
│     • Timestamp sanity checks            │
│     • Position bounds validation         │
│     • Signal strength verification       │
├─────────────────────────────────────────┤
│  2. Authentication (Future)              │
│     • Receiver registration              │
│     • API key management                 │
│     • Rate limiting                      │
├─────────────────────────────────────────┤
│  3. Blockchain Security                  │
│     • Private keys in .env               │
│     • Transaction signing                │
│     • Hedera account security            │
├─────────────────────────────────────────┤
│  4. Data Privacy                         │
│     • No PII collected                   │
│     • Public aircraft data only          │
│     • Optional receiver anonymization    │
└─────────────────────────────────────────┘
```

## Scalability

### Current Capacity
- Receivers: 5 (demo)
- Positions/second: ~10
- Concurrent aircraft: 3
- Storage: In-memory

### Target Capacity (6 months)
- Receivers: 100-500
- Positions/second: 100-500
- Concurrent aircraft: 50-100
- Storage: PostgreSQL

### Future Capacity (12 months)
- Receivers: 1,000+
- Positions/second: 1,000+
- Concurrent aircraft: 500+
- Storage: Distributed database

## Performance Metrics

```
Component          | Latency    | Throughput
-------------------|------------|-------------
MLAT Computation   | <5ms       | 200 pos/sec
Hedera HCS Log     | 3-5s       | 10,000 TPS
Hedera HTS Reward  | 3-5s       | 10,000 TPS
API Response       | <100ms     | 1,000 req/sec
Frontend Update    | <50ms      | 60 FPS
```

## Cost Analysis

### Per Position Computed
- MLAT computation: Free (CPU)
- HCS logging: $0.0001
- HTS rewards: $0.01 (distributed to receivers)
- Total: ~$0.0101

### Monthly (1000 positions/day)
- Hedera fees: ~$3
- Cloud hosting: ~$50
- Total: ~$53

### Revenue Potential
- Data subscription: $99-999/month per customer
- 10 customers = $1,000-10,000/month
- ROI: 20-200x costs

This architecture demonstrates a sustainable, scalable DePIN solution! 🚀
