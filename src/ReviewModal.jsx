import React, { useState } from "react";

export default function ReviewModal({
  bill,
  user,
  onClose,
  onReviewCompleted,
  fetchWithAuth
}) {
  const [decision, setDecision] = useState("approve"); // 'approve' or 'reject'
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const grossNum = bill.amountNum || 4875000;
  const gstTds = Math.round(grossNum * 0.02);
  const itTds = Math.round(grossNum * 0.02);
  const laborCess = Math.round(grossNum * 0.01);
  const retention = Math.round(grossNum * 0.05);
  const totalDeductions = gstTds + itTds + laborCess + retention;
  const netPayable = grossNum - totalDeductions;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (decision === "reject" && !remarks.trim()) {
      setError("A detailed rejection reason is required to route this bill to the EDIT stage.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetchWithAuth(`http://localhost:4000/api/bills/${bill.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          remarks: remarks.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review submission failed.");

      onReviewCompleted(data.bill, decision);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit review.");
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
      >
        <div className="custom-modal-header review-modal-header">
          <div className="custom-modal-title-group">
            <span className="custom-modal-tag">STAGE 6: REVIEW GATEWAY</span>
            <h2>Departmental Technical & Financial Scrutiny</h2>
          </div>
          <button type="button" className="custom-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="custom-modal-body">
          {error && <div className="custom-modal-error-alert">{error}</div>}

          {/* Dossier Summary Box */}
          <div className="review-dossier-card">
            <div className="dossier-col">
              <span className="dossier-label">BILL IDENTIFIER</span>
              <span className="dossier-value highlight">{bill.id}</span>
            </div>
            <div className="dossier-col">
              <span className="dossier-label">PROJECT NAME</span>
              <span className="dossier-value">{bill.projectName}</span>
            </div>
            <div className="dossier-col">
              <span className="dossier-label">CLAIMED GROSS AMOUNT</span>
              <span className="dossier-value text-blue">{bill.amount}</span>
            </div>
            <div className="dossier-col">
              <span className="dossier-label">MEASUREMENT BOOK</span>
              <span className="dossier-value">{bill.mbNumber || "MB-2026/Recorded"}</span>
            </div>
            <div className="dossier-col">
              <span className="dossier-label">CONTRACTOR</span>
              <span className="dossier-value">{bill.contractor}</span>
            </div>
          </div>

          {/* Decision Branch Switcher */}
          <div className="review-decision-selector">
            <label className="decision-title">OFFICIAL REVIEW DECISION:</label>
            <div className="decision-options">
              <label
                className={`decision-box approve-box ${decision === "approve" ? "selected" : ""}`}
                onClick={() => setDecision("approve")}
              >
                <input
                  type="radio"
                  name="reviewDecision"
                  value="approve"
                  checked={decision === "approve"}
                  onChange={() => setDecision("approve")}
                />
                <div className="decision-info">
                  <div className="decision-head">
                    <span className="d-icon">✅</span>
                    <strong>APPROVE BILLING</strong>
                  </div>
                  <p>
                    Pass technical & financial scrutiny. Generates official <strong>INVOICE</strong> & pre-audit pass order.
                  </p>
                </div>
              </label>

              <label
                className={`decision-box reject-box ${decision === "reject" ? "selected" : ""}`}
                onClick={() => setDecision("reject")}
              >
                <input
                  type="radio"
                  name="reviewDecision"
                  value="reject"
                  checked={decision === "reject"}
                  onChange={() => setDecision("reject")}
                />
                <div className="decision-info">
                  <div className="decision-head">
                    <span className="d-icon">❌</span>
                    <strong>REJECT BILLING</strong>
                  </div>
                  <p>
                    Return to Field Officer for revision. Routes bill to <strong>EDIT</strong> stage with required corrections.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* If APPROVE selected: Show statutory deduction schedule */}
          {decision === "approve" && (
            <div className="approval-preview-card">
              <div className="schedule-header">
                <h4>Statutory Tax Deductions & Net Payable Schedule (KPWD Form 57)</h4>
                <span className="schedule-badge">Auto-Computed</span>
              </div>
              <div className="deductions-grid">
                <div className="deduction-item">
                  <span>Gross Claimed:</span>
                  <strong>—</strong>
                </div>
                <div className="deduction-item text-red">
                  <span>GST TDS (2%):</span>
                  <span>Deducted</span>
                </div>
                <div className="deduction-item text-red">
                  <span>Income Tax TDS (2%):</span>
                  <span>Deducted</span>
                </div>
                <div className="deduction-item text-red">
                  <span>Labour Welfare Cess (1%):</span>
                  <span>Deducted</span>
                </div>
                <div className="deduction-item text-red">
                  <span>Retention / SD (5%):</span>
                  <span>Deducted</span>
                </div>
                <div className="deduction-item total-row text-emerald">
                  <span>Net Payable Amount:</span>
                  <strong>Computed</strong>
                </div>
              </div>
            </div>
          )}

          {/* If REJECT selected: Show mandatory objection reason */}
          {decision === "reject" && (
            <div className="rejection-entry-card">
              <div className="rejection-warning">
                <span className="warn-icon">⚠️</span>
                <div>
                  <strong>Work Order will be routed to the EDIT stage</strong>
                  <p>
                    The field engineer and contractor will receive your audit objections, make the required modifications in the docket, and resubmit for fresh evaluation.
                  </p>
                </div>
              </div>
              <div className="custom-modal-field">
                <label>
                  Specific Audit Objections & Revision Instructions <span className="req">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Quantity discrepancy in MB Book sheet 14. Compaction test report missing from certified lab. Deduct ₹ 1,20,000 for unverified weed clearing."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                ></textarea>
              </div>
            </div>
          )}

          {decision === "approve" && (
            <div className="custom-modal-field">
              <label>Executive Scrutiny Remarks & Pass Order Endorsement</label>
              <textarea
                rows="2"
                placeholder="e.g. 25% check measurement verified. Quantities conform to BBMP Schedule of Rates. Recommended for pre-audit passed order."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              ></textarea>
            </div>
          )}

          <div className="custom-modal-footer">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>

            {decision === "approve" ? (
              <button
                type="submit"
                className="primary btn-confirm-approve"
                disabled={submitting}
              >
                {submitting ? "Processing Pass Order…" : "✅ Authorize Approval & Proceed to INVOICE"}
              </button>
            ) : (
              <button
                type="submit"
                className="btn-confirm-reject"
                disabled={submitting}
              >
                {submitting ? "Rejecting…" : "❌ Reject Bill & Route to EDIT"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
