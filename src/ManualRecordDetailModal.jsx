import React from "react";

function formatDate(val) {
  if (!val) return "-";
  return new Date(val).toLocaleDateString("en-IN", {
    dateStyle: "medium"
  });
}

export default function ManualRecordDetailModal({ record, stages = [], onClose }) {
  if (!record) return null;

  const items = record.items || [];
  const totalAmount = items.reduce((sum, it) => sum + (parseFloat(it.total) || 0), 0);
  const stageName = record.associatedStep && stages[record.associatedStep - 1]
    ? `Step ${record.associatedStep}: ${stages[record.associatedStep - 1]}`
    : `Step ${record.associatedStep || 1}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div
        className="custom-modal-window wide printable-record-window"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="custom-modal-header">
          <div className="custom-modal-title-group">
            <div className="record-badge-row">
              <span className="record-cat-pill">✍️ {record.category || "Manual Document Record"}</span>
              <span className="record-stage-pill">{stageName}</span>
              <span className="record-ref-pill">Ref: {record.refNumber || record.id}</span>
            </div>
            <h2>{record.name}</h2>
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

        <div className="custom-modal-body">
          {/* Key Metric Highlights */}
          <div className="record-metrics-grid">
            <div className="record-metric-card">
              <span className="metric-label">Financial Valuation</span>
              <strong className="metric-value green">{record.amount || "₹ 0"}</strong>
            </div>

            <div className="record-metric-card">
              <span className="metric-label">Issuing Authority / Officer</span>
              <strong className="metric-value">{record.issuingAuthority || record.uploadedBy || "Field Officer"}</strong>
            </div>

            <div className="record-metric-card">
              <span className="metric-label">Record Verification Date</span>
              <strong className="metric-value">{formatDate(record.recordDate || record.uploadedAt)}</strong>
            </div>

            <div className="record-metric-card">
              <span className="metric-label">Audit Registration</span>
              <strong className="metric-value">Verified in System</strong>
            </div>
          </div>

          {/* Observations and Remarks */}
          {record.remarks && (
            <div className="record-remarks-box">
              <div className="remarks-head">📝 Verification Remarks & Field Notes</div>
              <p>{record.remarks}</p>
            </div>
          )}

          {/* Line items table */}
          {items.length > 0 && (
            <div className="record-table-section">
              <h3>Itemized BoQ & Measurement Specifications</h3>
              <table className="record-items-display-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Specification / Work Item</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Rate</th>
                    <th style={{ textAlign: "right" }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td><b>{it.desc}</b></td>
                      <td>{it.qty}</td>
                      <td>{it.unit || "-"}</td>
                      <td>₹ {parseFloat(it.rate || 0).toLocaleString("en-IN")}</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>
                        ₹ {parseFloat(it.total || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {totalAmount > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={5} style={{ textAlign: "right", fontWeight: 800 }}>
                        Total Itemized Valuation:
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 900, color: "#10b981", fontSize: "16px" }}>
                        ₹ {totalAmount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}

          {/* Metadata footer */}
          <div className="record-audit-footer">
            <span>Entered by <b>{record.uploadedBy || "Officer"}</b> on {new Date(record.uploadedAt).toLocaleString()}</span>
            <span>Record ID: <code>{record.id}</code></span>
          </div>

          <div className="custom-modal-footer">
            <button
              type="button"
              className="custom-btn-secondary"
              onClick={handlePrint}
            >
              🖨️ Print Voucher
            </button>
            <button
              type="button"
              className="custom-btn-primary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
