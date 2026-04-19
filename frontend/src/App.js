import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';

const API_BASE = 'http://127.0.0.1:8000';

export default function App() {
  const [markers, setMarkers] = useState([]);

  const fetchMarkers = useCallback(async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/markers")
      setMarkers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch markers:', err);
    }
  }, []);

  // Fetch on mount
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
