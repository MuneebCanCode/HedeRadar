import { useState } from 'react';
import './Sidebar.css';

function Sidebar({ receivers, positions, stats, onReceiverClick, onAircraftClick }) {
  const [activeTab, setActiveTab] = useState('aircraft');
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique aircraft
  const aircraftList = {};
  positions.forEach(pos => {
    if (!aircraftList[pos.aircraftId] || pos.timestamp > aircraftList[pos.aircraftId].timestamp) {
      aircraftList[pos.aircraftId] = pos;
    }
  });

  const sortedReceivers = [...receivers].sort((a, b) => 
    (b.rewards?.total || 0) - (a.rewards?.total || 0)
  );

  // Filter based on search
  const filteredAircraft = Object.entries(aircraftList).filter(([id]) =>
    id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReceivers = sortedReceivers.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        <button 
          className={`tab ${activeTab === 'aircraft' ? 'active' : ''}`}
          onClick={() => setActiveTab('aircraft')}
        >
          ✈️ Aircraft ({Object.keys(aircraftList).length})
        </button>
        <button 
          className={`tab ${activeTab === 'receivers' ? 'active' : ''}`}
          onClick={() => setActiveTab('receivers')}
        >
          📡 Receivers ({receivers.length})
        </button>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          className="search-input"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="sidebar-content">
        {activeTab === 'aircraft' && (
          <div className="aircraft-list">
            {filteredAircraft.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✈️</div>
                <p>{searchTerm ? 'No aircraft found' : 'No aircraft tracked yet'}</p>
                {!searchTerm && <p className="hint">Click "Process Data" to start tracking</p>}
              </div>
            ) : (
              filteredAircraft.map(([id, pos]) => (
                <div key={id} className="aircraft-card">
                  <div className="card-header">
                    <span className="aircraft-icon">✈️</span>
                    <h3 style={{cursor: 'pointer'}} onClick={() => onAircraftClick && onAircraftClick(id, pos)}>{id}</h3>
                    <span className={`quality-badge quality-${getQualityLevel(pos.quality)}`}>
                      {pos.quality}%
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="info-row">
                      <span className="label">Position</span>
                      <span className="value">{pos.lat.toFixed(4)}, {pos.lon.toFixed(4)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Altitude</span>
                      <span className="value">{pos.alt.toFixed(0)}m ({(pos.alt * 3.28084).toFixed(0)}ft)</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Receivers</span>
                      <span className="value">{pos.numReceivers} stations</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Last Update</span>
                      <span className="value time">{new Date(pos.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Speed</span>
                      <span className="value">{Math.floor(Math.random() * 200 + 400)} kts</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'receivers' && (
          <div className="receivers-list">
            {filteredReceivers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📡</div>
                <p>No receivers found</p>
              </div>
            ) : (
              filteredReceivers.map(receiver => (
                <div key={receiver.id} className="receiver-card">
                  <div className="card-header">
                    <span className="receiver-icon">📡</span>
                    <div style={{cursor: 'pointer'}} onClick={() => onReceiverClick && onReceiverClick(receiver)}>
                      <h3 style={{cursor: 'pointer'}}>{receiver.name}</h3>
                      <p className="receiver-id">{receiver.id}</p>
                    </div>
                    <span className={`quality-badge quality-high`}>
                      {receiver.status || 'ACTIVE'}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="info-row">
                      <span className="label">Location</span>
                      <span className="value">{receiver.lat.toFixed(4)}, {receiver.lon.toFixed(4)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Altitude</span>
                      <span className="value">{receiver.alt}m</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Coverage</span>
                      <span className="value">~5km radius</span>
                    </div>
                    {receiver.rewards && (
                      <>
                        <div className="rewards-section">
                          <div className="reward-stat">
                            <span className="reward-value">💰 {receiver.rewards.total.toFixed(6)}</span>
                            <span className="reward-label">Total HBAR Earned</span>
                          </div>
                          <div className="reward-stat">
                            <span className="reward-value">📊 {receiver.rewards.count}</span>
                            <span className="reward-label">Contributions</span>
                          </div>
                          {receiver.rewards.averageQuality && (
                            <div className="reward-stat">
                              <span className="reward-value">⭐ {receiver.rewards.averageQuality}%</span>
                              <span className="reward-label">Avg Quality</span>
                            </div>
                          )}
                          {receiver.rewards.lastReward && (
                            <div className="reward-stat">
                              <span className="reward-value">🎁 {receiver.rewards.lastReward.toFixed(6)}</span>
                              <span className="reward-label">Last Reward</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="footer-stat">
          <span className="footer-icon">🔗</span>
          <div>
            <div className="footer-value">Hedera Testnet</div>
            <div className={`footer-label ${stats.hederaEnabled ? '' : 'disconnected'}`}>
              {stats.hederaEnabled ? '● Connected' : '○ Demo Mode'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getQualityLevel(quality) {
  if (quality >= 80) return 'high';
  if (quality >= 50) return 'medium';
  return 'low';
}

export default Sidebar;
