// MLAT Engine - Multilateration Algorithm for Aircraft Position Calculation

const SPEED_OF_LIGHT = 299792458; // meters per second
const EARTH_RADIUS = 6371000; // meters

// Convert lat/lon to ECEF (Earth-Centered, Earth-Fixed) coordinates
function latLonToECEF(lat, lon, alt = 0) {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  
  const N = EARTH_RADIUS / Math.sqrt(1 - 0.00669437999014 * Math.sin(latRad) ** 2);
  
  const x = (N + alt) * Math.cos(latRad) * Math.cos(lonRad);
  const y = (N + alt) * Math.cos(latRad) * Math.sin(lonRad);
  const z = (N * (1 - 0.00669437999014) + alt) * Math.sin(latRad);
  
  return { x, y, z };
}

// Convert ECEF to lat/lon
function ecefToLatLon(x, y, z) {
  const lon = Math.atan2(y, x);
  const p = Math.sqrt(x * x + y * y);
  let lat = Math.atan2(z, p * (1 - 0.00669437999014));
  
  // Iterate for better accuracy
  for (let i = 0; i < 5; i++) {
    const N = EARTH_RADIUS / Math.sqrt(1 - 0.00669437999014 * Math.sin(lat) ** 2);
    lat = Math.atan2(z + 0.00669437999014 * N * Math.sin(lat), p);
  }
  
  const N = EARTH_RADIUS / Math.sqrt(1 - 0.00669437999014 * Math.sin(lat) ** 2);
  const alt = p / Math.cos(lat) - N;
  
  return {
    lat: (lat * 180) / Math.PI,
    lon: (lon * 180) / Math.PI,
    alt: alt
  };
}

// Calculate distance between two ECEF points
function distance(p1, p2) {
  return Math.sqrt(
    (p1.x - p2.x) ** 2 +
    (p1.y - p2.y) ** 2 +
    (p1.z - p2.z) ** 2
  );
}

// MLAT algorithm using least squares optimization
export function computeMLATPosition(receivers, timestamps) {
  if (receivers.length < 4 || timestamps.length < 4) {
    return null; // Need at least 4 receivers for 3D position
  }
  
  // Convert receiver positions to ECEF
  const receiverECEF = receivers.map(r => ({
    ...latLonToECEF(r.lat, r.lon, r.alt),
    id: r.id
  }));
  
  // Use first receiver as reference
  const refReceiver = receiverECEF[0];
  const refTime = timestamps[0];
  
  // Calculate time differences (TDOA)
  const tdoa = timestamps.slice(1).map((t, i) => ({
    dt: t - refTime,
    receiver: receiverECEF[i + 1]
  }));
  
  // Initial guess: average of receiver positions
  let x = receiverECEF.reduce((sum, r) => sum + r.x, 0) / receiverECEF.length;
  let y = receiverECEF.reduce((sum, r) => sum + r.y, 0) / receiverECEF.length;
  let z = receiverECEF.reduce((sum, r) => sum + r.z, 0) / receiverECEF.length;
  
  // Gauss-Newton iteration
  const maxIterations = 20;
  const tolerance = 1e-6;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    const pos = { x, y, z };
    
    // Build Jacobian matrix and residual vector
    const A = [];
    const b = [];
    
    const d0 = distance(pos, refReceiver);
    
    tdoa.forEach(({ dt, receiver }) => {
      const di = distance(pos, receiver);
      const measured = SPEED_OF_LIGHT * dt;
      const predicted = di - d0;
      
      // Residual
      b.push(measured - predicted);
      
      // Jacobian row
      const dx0 = (pos.x - refReceiver.x) / d0;
      const dy0 = (pos.y - refReceiver.y) / d0;
      const dz0 = (pos.z - refReceiver.z) / d0;
      
      const dxi = (pos.x - receiver.x) / di;
      const dyi = (pos.y - receiver.y) / di;
      const dzi = (pos.z - receiver.z) / di;
      
      A.push([dxi - dx0, dyi - dy0, dzi - dz0]);
    });
    
    // Solve using least squares: (A^T * A) * delta = A^T * b
    const AtA = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
    const Atb = [0, 0, 0];
    
    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < 3; j++) {
        Atb[j] += A[i][j] * b[i];
        for (let k = 0; k < 3; k++) {
          AtA[j][k] += A[i][j] * A[i][k];
        }
      }
    }
    
    // Solve 3x3 system (simple Gaussian elimination)
    const delta = solve3x3(AtA, Atb);
    
    if (!delta) break;
    
    x += delta[0];
    y += delta[1];
    z += delta[2];
    
    // Check convergence
    const change = Math.sqrt(delta[0] ** 2 + delta[1] ** 2 + delta[2] ** 2);
    if (change < tolerance) break;
  }
  
  // Convert back to lat/lon
  const result = ecefToLatLon(x, y, z);
  
  // Calculate quality score based on geometric dilution of precision
  const quality = calculateQuality(receiverECEF, { x, y, z });
  
  return {
    ...result,
    quality,
    numReceivers: receivers.length
  };
}

// Solve 3x3 linear system
function solve3x3(A, b) {
  const a = A[0][0], b1 = A[0][1], c = A[0][2];
  const d = A[1][0], e = A[1][1], f = A[1][2];
  const g = A[2][0], h = A[2][1], i = A[2][2];
  
  const det = a * (e * i - f * h) - b1 * (d * i - f * g) + c * (d * h - e * g);
  
  if (Math.abs(det) < 1e-10) return null;
  
  const x = (b[0] * (e * i - f * h) - b1 * (b[1] * i - f * b[2]) + c * (b[1] * h - e * b[2])) / det;
  const y = (a * (b[1] * i - f * b[2]) - b[0] * (d * i - f * g) + c * (d * b[2] - b[1] * g)) / det;
  const z = (a * (e * b[2] - b[1] * h) - b1 * (d * b[2] - b[1] * g) + b[0] * (d * h - e * g)) / det;
  
  return [x, y, z];
}

// Calculate quality score (0-100)
function calculateQuality(receivers, position) {
  if (receivers.length < 4) return 0;
  
  // Calculate geometric dilution of precision (GDOP)
  const vectors = receivers.map(r => {
    const d = distance(r, position);
    return {
      x: (position.x - r.x) / d,
      y: (position.y - r.y) / d,
      z: (position.z - r.z) / d
    };
  });
  
  // Simple quality metric based on receiver spread
  let minAngle = Math.PI;
  for (let i = 0; i < vectors.length; i++) {
    for (let j = i + 1; j < vectors.length; j++) {
      const dot = vectors[i].x * vectors[j].x + 
                  vectors[i].y * vectors[j].y + 
                  vectors[i].z * vectors[j].z;
      const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
      minAngle = Math.min(minAngle, angle);
    }
  }
  
  // Convert to 0-100 score (better spread = higher score)
  const quality = Math.min(100, (minAngle / Math.PI) * 200);
  return Math.round(quality);
}

// Group messages by aircraft and time window
export function groupMessages(messages, timeWindowMs = 1000) {
  const groups = {};
  
  messages.forEach(msg => {
    const key = `${msg.aircraftId}_${Math.floor(msg.timestamp / timeWindowMs)}`;
    if (!groups[key]) {
      groups[key] = {
        aircraftId: msg.aircraftId,
        messages: []
      };
    }
    groups[key].messages.push(msg);
  });
  
  return Object.values(groups);
}
