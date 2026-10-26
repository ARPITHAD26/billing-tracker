import React, { useState } from "react";

export default function EditBillingModal({
  bill,
  user,
  onClose,
  onUpdated,
  onResubmitted,
  onNavigateReports,
  fetchWithAuth
}) {
  const [formData, setFormData] = useState({
    projectName: bill.projectName || "",
    amount: bill.amount || "",
    contractor: bill.contractor || "",
    ward: bill.ward || "",
    mbNumber: bill.mbNumber || "",
    description: bill.description || ""
  });

  const [revisionNote, setRevisionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSaveEdits = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetchWithAuth(`http://localhost:4000/api/bills/${bill.id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update bill.");

      if (onUpdated) onUpdated(data.bill);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save edits.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    if (!revisionNote.trim()) {
      setError("Please provide a brief note explaining how the reviewer's objections were rectified.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      // First save any modified fields
      await fetchWithAuth(`http://localhost:4000/api/bills/${bill.id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      // Then call resubmit endpoint
      const res = await fetchWithAuth(`http://localhost:4000/api/bills/${bill.id}/resubmit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisionNote: revisionNote.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resubmit bill.");

      if (onResubmitted) onResubmitted(data.bill);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to resubmit bill.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div
        className="custom-modal-window wide edit-modal-window"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="custom-modal-header edit-modal-header">
          <div className="custom-modal-title-group">
            <span className="custom-modal-tag tag-warning">STAGE: EDIT (POST-REJECTION REVISION)</span>
            <h2>Revise & Rectify Bill: {bill.id}</h2>
          </div>
          <button type="button" className="custom-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="custom-modal-body">
          {error && <div className="custom-modal-error-alert">{error}</div>}

          {/* Rejection Alert Box */}
          <div className="rejection-alert-banner">
            <div className="rejection-alert-header">
              <span className="alert-icon">⚠️</span>
              <div className="alert-title-wrap">
                <strong>REJECTED IN REVIEW — REVISION REQUIRED</strong>
                <span className="alert-sub">
                  Action taken by <b>{bill.rejectedBy || "Reviewing Officer"}</b> on{" "}
                  {bill.rejectedAt ? new Date(bill.rejectedAt).toLocaleString() : "Recent Scrutiny"}
                </span>
              </div>
            </div>
            <div className="rejection-reason-box">
              <div className="reason-label">Reviewer's Objections & Specific Remarks:</div>
              <p className="reason-text">"{bill.rejectionReason || "Please verify measurements and resubmit."}"</p>
            </div>
          </div>

          <div className="custom-modal-row-2">
            <div className="custom-modal-field">
              <label>Project / Work Order Title</label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              />
            </div>

            <div className="custom-modal-field">
              <label>Revised Gross Amount</label>
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="custom-modal-row-3">
            <div className="custom-modal-field">
              <label>Measurement Book (MB) Ref</label>
              <input
                type="text"
                value={formData.mbNumber}
                onChange={(e) => setFormData({ ...formData, mbNumber: e.target.value })}
              />
            </div>

            <div className="custom-modal-field">
              <label>Contractor / Agency</label>
              <input
                type="text"
                value={formData.contractor}
                onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
              />
            </div>

            <div className="custom-modal-field">
              <label>Division / Ward</label>
              <input
                type="text"
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
              />
            </div>
          </div>

          <div className="custom-modal-field">
            <label>Field Rectification Notes</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Corrected quantities, updated earthwork chainage notes..."
            ></textarea>
          </div>

          {/* Resubmission Justification */}
          <div className="custom-modal-field highlight-field">
            <label>
              Mandatory Rectification Summary for Resubmission <span className="req">*</span>
            </label>
            <textarea
              rows="2"
              required
              placeholder="Explain how the reviewer's objections were resolved (e.g. Attached certified lab compaction test report, rectified MB sheet 14 quantities)."
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
            ></textarea>
            <span className="field-hint">
              This explanation will be logged into the permanent audit trail when resubmitted for review.
            </span>
          </div>
        </div>

        <div className="custom-modal-footer edit-modal-footer">
          <div className="modal-actions-left">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-goto-reports"
              onClick={() => {
                onClose();
                if (onNavigateReports) onNavigateReports();
              }}
              title="View this bill and rejection metrics in Reports"
            >
              <span>📈</span>
              <span>View in Reports →</span>
            </button>
          </div>

          <div className="modal-actions-right">
            <button
              type="button"
              className="btn-save-draft"
              disabled={submitting}
              onClick={handleSaveEdits}
            >
              {submitting ? "Saving…" : "💾 Save Changes"}
            </button>

            <button
              type="button"
              className="primary btn-resubmit-billing"
              disabled={submitting}
              onClick={handleResubmit}
              title="Resubmit to Review stage for evaluation"
            >
              <span>↺</span>
              <span>{submitting ? "Resubmitting…" : "Resubmit Billing for Review"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
