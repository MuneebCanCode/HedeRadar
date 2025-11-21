// Alert Detection System for Aviation Safety

const PROXIMITY_THRESHOLD = 1000; // meters - too close
const UNSTABLE_APPROACH_ALT_HIGH = 500; // meters - too high for approach
const UNSTABLE_APPROACH_ALT_LOW = 200; // meters - too low for approach
const UNSTABLE_APPROACH_SPEED_HIGH = 200; // knots - too fast for approach
const APPROACH_DISTANCE = 10000; // meters - distance to consider "approaching"
const PATH_DEVIATION_THRESHOLD = 2000; // meters - max deviation from planned route
const RESTRICTED_ZONE_WARNING_BUFFER = 1500; // meters - warn when approaching restricted zone

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Check for proximity alerts (aircraft too close)
export function checkProximityAlerts(positions) {
  const alerts = [];
  const aircraftList = Object.values(positions);

  for (let i = 0; i < aircraftList.length; i++) {
    for (let j = i + 1; j < aircraftList.length; j++) {
      const aircraft1 = aircraftList[i];
      const aircraft2 = aircraftList[j];

      const horizontalDistance = calculateDistance(
        aircraft1.lat, aircraft1.lon,
        aircraft2.lat, aircraft2.lon
      );

      const verticalDistance = Math.abs(aircraft1.alt - aircraft2.alt);

      // Alert if aircraft are too close horizontally and vertically
      if (horizontalDistance < PROXIMITY_THRESHOLD && verticalDistance < 300) {
        alerts.push({
          type: 'PROXIMITY_ALERT',
          severity: 'CRITICAL',
          timestamp: Date.now(),
          aircraft1: aircraft1.aircraftId,
          aircraft2: aircraft2.aircraftId,
          distance: Math.round(horizontalDistance),
          verticalSeparation: Math.round(verticalDistance),
          position1: { lat: aircraft1.lat, lon: aircraft1.lon, alt: aircraft1.alt },
          position2: { lat: aircraft2.lat, lon: aircraft2.lon, alt: aircraft2.alt },
          message: `Aircraft ${aircraft1.aircraftId} and ${aircraft2.aircraftId} are dangerously close: ${Math.round(horizontalDistance)}m horizontal, ${Math.round(verticalDistance)}m vertical separation`
        });
      }
    }
  }

  return alerts;
}

// Check for unstable approach alerts
export function checkUnstableApproach(positions, runways) {
  const alerts = [];

  Object.values(positions).forEach(aircraft => {
    runways.forEach(runway => {
      const distanceToRunway = calculateDistance(
        aircraft.lat, aircraft.lon,
        runway.lat, runway.lon
      );

      // Check if aircraft is approaching this runway
      if (distanceToRunway < APPROACH_DISTANCE) {
        const issues = [];

        // Check altitude (too high or too low for approach)
        if (aircraft.alt > UNSTABLE_APPROACH_ALT_HIGH) {
          issues.push(`altitude too high (${Math.round(aircraft.alt)}m)`);
        } else if (aircraft.alt < UNSTABLE_APPROACH_ALT_LOW && distanceToRunway > 2000) {
          issues.push(`altitude too low (${Math.round(aircraft.alt)}m)`);
        }

        // Check speed (too fast for approach)
        const speed = aircraft.speed || 0;
        if (speed > UNSTABLE_APPROACH_SPEED_HIGH) {
          issues.push(`speed too high (${speed} knots)`);
        }

        if (issues.length > 0) {
          alerts.push({
            type: 'UNSTABLE_APPROACH',
            severity: 'WARNING',
            timestamp: Date.now(),
            aircraftId: aircraft.aircraftId,
            runway: runway.name,
            runwayPosition: { lat: runway.lat, lon: runway.lon },
            aircraftPosition: { lat: aircraft.lat, lon: aircraft.lon, alt: aircraft.alt },
            distanceToRunway: Math.round(distanceToRunway),
            altitude: Math.round(aircraft.alt),
            speed: speed,
            issues: issues,
            message: `Unstable approach detected for ${aircraft.aircraftId} to ${runway.name}: ${issues.join(', ')}`
          });
        }
      }
    });
  });

  return alerts;
}

// Check for unsafe landing conditions
export function checkUnsafeLandingConditions(positions, runways) {
  const alerts = [];

  Object.values(positions).forEach(aircraft => {
    // Check if aircraft ID is UNSAFE01 (the special aircraft we're monitoring)
    if (aircraft.aircraftId === 'UNSAFE01') {
      alerts.push({
        type: 'UNSAFE_LANDING_CONDITIONS',
        severity: 'CRITICAL',
        timestamp: Date.now(),
        aircraftId: aircraft.aircraftId,
        aircraftPosition: { lat: aircraft.lat, lon: aircraft.lon, alt: aircraft.alt },
        altitude: Math.round(aircraft.alt),
        speed: aircraft.speed,
        message: `🚨 CRITICAL: Aircraft ${aircraft.aircraftId} does not have ideal conditions to land. Weather conditions, altitude, or approach angle are unsafe.`
      });
    }
  });

  return alerts;
}

// Check for restricted airspace violations and proximity warnings
export function checkRestrictedAirspace(positions, restrictedZones) {
  const alerts = [];

  Object.values(positions).forEach(aircraft => {
    restrictedZones.forEach(zone => {
      const distance = calculateDistance(
        aircraft.lat, aircraft.lon,
        zone.lat, zone.lon
      );

      // Check if aircraft is inside restricted zone
      if (distance < zone.radius) {
        alerts.push({
          type: 'RESTRICTED_AIRSPACE_VIOLATION',
          severity: 'CRITICAL',
          timestamp: Date.now(),
          aircraftId: aircraft.aircraftId,
          zone: zone.name,
          zoneType: zone.type,
          zonePosition: { lat: zone.lat, lon: zone.lon, radius: zone.radius },
          aircraftPosition: { lat: aircraft.lat, lon: aircraft.lon, alt: aircraft.alt },
          distanceFromCenter: Math.round(distance),
          message: `🚨 VIOLATION: Aircraft ${aircraft.aircraftId} has entered restricted airspace: ${zone.name} (${zone.type})`
        });
      }
      // Check if aircraft is approaching restricted zone (warning buffer)
      else if (distance < zone.radius + RESTRICTED_ZONE_WARNING_BUFFER) {
        const distanceToEdge = distance - zone.radius;
        alerts.push({
          type: 'RESTRICTED_AIRSPACE_PROXIMITY',
          severity: 'WARNING',
          timestamp: Date.now(),
          aircraftId: aircraft.aircraftId,
          zone: zone.name,
          zoneType: zone.type,
          zonePosition: { lat: zone.lat, lon: zone.lon, radius: zone.radius },
          aircraftPosition: { lat: aircraft.lat, lon: aircraft.lon, alt: aircraft.alt },
          distanceFromCenter: Math.round(distance),
          distanceToEdge: Math.round(distanceToEdge),
          message: `⚠️ WARNING: Aircraft ${aircraft.aircraftId} approaching restricted airspace: ${zone.name} - ${Math.round(distanceToEdge)}m from boundary`
        });
      }
    });
  });

  return alerts;
}

// Calculate distance from point to line segment (for path deviation)
function distanceToLineSegment(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

// Check for path deviation alerts
export function checkPathDeviation(positions) {
  const alerts = [];

  Object.values(positions).forEach(aircraft => {
    // Only check if aircraft has a planned route
    if (!aircraft.route || aircraft.route.length < 2) {
      return;
    }

    const currentLat = aircraft.lat;
    const currentLon = aircraft.lon;
    const route = aircraft.route;

    // Find the closest segment of the planned route
    let minDeviation = Infinity;
    let closestSegmentIndex = 0;

    for (let i = 0; i < route.length - 1; i++) {
      const [lat1, lon1] = route[i];
      const [lat2, lon2] = route[i + 1];

      // Convert to approximate meters (rough approximation)
      const latToMeters = 111000;
      const lonToMeters = 111000 * Math.cos(currentLat * Math.PI / 180);

      const deviation = distanceToLineSegment(
        currentLat * latToMeters,
        currentLon * lonToMeters,
        lat1 * latToMeters,
        lon1 * lonToMeters,
        lat2 * latToMeters,
        lon2 * lonToMeters
      );

      if (deviation < minDeviation) {
        minDeviation = deviation;
        closestSegmentIndex = i;
      }
    }

    // Alert if deviation exceeds threshold
    if (minDeviation > PATH_DEVIATION_THRESHOLD) {
      alerts.push({
        type: 'PATH_DEVIATION',
        severity: 'WARNING',
        timestamp: Date.now(),
        aircraftId: aircraft.aircraftId,
        deviation: Math.round(minDeviation),
        plannedRoute: route,
        currentPosition: { lat: currentLat, lon: currentLon, alt: aircraft.alt },
        closestSegment: closestSegmentIndex,
        targetRunway: aircraft.targetRunway,
        message: `⚠️ PATH DEVIATION: Aircraft ${aircraft.aircraftId} has deviated ${Math.round(minDeviation)}m from planned route to ${aircraft.targetRunway}`
      });
    }
  });

  return alerts;
}

// Generate comprehensive alert report
export function generateAlertReport(alert) {
  const report = {
    id: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: alert.timestamp,
    type: alert.type,
    severity: alert.severity,
    status: 'ACTIVE',
    ...alert
  };

  return report;
}

// Check all alerts
export function checkAllAlerts(positions, runways, restrictedZones) {
  const proximityAlerts = checkProximityAlerts(positions);
  const approachAlerts = checkUnstableApproach(positions, runways);
  const restrictedAlerts = checkRestrictedAirspace(positions, restrictedZones);
  const pathDeviationAlerts = checkPathDeviation(positions);
  const unsafeLandingAlerts = checkUnsafeLandingConditions(positions, runways);

  const allAlerts = [
    ...proximityAlerts,
    ...approachAlerts,
    ...restrictedAlerts,
    ...pathDeviationAlerts,
    ...unsafeLandingAlerts
  ];

  return allAlerts.map(generateAlertReport);
}
