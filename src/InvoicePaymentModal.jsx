import React, { useState } from "react";

export default function InvoicePaymentModal({
  bill,
  user,
  onClose,
  onStatusUpdated,
  onNavigateReports,
  fetchWithAuth
}) {
  const currentStatus = bill.workflowStatus || "INVOICE";

  // Payment form state
  const [utrNumber, setUtrNumber] = useState(
    bill.paymentData?.utrNumber || `SBIN2026${Math.floor(100000000 + Math.random() * 900000000)}`
  );
  const [paymentMode, setPaymentMode] = useState(
    bill.paymentData?.paymentMode || "RTGS Electronic Clearing"
  );
  const [bankName, setBankName] = useState(
    bill.paymentData?.bankName || "State Bank of India - BBMP Treasury Branch"
  );
  const [remarks, setRemarks] = useState(bill.paymentData?.remarks || "Cleared via Central Treasury Portal");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const grossNum = bill.invoiceData?.gross || bill.amountNum || 4500000;
  const gstTds = bill.invoiceData?.gstTds || Math.round(grossNum * 0.02);
  const itTds = bill.invoiceData?.itTds || Math.round(grossNum * 0.02);
  const laborCess = bill.invoiceData?.laborCess || Math.round(grossNum * 0.01);
  const retention = bill.invoiceData?.retention || Math.round(grossNum * 0.05);
  const totalDeductions = bill.invoiceData?.totalDeductions || (gstTds + itTds + laborCess + retention);
  const netPayable = bill.invoiceData?.netPayable || (grossNum - totalDeductions);

  // Transition from INVOICE to PAYMENT
  const handleProceedToPayment = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetchWithAuth(`http://localhost:4000/api/bills/${bill.id}/proceed-to-payment`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to proceed to payment.");

      onStatusUpdated(data.bill);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Transition from PAYMENT to PAID
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      setError("Please enter a valid Bank UTR / Transaction Reference Number.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetchWithAuth(`http://localhost:4000/api/bills/${bill.id}/record-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utrNumber: utrNumber.trim(),
          paymentMode,
          bankName,
          amountPaid: netPayable,
          remarks
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record payment.");

      onStatusUpdated(data.bill);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Transition from PAID to CLOSED
  const handleCloseBill = async () => {
    if (!window.confirm(`Permanently seal and close bill "${bill.id}"? This will archive the workflow file.`)) {
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetchWithAuth(`http://localhost:4000/api/bills/${bill.id}/close-bill`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to close bill.");

      onStatusUpdated(data.bill);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div
        className="custom-modal-window wide invoice-modal-window"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="custom-modal-header invoice-header">
          <div className="custom-modal-title-group">
            <span className="custom-modal-tag tag-success">
              STAGE: {currentStatus}
            </span>
            <h2>
              {currentStatus === "INVOICE" && "Official Tax Invoice & Pre-Audit Pass Order"}
              {currentStatus === "PAYMENT" && "Treasury Fund Transfer & Disbursement Processing"}
              {currentStatus === "PAID" && "Payment Confirmation & Bank Discharge Advice"}
              {currentStatus === "CLOSED" && "Permanent File Closure & Archival Record"}
            </h2>
          </div>
          <button type="button" className="custom-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="custom-modal-body">
          {error && <div className="custom-modal-error-alert">{error}</div>}

          {/* Stepper tracker for the approved branch: INVOICE -> PAYMENT -> PAID -> CLOSED */}
          <div className="invoice-progress-steps">
            <div className={`inv-step ${["INVOICE", "PAYMENT", "PAID", "CLOSED"].includes(currentStatus) ? "active" : ""}`}>
              <div className="inv-step-dot">1</div>
              <span>INVOICE</span>
            </div>
            <div className="inv-step-line"></div>
            <div className={`inv-step ${["PAYMENT", "PAID", "CLOSED"].includes(currentStatus) ? "active" : ""}`}>
              <div className="inv-step-dot">2</div>
              <span>PAYMENT</span>
            </div>
            <div className="inv-step-line"></div>
            <div className={`inv-step ${["PAID", "CLOSED"].includes(currentStatus) ? "active" : ""}`}>
              <div className="inv-step-dot">3</div>
              <span>PAID</span>
            </div>
            <div className="inv-step-line"></div>
            <div className={`inv-step ${currentStatus === "CLOSED" ? "active" : ""}`}>
              <div className="inv-step-dot">4</div>
              <span>CLOSED</span>
            </div>
          </div>

          {/* Official Tax Invoice Voucher Sheet */}
          <div className="official-invoice-slip">
            <div className="slip-top">
              <div className="slip-issuer">
                <h3>BRUHAT BENGALURU MAHANAGARA PALIKE</h3>
                <p>Engineering & Accounts Directorate • KPWD Form 57 Passed Order</p>
              </div>
              <div className="slip-inv-meta">
                <div className="meta-box">
                  <span className="lbl">INVOICE NO:</span>
                  <span className="val highlight">{bill.invoiceData?.invoiceNo || `INV-2026-BBMP-${bill.id}`}</span>
                </div>
                <div className="meta-box">
                  <span className="lbl">DATE:</span>
                  <span className="val">
                    {bill.invoiceData?.invoiceDate
                      ? new Date(bill.invoiceData.invoiceDate).toLocaleDateString()
                      : new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="slip-divider"></div>

            <div className="slip-info-grid">
              <div>
                <span className="lbl">Beneficiary Contractor:</span>
                <strong>{bill.contractor}</strong>
              </div>
              <div>
                <span className="lbl">Work / Project Title:</span>
                <span>{bill.projectName}</span>
              </div>
              <div>
                <span className="lbl">Measurement Book (MB):</span>
                <span>{bill.mbNumber || "Verified & Signed"}</span>
              </div>
              <div>
                <span className="lbl">Ward & Division:</span>
                <span>{bill.ward}</span>
              </div>
            </div>

            <table className="slip-amounts-table">
              <thead>
                <tr>
                  <th>Particulars / Statutory Head</th>
                  <th>Calculation Rule</th>
                  <th style={{ textAlign: "right" }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Gross Sanctioned Bill Claim</td>
                  <td>Certified measurements in MB</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    ₹ {grossNum.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr className="sub-deduct">
                  <td>Less: GST TDS Deduction</td>
                  <td>2% on gross taxable work</td>
                  <td style={{ textAlign: "right", color: "#ef4444" }}>
                    - ₹ {gstTds.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr className="sub-deduct">
                  <td>Less: Income Tax TDS (Sec 194C)</td>
                  <td>2% statutory contractor TDS</td>
                  <td style={{ textAlign: "right", color: "#ef4444" }}>
                    - ₹ {itTds.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr className="sub-deduct">
                  <td>Less: Labour Welfare Cess</td>
                  <td>1% Building & Const. Workers Act</td>
                  <td style={{ textAlign: "right", color: "#ef4444" }}>
                    - ₹ {laborCess.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr className="sub-deduct">
                  <td>Less: Security Deposit / Retention</td>
                  <td>5% retained until defect liability</td>
                  <td style={{ textAlign: "right", color: "#ef4444" }}>
                    - ₹ {retention.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr className="slip-total-row">
                  <td colSpan="2">
                    <strong>NET PAYABLE AMOUNT (IN WORDS: RUPEES {numberToIndianWords(netPayable)} ONLY)</strong>
                  </td>
                  <td style={{ textAlign: "right", color: "#10b981", fontSize: "18px", fontWeight: 800 }}>
                    ₹ {netPayable.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Form for PAYMENT stage */}
          {currentStatus === "PAYMENT" && (
            <form onSubmit={handleRecordPayment} className="payment-entry-form">
              <div className="section-subtitle">
                <h4>Treasury Electronic Fund Transfer (RTGS / PFMS) Execution</h4>
                <p>Enter the clearance UTR from State Bank of India treasury portal to confirm payment.</p>
              </div>

              <div className="custom-modal-row-2">
                <div className="custom-modal-field">
                  <label>
                    Bank UTR / Transaction Reference No. <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. SBIN2026092688419"
                  />
                </div>

                <div className="custom-modal-field">
                  <label>Disbursement Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <option value="RTGS Electronic Clearing">RTGS Electronic Clearing</option>
                    <option value="PFMS Direct Benefit Transfer">PFMS Direct Benefit Transfer</option>
                    <option value="State Treasury Khajane II Transfer">State Treasury Khajane II Transfer</option>
                  </select>
                </div>
              </div>

              <div className="custom-modal-row-2">
                <div className="custom-modal-field">
                  <label>Treasury Clearing Bank</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>

                <div className="custom-modal-field">
                  <label>Auditor Reference Notes</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="primary btn-confirm-payment-action"
                disabled={submitting}
              >
                {submitting ? "Confirming Disbursement…" : "💰 Confirm Payment Executed (Move to PAID)"}
              </button>
            </form>
          )}

          {/* PAID or CLOSED details */}
          {(currentStatus === "PAID" || currentStatus === "CLOSED") && bill.paymentData && (
            <div className="paid-acknowledgement-card">
              <div className="ack-header">
                <span className="ack-icon">✅</span>
                <div>
                  <strong>BANK DISBURSEMENT CONFIRMED (PAID)</strong>
                  <div className="ack-sub">
                    Disbursed amount of <b>₹ {(bill.paymentData.amountPaid || netPayable).toLocaleString("en-IN")}</b> electronically credited to contractor.
                  </div>
                </div>
              </div>
              <div className="ack-grid">
                <div><span>Bank UTR:</span> <b>{bill.paymentData.utrNumber}</b></div>
                <div><span>Mode:</span> {bill.paymentData.paymentMode}</div>
                <div><span>Cleared Date:</span> {new Date(bill.paymentData.paidDate).toLocaleString()}</div>
                <div><span>Voucher Ref:</span> {bill.paymentData.voucherId}</div>
              </div>
            </div>
          )}

          {currentStatus === "CLOSED" && (
            <div className="closed-seal-box">
              <div className="seal-badge">FILE PERMANENTLY CLOSED & ARCHIVED</div>
              <p>
                All statutory inspections, check measurements, tax audits, and electronic disbursements are complete.
                This file is cryptographically locked and stored in the municipal permanent archives.
              </p>
              <small>Closed by: <b>{bill.closedBy || "Chief Finance Officer"}</b> at {new Date(bill.closedAt || Date.now()).toLocaleString()}</small>
            </div>
          )}
        </div>

        <div className="custom-modal-footer invoice-footer">
          <div className="modal-actions-left">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn-goto-reports"
              onClick={() => {
                onClose();
                if (onNavigateReports) onNavigateReports();
              }}
            >
              <span>📈</span>
              <span>View in Reports →</span>
            </button>
          </div>

          <div className="modal-actions-right">
            {/* INVOICE -> proceed to PAYMENT */}
            {currentStatus === "INVOICE" && (
              <button
                type="button"
                className="primary btn-proceed-payment"
                disabled={submitting}
                onClick={handleProceedToPayment}
              >
                {submitting ? "Transmitting…" : "🏦 Authorize Invoice & Proceed to PAYMENT"}
              </button>
            )}

            {/* PAID -> Close Bill */}
            {currentStatus === "PAID" && (
              <button
                type="button"
                className="primary btn-finalize-close"
                disabled={submitting}
                onClick={handleCloseBill}
              >
                {submitting ? "Finalizing…" : "📁 Finalize & CLOSE File (CLOSED stage)"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Indian numbering system converter
function numberToIndianWords(num) {
  if (!num) return "ZERO";
  const a = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
  const b = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];

  function inWords(n) {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? " " + a[digit] : "");
  }

  let str = "";
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = Math.floor(num / 100);
  const remaining = num % 100;

  if (crore > 0) str += inWords(crore) + " CRORE ";
  if (lakh > 0) str += inWords(lakh) + " LAKH ";
  if (thousand > 0) str += inWords(thousand) + " THOUSAND ";
  if (hundred > 0) str += inWords(hundred) + " HUNDRED ";
  if (remaining > 0) str += (str !== "" ? "AND " : "") + inWords(remaining);

  return str.trim();
}
