import React, { useState } from "react";

const ACTION_TYPES = [
  "Physical Field Verification",
  "Site Quality & Depth Check",
  "Measurement Book Cross-Check",
  "Contractor Compliance Inspection",
  "Officer Concurrence & Review",
  "Administrative Clarification"
];

export default function NewAuditNoteModal({
  billId,
  stages = [],
  currentStep = 1,
  currentUser,
  onClose,
  onNoteAdded,
  fetchWithAuth
}) {
  const [formData, setFormData] = useState({
    step: currentStep,
    actionType: "Physical Field Verification",
    note: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.note.trim()) {
      setError("Please write an inspection or verification note.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetchWithAuth(`http://localhost:4000/api/bills/${billId}/audit-entry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: Number(formData.step) || currentStep,
          actionType: formData.actionType,
          note: formData.note.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to log inspection note");
      }

      onNoteAdded(data.history);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit note");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div
        className="custom-modal-window"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="custom-modal-header">
          <div className="custom-modal-title-group">
            <span className="custom-modal-tag">SITE LOGGING</span>
            <h2>Record Field Inspection / Audit Note</h2>
          </div>
          <button
            type="button"
            className="custom-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="custom-modal-body">
          {error && <div className="custom-modal-error-alert">{error}</div>}

          <div className="custom-modal-row-2">
            <div className="custom-modal-field">
              <label>Target Workflow Stage</label>
              <select name="step" value={formData.step} onChange={handleChange}>
                {stages.map((stg, i) => (
                  <option key={stg + i} value={i + 1}>
                    Step {i + 1}: {stg}
                  </option>
                ))}
              </select>
            </div>

            <div className="custom-modal-field">
              <label>Verification Activity Type</label>
              <select name="actionType" value={formData.actionType} onChange={handleChange}>
                {ACTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="custom-modal-field">
            <label>Authorizing Officer</label>
            <input
              type="text"
              disabled
              value={`${currentUser?.name || "Officer"} (${currentUser?.role || "Field Officer"})`}
              style={{ opacity: 0.85 }}
            />
          </div>

          <div className="custom-modal-field">
            <label>
              Site Observations & Verification Log <span className="req">*</span>
            </label>
            <textarea
              name="note"
              rows={4}
              value={formData.note}
              onChange={handleChange}
              placeholder="e.g. Conducted on-site physical inspection at Bellandur Lake South inlet. Verified desilting depth of 1.8 meters across chainage 0+00 to 0+450. Bund stone revetment slope matches sanctioned drawings."
              required
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
              disabled={submitting}
            >
              {submitting ? "Logging…" : "✓ Add to Audit Trail"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
