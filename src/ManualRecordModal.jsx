import React, { useState } from "react";

const CATEGORIES = [
  { id: "Invoice / Bill", label: "📜 Contractor Invoice / RA Bill", defaultPrefix: "INV" },
  { id: "Measurement Book Entry", label: "📐 Measurement Book (MB) Entry", defaultPrefix: "MB" },
  { id: "Quality Certificate", label: "🛡️ Quality Inspection & Lab Certificate", defaultPrefix: "QC" },
  { id: "Attendance Muster", label: "👥 Labor Attendance & Muster Roll", defaultPrefix: "ATT" },
  { id: "Sanction Order", label: "🏛️ Administrative Approval / Sanction Order", defaultPrefix: "SNC" },
  { id: "Verification Voucher", label: "📝 Field Verification Note / Voucher", defaultPrefix: "VCH" }
];

export default function ManualRecordModal({
  billId,
  stages = [],
  currentStep = 1,
  currentUser,
  onClose,
  onRecordCreated,
  fetchWithAuth
}) {
  const [formData, setFormData] = useState({
    name: "",
    category: "Invoice / Bill",
    refNumber: `VCH-${Math.floor(100000 + Math.random() * 900000)}`,
    amount: "₹ 12,50,000",
    step: currentStep,
    issuingAuthority: currentUser?.name ? `${currentUser.name} (${currentUser.role})` : "Site Verification Officer",
    date: new Date().toISOString().split("T")[0],
    remarks: ""
  });

  const [items, setItems] = useState([
    { desc: "Earthwork excavation and de-silting in lake basin", qty: "450", unit: "cum", rate: "1200", total: "540000" },
    { desc: "Stone pitching along lake bund with filter layer", qty: "180", unit: "sqm", rate: "2500", total: "450000" }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      
      // Auto-compute total if qty and rate are numbers
      if (field === "qty" || field === "rate") {
        const q = parseFloat(field === "qty" ? value : item.qty) || 0;
        const r = parseFloat(field === "rate" ? value : item.rate) || 0;
        if (q > 0 && r > 0) {
          item.total = String(Math.round(q * r));
        }
      }
      updated[index] = item;
      return updated;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { desc: "", qty: "1", unit: "unit", rate: "0", total: "0" }
    ]);
  };

  const removeItemRow = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Compute calculated total from line items
  const computedItemsSum = items.reduce((acc, it) => acc + (parseFloat(it.total) || 0), 0);

  const applySumToAmount = () => {
    if (computedItemsSum > 0) {
      setFormData((prev) => ({
        ...prev,
        amount: `₹ ${computedItemsSum.toLocaleString("en-IN")}`
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please provide a Document or Record Title.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        refNumber: formData.refNumber.trim() || `REF-${Date.now().toString().slice(-6)}`,
        amount: formData.amount.trim(),
        step: Number(formData.step) || currentStep,
        issuingAuthority: formData.issuingAuthority.trim(),
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        remarks: formData.remarks.trim(),
        items: items.filter((it) => it.desc.trim().length > 0)
      };

      const res = await fetchWithAuth(`http://localhost:4000/api/bills/${billId}/documents/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record manual entry");
      }

      onRecordCreated(data.document, data.documents);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save record");
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
            <span className="custom-modal-tag">MANUAL VERIFICATION ENTRY</span>
            <h2>Add Document / Invoice Record Manually</h2>
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
              <label>
                Record / Document Title <span className="req">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFieldChange}
                placeholder="e.g. Joint Site Inspection & RA Bill #02 Verification"
                required
              />
            </div>

            <div className="custom-modal-field">
              <label>
                Record Category <span className="req">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleFieldChange}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="custom-modal-row-3">
            <div className="custom-modal-field">
              <label>Reference / Voucher #</label>
              <input
                type="text"
                name="refNumber"
                value={formData.refNumber}
                onChange={handleFieldChange}
                placeholder="e.g. BBMP/LAK/2026/V-894"
              />
            </div>

            <div className="custom-modal-field">
              <label>
                Bill Amount / Valuation
                {computedItemsSum > 0 && (
                  <button
                    type="button"
                    onClick={applySumToAmount}
                    className="btn-apply-sum"
                    title="Copy sum from line items below"
                  >
                    Sync items sum (₹{computedItemsSum.toLocaleString("en-IN")})
                  </button>
                )}
              </label>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleFieldChange}
                placeholder="e.g. ₹ 14,50,000"
              />
            </div>

            <div className="custom-modal-field">
              <label>Associated Workflow Stage</label>
              <select
                name="step"
                value={formData.step}
                onChange={handleFieldChange}
              >
                {stages.map((stg, i) => (
                  <option key={stg + i} value={i + 1}>
                    Step {i + 1}: {stg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="custom-modal-row-2">
            <div className="custom-modal-field">
              <label>Verified By / Issuing Authority</label>
              <input
                type="text"
                name="issuingAuthority"
                value={formData.issuingAuthority}
                onChange={handleFieldChange}
                placeholder="e.g. Dr. Priya Sharma (Field Officer (AEE))"
              />
            </div>

            <div className="custom-modal-field">
              <label>Record / Inspection Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFieldChange}
              />
            </div>
          </div>

          {/* Interactive Line Items Breakdown */}
          <div className="manual-items-section">
            <div className="manual-items-head">
              <div>
                <h4>Measurement & Bill of Quantities (BoQ) Line Items</h4>
                <p>Add individual work items, quantities, and rates for official verification.</p>
              </div>
              <button
                type="button"
                className="btn-add-item-row"
                onClick={addItemRow}
              >
                + Add Item Line
              </button>
            </div>

            <div className="items-table-wrapper">
              <table className="items-entry-table">
                <thead>
                  <tr>
                    <th style={{ width: "42%" }}>Item Description / Work Specification</th>
                    <th style={{ width: "14%" }}>Quantity</th>
                    <th style={{ width: "12%" }}>Unit</th>
                    <th style={{ width: "16%" }}>Rate (₹)</th>
                    <th style={{ width: "16%" }}>Total (₹)</th>
                    <th style={{ width: "40px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          value={it.desc}
                          onChange={(e) => handleItemChange(idx, "desc", e.target.value)}
                          placeholder="e.g. Bund strengthening with revetment stone"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="any"
                          value={it.qty}
                          onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={it.unit}
                          onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                          placeholder="cum / sqm / nos"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="any"
                          value={it.rate}
                          onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="any"
                          value={it.total}
                          onChange={(e) => handleItemChange(idx, "total", e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td>
                        {items.length > 1 && (
                          <button
                            type="button"
                            className="btn-del-row"
                            onClick={() => removeItemRow(idx)}
                            title="Remove line"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ textAlign: "right", fontWeight: 700 }}>
                      Calculated Subtotal:
                    </td>
                    <td style={{ fontWeight: 800, color: "#10b981" }}>
                      ₹ {computedItemsSum.toLocaleString("en-IN")}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="custom-modal-field">
            <label>Field Observations & Verification Remarks</label>
            <textarea
              name="remarks"
              rows={2}
              value={formData.remarks}
              onChange={handleFieldChange}
              placeholder="e.g. Physical on-site verification confirmed. Quantities match MB Page 42-45. Work conforms to technical parameters."
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
              {submitting ? "Saving Record…" : "✓ Save Manual Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
