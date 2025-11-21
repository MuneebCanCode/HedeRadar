import { useState, useEffect } from 'react';
import './Header.css';

function Header({ stats, onProcess, processing, onShowReports, showReports, alertCount }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <img src="/hederadar-logo-final.svg" alt="HedeRadar" className="logo-image" />
        </div>
      </div>
      
      <div className="header-center">
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.totalPositions || 0}</div>
            <div className="stat-label">Positions Tracked</div>
            {stats.totalPositions > 0 && (
              <div className="stat-change">+{stats.totalPositions} today</div>
            )}
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{stats.totalReceivers || 0}</div>
            <div className="stat-label">Active Receivers</div>
            <div className="stat-change">100% uptime</div>
          </div>
          
          <div className="stat-card" onClick={onShowReports} style={{cursor: 'pointer'}}>
            <div className={`stat-value ${alertCount > 0 ? 'danger' : 'active'}`}>
              {alertCount || 0}
            </div>
            <div className="stat-label">Active Alerts</div>
            <div className={`stat-change ${alertCount > 0 ? 'negative' : ''}`}>
              {alertCount > 0 ? 'Attention Required' : 'All Clear'}
            </div>
          </div>

          <div className="stat-card">
            <div className={`stat-value ${stats.hederaEnabled ? 'active' : 'inactive'}`}>
              {stats.hederaEnabled ? '●' : '○'}
            </div>
            <div className="stat-label">Hedera Network</div>
            <div className={`stat-change ${stats.hederaEnabled ? '' : 'negative'}`}>
              {stats.hederaEnabled ? 'Connected' : 'Demo Mode'}
            </div>
          </div>

          {stats.hederaTopicId && (
            <div className="stat-card hedera-topic" style={{minWidth: '180px'}}>
              <div className="stat-value" style={{fontSize: '14px'}}>
                <a 
                  href={stats.hederaExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View messages on HashScan"
                  style={{color: 'inherit', textDecoration: 'none'}}
                >
                  {stats.hederaTopicId}
                </a>
              </div>
              <div className="stat-label">HCS Topic ID</div>
              <div className="stat-change">
                <a 
                  href={stats.hederaExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{color: '#00d4ff', textDecoration: 'none'}}
                >
                  View Messages →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        <button 
          className={`reports-btn ${showReports ? 'active' : ''}`}
          onClick={onShowReports}
        >
          <span>📊 Reports {alertCount > 0 && `(${alertCount})`}</span>
        </button>
        <button 
          className="process-btn" 
          onClick={onProcess}
          disabled={processing}
        >
          <span>{processing ? '⏳ Processing...' : '🔄 Process Data'}</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
