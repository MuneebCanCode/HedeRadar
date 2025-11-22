import { useState, useEffect } from 'react';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Reports from './components/Reports';
import SplashScreen from './components/SplashScreen';
import axios from 'axios';
import { API_URL } from './config';
import './App.css';

function App() {
  const [receivers, setReceivers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [stats, setStats] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);
  const [restrictedZones, setRestrictedZones] = useState([]);
  const [runways, setRunways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [highlightedReceiver, setHighlightedReceiver] = useState(null);
  const [highlightedAircraft, setHighlightedAircraft] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [receiversRes, positionsRes, statsRes, alertsRes, reportsRes, zonesRes, runwaysRes, hederaRes] = await Promise.all([
        axios.get(`${API_URL}/receivers`),
        axios.get(`${API_URL}/positions?limit=100`),
        axios.get(`${API_URL}/stats`),
        axios.get(`${API_URL}/alerts`),
        axios.get(`${API_URL}/reports`),
        axios.get(`${API_URL}/restricted-zones`),
        axios.get(`${API_URL}/runways`),
        axios.get(`${API_URL}/hedera/topic`)
      ]);

      console.log('📡 Fetched data:', {
        receivers: receiversRes.data.length,
        positions: positionsRes.data.length,
        alerts: alertsRes.data.length,
        zones: zonesRes.data.length,
        runways: runwaysRes.data.length,
        hederaTopic: hederaRes.data.topicId
      });
      
      setReceivers(receiversRes.data);
      setPositions(positionsRes.data);
      setStats({
        ...statsRes.data,
        hederaTopicId: hederaRes.data.topicId,
        hederaExplorerUrl: hederaRes.data.explorerUrl
      });
      setAlerts(alertsRes.data);
      setReports(reportsRes.data);
      setRestrictedZones(zonesRes.data);
      setRunways(runwaysRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    try {
      await axios.post(`${API_URL}/process`);
      await fetchData();
    } catch (error) {
      console.error('Error processing:', error);
    }
    setProcessing(false);
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await axios.post(`${API_URL}/alerts/${alertId}/acknowledge`);
      await fetchData();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  // Show splash screen on first load
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Initializing HedeRadar...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header 
        stats={stats} 
        onProcess={handleProcess} 
        processing={processing}
        onShowReports={() => setShowReports(!showReports)}
        showReports={showReports}
        alertCount={alerts.length}
      />
      <div className="main-content"> 
        <Map 
          receivers={receivers} 
          positions={positions}
          alerts={alerts}
          restrictedZones={restrictedZones}
          runways={runways}
          highlightedReceiver={highlightedReceiver}
          highlightedAircraft={highlightedAircraft}
        />
        <Sidebar 
          receivers={receivers} 
          positions={positions} 
          stats={stats} 
          alerts={alerts}
          onReceiverClick={(receiver) => {
            setHighlightedReceiver(receiver);
            setTimeout(() => setHighlightedReceiver(null), 3000);
          }}
          onAircraftClick={(aircraftId, position) => {
            setHighlightedAircraft(aircraftId);
            setTimeout(() => setHighlightedAircraft(null), 3000);
          }}
        />
      </div>
      
      {showReports && (
        <Reports 
          reports={reports}
          alerts={alerts}
          onClose={() => setShowReports(false)}
          onAcknowledge={handleAcknowledgeAlert}
        />
      )}
    </div>
  );
}

export default App;
