import React, { useState, useRef } from "react";

export default function NewPhotoModal({ billId, stages = [], currentStep = 1, ward = "", onClose, onPhotoAdded, fetchWithAuth }) {
  const [photoMode, setPhotoMode] = useState("file"); // "file" | "url"
  const [photoData, setPhotoData] = useState("");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [stage, setStage] = useState(stages[currentStep - 1] ? `Step ${currentStep} — ${stages[currentStep - 1]}` : `Step ${currentStep}`);
  const [siteLocation, setSiteLocation] = useState(ward || "Lake Bund / Weir Section");
  const [geoTag, setGeoTag] = useState("12.9352° N, 77.6744° E");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("Image file is too large (Maximum 15 MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoData(reader.result);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
      }
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoTag(`${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`);
        },
        () => {
          setGeoTag("12.9716° N, 77.5946° E (Bengaluru East)");
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalPhoto = photoMode === "file" ? photoData : url;
    if (!finalPhoto) {
      setError("Please select an image file or enter an image URL.");
      return;
    }

    if (!title.trim()) {
      setError("Please provide a photo title.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        url: photoMode === "url" ? url.trim() : "",
        photoData: photoMode === "file" ? photoData : "",
        title: title.trim(),
        caption: caption.trim() || "Field photographic verification evidence",
        stage,
        siteLocation: siteLocation.trim(),
        geoTag: geoTag.trim()
      };

      const res = await fetchWithAuth(`http://localhost:4000/api/bills/${billId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload photo");
      }

      onPhotoAdded(data.photos, data.photoUrls);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to attach photo");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div
        className="custom-modal-window wide"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="custom-modal-header">
          <div className="custom-modal-title-group">
            <span className="custom-modal-tag">SITE VERIFICATION EVIDENCE</span>
            <h2>Add Site Inspection Photo Manually</h2>
          </div>
          <button type="button" className="custom-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="custom-modal-body">
          {error && <div className="custom-modal-error-alert">{error}</div>}

          {/* Photo Source Switcher */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
            <button
              type="button"
              className={`docs-mode-tab ${photoMode === "file" ? "active" : ""}`}
              onClick={() => setPhotoMode("file")}
            >
              📷 Upload Image File from Computer
            </button>
            <button
              type="button"
              className={`docs-mode-tab ${photoMode === "url" ? "active" : ""}`}
              onClick={() => setPhotoMode("url")}
            >
              🌐 Enter Image Web URL
            </button>
          </div>

          {photoMode === "file" ? (
            <div
              className="dropzone-container"
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: "20px", cursor: "pointer", background: "rgba(15, 23, 42, 0.4)" }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              {photoData ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <img
                    src={photoData}
                    alt="Preview"
                    style={{ maxHeight: "160px", maxWidth: "100%", borderRadius: "8px", objectFit: "cover" }}
                  />
                  <span style={{ fontSize: "12px", color: "#60a5fa" }}>Click to replace selected image</span>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "4px" }}>🖼️</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>
                    Click or drag & drop photo here
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                    Accepts PNG, JPG, JPEG, WebP (Max 15 MB)
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="custom-modal-field">
              <label>Photo Web URL <span className="req">*</span></label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                required
              />
              {url && (
                <div style={{ marginTop: "6px", textAlign: "center" }}>
                  <img
                    src={url}
                    alt="Preview"
                    style={{ maxHeight: "140px", borderRadius: "8px", objectFit: "cover" }}
                    onError={() => setError("Could not load image from this URL. Please verify.")}
                  />
                </div>
              )}
            </div>
          )}

          <div className="custom-modal-row-2">
            <div className="custom-modal-field">
              <label>Photo Title / Inspection Subject <span className="req">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sluice Gate Apron Reinforcement Check"
                required
              />
            </div>

            <div className="custom-modal-field">
              <label>Associated Workflow Stage</label>
              <select value={stage} onChange={(e) => setStage(e.target.value)}>
                {stages.map((stg, i) => (
                  <option key={stg + i} value={`Step ${i + 1} — ${stg}`}>
                    Step {i + 1} — {stg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="custom-modal-row-2">
            <div className="custom-modal-field">
              <label>Physical Site Location / Chainage</label>
              <input
                type="text"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                placeholder="e.g. Bellandur Lake South Inflow, Chainage 0+250"
              />
            </div>

            <div className="custom-modal-field">
              <label>
                Geo Coordinates / GPS Tag
                <button
                  type="button"
                  className="btn-apply-sum"
                  onClick={handleUseCurrentLocation}
                  style={{ textDecoration: "underline", color: "#60a5fa" }}
                >
                  📍 Detect GPS
                </button>
              </label>
              <input
                type="text"
                value={geoTag}
                onChange={(e) => setGeoTag(e.target.value)}
                placeholder="e.g. 12.9352° N, 77.6744° E"
              />
            </div>
          </div>

          <div className="custom-modal-field">
            <label>Field Observation Caption & Notes</label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Concrete placement verified with slump test at 100mm. Retaining wall steel reinforcement matches sanctioned drawing."
            />
          </div>

          <div className="custom-modal-footer">
            <button type="button" className="custom-btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="custom-btn-primary" disabled={submitting}>
              {submitting ? "Uploading…" : "✓ Attach Inspection Photo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
