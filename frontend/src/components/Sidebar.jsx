import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'https://multi-source-intelligence-fusion-amx6.onrender.com';

export default function Sidebar({ markerCount, onDataUploaded }) {
  const [dataFile, setDataFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState({ data: false, image: false });
  const [toasts, setToasts] = useState([]);

  const dataInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // ── Toast helper ────────────────────────────────────────────────
  const showToast = (type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // ── Image Preview Effect ────────────────────────────────────────
  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

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
      {/* ── Upload Sections ─────────────────────────────────────── */}
      <div className="sidebar-content">

        {/* Data Upload */}
        <div className="section">
          <span className="section-title">Intelligence Data</span>
          <div className={`upload-card ${dataFile ? 'has-file' : ''}`}>
            <input
              ref={dataInputRef}
              type="file"
              accept=".json,.csv"
              onChange={(e) => setDataFile(e.target.files?.[0] || null)}
              className="upload-input"
              id="data-file-input"
            />
            <div className="upload-icon">📄</div>
            <div className="upload-text">
              <strong>Choose file</strong> or drag here
              <br />
              <span style={{ fontSize: '11px' }}>JSON or CSV format</span>
            </div>
          </div>

          {dataFile && (
            <div className="file-pill">
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
                <div className="spinner" />
                Uploading…
              </>
            ) : (
              '↑ Upload Data'
            )}
          </button>
        </div>

        {/* Image Upload */}
        <div className="section">
          <span className="section-title">Image Asset</span>
          <div className={`upload-card ${imageFile ? 'has-file' : ''}`}>
            <input
              ref={imageInputRef}
              type="file"
              accept=".jpg,.jpeg"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="upload-input"
              id="image-file-input"
            />
            <div className="upload-icon">🖼️</div>
            <div className="upload-text">
              <strong>Choose image</strong> or drag here
              <br />
              <span style={{ fontSize: '11px' }}>JPG / JPEG only</span>
            </div>
          </div>

          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="preview-thumb" />
          )}

          {imageFile && !imagePreview && (
            <div className="file-pill">
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
                <div className="spinner" />
                Uploading…
              </>
            ) : (
              '↑ Upload Image'
            )}
          </button>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div className="sidebar-footer">
        <div className="stat-box">
          <span className="stat-label">Active Markers</span>
          <span className="stat-value">{markerCount}</span>
        </div>
      </div>

      {/* ── Toasts ──────────────────────────────────────────────── */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </aside>
  );
}
