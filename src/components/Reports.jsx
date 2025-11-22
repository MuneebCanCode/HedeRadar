import { useState } from 'react';
import './Reports.css';

function Reports({ reports, alerts, onClose, onAcknowledge }) {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedReport, setSelectedReport] = useState(null);

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  const allReports = [...reports].sort((a, b) => b.timestamp - a.timestamp);

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'CRITICAL': return '#ef4444';
      case 'WARNING': return '#f59e0b';
      case 'INFO': return '#3b82f6';
      default: return '#64748b';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'PROXIMITY_ALERT': return '⚠️';
      case 'UNSTABLE_APPROACH': return '🛬';
      case 'RESTRICTED_AIRSPACE_VIOLATION': return '🚨';
      case 'RESTRICTED_AIRSPACE_PROXIMITY': return '⚠️';
      case 'PATH_DEVIATION': return '🔀';
      default: return '📋';
    }
  };

  const getTypeName = (type) => {
    switch(type) {
      case 'PROXIMITY_ALERT': return 'Proximity Alert';
      case 'UNSTABLE_APPROACH': return 'Unstable Approach';
      case 'RESTRICTED_AIRSPACE_VIOLATION': return 'Restricted Airspace Violation';
      case 'RESTRICTED_AIRSPACE_PROXIMITY': return 'Approaching Restricted Zone';
      case 'PATH_DEVIATION': return 'Path Deviation';
      default: return type.replace(/_/g, ' ');
    }
  };

  return (
    <div className="reports-overlay">
      <div className="reports-modal">
        <div className="reports-header">
          <h2>📊 Safety Reports & Alerts</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="reports-tabs">
          <button 
            className={`report-tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            🚨 Active Alerts ({activeAlerts.length})
          </button>
          <button 
            className={`report-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            📋 All Reports ({allReports.length})
          </button>
        </div>

        <div className="reports-content">
          {activeTab === 'active' && (
            <div className="alerts-list">
              {activeAlerts.length === 0 ? (
                <div className="empty-reports">
                  <div className="empty-icon">✅</div>
                  <p>No active alerts</p>
                  <p className="empty-hint">All systems operating normally</p>
                </div>
              ) : (
                activeAlerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className="alert-card"
                    style={{ borderLeftColor: getSeverityColor(alert.severity) }}
                  >
                    <div className="alert-header">
                      <span className="alert-icon">{getTypeIcon(alert.type)}</span>
                      <div className="alert-title">
                        <h3>{getTypeName(alert.type)}</h3>
                        <span className="alert-time">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <span 
                        className="alert-severity"
                        style={{ backgroundColor: getSeverityColor(alert.severity) }}
                      >
                        {alert.severity}
                      </span>
                    </div>

                    <div className="alert-body">
                      <p className="alert-message">{alert.message}</p>
                      
                      {alert.type === 'PROXIMITY_ALERT' && (
                        <div className="alert-details">
                          <div className="detail-row">
                            <span className="detail-label">Aircraft 1:</span>
                            <span className="detail-value">{alert.aircraft1}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Aircraft 2:</span>
                            <span className="detail-value">{alert.aircraft2}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Horizontal Distance:</span>
                            <span className="detail-value danger">{alert.distance}m</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Vertical Separation:</span>
                            <span className="detail-value danger">{alert.verticalSeparation}m</span>
                          </div>
                        </div>
                      )}

                      {alert.type === 'UNSTABLE_APPROACH' && (
                        <div className="alert-details">
                          <div className="detail-row">
                            <span className="detail-label">Aircraft:</span>
                            <span className="detail-value">{alert.aircraftId}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Runway:</span>
                            <span className="detail-value">{alert.runway}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Distance to Runway:</span>
                            <span className="detail-value">{alert.distanceToRunway}m</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Issues:</span>
                            <span className="detail-value danger">{alert.issues.join(', ')}</span>
                          </div>
                        </div>
                      )}

                      {alert.type === 'RESTRICTED_AIRSPACE' && (
                        <div className="alert-details">
                          <div className="detail-row">
                            <span className="detail-label">Aircraft:</span>
                            <span className="detail-value">{alert.aircraftId}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Restricted Zone:</span>
                            <span className="detail-value">{alert.zone}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Zone Type:</span>
                            <span className="detail-value">{alert.zoneType}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Distance from Center:</span>
                            <span className="detail-value danger">{alert.distanceFromCenter}m</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="alert-actions">
                      <button 
                        className="acknowledge-btn"
                        onClick={() => onAcknowledge(alert.id)}
                      >
                        ✓ Acknowledge
                      </button>
                      <button 
                        className="details-btn"
                        onClick={() => setSelectedReport(alert)}
                      >
                        📄 Full Report
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'all' && (
            <div className="reports-list">
              {allReports.length === 0 ? (
                <div className="empty-reports">
                  <div className="empty-icon">📋</div>
                  <p>No reports generated yet</p>
                  <p className="empty-hint">Reports will appear here when alerts are detected</p>
                </div>
              ) : (
                allReports.map(report => (
                  <div 
                    key={report.id} 
                    className="report-card"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="report-header">
                      <span className="report-icon">{getTypeIcon(report.type)}</span>
                      <div className="report-info">
                        <h4>{getTypeName(report.type)}</h4>
                        <span className="report-id">ID: {report.id}</span>
                      </div>
                      <span 
                        className="report-status"
                        style={{ 
                          backgroundColor: report.status === 'ACTIVE' ? '#ef4444' : '#64748b' 
                        }}
                      >
                        {report.status}
                      </span>
                    </div>
                    <p className="report-message">{report.message}</p>
                    <div className="report-footer">
                      <span className="report-time">
                        {new Date(report.timestamp).toLocaleString()}
                      </span>
                      <span className="report-severity" style={{ color: getSeverityColor(report.severity) }}>
                        {report.severity}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {selectedReport && (
        <div className="report-detail-overlay" onClick={() => setSelectedReport(null)}>
          <div className="report-detail" onClick={(e) => e.stopPropagation()}>
            <div className="report-detail-header">
              <h3>📄 Detailed Report</h3>
              <button onClick={() => setSelectedReport(null)}>✕</button>
            </div>
            <div className="report-detail-content">
              <pre>{JSON.stringify(selectedReport, null, 2)}</pre>
            </div>
            <div className="report-detail-actions">
              <button className="export-btn">📥 Export PDF</button>
              <button className="print-btn">🖨️ Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
