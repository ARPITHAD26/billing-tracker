import React, { useState } from "react";

export default function WorkflowActionBanner({ bill, user, fetchWithAuth, onBillUpdated, onToast }) {
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState({
    projectName: bill.projectName,
    amount: bill.amount,
    contractor: bill.contractor,
    ward: bill.ward,
    mbNumber: bill.mbNumber || "",
    description: bill.description || "",
    revisionNote: ""
  });

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    utrNumber: `SBIN${Date.now().toString().slice(-9)}`,
    paymentMode: "RTGS Electronic Clearing",
    bankName: "State Bank of India - BBMP Treasury Branch",
    amountPaid: bill.invoiceData?.netPayable ? `₹ ${bill.invoiceData.netPayable.toLocaleString("en-IN")}` : bill.amount
  });

  const status = bill.workflowStatus || "UNDER_REVIEW";

  // 1. Submit billing (if DRAFT)
  const handleSubmitBill = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`http://localhost:4000/api/bills/${bill.id}/submit`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      onBillUpdated(data.bill);
      onToast(data.message);
    } catch (err) {
      onToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Approve billing (UNDER_REVIEW -> INVOICE)
  const handleApprove = async () => {
    if (!window.confirm(`Approve Bill "${bill.id}" and generate official Tax Invoice?`)) return;
    setLoading(true);
    try {
      const res = await fetchWithAuth(`http://localhost:4000/api/bills/${bill.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "approve", remarks: "Technical & Measurement Verification Satisfactory" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed");
      onBillUpdated(data.bill);
      onToast(data.message);
    } catch (err) {
      onToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Reject billing (UNDER_REVIEW -> REJECTED_EDIT)
  const handleRejectConfirm = async () => {
    if (!rejectRemarks.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetchWithAuth(`http://localhost:4000/api/bills/${bill.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "reject", remarks: rejectRemarks.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rejection failed");
      onBillUpdated(data.bill);
      setShowRejectModal(false);
      onToast(data.message);
    } catch (err) {
      onToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Save edits & Resubmit (REJECTED_EDIT -> UNDER_REVIEW)
  const handleSaveAndResubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // First update details
      const editRes = await fetchWithAuth(`http://localhost:4000/api/bills/${bill.id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData)
      });
      if (!editRes.ok) throw new Error("Failed to update bill edits");

      // Then resubmit
      const resubmitRes = await fetchWithAuth(`http://localhost:4000/api/bills/${bill.id}/resubmit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisionNote: editData.revisionNote || "Rectified objections." })
      });
      const data = await resubmitRes.json();
      if (!resubmitRes.ok) throw new Error(data.error || "Resubmission failed");

      onBillUpdated(data.bill);
      setShowEditModal(false);
      onToast(data.message);
    } catch (err) {
      onToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Proceed to payment (INVOICE -> PAYMENT)
  const handleProceedToPayment = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`http://localhost:4000/api/bills/${bill.id}/proceed-to-payment`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transition to payment failed");
      onBillUpdated(data.bill);
      onToast(data.message);
    } catch (err) {
      onToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. Record payment (PAYMENT -> PAID)
  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentData.utrNumber.trim()) {
      alert("UTR Number is required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetchWithAuth(`http://localhost:4000/api/bills/${bill.id}/record-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment recording failed");
      onBillUpdated(data.bill);
      setShowPaymentModal(false);
      onToast(data.message);
    } catch (err) {
      onToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 7. Close bill (PAID -> CLOSED)
  const handleCloseBill = async () => {
    if (!window.confirm(`Permanently seal and close Bill file "${bill.id}"?`)) return;
    setLoading(true);
    try {
      const res = await fetchWithAuth(`http://localhost:4000/api/bills/${bill.id}/close-bill`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Closing failed");
      onBillUpdated(data.bill);
      onToast(data.message);
    } catch (err) {
      onToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`workflow-lifecycle-banner status-${status.toLowerCase()}`}>
      <div className="lifecycle-banner-left">
        <div className="lifecycle-status-pill">
          {status === "UNDER_REVIEW" && "🟡 UNDER DEPARTMENTAL REVIEW"}
          {status === "REJECTED_EDIT" && "🔴 REJECTED IN REVIEW — REVISION REQUIRED"}
          {status === "INVOICE" && "🟣 TAX INVOICE GENERATED — READY FOR PAYMENT"}
          {status === "PAYMENT" && "🔵 IN TREASURY PAYMENT QUEUE"}
          {status === "PAID" && "🟢 PAYMENT DISBURSED & CLEARED"}
          {status === "CLOSED" && "⚪ FILE PERMANENTLY CLOSED & ARCHIVED"}
          {status === "SUBMITTED" && "🟡 SUBMITTED — AWAITING REVIEW PICKUP"}
          {status === "DRAFT" && "📝 DRAFT BILLING DOCKET"}
        </div>

        {/* Detailed context text */}
        {status === "UNDER_REVIEW" && (
          <p className="lifecycle-desc">
            This bill dossier is currently under technical scrutiny. Field Officers and Engineers can verify MB sheets and approve or reject.
          </p>
        )}

        {status === "REJECTED_EDIT" && (
          <div className="rejection-box">
            <span className="rejection-title">Objection / Rejection Reason:</span>
            <span className="rejection-text">{bill.rejectionReason}</span>
            {bill.rejectedBy && <span className="rejection-by">Flagged by: {bill.rejectedBy}</span>}
          </div>
        )}

        {status === "INVOICE" && bill.invoiceData && (
          <div className="invoice-summary-box">
            <span>Invoice <b>#{bill.invoiceData.invoiceNo}</b></span>
          </div>
        )}

        {status === "PAYMENT" && (
          <p className="lifecycle-desc">
            Disbursement authorized. Awaiting RTGS confirmation from BBMP Treasury Branch.
          </p>
        )}

        {status === "PAID" && bill.paymentData && (
          <div className="payment-summary-box">
            <span>UTR Ref: <b>{bill.paymentData.utrNumber}</b></span>
            <span>• Mode: <b>{bill.paymentData.paymentMode}</b></span>
          </div>
        )}

        {status === "CLOSED" && (
          <p className="lifecycle-desc">
            Statutory verification completed. Sealed on {new Date(bill.closedAt || Date.now()).toLocaleDateString("en-IN")}.
          </p>
        )}
      </div>

      <div className="lifecycle-banner-actions">
        {/* Action button based on state */}
        {status === "SUBMITTED" && (
          <button
            type="button"
            className="btn-lifecycle-action primary"
            onClick={handleSubmitBill}
            disabled={loading}
          >
            Start Technical Review →
          </button>
        )}

        {status === "UNDER_REVIEW" && (
          <div className="review-action-group">
            <button
              type="button"
              className="btn-lifecycle-action approve"
              onClick={handleApprove}
              disabled={loading}
              title="Approve verification and generate official Tax Invoice"
            >
              ✓ Approve & Generate Invoice
            </button>
            <button
              type="button"
              className="btn-lifecycle-action reject"
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              title="Flag objections and return to field officer for edits"
            >
              ✕ Reject to Edit
            </button>
          </div>
        )}

        {status === "REJECTED_EDIT" && (
          <button
            type="button"
            className="btn-lifecycle-action edit-resubmit"
            onClick={() => {
              setEditData({
                projectName: bill.projectName,
                amount: bill.amount,
                contractor: bill.contractor,
                ward: bill.ward,
                mbNumber: bill.mbNumber || "",
                description: bill.description || "",
                revisionNote: `Corrected: ${bill.rejectionReason || "Addressed objections."}`
              });
              setShowEditModal(true);
            }}
            disabled={loading}
          >
            ✏️ Edit & Resubmit Bill
          </button>
        )}

        {status === "INVOICE" && (
          <button
            type="button"
            className="btn-lifecycle-action payment"
            onClick={handleProceedToPayment}
            disabled={loading}
          >
            💳 Transmit to Central Treasury →
          </button>
        )}

        {status === "PAYMENT" && (
          <button
            type="button"
            className="btn-lifecycle-action record-pay"
            onClick={() => setShowPaymentModal(true)}
            disabled={loading}
          >
            💰 Record Treasury Payment / UTR
          </button>
        )}

        {status === "PAID" && (
          <button
            type="button"
            className="btn-lifecycle-action close-file"
            onClick={handleCloseBill}
            disabled={loading}
          >
            🔒 Finalize & Close Bill File
          </button>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="custom-modal-backdrop" onClick={() => setShowRejectModal(false)}>
          <div className="custom-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <div className="custom-modal-title-group">
                <span className="custom-modal-tag">REVIEW OBJECTION</span>
                <h2>Reject Bill & Route to Edit Stage</h2>
              </div>
              <button type="button" className="custom-modal-close" onClick={() => setShowRejectModal(false)}>✕</button>
            </div>
            <div className="custom-modal-body">
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
                Specify exact discrepancies, measurement book issues, or missing documentation for the field officer to correct.
              </p>
              <div className="custom-modal-field">
                <label>Rejection Reason & Required Rectification <span className="req">*</span></label>
                <textarea
                  rows={4}
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  placeholder="e.g. Measurement discrepancy in MB sheet 14. Compaction test report missing from lab certification."
                  required
                />
              </div>
              <div className="custom-modal-footer">
                <button type="button" className="custom-btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
                <button type="button" className="custom-btn-primary" style={{ background: "#ef4444" }} onClick={handleRejectConfirm} disabled={loading}>
                  Confirm Rejection & Send to Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit & Resubmit Modal */}
      {showEditModal && (
        <div className="custom-modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="custom-modal-window wide" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <div className="custom-modal-title-group">
                <span className="custom-modal-tag">RECTIFICATION</span>
                <h2>Edit Bill Details & Resubmit for Review</h2>
              </div>
              <button type="button" className="custom-modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveAndResubmit} className="custom-modal-body">
              {bill.rejectionReason && (
                <div className="custom-modal-error-alert">
                  <b>Prior Objection:</b> {bill.rejectionReason}
                </div>
              )}
              <div className="custom-modal-row-2">
                <div className="custom-modal-field">
                  <label>Project Name</label>
                  <input
                    type="text"
                    value={editData.projectName}
                    onChange={(e) => setEditData({ ...editData, projectName: e.target.value })}
                    required
                  />
                </div>

              </div>
              <div className="custom-modal-row-3">
                <div className="custom-modal-field">
                  <label>Contractor</label>
                  <input
                    type="text"
                    value={editData.contractor}
                    onChange={(e) => setEditData({ ...editData, contractor: e.target.value })}
                  />
                </div>
                <div className="custom-modal-field">
                  <label>Ward / Division</label>
                  <input
                    type="text"
                    value={editData.ward}
                    onChange={(e) => setEditData({ ...editData, ward: e.target.value })}
                  />
                </div>
                <div className="custom-modal-field">
                  <label>Measurement Book # (MB)</label>
                  <input
                    type="text"
                    value={editData.mbNumber}
                    onChange={(e) => setEditData({ ...editData, mbNumber: e.target.value })}
                  />
                </div>
              </div>
              <div className="custom-modal-field">
                <label>Rectification Note / Explanation of Changes <span className="req">*</span></label>
                <textarea
                  rows={2}
                  value={editData.revisionNote}
                  onChange={(e) => setEditData({ ...editData, revisionNote: e.target.value })}
                  placeholder="e.g. Attached compaction certificate, rectified sheet 14 calculation."
                  required
                />
              </div>
              <div className="custom-modal-footer">
                <button type="button" className="custom-btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="custom-btn-primary" disabled={loading}>
                  ✓ Save Edits & Resubmit to Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="custom-modal-backdrop" onClick={() => setShowPaymentModal(false)}>
          <div className="custom-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <div className="custom-modal-title-group">
                <span className="custom-modal-tag">DISBURSEMENT REGISTRATION</span>
                <h2>Record Electronic Treasury Payment (RTGS)</h2>
              </div>
              <button type="button" className="custom-modal-close" onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRecordPaymentSubmit} className="custom-modal-body">
              <div className="custom-modal-field">
                <label>Bank UTR / Transaction Reference # <span className="req">*</span></label>
                <input
                  type="text"
                  value={paymentData.utrNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, utrNumber: e.target.value })}
                  placeholder="e.g. SBIN2026092688419"
                  required
                />
              </div>
              <div className="custom-modal-row-2">
                <div className="custom-modal-field">
                  <label>Payment Mode</label>
                  <input
                    type="text"
                    value={paymentData.paymentMode}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
                  />
                </div>
              </div>
              <div className="custom-modal-field">
                <label>Paying Bank / Treasury Division</label>
                <input
                  type="text"
                  value={paymentData.bankName}
                  onChange={(e) => setPaymentData({ ...paymentData, bankName: e.target.value })}
                />
              </div>
              <div className="custom-modal-footer">
                <button type="button" className="custom-btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button type="submit" className="custom-btn-primary" style={{ background: "#10b981" }} disabled={loading}>
                  ✓ Confirm Payment & Move to PAID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
