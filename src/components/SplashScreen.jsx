import { useEffect, useState } from 'react';
import './SplashScreen.css';

function SplashScreen({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [showElements, setShowElements] = useState({
    logo: false,
    tagline: false,
    features: false,
    loading: false
  });

  useEffect(() => {
    // Staggered animation sequence
    const logoTimer = setTimeout(() => {
      setShowElements(prev => ({ ...prev, logo: true }));
    }, 200);

    const taglineTimer = setTimeout(() => {
      setShowElements(prev => ({ ...prev, tagline: true }));
    }, 800);

    const featuresTimer = setTimeout(() => {
      setShowElements(prev => ({ ...prev, features: true }));
    }, 1400);

    const loadingTimer = setTimeout(() => {
      setShowElements(prev => ({ ...prev, loading: true }));
    }, 2000);

    // Start fade out after 4 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4000);

    // Complete and remove splash screen after 4.5 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(taglineTimer);
      clearTimeout(featuresTimer);
      clearTimeout(loadingTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      {/* Animated background particles */}
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Radar sweep effect */}
      <div className="radar-sweep"></div>

      <div className="splash-content">
        <div className={`logo-container ${showElements.logo ? 'show' : ''}`}>
          <img 
            src="/hederadar-logo-final.svg" 
            alt="HedeRadar" 
            className="splash-logo"
          />
          <div className="logo-glow"></div>
        </div>

        <div className={`splash-tagline ${showElements.tagline ? 'show' : ''}`}>
          DePIN-Powered Aircraft Tracking
        </div>

        <div className={`feature-pills ${showElements.features ? 'show' : ''}`}>
          <div className="pill">
            <span className="pill-icon">✈️</span>
            <span>Real-Time Tracking</span>
          </div>
          <div className="pill">
            <span className="pill-icon">📡</span>
            <span>MLAT Technology</span>
          </div>
          <div className="pill">
            <span className="pill-icon">🔗</span>
            <span>Hedera Blockchain</span>
          </div>
        </div>

        <div className={`loading-section ${showElements.loading ? 'show' : ''}`}>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
          <div className="loading-text">Initializing System...</div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
