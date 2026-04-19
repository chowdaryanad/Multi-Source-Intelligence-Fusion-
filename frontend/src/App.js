import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';

export default function App() {
  const [markers, setMarkers] = useState([]);

  const fetchMarkers = useCallback(async () => {
    try {
      const res = await axios.get(
        "https://multi-source-intelligence-fusion-amx6.onrender.com/api/markers"
      );
      setMarkers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch markers:', err);
    }
  }, []);

  useEffect(() => {
    fetchMarkers();
  }, [fetchMarkers]);

  return (
    <div className="app-layout">
      {/* ── Top Navbar ──────────────────────────────────────────────── */}
      <header className="top-navbar">
        <div className="brand-wrap">
          <div className="brand-icon">⚡</div>
          <div className="brand-title">Fusion Dashboard</div>
        </div>
        <div className="status-indicator">
          <div className="status-dot" />
          <span>System Operational</span>
        </div>
      </header>

      {/* ── Main Content Area ───────────────────────────────────────── */}
      <main className="main-content">
        <Sidebar markerCount={markers.length} onDataUploaded={fetchMarkers} />
        <MapView markers={markers} />
      </main>
    </div>
  );
}