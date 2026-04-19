import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Fix Leaflet default icon paths (CRA / Webpack issue) ──────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// ── Custom marker icon ────────────────────────────────────────────
const customIcon = new L.DivIcon({
  className: '',
  html: `
    <div style="
      width: 28px; height: 28px;
      background: linear-gradient(135deg, #0ea5e9, #3b82f6);
      border: 2.5px solid rgba(255,255,255,0.9);
      border-radius: 50% 50% 50% 4px;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
      display: flex; align-items: center; justify-content: center;
    ">
      <div style="
        width: 8px; height: 8px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const API_BASE = 'https://multi-source-intelligence-fusion-amx6.onrender.com';

// Center: India
const DEFAULT_CENTER = [22.5, 78.9];
const DEFAULT_ZOOM = 5;

// ── Auto-fit bounds when markers change ───────────────────────────
function FitBounds({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lon]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
    }
  }, [markers, map]);

  return null;
}

export default function MapView({ markers }) {
  const [mapReady, setMapReady] = useState(false);

  return (
    <div className="map-wrapper">
      {!mapReady && (
        <div className="map-card-loading">
          <div className="spinner" />
          <span>Initializing Map...</span>
        </div>
      )}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={true}
        whenReady={() => setMapReady(true)}
        style={{ height: '100%', width: '100%', background: 'transparent' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {markers.length > 0 && <FitBounds markers={markers} />}

        {markers.map((point, idx) => (
          <Marker
            key={`${point.lat}-${point.lon}-${idx}`}
            position={[point.lat, point.lon]}
            icon={customIcon}
          >
            <Popup maxWidth={300} minWidth={240}>
              <div className="popup-card">
                {point.image && (
                  <img
                    className="popup-img"
                    src={
                      point.image.startsWith('http')
                        ? point.image
                        : `${API_BASE}/images/${point.image}`
                    }
                    alt={point.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}

                <div className="popup-info">
                  <div className="popup-title">{point.title}</div>
                  <div className="popup-desc">{point.description}</div>
                  <div className="popup-coords-wrapper">
                    <span className="popup-coord">LAT {point.lat.toFixed(4)}</span>
                    <span className="popup-coord">LON {point.lon.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
