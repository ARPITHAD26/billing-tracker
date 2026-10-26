import React, { useState, useEffect, useRef } from "react";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export default function SitePhotosGallery({
  bill,
  currentUser,
  fetchWithAuth,
  onBillUpdated,
  onShowToast
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Normalize photos array from bill.photos or bill.photoUrls
  const photos = React.useMemo(() => {
    if (!bill) return [];
    if (Array.isArray(bill.photos) && bill.photos.length > 0) {
      return bill.photos;
    }
    if (Array.isArray(bill.photoUrls) && bill.photoUrls.length > 0) {
      return bill.photoUrls.map((p, i) => {
        if (typeof p === "object" && p !== null) {
          return {
            id: p.id || `photo-${bill.id}-${i + 1}`,
            url: p.url,
            title: p.title || `Site Inspection Photo ${i + 1}`,
            caption: p.caption || `Field photographic record for ${bill.projectName}`,
            siteLocation: p.siteLocation || bill.ward || bill.projectName,
            stage: p.stage || `Step ${bill.currentStep}`,
            uploadedBy: p.uploadedBy || "Field Verification Team",
            uploadedAt: p.uploadedAt || new Date().toISOString(),
            geoTag: p.geoTag || "12.9716° N, 77.5946° E"
          };
        }
        return {
          id: `photo-${bill.id}-${i + 1}`,
          url: p,
          title: `Site Inspection Photo ${i + 1}`,
          caption: `Photographic evidence logged for ${bill.projectName}`,
          siteLocation: bill.ward || bill.projectName,
          stage: `Step ${bill.currentStep}`,
          uploadedBy: "Field Verification Team",
          uploadedAt: new Date().toISOString(),
          geoTag: "12.9716° N, 77.5946° E"
        };
      });
    }
    return [];
  }, [bill]);

  // Keep index within bounds whenever active bill or photo list changes
  useEffect(() => {
    if (photoIndex >= photos.length) {
      setPhotoIndex(0);
    }
  }, [photos, photoIndex]);

  // Reset photo index to 0 whenever switching to a different bill/site
  useEffect(() => {
    setPhotoIndex(0);
  }, [bill?.id]);

  const currentPhoto = photos[photoIndex] || null;

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    if (photos.length <= 1) return;
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (photos.length <= 1) return;
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxOpen) {
        if (e.key === "ArrowLeft") handlePrev();
        if (e.key === "ArrowRight") handleNext();
        if (e.key === "Escape") setLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, photos.length]);

  const handleDeletePhoto = async () => {
    if (!currentPhoto) return;
    if (photos.length <= 1) {
      if (onShowToast) {
        onShowToast("Each site requires at least one primary inspection photo.");
      }
      return;
    }
    const confirmDelete = window.confirm(
      `Remove site photo "${currentPhoto.title}" from this site record?`
    );
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const res = await fetchWithAuth(
        `http://localhost:4000/api/bills/${bill.id}/photos/${currentPhoto.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove photo.");

      if (onBillUpdated) onBillUpdated(data.bill);
      if (onShowToast) onShowToast(data.message || "Site photo removed.");
      setPhotoIndex((prev) => Math.max(0, prev - 1));
    } catch (err) {
      if (onShowToast) onShowToast(err.message || "Error deleting photo");
    } finally {
      setDeleting(false);
    }
  };

  if (!bill) return null;

  return (
    <div className="card gallery-card site-gallery-container">
      {/* Gallery Header */}
      <div className="section-title gallery-section-header">
        <div className="gallery-header-info">
          <div className="gallery-title-row">
            <h2>Attached Site Inspection Photos</h2>
            <span className="site-identifier-badge" title="Active Site / Ward">
              📍 {bill.ward || bill.projectName}
            </span>
          </div>
          <p className="gallery-subtitle">
            Verified photographic evidence uploaded for this site ({bill.projectName}).
          </p>
        </div>

        <div className="gallery-header-actions">
          {photos.length > 0 && (
            <span className="gallery-count-pill">
              Photo {photoIndex + 1} of {photos.length}
            </span>
          )}

          <button
            type="button"
            className="btn-add-site-photo"
            onClick={() => setShowAddModal(true)}
            title="Attach a new site inspection photo for this project"
          >
            <span>📷</span>
            <span>+ Attach Site Photo</span>
          </button>

          {currentPhoto && (
            <button
              type="button"
              className="btn-fullscreen-toggle"
              onClick={() => setLightboxOpen(true)}
              title="Inspect high-resolution photo in full screen"
              aria-label="Fullscreen view"
            >
              ⛶
            </button>
          )}
        </div>
      </div>

      {/* Main Photo Showcase */}
      {photos.length === 0 ? (
        <div className="empty-site-photos-box">
          <div className="empty-photo-icon">📷</div>
          <h3>No Site Inspection Photos Attached Yet</h3>
          <p>
            Upload verified photographic evidence of civil works, desilting, or
            inspections for <b>{bill.projectName}</b>.
          </p>
          <button
            type="button"
            className="primary"
            onClick={() => setShowAddModal(true)}
            style={{ marginTop: "12px" }}
          >
            + Attach First Site Photo
          </button>
        </div>
      ) : (
        <div className="site-photo-viewport">
          <div
            className="site-photo-stage"
            onClick={() => setLightboxOpen(true)}
            title="Click to view full-resolution photo"
          >
            <img
              key={currentPhoto.id || currentPhoto.url}
              src={currentPhoto.url}
              alt={currentPhoto.title || `Site inspection photo ${photoIndex + 1}`}
              className="site-inspection-main-img"
              loading="lazy"
            />

            {/* Overlaid Badges (Top) */}
            <div className="stage-overlay-top">
              <span className="photo-location-pill" title="Physical Site Location">
                📍 {currentPhoto.siteLocation || bill.ward || "Project Site"}
              </span>
              <span className="photo-stage-pill" title="Inspection Milestone / Workflow Stage">
                🏷️ {currentPhoto.stage || `Step ${bill.currentStep}`}
              </span>
            </div>

            {/* Navigation Buttons */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-nav-btn left"
                  onClick={handlePrev}
                  aria-label="Previous site photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="gallery-nav-btn right"
                  onClick={handleNext}
                  aria-label="Next site photo"
                >
                  ›
                </button>
              </>
            )}

            {/* Overlaid Caption & Metadata Drawer (Bottom) */}
            <div className="stage-overlay-bottom" onClick={(e) => e.stopPropagation()}>
              <div className="photo-caption-content">
                <div className="photo-caption-header">
                  <h4 className="photo-title-text">{currentPhoto.title}</h4>
                  <div className="photo-action-buttons">
                    <button
                      type="button"
                      className="btn-photo-expand"
                      onClick={() => setLightboxOpen(true)}
                      title="Enlarge inspection photo"
                    >
                      Enlarge 🔍
                    </button>
                    {photos.length > 1 && (
                      <button
                        type="button"
                        className="btn-photo-delete"
                        onClick={handleDeletePhoto}
                        disabled={deleting}
                        title="Delete this site photo"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                {currentPhoto.caption && (
                  <p className="photo-description-text">{currentPhoto.caption}</p>
                )}

                <div className="photo-meta-tags">
                  {currentPhoto.uploadedBy && (
                    <span className="meta-tag officer">
                      👤 {currentPhoto.uploadedBy}
                    </span>
                  )}
                  {currentPhoto.uploadedAt && (
                    <span className="meta-tag date">
                      📅 {formatDate(currentPhoto.uploadedAt)}
                    </span>
                  )}
                  {currentPhoto.geoTag && (
                    <span className="meta-tag coords" title="GPS Geo-tag">
                      🧭 {currentPhoto.geoTag}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Thumbnail Ribbon */}
          {photos.length > 1 && (
            <div className="site-thumbnails-strip">
              <div className="thumbnails-scroll-container">
                {photos.map((item, idx) => (
                  <button
                    key={item.id || idx}
                    type="button"
                    className={`site-thumb-item ${idx === photoIndex ? "active" : ""}`}
                    onClick={() => setPhotoIndex(idx)}
                    title={`${item.title} (${item.siteLocation})`}
                    aria-label={`Select site photo ${idx + 1}: ${item.title}`}
                  >
                    <img src={item.url} alt={item.title} />
                    <span className="thumb-idx-badge">{idx + 1}</span>
                    {idx === photoIndex && <span className="thumb-active-dot" />}
                  </button>
                ))}

                <button
                  type="button"
                  className="site-thumb-add-tile"
                  onClick={() => setShowAddModal(true)}
                  title="Upload another site inspection photo"
                >
                  <span className="add-icon">➕</span>
                  <span className="add-text">Add</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Site Photo Modal */}
      {showAddModal && (
        <AddSitePhotoModal
          bill={bill}
          currentUser={currentUser}
          fetchWithAuth={fetchWithAuth}
          onClose={() => setShowAddModal(false)}
          onPhotoAdded={(updatedBill, newPhoto) => {
            if (onBillUpdated) onBillUpdated(updatedBill);
            if (onShowToast) {
              onShowToast(`Attached "${newPhoto.title}" to ${bill.id}.`);
            }
            setShowAddModal(false);
            setPhotoIndex(
              (updatedBill.photos || updatedBill.photoUrls || []).length - 1
            );
          }}
        />
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && currentPhoto && (
        <PhotoLightboxModal
          photo={currentPhoto}
          currentIndex={photoIndex}
          totalPhotos={photos.length}
          projectName={bill.projectName}
          onPrev={handlePrev}
          onNext={handleNext}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// MODAL: Attach New Site Photo
// -------------------------------------------------------------
function AddSitePhotoModal({ bill, currentUser, fetchWithAuth, onClose, onPhotoAdded }) {
  const [mode, setMode] = useState("file"); // "file" | "url"
  const [photoData, setPhotoData] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [previewSrc, setPreviewSrc] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [stage, setStage] = useState(
    `Step ${bill.currentStep} — ${bill.stages[bill.currentStep - 1] || "Verification"}`
  );
  const [siteLocation, setSiteLocation] = useState(
    bill.ward || bill.projectName || "Site Inspection Location"
  );
  const [geoTag, setGeoTag] = useState("12.9716° N, 77.5946° E");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("Image size exceeds 15 MB limit.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoData(reader.result);
      setPreviewSrc(reader.result);
      if (!title) {
        const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        setTitle(rawName.charAt(0).toUpperCase() + rawName.slice(1));
      }
    };
    reader.onerror = () => setError("Failed to read image file.");
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (val) => {
    setUrlInput(val);
    setPreviewSrc(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalPhoto = mode === "file" ? photoData : urlInput.trim();

    if (!finalPhoto) {
      setError("Please upload an image file or provide a valid image URL.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a brief title for this inspection photo.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        url: mode === "url" ? finalPhoto : undefined,
        photoData: mode === "file" ? finalPhoto : undefined,
        title: title.trim(),
        caption: caption.trim() || `Field photographic evidence for ${bill.projectName}`,
        stage: stage,
        siteLocation: siteLocation.trim() || bill.ward || "Project Site",
        geoTag: geoTag.trim() || "12.9716° N, 77.5946° E"
      };

      const res = await fetchWithAuth(
        `http://localhost:4000/api/bills/${bill.id}/photos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to attach site photo.");
      }

      onPhotoAdded(data.bill, data.photo);
    } catch (err) {
      setError(err.message || "Failed to save photo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div
        className="custom-modal-window add-photo-modal-window"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="custom-modal-header">
          <div className="custom-modal-title-group">
            <span className="custom-modal-tag">SITE INSPECTION EVIDENCE</span>
            <h2>Attach Site Inspection Photo</h2>
            <div className="modal-site-hint">
              Target Site: <b>{bill.projectName}</b> ({bill.ward || bill.id})
            </div>
          </div>
          <button
            type="button"
            className="custom-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="custom-modal-body">
          {error && <div className="custom-modal-error-alert">{error}</div>}

          {/* Mode Switcher */}
          <div className="photo-input-mode-tabs">
            <button
              type="button"
              className={`mode-tab-btn ${mode === "file" ? "active" : ""}`}
              onClick={() => setMode("file")}
            >
              📁 Upload Image File
            </button>
            <button
              type="button"
              className={`mode-tab-btn ${mode === "url" ? "active" : ""}`}
              onClick={() => setMode("url")}
            >
              🌐 Enter Web Image URL
            </button>
          </div>

          {/* Image Input */}
          {mode === "file" ? (
            <div
              className="photo-file-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                style={{ display: "none" }}
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
              <div className="dropzone-icon">📷</div>
              <div className="dropzone-text">
                {previewSrc ? (
                  <span style={{ color: "#34d399", fontWeight: 700 }}>
                    ✓ Image selected. Click to replace.
                  </span>
                ) : (
                  <>
                    <b>Click to choose site photo</b> or drag & drop image here
                  </>
                )}
              </div>
              <span className="dropzone-sub">
                Supports JPG, PNG, WEBP (Max 15 MB)
              </span>
            </div>
          ) : (
            <div className="custom-modal-field">
              <label>
                Image Web URL <span className="req">*</span>
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://images.unsplash.com/... or https://..."
                required={mode === "url"}
              />
            </div>
          )}

          {/* Live Preview If Available */}
          {previewSrc && (
            <div className="photo-preview-box">
              <img src={previewSrc} alt="Preview" onError={() => setError("Unable to load image from provided source.")} />
              <div className="preview-label">Live Preview</div>
            </div>
          )}

          {/* Metadata Fields */}
          <div className="custom-modal-field">
            <label>
              Photo Title / Inspection Scope <span className="req">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Silt Dredging Excavator at Northern Weir"
              required
            />
          </div>

          <div className="custom-modal-row-2">
            <div className="custom-modal-field">
              <label>Associated Workflow Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
              >
                {bill.stages.map((stg, i) => (
                  <option key={i} value={`Step ${i + 1} — ${stg}`}>
                    Step {i + 1} — {stg}
                  </option>
                ))}
              </select>
            </div>

            <div className="custom-modal-field">
              <label>Specific Site Location / Landmark</label>
              <input
                type="text"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                placeholder="e.g. Bellandur Lake North Weir, Zone 4"
              />
            </div>
          </div>

          <div className="custom-modal-row-2">
            <div className="custom-modal-field">
              <label>GPS Geo-Coordinates (Optional)</label>
              <input
                type="text"
                value={geoTag}
                onChange={(e) => setGeoTag(e.target.value)}
                placeholder="e.g. 12.9352° N, 77.6744° E"
              />
            </div>

            <div className="custom-modal-field">
              <label>Verifying Officer</label>
              <input
                type="text"
                value={currentUser?.name || "Field Officer"}
                disabled
                style={{ opacity: 0.7 }}
              />
            </div>
          </div>

          <div className="custom-modal-field">
            <label>Technical Observation & Inspection Remarks</label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Details on civil works observed, equipment deployed, depth desilted, or quality compliance..."
            />
          </div>

          <div className="custom-modal-footer">
            <button
              type="button"
              className="custom-btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="custom-btn-primary"
              disabled={submitting || (!photoData && !urlInput.trim())}
            >
              {submitting ? "Saving Photo…" : "✓ Attach Photo to Site"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODAL: Lightbox Fullscreen View
// -------------------------------------------------------------
function PhotoLightboxModal({
  photo,
  currentIndex,
  totalPhotos,
  projectName,
  onPrev,
  onNext,
  onClose
}) {
  return (
    <div className="photo-lightbox-backdrop" onClick={onClose}>
      <div
        className="photo-lightbox-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Lightbox Toolbar */}
        <div className="lightbox-topbar">
          <div className="lightbox-title-meta">
            <h3>{photo.title}</h3>
            <span className="lightbox-site-tag">📍 {photo.siteLocation || projectName}</span>
          </div>

          <div className="lightbox-controls">
            <span className="lightbox-counter">
              {currentIndex + 1} / {totalPhotos}
            </span>
            <a
              href={photo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-lightbox-action"
              title="Open full-resolution image in new tab"
            >
              ↗ Open Original
            </a>
            <button
              type="button"
              className="btn-lightbox-close"
              onClick={onClose}
              title="Close (Esc)"
              aria-label="Close lightbox"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Big Image Viewer */}
        <div className="lightbox-main-stage">
          {totalPhotos > 1 && (
            <button
              type="button"
              className="lightbox-arrow left"
              onClick={onPrev}
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          <img src={photo.url} alt={photo.title} className="lightbox-image" />

          {totalPhotos > 1 && (
            <button
              type="button"
              className="lightbox-arrow right"
              onClick={onNext}
              aria-label="Next photo"
            >
              ›
            </button>
          )}
        </div>

        {/* Lightbox Footer Info */}
        <div className="lightbox-footer">
          <div className="lightbox-caption">
            <p>{photo.caption}</p>
          </div>
          <div className="lightbox-meta-pills">
            <span className="lb-pill">🏷️ {photo.stage}</span>
            {photo.uploadedBy && <span className="lb-pill">👤 {photo.uploadedBy}</span>}
            {photo.uploadedAt && <span className="lb-pill">📅 {formatDate(photo.uploadedAt)}</span>}
            {photo.geoTag && <span className="lb-pill">🧭 {photo.geoTag}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
