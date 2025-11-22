// HedeRadar Backend Server
import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { computeMLATPosition, groupMessages } from './mlat-engine.js';
import hederaService from './hedera-service.js';
import { checkAllAlerts } from './alert-system.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory storage for demo
let receivers = [];
let positions = [];
let rewardStats = {};
let rewardHistory = []; // Track all reward transactions
let restrictedZones = [];
let runways = [];
let alerts = [];
let alertReports = [];

// Initialize Hedera
let hederaInitialized = false;
(async () => {
  hederaInitialized = await hederaService.initialize();
  if (hederaInitialized) {
    const topicId = await hederaService.getOrCreateTopic();
    if (topicId) {
      // Log system initialization event
      await hederaService.logSystemEvent('SYSTEM_INITIALIZED', {
        topicId: topicId,
        timestamp: Date.now(),
        version: '1.0.0',
        features: ['MLAT', 'Alerts', 'Rewards']
      });
    }
  }
})();

// Load sample data
function loadSampleData() {
  try {
    const data = JSON.parse(readFileSync('./data/sample-data.json', 'utf-8'));
    receivers = data.receivers;
    restrictedZones = data.restrictedZones || [];
    runways = data.runways || [];
    return data.messages;
  } catch (error) {
    console.log('⚠️  Sample data not found, using mock data');
    return generateMockData();
  }
}

// Generate mock Mode-S data for demo
function generateMockData() {
  // Define receiver locations (ground stations)
  receivers = [
    { id: 'RX001', lat: 40.7128, lon: -74.0060, alt: 10, name: 'New York', status: 'active' },
    { id: 'RX002', lat: 40.7589, lon: -73.9851, alt: 15, name: 'Times Square', status: 'active' },
    { id: 'RX003', lat: 40.6782, lon: -73.9442, alt: 12, name: 'Brooklyn', status: 'active' },
    { id: 'RX004', lat: 40.7489, lon: -73.9680, alt: 20, name: 'Queens', status: 'active' },
    { id: 'RX005', lat: 40.7282, lon: -74.0776, alt: 8, name: 'Jersey City', status: 'active' }
  ];

  restrictedZones = [
    { id: 'RZ001', name: 'JFK Restricted', lat: 40.6413, lon: -73.7781, radius: 3000, type: 'airport' },
    { id: 'RZ002', name: 'Manhattan No-Fly', lat: 40.7580, lon: -73.9855, radius: 2000, type: 'sensitive' },
    { id: 'RZ003', name: 'Military Zone', lat: 40.8000, lon: -73.9500, radius: 2500, type: 'military' }
  ];

  runways = [
    { id: 'RWY01', number: '04/22', name: 'LaGuardia 04/22', lat: 40.7769, lon: -73.8740, heading: 40, length: 2134 },
    { id: 'RWY02', number: '04L/22R', name: 'JFK 04L/22R', lat: 40.6413, lon: -73.7781, heading: 40, length: 3682 }
  ];

  // Generate mock aircraft messages
  const messages = [];
  const aircraftIds = ['UAL123', 'DAL456', 'AAL789'];
  const baseTime = Date.now();

  aircraftIds.forEach((aircraftId, idx) => {
    // Simulate aircraft at different positions
    const baseLat = 40.73 + idx * 0.02;
    const baseLon = -73.98 + idx * 0.02;
    const baseAlt = 3000 + idx * 500;

    // Each aircraft sends signals received by multiple receivers
    receivers.forEach((receiver, rxIdx) => {
      // Calculate realistic time delay based on distance
      const distance = Math.sqrt(
        Math.pow((baseLat - receiver.lat) * 111000, 2) +
        Math.pow((baseLon - receiver.lon) * 111000, 2) +
        Math.pow(baseAlt - receiver.alt, 2)
      );
      const timeDelay = (distance / 299792458) * 1000; // Convert to ms

      messages.push({
        aircraftId,
        receiverId: receiver.id,
        timestamp: baseTime + timeDelay + Math.random() * 10, // Add small noise
        signal: 85 + Math.random() * 10,
        altitude: baseAlt,
        speed: 450 + idx * 10
      });
    });
  });

  return messages;
}

// Process MLAT computation
async function processMLAT(messages) {
  const groups = groupMessages(messages, 2000);
  const results = [];
  const positionsMap = {};

  for (const group of groups) {
    if (group.messages.length < 4) continue;

    const receiverData = group.messages.map(msg => {
      const receiver = receivers.find(r => r.id === msg.receiverId);
      return receiver;
    }).filter(r => r);

    const timestamps = group.messages.map(msg => msg.timestamp);
    const firstMessage = group.messages[0];

    const position = computeMLATPosition(receiverData, timestamps);

    if (position && position.quality > 30) {
      const result = {
        aircraftId: group.aircraftId,
        timestamp: Date.now(),
        ...position,
        receivers: receiverData.map(r => r.id),
        speed: firstMessage.speed || Math.floor(Math.random() * 200 + 400),
        approaching: firstMessage.approaching || null,
        inRestrictedZone: firstMessage.inRestrictedZone || null
      };

      results.push(result);
      positions.push(result);
      positionsMap[group.aircraftId] = result;

      // Log to Hedera
      if (hederaInitialized) {
        // Log MLAT position calculation
        await hederaService.logPosition(group.aircraftId, position, receiverData);
        
        // Reward receivers with quality-based calculation
        const rewards = await hederaService.rewardReceivers(
          receiverData,
          group.aircraftId,
          position.quality
        );

        // Update reward stats and log each reward
        for (const r of rewards) {
          // Store in reward history
          rewardHistory.push(r);
          
          // Update aggregated stats
          if (!rewardStats[r.receiverId]) {
            rewardStats[r.receiverId] = { 
              total: 0, 
              count: 0, 
              averageQuality: 0,
              lastReward: null,
              lastRewardTime: null
            };
          }
          
          const stats = rewardStats[r.receiverId];
          stats.total += r.reward;
          stats.count += 1;
          stats.averageQuality = Math.round(
            ((stats.averageQuality * (stats.count - 1)) + r.quality) / stats.count
          );
          stats.lastReward = r.reward;
          stats.lastRewardTime = r.timestamp;
          
          // Log reward to HCS
          await hederaService.logReward(r.receiverId, r.reward, group.aircraftId, r.quality);
        }
      }
    }
  }

  // Check for alerts
  if (Object.keys(positionsMap).length > 0) {
    const newAlerts = checkAllAlerts(positionsMap, runways, restrictedZones);
    
    for (const alert of newAlerts) {
      alerts.push(alert);
      alertReports.push(alert);
      
      // Log alert to HCS
      if (hederaInitialized) {
        await hederaService.logAlert(alert);
      }
    }
    
    if (newAlerts.length > 0) {
      console.log(`⚠️  ${newAlerts.length} alert(s) detected!`);
    }
  }

  return results;
}

// API Endpoints

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hedera: hederaInitialized,
    timestamp: Date.now()
  });
});

app.get('/api/receivers', (req, res) => {
  const receiversWithStats = receivers.map(r => ({
    ...r,
    rewards: rewardStats[r.id] || { total: 0, count: 0 }
  }));
  res.json(receiversWithStats);
});

app.get('/api/positions', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json(positions.slice(-limit));
});

app.post('/api/process', async (req, res) => {
  try {
    const messages = req.body.messages || loadSampleData();
    const results = await processMLAT(messages);
    
    res.json({
      success: true,
      processed: results.length,
      positions: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/stats', (req, res) => {
  res.json({
    totalPositions: positions.length,
    totalReceivers: receivers.length,
    rewardStats,
    hederaEnabled: hederaInitialized,
    activeAlerts: alerts.length,
    totalReports: alertReports.length
  });
});

app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

app.get('/api/reports', (req, res) => {
  res.json(alertReports);
});

app.get('/api/restricted-zones', (req, res) => {
  res.json(restrictedZones);
});

app.get('/api/runways', (req, res) => {
  res.json(runways);
});

app.post('/api/alerts/:id/acknowledge', async (req, res) => {
  const alertId = req.params.id;
  const alert = alerts.find(a => a.id === alertId);
  
  if (alert) {
    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedAt = Date.now();
    
    // Log acknowledgment to HCS
    if (hederaInitialized) {
      await hederaService.logSystemEvent('ALERT_ACKNOWLEDGED', {
        alertId: alert.id,
        alertType: alert.type,
        aircraftId: alert.aircraftId,
        acknowledgedAt: alert.acknowledgedAt
      });
    }
    
    // Remove from active alerts
    alerts = alerts.filter(a => a.id !== alertId);
    
    res.json({ success: true, alert });
  } else {
    res.status(404).json({ success: false, error: 'Alert not found' });
  }
});

app.get('/api/hedera/topic', (req, res) => {
  if (!hederaInitialized) {
    return res.json({
      enabled: false,
      message: 'Hedera integration not configured'
    });
  }
  
  const topicId = hederaService.topicId ? hederaService.topicId.toString() : null;
  
  res.json({
    enabled: true,
    topicId: topicId,
    network: 'testnet',
    explorerUrl: topicId ? `https://hashscan.io/testnet/topic/${topicId}` : null,
    mirrorNodeUrl: topicId ? `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages` : null
  });
});

app.get('/api/rewards/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const receiverId = req.query.receiverId;
  
  let history = rewardHistory;
  
  if (receiverId) {
    history = history.filter(r => r.receiverId === receiverId);
  }
  
  res.json({
    total: history.length,
    rewards: history.slice(-limit).reverse()
  });
});

app.get('/api/rewards/stats', (req, res) => {
  const receiverId = req.query.receiverId;
  
  if (receiverId) {
    // Get stats for specific receiver
    const stats = rewardStats[receiverId] || {
      total: 0,
      count: 0,
      averageQuality: 0,
      lastReward: null,
      lastRewardTime: null
    };
    
    const receiverRewards = rewardHistory.filter(r => r.receiverId === receiverId);
    
    res.json({
      receiverId,
      ...stats,
      recentRewards: receiverRewards.slice(-10).reverse()
    });
  } else {
    // Get stats for all receivers
    const allStats = Object.keys(rewardStats).map(id => ({
      receiverId: id,
      ...rewardStats[id]
    }));
    
    const totalRewardsDistributed = Object.values(rewardStats).reduce((sum, s) => sum + s.total, 0);
    const totalTransactions = rewardHistory.length;
    
    res.json({
      totalRewardsDistributed: parseFloat(totalRewardsDistributed.toFixed(6)),
      totalTransactions,
      receivers: allStats,
      recentRewards: rewardHistory.slice(-20).reverse()
    });
  }
});

app.get('/api/rewards/leaderboard', (req, res) => {
  const leaderboard = Object.keys(rewardStats)
    .map(id => ({
      receiverId: id,
      ...rewardStats[id],
      receiver: receivers.find(r => r.id === id)
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  
  res.json({
    leaderboard,
    timestamp: Date.now()
  });
});

// Demo endpoint to trigger MLAT processing with rewards
app.post('/api/demo/mlat-with-rewards', async (req, res) => {
  try {
    console.log('\n🎬 DEMO: Simulating MLAT calculations with rewards...\n');
    
    // Generate demo aircraft
    const demoAircraft = [
      { id: 'DEMO001', lat: 40.73, lon: -73.98, alt: 3000, speed: 450 },
      { id: 'DEMO002', lat: 40.75, lon: -73.95, alt: 3500, speed: 455 },
      { id: 'DEMO003', lat: 40.71, lon: -74.01, alt: 2800, speed: 440 }
    ];
    
    const results = [];
    
    for (const aircraft of demoAircraft) {
      // Simulate MLAT calculation with varying quality
      const quality = 70 + Math.floor(Math.random() * 30); // 70-100%
      
      const position = {
        aircraftId: aircraft.id,
        lat: aircraft.lat,
        lon: aircraft.lon,
        alt: aircraft.alt,
        speed: aircraft.speed,
        quality: quality,
        numReceivers: receivers.length,
        receivers: receivers.map(r => r.id),
        timestamp: Date.now()
      };
      
      positions.push(position);
      
      console.log(`✈️  Aircraft ${aircraft.id}: Position calculated (Quality: ${quality}%)`);
      
      // Log to Hedera if enabled
      if (hederaInitialized) {
        await hederaService.logPosition(aircraft.id, position, receivers);
        
        // Calculate and distribute rewards
        const rewards = await hederaService.rewardReceivers(
          receivers,
          aircraft.id,
          quality
        );
        
        // Update stats
        for (const r of rewards) {
          rewardHistory.push(r);
          
          if (!rewardStats[r.receiverId]) {
            rewardStats[r.receiverId] = { 
              total: 0, 
              count: 0, 
              averageQuality: 0,
              lastReward: null,
              lastRewardTime: null
            };
          }
          
          const stats = rewardStats[r.receiverId];
          stats.total += r.reward;
          stats.count += 1;
          stats.averageQuality = Math.round(
            ((stats.averageQuality * (stats.count - 1)) + r.quality) / stats.count
          );
          stats.lastReward = r.reward;
          stats.lastRewardTime = r.timestamp;
          
          // Log reward to HCS
          await hederaService.logReward(r.receiverId, r.reward, aircraft.id, r.quality);
        }
        
        results.push({
          aircraft: aircraft.id,
          quality: quality,
          rewardsDistributed: rewards.length,
          totalRewardAmount: rewards.reduce((sum, r) => sum + r.reward, 0)
        });
      }
    }
    
    console.log('\n✅ DEMO: MLAT processing complete!\n');
    
    res.json({
      success: true,
      processed: demoAircraft.length,
      results: results,
      totalRewards: rewardHistory.length,
      totalAmount: Object.values(rewardStats).reduce((sum, s) => sum + s.total, 0)
    });
    
  } catch (error) {
    console.error('❌ Demo MLAT failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate demo positions with flight paths
function generateDemoPositions() {
  const timestamp = Date.now();
  
  // 7 runways - each gets 3-4 aircraft (mix of arrivals and departures)
  // Aircraft spread far apart with varied headings
  const aircraftData = [
    // RWY01 - LaGuardia (2 arriving, 2 departing) - MOVED TO YELLOW CIRCLE (center)
    { id: 'UAL123', route: [[40.65, -74.15], [40.7, -74.0], [40.75, -73.95], [40.7769, -73.8740]], alt: 3200, speed: 450, runway: 'RWY01', type: 'arrival' },
    { id: 'DAL456', route: [[40.0, -73.0], [40.3, -73.4], [40.55, -73.65], [40.7769, -73.8740]], alt: 3500, speed: 455, runway: 'RWY01', type: 'arrival' },
    { id: 'AAL789', route: [[41.05, -73.65], [41.2, -73.5], [41.4, -73.3], [41.6, -72.9]], alt: 4000, speed: 480, runway: 'RWY01', type: 'departure' },
    
    // PROXIMITY ALERT: Two aircraft too close to each other (same altitude, close position)
    { id: 'PROX01', route: [[40.72, -73.98], [40.73, -73.97], [40.74, -73.96], [40.75, -73.95]], alt: 3000, speed: 450, runway: 'RWY01', type: 'arrival' },
    { id: 'PROX02', route: [[40.721, -73.981], [40.731, -73.971], [40.741, -73.961], [40.751, -73.951]], alt: 3000, speed: 455, runway: 'RWY01', type: 'arrival' },
    
    // RWY02 - JFK (2 arriving, 2 departing) - MOVED TO YELLOW CIRCLE (right side)
    { id: 'JBU567', route: [[40.75, -73.2], [40.72, -73.4], [40.68, -73.6], [40.6413, -73.7781]], alt: 4200, speed: 490, runway: 'RWY02', type: 'arrival' },
    { id: 'FDX890', route: [[39.8, -74.6], [40.1, -74.2], [40.35, -74.0], [40.6413, -73.7781]], alt: 5000, speed: 510, runway: 'RWY02', type: 'arrival' },
    { id: 'UAL456', route: [[40.85, -73.55], [41.0, -73.3], [41.2, -73.0], [41.4, -72.6]], alt: 3200, speed: 460, runway: 'RWY02', type: 'departure' },
    
    // RESTRICTED AIRSPACE: Aircraft entering Manhattan No-Fly zone (40.7580, -73.9855, radius 2000m)
    // Positioned to trigger restricted airspace alert but away from runways
    { id: 'RESTRICT01', route: [[40.745, -73.99], [40.755, -73.988], [40.765, -73.986], [40.775, -73.984]], alt: 3500, speed: 420, runway: null, type: 'transit' },
    
    // RWY03 - Newark (2 arriving, 2 departing) - MOVED TO YELLOW CIRCLE (bottom left)
    { id: 'AAL234', route: [[40.15, -74.8], [40.35, -74.6], [40.55, -74.4], [40.6895, -74.1745]], alt: 3500, speed: 465, runway: 'RWY03', type: 'arrival' },
    { id: 'SWA567', route: [[39.9, -73.3], [40.2, -73.7], [40.45, -74.0], [40.6895, -74.1745]], alt: 4100, speed: 485, runway: 'RWY03', type: 'arrival' },
    { id: 'JBU890', route: [[40.95, -74.45], [41.1, -74.7], [41.3, -75.0], [41.5, -75.3]], alt: 2900, speed: 430, runway: 'RWY03', type: 'departure' },
    
    // PATH DEVIATION: Aircraft deviating significantly from planned route to Newark
    // Current position is far off the planned route (should be at 40.35, -74.6 but is at 40.5, -74.0)
    { id: 'DEVIATE01', route: [[40.35, -74.6], [40.45, -74.4], [40.55, -74.25], [40.6895, -74.1745]], alt: 3200, speed: 460, runway: 'RWY03', type: 'arrival', targetRunway: 'RWY03' },
    
    // RWY04 - Teterboro (3 arriving) - REPOSITIONED AAL567 BEFORE RUNWAY
    { id: 'UAL789', route: [[41.8, -75.0], [41.5, -74.7], [41.2, -74.4], [40.8501, -74.0608]], alt: 4500, speed: 500, runway: 'RWY04', type: 'arrival' },
    { id: 'DAL234', route: [[39.9, -75.0], [40.2, -74.7], [40.5, -74.4], [40.8501, -74.0608]], alt: 3300, speed: 455, runway: 'RWY04', type: 'arrival' },
    { id: 'AAL567', route: [[40.80, -74.15], [40.82, -74.12], [40.84, -74.08], [40.8501, -74.0608]], alt: 3700, speed: 470, runway: 'RWY04', type: 'arrival' },
    
    // RWY05 - Westchester (1 arriving, 2 departing) - MOVED TO YELLOW CIRCLE (top right)
    { id: 'SWA890', route: [[41.15, -73.0], [41.0, -73.2], [41.1, -73.5], [41.0669, -73.7076]], alt: 2700, speed: 410, runway: 'RWY05', type: 'arrival' },
    { id: 'JBU234', route: [[40.75, -73.45], [40.6, -73.2], [40.4, -72.9], [40.15, -72.5]], alt: 4300, speed: 495, runway: 'RWY05', type: 'departure' },
    { id: 'FDX123', route: [[41.35, -74.0], [41.5, -74.3], [41.7, -74.6], [41.9, -74.9]], alt: 5200, speed: 520, runway: 'RWY05', type: 'departure' },
    
    // RWY06 - Caldwell (1 arriving, 2 departing) - MOVED TO YELLOW CIRCLE (left side)
    { id: 'UAL999', route: [[40.85, -74.6], [40.88, -74.5], [40.9, -74.4], [40.8752, -74.2814]], alt: 3400, speed: 462, runway: 'RWY06', type: 'arrival' },
    { id: 'DAL567', route: [[40.55, -74.5], [40.4, -74.7], [40.2, -74.95], [39.95, -75.2]], alt: 3600, speed: 468, runway: 'RWY06', type: 'departure' },
    { id: 'AAL888', route: [[41.15, -73.85], [41.3, -73.6], [41.5, -73.4], [41.75, -73.1]], alt: 4600, speed: 498, runway: 'RWY06', type: 'departure' },
    
    // RWY07 - Republic (1 arriving, 2 departing) - ADJUSTED TO AVOID COLLISION
    { id: 'SWA777', route: [[41.6, -72.4], [41.3, -72.7], [41.0, -73.0], [40.7292, -73.4134]], alt: 3100, speed: 445, runway: 'RWY07', type: 'arrival' },
    { id: 'JBU777', route: [[40.35, -73.15], [40.25, -72.9], [40.1, -72.6], [39.9, -72.3]], alt: 3900, speed: 478, runway: 'RWY07', type: 'departure' },
    { id: 'FDX777', route: [[41.25, -72.85], [41.45, -72.6], [41.65, -72.35], [41.85, -72.1]], alt: 4400, speed: 492, runway: 'RWY07', type: 'departure' },
    
    // Additional aircraft with complete paths (for the red aircraft highlighted in pink) - MOVED TO YELLOW CIRCLE (center bottom)
    // Aircraft approaching from southwest to JFK
    { id: 'RED01', route: [[40.45, -73.85], [40.5, -73.82], [40.55, -73.8], [40.6, -73.79], [40.6413, -73.7781]], alt: 3300, speed: 465, runway: 'RWY02', type: 'arrival' },
    // Aircraft approaching from south to LaGuardia  
    { id: 'RED02', route: [[40.2, -74.3], [40.4, -74.1], [40.6, -73.95], [40.7, -73.9], [40.7769, -73.8740]], alt: 2900, speed: 445, runway: 'RWY01', type: 'arrival' },
    // Aircraft departing from center area
    { id: 'RED03', route: [[40.75, -74.2], [40.6, -74.4], [40.45, -74.6], [40.3, -74.8]], alt: 3100, speed: 455, runway: 'RWY03', type: 'departure' },
    
    // UNSAFE LANDING CONDITIONS AIRCRAFT - Positioned well BEFORE runway, clear approach indication
    { id: 'UNSAFE01', route: [[40.73, -73.95], [40.745, -73.93], [40.76, -73.91], [40.77, -73.89], [40.7769, -73.8740]], alt: 150, speed: 520, runway: 'RWY01', type: 'arrival' }
  ];

  aircraftData.forEach(aircraft => {
    // Use FIRST position in route as current position (aircraft starting point, far from runway)
    let currentPos = aircraft.route[0];
    
    // Special case: DEVIATE01 should be OFF its planned route to trigger path deviation
    if (aircraft.id === 'DEVIATE01') {
      // Current position is significantly off the planned route
      currentPos = [40.5, -74.0]; // Should be at [40.35, -74.6] but deviated
    }
    
    positions.push({
      aircraftId: aircraft.id,
      lat: currentPos[0],
      lon: currentPos[1],
      alt: aircraft.alt,
      speed: aircraft.speed,
      quality: 85,
      numReceivers: 4,
      receivers: ['RX001', 'RX002', 'RX003', 'RX004'],
      timestamp: timestamp,
      route: aircraft.route,
      targetRunway: aircraft.runway || aircraft.targetRunway
    });
  });

  // Check for alerts
  const positionsMap = {};
  positions.forEach(p => positionsMap[p.aircraftId] = p);
  
  const newAlerts = checkAllAlerts(positionsMap, runways, restrictedZones);
  
  // Log alerts to HCS if initialized
  (async () => {
    for (const alert of newAlerts) {
      alerts.push(alert);
      alertReports.push(alert);
      
      if (hederaInitialized) {
        await hederaService.logAlert(alert);
      }
    }
    
    // Log demo data generation event
    if (hederaInitialized) {
      await hederaService.logSystemEvent('DEMO_DATA_GENERATED', {
        aircraftCount: positions.length,
        alertCount: newAlerts.length,
        receiverCount: receivers.length,
        runwayCount: runways.length,
        restrictedZoneCount: restrictedZones.length
      });
    }
  })();
  
  console.log(`✅ Generated ${positions.length} positions with flight paths`);
  console.log(`⚠️  Generated ${newAlerts.length} alerts`);
}

// Auto-process on startup for demo
setTimeout(async () => {
  console.log('🚀 Generating demo data...');
  try {
    const fileContent = readFileSync('./data/sample-data.json', 'utf-8');
    console.log('📄 File read, length:', fileContent.length);
    const data = JSON.parse(fileContent);
    console.log('📦 Parsed data keys:', Object.keys(data));
    receivers = data.receivers || [];
    restrictedZones = data.restrictedZones || [];
    runways = data.runways || [];
    console.log(`📡 Loaded ${receivers.length} receivers`);
    console.log(`🚫 Loaded ${restrictedZones.length} restricted zones`);
    console.log(`🛬 Loaded ${runways.length} runways`);
  } catch (error) {
    console.log('⚠️  Error loading data:', error.message);
    generateMockData();
  }
  generateDemoPositions(); // Generate aircraft positions
}, 2000);

app.listen(PORT, () => {
  console.log(`🚀 HedeRadar server running on http://localhost:${PORT}`);
  console.log(`📡 Hedera integration: ${hederaInitialized ? 'ENABLED' : 'DISABLED'}`);
});
