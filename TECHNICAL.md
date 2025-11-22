# HederaSky Technical Documentation

## MLAT Algorithm Implementation

### Overview
Multilateration (MLAT) determines aircraft position using Time Difference of Arrival (TDOA) measurements from multiple ground receivers.

### Mathematical Foundation

**Given:**
- N receivers at known positions: (x₁, y₁, z₁), ..., (xₙ, yₙ, zₙ)
- Time of arrival at each receiver: t₁, ..., tₙ
- Speed of light: c = 299,792,458 m/s

**Find:**
- Aircraft position: (x, y, z)

**Method:**
1. Convert lat/lon to ECEF (Earth-Centered, Earth-Fixed) coordinates
2. Calculate TDOA relative to reference receiver
3. Solve non-linear system using Gauss-Newton iteration
4. Convert result back to lat/lon/altitude

### Algorithm Steps

#### 1. Coordinate Conversion (WGS84 to ECEF)

```
N = R / √(1 - e² sin²(lat))
x = (N + alt) cos(lat) cos(lon)
y = (N + alt) cos(lat) sin(lon)
z = (N(1 - e²) + alt) sin(lat)

where:
R = 6,371,000 m (Earth radius)
e² = 0.00669437999014 (eccentricity squared)
```

#### 2. TDOA Calculation

```
Δtᵢ = tᵢ - t₁ (time difference from reference)
Δdᵢ = c × Δtᵢ (distance difference)
```

#### 3. Gauss-Newton Optimization

Minimize residual:
```
rᵢ = Δdᵢ - (dᵢ - d₁)

where:
dᵢ = √((x - xᵢ)² + (y - yᵢ)² + (z - zᵢ)²)
```

Jacobian matrix:
```
J[i][j] = ∂rᵢ/∂xⱼ

Update: x_new = x_old + (JᵀJ)⁻¹Jᵀr
```

#### 4. Quality Scoring

Quality based on geometric dilution of precision (GDOP):
```
quality = min_angle_between_receivers / π × 200

Better receiver spread = higher quality
Range: 0-100
```

### Performance Characteristics

**Accuracy:**
- 4 receivers: ~100-200m
- 5+ receivers: ~50-100m
- Optimal geometry: <50m

**Computation Time:**
- Single position: <5ms
- Batch processing: ~1ms per position

**Requirements:**
- Minimum 4 receivers for 3D position
- Time synchronization: <1ms accuracy
- Receiver position accuracy: <10m

## Hedera Integration Architecture

### Consensus Service (HCS)

**Purpose:** Immutable logging of aircraft positions

**Message Format:**
```json
{
  "type": "MLAT_POSITION",
  "timestamp": 1700000000000,
  "aircraftId": "UAL123",
  "position": {
    "lat": 40.7128,
    "lon": -74.0060,
    "alt": 3000,
    "quality": 85
  },
  "receivers": ["RX001", "RX002", "RX003", "RX004"],
  "numReceivers": 4
}
```

**Benefits:**
- Tamper-proof audit trail
- Regulatory compliance
- Historical analysis
- Dispute resolution

**Cost:** ~$0.0001 per message (testnet)

### Token Service (HTS)

**Purpose:** Reward distribution to receiver operators

**Reward Calculation:**
```
base_reward = 0.01 HBAR
quality_multiplier = position_quality / 100
final_reward = base_reward × quality_multiplier
```

**Distribution:**
- Automatic after each successful position
- Proportional to contribution quality
- Aggregated for efficiency

**Token Economics:**
- Initial supply: 1,000,000 tokens
- Reward pool: 500,000 tokens
- Vesting: 4 years
- Burn mechanism: 1% per transaction

### Smart Contract Integration (Future)

**Planned Features:**
- Staking for receiver operators
- Governance for network parameters
- Data marketplace contracts
- Quality verification oracle

## API Documentation

### Backend Endpoints

#### GET /api/health
Health check and status

**Response:**
```json
{
  "status": "ok",
  "hedera": true,
  "timestamp": 1700000000000
}
```

#### GET /api/receivers
List all receiver stations

**Response:**
```json
[
  {
    "id": "RX001",
    "lat": 40.7128,
    "lon": -74.0060,
    "alt": 10,
    "name": "New York Station",
    "rewards": {
      "total": 1.2345,
      "count": 42
    }
  }
]
```

#### GET /api/positions?limit=50
Get recent aircraft positions

**Response:**
```json
[
  {
    "aircraftId": "UAL123",
    "timestamp": 1700000000000,
    "lat": 40.7128,
    "lon": -74.0060,
    "alt": 3000,
    "quality": 85,
    "numReceivers": 4,
    "receivers": ["RX001", "RX002", "RX003", "RX004"]
  }
]
```

#### POST /api/process
Process Mode-S messages

**Request:**
```json
{
  "messages": [
    {
      "aircraftId": "UAL123",
      "receiverId": "RX001",
      "timestamp": 1700000000000,
      "signal": 92,
      "altitude": 3000
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "processed": 3,
  "positions": [...]
}
```

#### GET /api/stats
Network statistics

**Response:**
```json
{
  "totalPositions": 150,
  "totalReceivers": 5,
  "rewardStats": {
    "RX001": { "total": 1.2345, "count": 42 }
  },
  "hederaEnabled": true
}
```

## Data Flow

```
1. Aircraft transmits Mode-S signal
   ↓
2. Multiple receivers capture signal + timestamp
   ↓
3. Messages sent to backend API
   ↓
4. MLAT engine groups by aircraft + time window
   ↓
5. Position computed using TDOA
   ↓
6. Quality score calculated
   ↓
7. Position logged to Hedera HCS
   ↓
8. Rewards distributed via HTS
   ↓
9. Frontend updates in real-time
```

## Security Considerations

### Data Integrity
- Timestamp validation (reject outliers)
- Signal strength verification
- Receiver authentication (future)
- Position sanity checks

### Blockchain Security
- Private keys stored in .env (never committed)
- Rate limiting on API endpoints
- Input validation on all endpoints
- CORS configuration for production

### Privacy
- Aircraft IDs are public (Mode-S standard)
- No personal information collected
- Receiver locations are public (necessary for MLAT)
- Optional anonymization for sensitive operations

## Performance Optimization

### Backend
- Message batching for Hedera transactions
- In-memory caching of recent positions
- Efficient ECEF coordinate conversion
- Parallel processing of multiple aircraft

### Frontend
- React memo for expensive components
- Leaflet marker clustering (future)
- Lazy loading of historical data
- WebSocket for real-time updates (future)

### Database (Future)
- PostgreSQL with PostGIS extension
- Indexed queries on timestamp + aircraft_id
- Partitioning by date
- Read replicas for analytics

## Testing Strategy

### Unit Tests
- MLAT algorithm accuracy
- Coordinate conversion precision
- Quality score calculation
- Hedera service mocking

### Integration Tests
- End-to-end position computation
- API endpoint validation
- Hedera testnet integration
- Frontend component rendering

### Performance Tests
- 1000+ positions per second
- Concurrent API requests
- Memory usage under load
- Hedera transaction throughput

## Deployment

### Development
```bash
npm install
npm run server  # Terminal 1
npm run dev     # Terminal 2
```

### Production
```bash
npm run build
# Deploy dist/ to CDN
# Deploy backend to cloud (AWS/GCP/Azure)
# Configure environment variables
# Set up monitoring & logging
```

### Infrastructure Requirements
- Node.js 18+ runtime
- 2GB RAM minimum
- 10GB storage
- Hedera testnet/mainnet access

## Monitoring & Logging

### Metrics to Track
- Positions computed per minute
- Average quality score
- Receiver uptime
- Hedera transaction success rate
- API response times

### Logging
- All MLAT computations
- Hedera transactions
- API requests
- Error conditions

### Alerts
- Hedera connection failures
- Low quality scores
- Receiver offline
- API errors

## Future Enhancements

### Short Term (3 months)
- Real-time 4DSky data integration
- WebSocket for live updates
- Mobile app for receivers
- Advanced filtering & search

### Medium Term (6 months)
- Machine learning for quality prediction
- Automatic receiver calibration
- Data marketplace
- Multi-chain support

### Long Term (12 months)
- Satellite receiver integration
- Global coverage
- Advanced analytics platform
- Integration with flight planning systems
