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
      setMarkers(res.data.data); // clean, no optional chaining needed now
    } catch (err) {
      console.error('Failed to fetch markers:', err);
    }
  }, []);

  useEffect(() => {
    fetchMarkers();
  }, [fetchMarkers]);

  return (
    <div className="app-layout">
      <Sidebar markerCount={markers.length} onDataUploaded={fetchMarkers} />
      <MapView markers={markers} />
    </div>
  );
}