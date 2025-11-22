import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Rectangle, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const receiverIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iIzYzNjZmMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iOCIgZmlsbD0id2hpdGUiLz4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyNCIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjQgNCIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC41Ii8+Cjwvc3ZnPg==',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

// Better aircraft icons - clearer airplane symbols
const aircraftIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIEFpcnBsYW5lIGJvZHkgLS0+CiAgPHBhdGggZD0iTTI0IDZMMjYgMjBIMzZMMjYgMjZMMjggNDJMMjQgMzhMMjAgNDJMMjIgMjZMMTIgMjBIMjJMMjQgNloiIGZpbGw9IiMxMGI5ODEiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogIDwhLS0gR2xvdyBlZmZlY3QgLS0+CiAgPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjAiIGZpbGw9IiMxMGI5ODEiIG9wYWNpdHk9IjAuMiIvPgo8L3N2Zz4=',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24]
});

const alertAircraftIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIEFpcnBsYW5lIGJvZHkgLS0+CiAgPHBhdGggZD0iTTI0IDZMMjYgMjBIMzZMMjYgMjZMMjggNDJMMjQgMzhMMjAgNDJMMjIgMjZMMTIgMjBIMjJMMjQgNloiIGZpbGw9IiNlZjQ0NDQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogIDwhLS0gQWxlcnQgZ2xvdyAtLT4KICA8Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyMCIgZmlsbD0iI2VmNDQ0NCIgb3BhY2l0eT0iMC4zIi8+CiAgPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjIiIHN0cm9rZT0iI2VmNDQ0NCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI0IDQiIGZpbGw9Im5vbmUiLz4KPC9zdmc+',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24]
});

const warningAircraftIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIEFpcnBsYW5lIGJvZHkgLS0+CiAgPHBhdGggZD0iTTI0IDZMMjYgMjBIMzZMMjYgMjZMMjggNDJMMjQgMzhMMjAgNDJMMjIgMjZMMTIgMjBIMjJMMjQgNloiIGZpbGw9IiNmNTllMGIiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogIDwhLS0gV2FybmluZyBnbG93IC0tPgogIDxjaXJjbGUgY3g9IjI0IiBjeT0iMjQiIHI9IjIwIiBmaWxsPSIjZjU5ZTBiIiBvcGFjaXR5PSIwLjMiLz4KICA8Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyMiIgc3Ryb2tlPSIjZjU5ZTBiIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjQgNCIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4=',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24]
});

function Map({ receivers, positions, alerts, restrictedZones, runways, highlightedReceiver, highlightedAircraft }) {
  // Debug logging
  console.log('🗺️ Map Component Render:', {
    receivers: receivers?.length || 0,
    positions: positions?.length || 0,
    alerts: alerts?.length || 0,
    restrictedZones: restrictedZones?.length || 0,
    runways: runways?.length || 0,
    highlightedReceiver: highlightedReceiver?.id || 'none',
    highlightedAircraft: highlightedAircraft || 'none'
  });

  // Center on the middle of the coverage area
  const center = [40.75, -73.95];

  // Group positions by aircraft
  const aircraftTracks = {};
  positions.forEach(pos => {
    if (!aircraftTracks[pos.aircraftId]) {
      aircraftTracks[pos.aircraftId] = [];
    }
    aircraftTracks[pos.aircraftId].push(pos);
  });
  
  console.log('📊 Aircraft tracks:', Object.keys(aircraftTracks).length, 'aircraft');

  // Check if aircraft has alert
  const getAircraftAlert = (aircraftId) => {
    const alert = alerts?.find(a => 
      a.aircraftId === aircraftId || 
      a.aircraft1 === aircraftId || 
      a.aircraft2 === aircraftId
    );
    if (alert) {
      console.log(`⚠️ Alert for ${aircraftId}:`, alert.type, alert.severity);
    }
    return alert;
  };

  // Calculate heading between two points
  const calculateHeading = (lat1, lon1, lat2, lon2) => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    const heading = Math.atan2(y, x) * 180 / Math.PI;
    return (heading + 360) % 360;
  };

  // Create rotatable aircraft icon with clear directional arrow
  const createRotatedIcon = (heading, alert) => {
    const color = alert ? (alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b') : '#10b981';
    const rotation = heading || 0;
    
    // SVG arrow that clearly shows direction
    const svgArrow = `
      <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${rotation}deg); transform-origin: center;">
        <!-- Glow circle -->
        <circle cx="25" cy="25" r="18" fill="${color}" opacity="0.2"/>
        <!-- Aircraft body pointing UP (will be rotated) -->
        <path d="M 25 8 L 28 22 L 35 22 L 28 26 L 30 38 L 25 35 L 20 38 L 22 26 L 15 22 L 22 22 Z" 
              fill="${color}" 
              stroke="white" 
              stroke-width="2" 
              stroke-linejoin="round"/>
        <!-- Direction arrow -->
        <path d="M 25 5 L 30 12 L 25 10 L 20 12 Z" 
              fill="white" 
              stroke="${color}" 
              stroke-width="1"/>
      </svg>
    `;
    
    return new L.DivIcon({
      html: svgArrow,
      iconSize: [50, 50],
      iconAnchor: [25, 25],
      popupAnchor: [0, -25],
      className: 'aircraft-marker'
    });
  };

  // Get aircraft icon based on alert status and heading
  const getAircraftIcon = (aircraftId, currentPos, route) => {
    const alert = getAircraftAlert(aircraftId);
    
    // Calculate heading from current position to next waypoint
    let heading = 0;
    if (route && route.length > 1) {
      // Current position is route[0], next waypoint is route[1]
      const currentWaypoint = route[0];
      const nextWaypoint = route[1];
      
      // Use current position from aircraft data, not route (in case of deviation)
      heading = calculateHeading(currentPos.lat, currentPos.lon, nextWaypoint[0], nextWaypoint[1]);
      
      if (aircraftId === 'DEVIATE01' || aircraftId === 'RESTRICT01' || aircraftId.includes('ALERT')) {
        console.log(`✈️ ${aircraftId}: heading ${heading.toFixed(1)}° from [${currentPos.lat.toFixed(4)}, ${currentPos.lon.toFixed(4)}] → [${nextWaypoint[0].toFixed(4)}, ${nextWaypoint[1].toFixed(4)}]`);
      }
    }
    
    return createRotatedIcon(heading, alert);
  };

  // Component to handle map flying/zooming
  function MapController({ highlightedReceiver, highlightedAircraft, positions }) {
    const map = useMap();
    
    useEffect(() => {
      if (highlightedReceiver) {
        map.flyTo([highlightedReceiver.lat, highlightedReceiver.lon], 13, {
          duration: 1.5,
          easeLinearity: 0.5
        });
      }
    }, [highlightedReceiver, map]);
    
    useEffect(() => {
      if (highlightedAircraft) {
        const aircraftTracks = {};
        positions.forEach(pos => {
          if (!aircraftTracks[pos.aircraftId]) {
            aircraftTracks[pos.aircraftId] = [];
          }
          aircraftTracks[pos.aircraftId].push(pos);
        });
        
        const track = aircraftTracks[highlightedAircraft];
        if (track && track.length > 0) {
          const latest = track[track.length - 1];
          map.flyTo([latest.lat, latest.lon], 12, {
            duration: 1.5,
            easeLinearity: 0.5
          });
        }
      }
    }, [highlightedAircraft, positions, map]);
    
    return null;
  }

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
        <MapController 
          highlightedReceiver={highlightedReceiver} 
          highlightedAircraft={highlightedAircraft}
          positions={positions}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Restricted Zones */}
        {restrictedZones && restrictedZones.length > 0 && restrictedZones.map(zone => {
          console.log('🚫 Rendering restricted zone:', zone.name, zone.lat, zone.lon, zone.radius);
          return (
            <Circle
              key={zone.id}
              center={[zone.lat, zone.lon]}
              radius={zone.radius}
              pathOptions={{
                color: zone.type === 'military' ? '#ef4444' : zone.type === 'sensitive' ? '#f59e0b' : '#8b5cf6',
                fillColor: zone.type === 'military' ? '#ef4444' : zone.type === 'sensitive' ? '#f59e0b' : '#8b5cf6',
                fillOpacity: 0.25,
                weight: 3,
                opacity: 1.0,
                dashArray: '10, 5'
              }}
            >
              <Popup>
                <div className="popup-content">
                  <h3>🚫 {zone.name}</h3>
                  <p><strong>Type:</strong> <span style={{color: '#ef4444', textTransform: 'uppercase'}}>{zone.type}</span></p>
                  <p><strong>Radius:</strong> <span>{zone.radius}m</span></p>
                  <p><strong>Status:</strong> <span style={{color: '#ef4444'}}>RESTRICTED</span></p>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Runways */}
        {runways && runways.map(runway => (
          <Marker key={runway.id} position={[runway.lat, runway.lon]}>
            <Popup>
              <div className="popup-content">
                <h3>🛬 {runway.name}</h3>
                {runway.number && <p><strong>Runway Number:</strong> <span>{runway.number}</span></p>}
                <p><strong>Heading:</strong> <span>{runway.heading}°</span></p>
                <p><strong>Length:</strong> <span>{runway.length}m</span></p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Receiver stations */}
        {receivers.map(receiver => {
          const isHighlighted = highlightedReceiver?.id === receiver.id;
          return (
            <div key={receiver.id}>
              <Marker position={[receiver.lat, receiver.lon]} icon={receiverIcon}>
                <Popup>
                  <div className="popup-content">
                    <h3>📡 {receiver.name}</h3>
                    <p><strong>ID:</strong> <span>{receiver.id}</span></p>
                    <p><strong>Location:</strong> <span>{receiver.lat.toFixed(4)}, {receiver.lon.toFixed(4)}</span></p>
                    <p><strong>Altitude:</strong> <span>{receiver.alt}m</span></p>
                    <p><strong>Status:</strong> <span style={{color: '#10b981'}}>ACTIVE</span></p>
                    {receiver.rewards && (
                      <div className="rewards-info">
                        <p><strong>Rewards Earned:</strong> <span>{receiver.rewards.total.toFixed(4)} HBAR</span></p>
                        <p><strong>Contributions:</strong> <span>{receiver.rewards.count}</span></p>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[receiver.lat, receiver.lon]}
                radius={5600}
                pathOptions={{
                  color: isHighlighted ? '#10b981' : '#6366f1',
                  fillColor: isHighlighted ? '#10b981' : '#6366f1',
                  fillOpacity: isHighlighted ? 0.3 : 0.05,
                  weight: isHighlighted ? 4 : 2,
                  opacity: isHighlighted ? 1 : 0.5
                }}
                className={isHighlighted ? 'highlighted-receiver' : ''}
              />
              {isHighlighted && (
                <>
                  <Circle
                    center={[receiver.lat, receiver.lon]}
                    radius={8000}
                    pathOptions={{
                      color: '#10b981',
                      fillColor: 'transparent',
                      weight: 3,
                      opacity: 0.8,
                      dashArray: '10, 5'
                    }}
                  />
                  <Circle
                    center={[receiver.lat, receiver.lon]}
                    radius={10500}
                    pathOptions={{
                      color: '#10b981',
                      fillColor: 'transparent',
                      weight: 2,
                      opacity: 0.6,
                      dashArray: '10, 5'
                    }}
                  />
                </>
              )}
            </div>
          );
        })}

        {/* Aircraft positions and tracks */}
        {Object.entries(aircraftTracks).map(([aircraftId, track]) => {
          const latest = track[track.length - 1];
          const alert = getAircraftAlert(aircraftId);
          
          // Use route if available, otherwise create a simple path
          const routeCoords = latest.route && latest.route.length > 0 
            ? latest.route 
            : track.length > 1 
              ? track.map(p => [p.lat, p.lon])
              : null;
          
          const icon = getAircraftIcon(aircraftId, latest, routeCoords);
          const isHighlighted = highlightedAircraft === aircraftId;
          
          console.log(`✈️ Rendering ${aircraftId}:`, {
            hasAlert: !!alert,
            alertType: alert?.type,
            alertSeverity: alert?.severity,
            hasRoute: !!routeCoords,
            routeLength: routeCoords?.length,
            iconType: alert ? (alert.severity === 'CRITICAL' ? 'RED' : 'ORANGE') : 'GREEN',
            isHighlighted
          });
          
          return (
            <div key={aircraftId}>
              {/* Flight Route - Full path with popup */}
              {routeCoords && routeCoords.length > 1 && (
                <Polyline
                  positions={routeCoords}
                  pathOptions={{
                    color: '#10b981',
                    weight: 4,
                    opacity: 0.9,
                    dashArray: 'none'
                  }}
                >
                  <Popup>
                    <div className="popup-content">
                      <h3>🛫 Flight Path</h3>
                      <p><strong>Aircraft:</strong> <span>{aircraftId}</span></p>
                      <p><strong>Target Runway:</strong> <span>{latest.targetRunway || 'Unknown'}</span></p>
                      <p><strong>Waypoints:</strong> <span>{routeCoords.length}</span></p>
                      <p><strong>Altitude:</strong> <span>{latest.alt.toFixed(0)}m ({(latest.alt * 3.28084).toFixed(0)}ft)</span></p>
                      <p><strong>Speed:</strong> <span>{latest.speed} kts</span></p>
                      {alert && (
                        <p><strong>Status:</strong> <span style={{color: alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}}>
                          ⚠️ {alert.type.replace('_', ' ')}
                        </span></p>
                      )}
                    </div>
                  </Popup>
                </Polyline>
              )}
              
              {/* Route waypoints */}
              {routeCoords && routeCoords.length > 1 && routeCoords.slice(0, -1).map((coord, idx) => (
                <Circle
                  key={`${aircraftId}-waypoint-${idx}`}
                  center={coord}
                  radius={500}
                  pathOptions={{
                    color: '#10b981',
                    fillColor: '#10b981',
                    fillOpacity: 0.4,
                    weight: 2
                  }}
                />
              ))}
              
              {/* Highlight circles for selected aircraft */}
              {isHighlighted && (
                <>
                  <Circle
                    center={[latest.lat, latest.lon]}
                    radius={3000}
                    pathOptions={{
                      color: '#10b981',
                      fillColor: '#10b981',
                      fillOpacity: 0.2,
                      weight: 4,
                      opacity: 1
                    }}
                  />
                  <Circle
                    center={[latest.lat, latest.lon]}
                    radius={5000}
                    pathOptions={{
                      color: '#10b981',
                      fillColor: 'transparent',
                      weight: 3,
                      opacity: 0.8,
                      dashArray: '10, 5'
                    }}
                  />
                  <Circle
                    center={[latest.lat, latest.lon]}
                    radius={7000}
                    pathOptions={{
                      color: '#10b981',
                      fillColor: 'transparent',
                      weight: 2,
                      opacity: 0.6,
                      dashArray: '10, 5'
                    }}
                  />
                </>
              )}
              
              {/* Latest position */}
              <Marker position={[latest.lat, latest.lon]} icon={icon}>
                <Popup>
                  <div className="popup-content">
                    <h3>✈️ {aircraftId}</h3>
                    {alert && (
                      <div style={{
                        background: alert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        padding: '8px',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        border: `1px solid ${alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}`
                      }}>
                        <strong style={{color: alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}}>
                          ⚠️ {alert.type.replace('_', ' ')}
                        </strong>
                      </div>
                    )}
                    <p><strong>Position:</strong> <span>{latest.lat.toFixed(4)}, {latest.lon.toFixed(4)}</span></p>
                    <p><strong>Altitude:</strong> <span>{latest.alt.toFixed(0)}m ({(latest.alt * 3.28084).toFixed(0)}ft)</span></p>
                    <p><strong>Quality:</strong> <span style={{color: latest.quality >= 80 ? '#10b981' : latest.quality >= 50 ? '#fbbf24' : '#ef4444'}}>{latest.quality}%</span></p>
                    <p><strong>Receivers:</strong> <span>{latest.numReceivers} stations</span></p>
                    <p><strong>Speed:</strong> <span>{latest.speed || Math.floor(Math.random() * 200 + 400)} kts</span></p>
                    {latest.targetRunway && (() => {
                      const targetRunway = runways?.find(r => r.id === latest.targetRunway);
                      const runwayNumber = targetRunway?.number || latest.targetRunway;
                      // Remove all alphabetic characters, keep only numbers and slashes
                      const numbersOnly = runwayNumber.replace(/[A-Za-z]/g, '');
                      return <p><strong>Runway Number:</strong> <span>{numbersOnly}</span></p>;
                    })()}
                    <p className="timestamp">{new Date(latest.timestamp).toLocaleTimeString()}</p>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-title">Map Legend</div>
        <div className="legend-item">
          <div className="legend-color receiver"></div>
          <span>Receiver Station</span>
        </div>
        <div className="legend-item">
          <div className="legend-color aircraft"></div>
          <span>Aircraft (Normal)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{background: '#ef4444', borderColor: '#ef4444'}}></div>
          <span>Aircraft (Alert)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{background: '#f59e0b', borderColor: '#f59e0b'}}></div>
          <span>Aircraft (Warning)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color track"></div>
          <span>Flight Track</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{background: 'transparent', border: '2px dashed #ef4444', width: '40px', height: '3px'}}></div>
          <span>Restricted Zone</span>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="map-stats-overlay">
        <div className="map-stat-card">
          <div className="map-stat-label">Coverage Area</div>
          <div className="map-stat-value">~1000 km²</div>
        </div>
        <div className="map-stat-card">
          <div className="map-stat-label">Active Aircraft</div>
          <div className="map-stat-value">{Object.keys(aircraftTracks).length}</div>
        </div>
        <div className="map-stat-card">
          <div className="map-stat-label">Runways</div>
          <div className="map-stat-value">{runways?.length || 0}</div>
        </div>
        {alerts && alerts.length > 0 && (
          <div className="map-stat-card" style={{borderColor: '#ef4444'}}>
            <div className="map-stat-label">Active Alerts</div>
            <div className="map-stat-value" style={{color: '#ef4444'}}>{alerts.length}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Map;
