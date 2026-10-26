import React, { useState, useEffect } from "react";

export default function CreateBillingModal({
  onClose,
  onCreated,
  fetchWithAuth,
  towers = [],
  preselectedTower = null,
  currentBillCount = 1
}) {
  const defaultNextId = `BILL-${1000 + currentBillCount + 1}`;

  const [selectedTowerId, setSelectedTowerId] = useState(
    preselectedTower?.id || (towers.length > 0 ? towers[0].id : "TWR-101")
  );

  const [formData, setFormData] = useState({
    id: defaultNextId,
    projectName: "",
    projectType: "BBMP_LAKES",
    amount: "₹ 38,50,000",
    contractor: "",
    ward: "",
    mbNumber: `MB-2026/${Math.floor(100 + Math.random() * 900)}`,
    workOrderNo: `WO/BBMP/2026/${Math.floor(1000 + Math.random() * 9000)}`,
    description: "",
    customPhotoUrl: ""
  });

  // Dynamic BoQ line items
  const [lineItems, setLineItems] = useState([
    { desc: "Desilting & silt dredging with mechanical excavators", qty: "1250", unit: "cum", rate: "1200", total: "15,00,000" },
    { desc: "Lake bund strengthening, boulder revetment & rip-rap", qty: "480", unit: "sqm", rate: "2500", total: "12,00,000" },
    { desc: "Inflow masonry weir desilting and spillway civil repairs", qty: "1", unit: "LS", rate: "1150000", total: "11,50,000" }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Update contractor & ward when tower changes
  useEffect(() => {
    const matched = towers.find((t) => t.id === selectedTowerId);
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        contractor: matched.contractor || prev.contractor,
        ward: matched.ward || prev.ward,
        projectName: prev.projectName || `${matched.name} - Periodic Maintenance Phase 1`
      }));
    }
  }, [selectedTowerId, towers]);

  const handleLineItemChange = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;

    if (field === "qty" || field === "rate") {
      const q = parseFloat(updated[index].qty) || 0;
      const r = parseFloat(updated[index].rate) || 0;
      const tot = Math.round(q * r);
      updated[index].total = tot > 0 ? tot.toLocaleString("en-IN") : "";
    }
    setLineItems(updated);

    // Auto-sum amount
    const sum = updated.reduce((acc, it) => {
      const val = parseFloat((it.total || "").replace(/[^0-9.]/g, "")) || 0;
      return acc + val;
    }, 0);
    if (sum > 0) {
      setFormData((prev) => ({ ...prev, amount: `₹ ${sum.toLocaleString("en-IN")}` }));
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { desc: "", qty: "", unit: "cum", rate: "", total: "" }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (submitImmediately = false) => {
    if (!formData.projectName.trim()) {
      setError("Please enter a valid Project / Work Title.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        id: formData.id.trim(),
        towerId: selectedTowerId,
        projectName: formData.projectName.trim(),
        projectType: formData.projectType,
        amount: formData.amount.trim() || "₹ 35,00,000",
        contractor: formData.contractor.trim() || "State Public Works Contractor",
        ward: formData.ward.trim() || "BBMP Municipal Zone",
        mbNumber: formData.mbNumber.trim(),
        description:
          formData.description.trim() ||
          `Billing initiated under Tower ${selectedTowerId} (Work Order: ${formData.workOrderNo})`,
        submitImmediately: submitImmediately
      };

      if (formData.customPhotoUrl.trim()) {
        payload.photoUrls = [formData.customPhotoUrl.trim()];
      }

      const res = await fetchWithAuth("http://localhost:4000/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create new bill project");

      onCreated(data.bill);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save bill project");
    } finally {
      setSubmitting(false);
    }
  };

  const activeTower = towers.find((t) => t.id === selectedTowerId);

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
            <span className="custom-modal-tag">STAGE 4: CREATE BILLING</span>
            <h2>Initiate New Tower Billing Docket</h2>
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
          {error && <div className="custom-modal-error-alert">{error}</div>}

          {/* Tower Selection Card */}
          <div className="selected-tower-banner">
            <div className="st-left">
              <span className="st-icon">🗼</span>
              <div>
                <label className="st-label">SELECT TOWER MASTER ENTITY:</label>
                <select
                  value={selectedTowerId}
                  onChange={(e) => setSelectedTowerId(e.target.value)}
                  className="tower-select-input"
                >
                  {towers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.code} — {t.name} ({t.ward})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {activeTower && (
              <div className="st-meta">
                <span>Sanctioned Budget: <strong className="text-blue">{activeTower.budget}</strong></span>
                <span>Assigned Vendor: <strong>{activeTower.contractor}</strong></span>
              </div>
            )}
          </div>

          <div className="custom-modal-row-3">
            <div className="custom-modal-field">
              <label>
                Bill Tracking ID <span className="req">*</span>
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="e.g. BILL-1007"
                required
              />
            </div>

            <div className="custom-modal-field">
              <label>
                Measurement Book (MB) Ref <span className="req">*</span>
              </label>
              <input
                type="text"
                value={formData.mbNumber}
                onChange={(e) => setFormData({ ...formData, mbNumber: e.target.value })}
                placeholder="e.g. MB-2026/042-C"
                required
              />
            </div>

            <div className="custom-modal-field">
              <label>Work Order Citation No.</label>
              <input
                type="text"
                value={formData.workOrderNo}
                onChange={(e) => setFormData({ ...formData, workOrderNo: e.target.value })}
                placeholder="e.g. WO/BBMP/2026/1842"
              />
            </div>
          </div>

          <div className="custom-modal-field">
            <label>
              Project / Contract Title <span className="req">*</span>
            </label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              placeholder="e.g. Bellandur Tower Desilting & Channel Restoration"
              required
            />
          </div>

          <div className="custom-modal-row-3">
            <div className="custom-modal-field">
              <label>Claimed Gross Bill Amount <span className="req">*</span></label>
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="₹ 38,50,000"
                required
              />
            </div>

            <div className="custom-modal-field">
              <label>Contractor / Agency</label>
              <input
                type="text"
                value={formData.contractor}
                onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                placeholder="Contractor Name"
              />
            </div>

            <div className="custom-modal-field">
              <label>Ward & Zone</label>
              <input
                type="text"
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                placeholder="Ward Name"
              />
            </div>
          </div>

          {/* BoQ Line Items */}
          <div className="boq-editor-section">
            <div className="boq-header">
              <h4>Bill of Quantities (BoQ) Claim Items</h4>
              <button type="button" className="btn-add-item-sm" onClick={addLineItem}>
                + Add Item
              </button>
            </div>

            <div className="boq-table-wrapper">
              <table className="boq-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th style={{ width: "90px" }}>Qty</th>
                    <th style={{ width: "80px" }}>Unit</th>
                    <th style={{ width: "110px" }}>Rate (₹)</th>
                    <th style={{ width: "130px" }}>Total (₹)</th>
                    <th style={{ width: "40px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          value={item.desc}
                          onChange={(e) => handleLineItemChange(idx, "desc", e.target.value)}
                          placeholder="Work specification"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleLineItemChange(idx, "qty", e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleLineItemChange(idx, "unit", e.target.value)}
                          placeholder="cum"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleLineItemChange(idx, "rate", e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.total}
                          onChange={(e) => handleLineItemChange(idx, "total", e.target.value)}
                          placeholder="0"
                          readOnly
                        />
                      </td>
                      <td>
                        {lineItems.length > 1 && (
                          <button
                            type="button"
                            className="btn-del-item"
                            onClick={() => removeLineItem(idx)}
                            title="Remove item"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="custom-modal-field">
            <label>Field Notes / Scope Summary</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of physical site progress, contractor milestones, and site measurements..."
            ></textarea>
          </div>
        </div>

        <div className="custom-modal-footer create-billing-footer">
          <button type="button" className="btn-modal-cancel" onClick={onClose}>
            Cancel
          </button>

          <div className="modal-actions-right">
            <button
              type="button"
              className="btn-save-draft"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              title="Save bill as Draft to review later"
            >
              <span>💾</span>
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              className="primary btn-submit-for-review"
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              title="Submit directly to Review stage"
            >
              <span>🚀</span>
              <span>Submit Billing (To Review Queue)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
