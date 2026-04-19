import React, { useState, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'https://multi-source-intelligence-fusion-amx6.onrender.com';

export default function Sidebar({ markerCount, onDataUploaded }) {
  const [dataFile, setDataFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState({ data: false, image: false });
  const [toast, setToast] = useState(null);

  const dataInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // ── Toast helper ────────────────────────────────────────────────
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Upload data file ────────────────────────────────────────────
  const handleDataUpload = async () => {
    if (!dataFile) return;
    setUploading((prev) => ({ ...prev, data: true }));

    const formData = new FormData();
    formData.append('file', dataFile);

    console.log('[Upload] Sending data file:', dataFile.name, 'size:', dataFile.size);

    try {
      const res = await axios.post(`${API_BASE}/api/upload-data`, formData);
      showToast('success', res.data.message || 'Data uploaded successfully.');
      setDataFile(null);
      if (dataInputRef.current) dataInputRef.current.value = '';
      onDataUploaded();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg =
        typeof detail === 'string'
          ? detail
          : detail?.message || 'Upload failed. Check file format.';
      showToast('error', msg);
    } finally {
      setUploading((prev) => ({ ...prev, data: false }));
    }
  };

  // ── Upload image ────────────────────────────────────────────────
  const handleImageUpload = async () => {
    if (!imageFile) return;
    setUploading((prev) => ({ ...prev, image: true }));

    const formData = new FormData();
    formData.append('file', imageFile);

    console.log('[Upload] Sending image file:', imageFile.name, 'size:', imageFile.size);

    try {
      const res = await axios.post(`${API_BASE}/api/upload-image`, formData);
      showToast('success', `Image saved: ${res.data.filename}`);
      setImageFile(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
    } catch (err) {
      const msg =
        err.response?.data?.detail || 'Image upload failed.';
      showToast('error', msg);
    } finally {
      setUploading((prev) => ({ ...prev, image: false }));
    }
  };

  return (
    <aside className="sidebar">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">⚡</div>
          <div className="brand-text">
            <h1>Fusion Dashboard</h1>
            <span>Intelligence Platform</span>
          </div>
        </div>

        <div className="status-bar">
          <div className="status-dot" />
          <span className="status-text">System Operational</span>
        </div>
      </div>

      {/* ── Upload Sections ─────────────────────────────────────── */}
      <div className="sidebar-content">

        {/* Data Upload */}
        <div className="section">
          <span className="section-label">Intelligence Data</span>

          <div className={`drop-zone ${dataFile ? 'has-file' : ''}`}>
            <input
              ref={dataInputRef}
              type="file"
              accept=".json,.csv"
              onChange={(e) => setDataFile(e.target.files?.[0] || null)}
              id="data-file-input"
            />
            <div className="drop-zone-icon">📄</div>
            <div className="drop-zone-text">
              <strong>Choose file</strong> or drag here
            </div>
            <div className="drop-zone-hint">JSON or CSV format</div>
          </div>

          {dataFile && (
            <div className="file-name">
              <span>📎</span>
              {dataFile.name}
            </div>
          )}

          <button
            id="upload-data-btn"
            className="btn btn-primary"
            onClick={handleDataUpload}
            disabled={!dataFile || uploading.data}
          >
            {uploading.data ? (
              <>
                <div className="btn-spinner" />
                Uploading…
              </>
            ) : (
              '↑ Upload Data'
            )}
          </button>
        </div>

        {/* Image Upload */}
        <div className="section">
          <span className="section-label">Image Asset</span>

          <div className={`drop-zone ${imageFile ? 'has-file' : ''}`}>
            <input
              ref={imageInputRef}
              type="file"
              accept=".jpg,.jpeg"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              id="image-file-input"
            />
            <div className="drop-zone-icon">🖼️</div>
            <div className="drop-zone-text">
              <strong>Choose image</strong> or drag here
            </div>
            <div className="drop-zone-hint">JPG / JPEG only</div>
          </div>

          {imageFile && (
            <div className="file-name">
              <span>📎</span>
              {imageFile.name}
            </div>
          )}

          <button
            id="upload-image-btn"
            className="btn btn-secondary"
            onClick={handleImageUpload}
            disabled={!imageFile || uploading.image}
          >
            {uploading.image ? (
              <>
                <div className="btn-spinner" />
                Uploading…
              </>
            ) : (
              '↑ Upload Image'
            )}
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            <span>{toast.type === 'success' ? '✓' : '✕'}</span>
            {toast.message}
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div className="sidebar-footer">
        <div className="marker-count">
          <span className="marker-count-label">Active Markers</span>
          <span className="marker-count-value">{markerCount}</span>
        </div>
      </div>
    </aside>
  );
}
