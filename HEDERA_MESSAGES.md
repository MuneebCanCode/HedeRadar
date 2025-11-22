# Hedera HCS Topic Messages

## Current Topic ID
**Topic ID**: `0.0.7302124`

## View Messages

### Option 1: HashScan Explorer (Recommended)
Visit: https://hashscan.io/testnet/topic/0.0.7302124

This will show all messages submitted to your topic with timestamps and sequence numbers.

### Option 2: Mirror Node API
```bash
curl https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.7302124/messages
```

### Option 3: Via Application API
```bash
curl http://localhost:3001/api/hedera/topic
```

## Message Types Being Logged

### 1. MLAT_POSITION
Logged every time an aircraft position is calculated using multilateration.
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

### 2. ALERT
Logged when safety alerts are detected (proximity, unstable approach, restricted airspace, etc.)
```json
{
  "type": "ALERT",
  "timestamp": 1700000000000,
  "alertType": "PROXIMITY_ALERT",
  "severity": "CRITICAL",
  "aircraftId": "UAL123",
  "details": {
    "message": "Aircraft too close",
    "position": { "lat": 40.7128, "lon": -74.0060, "alt": 3000 }
  }
}
```

### 3. RECEIVER_REWARD
Logged when receivers are rewarded for contributing to MLAT calculations.
```json
{
  "type": "RECEIVER_REWARD",
  "timestamp": 1700000000000,
  "receiverId": "RX001",
  "amount": 0.01,
  "aircraftId": "UAL123",
  "quality": 85,
  "currency": "HBAR"
}
```

### 4. SYSTEM_EVENT
Logged for system-level events (initialization, demo data generation, alert acknowledgments).
```json
{
  "type": "SYSTEM_EVENT",
  "timestamp": 1700000000000,
  "eventType": "SYSTEM_INITIALIZED",
  "data": {
    "topicId": "0.0.7302124",
    "version": "1.0.0",
    "features": ["MLAT", "Alerts", "Rewards"]
  }
}
```

## Current Messages in Topic

Based on the server logs, your topic currently has:
- **Sequence 1**: System initialization
- **Sequence 2**: Unstable approach alert for UNSAFE01
- **Sequence 3**: Unsafe landing conditions alert for UNSAFE01
- **Sequence 4**: Demo data generation event

## Testing Message Logging

To generate more messages:

1. **Trigger MLAT Calculations**:
   ```bash
   curl -X POST http://localhost:3001/api/process
   ```

2. **View Current Alerts**:
   ```bash
   curl http://localhost:3001/api/alerts
   ```

3. **Acknowledge an Alert** (this logs to HCS):
   ```bash
   curl -X POST http://localhost:3001/api/alerts/ALERT-ID/acknowledge
   ```

## Message Flow

```
Aircraft Signal → MLAT Calculation → HCS Log (MLAT_POSITION)
                                   ↓
                            Reward Receivers → HCS Log (RECEIVER_REWARD)
                                   ↓
                            Check Alerts → HCS Log (ALERT)
                                   ↓
                            User Acknowledges → HCS Log (SYSTEM_EVENT)
```

## Notes

- All messages are immutable once submitted to the HCS topic
- Messages are ordered by sequence number
- Each message includes a timestamp for tracking
- The topic serves as an audit trail for all system activities
- Messages can be queried via the Hedera Mirror Node API
