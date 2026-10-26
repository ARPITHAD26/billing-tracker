import React, { useState, useEffect } from "react";

export default function NewBillModal({ onClose, onCreated, fetchWithAuth, currentBillCount = 1 }) {
  const defaultNextId = `BILL-${1000 + currentBillCount + 1}`;

  const [towersList, setTowersList] = useState([]);
  const [workflowsList, setWorkflowsList] = useState([]);
  const [formData, setFormData] = useState({
    id: defaultNextId,
    billNumber: `INV/2026/${Math.floor(100 + Math.random() * 900)}`,
    towerId: "TWR-101",
    workflowId: "WF-01-BBMP-LAKES",
    client: "BBMP",
    unit: "BBMP Lakes North Zone",
    workOrder: `WO/BBMP/2026/${Math.floor(1000 + Math.random() * 9000)}`,
    contract: `CNT-2025-BBMP-LAK-088`,
    billingPeriod: "01 Oct 2026 – 31 Oct 2026",
    billingType: "Monthly Running Account (RA) Bill",
    projectName: "",
    projectType: "BBMP_LAKES",
    amount: "₹ 35,00,000",
    submissionDate: new Date().toISOString().slice(0, 10),
    expectedPaymentDate: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
    contractor: "Sri Sai Infratech Projects",
    ward: "Ward 42, Bellandur",
    mbNumber: `MB-2026/${Math.floor(100 + Math.random() * 900)}`,
    paymentStatus: "UNPAID",
    submitImmediately: true,
    description: "",
    customPhotoUrl: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load Towers & Dynamic Workflows
  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchWithAuth("http://localhost:4000/api/towers").then((r) => r.json()).catch(() => []),
      fetchWithAuth("http://localhost:4000/api/workflows").then((r) => r.json()).catch(() => ({ catalog: [] }))
    ]).then(([towers, wfData]) => {
      if (!mounted) return;
      if (Array.isArray(towers) && towers.length > 0) {
        setTowersList(towers);
      }
      const wfs = Array.isArray(wfData.catalog) ? wfData.catalog : [];
      if (wfs.length > 0) {
        setWorkflowsList(wfs);
        const firstWf = wfs[0];
        setFormData((prev) => ({
          ...prev,
          workflowId: firstWf.id,
          client: firstWf.client,
          unit: firstWf.unit,
          projectName: prev.projectName || `${firstWf.unit} — ${firstWf.serviceType}`,
          billingType: firstWf.category === "MUNICIPAL" ? "Double Bill Route (DC Bill + DCF Fund Allocation)" : prev.billingType
        }));
      }
    });

    return () => {
      mounted = false;
    };
  }, [fetchWithAuth]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    if (name === "workflowId") {
      const matched = workflowsList.find((w) => w.id === value);
      if (matched) {
        setFormData((prev) => ({
          ...prev,
          workflowId: value,
          client: matched.client,
          unit: matched.unit,
          projectType: matched.category === "MUNICIPAL" ? "BBMP_LAKES" : "STANDARD",
          projectName: prev.projectName || `${matched.unit} — ${matched.serviceType}`
        }));
        return;
      }
    }

    if (name === "towerId") {
      const matched = towersList.find((t) => t.id === value);
      setFormData((prev) => ({
        ...prev,
        towerId: value,
        contractor: matched?.contractor || prev.contractor,
        ward: matched?.ward || prev.ward
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const selectedWf = workflowsList.find((w) => w.id === formData.workflowId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectName.trim()) {
      setError("Please enter a valid Project / Work Scope Name.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        // === 15 MANDATORY PROPOSED INFORMATION FIELDS ===
        id: formData.id.trim(), // 1. Bill ID (Unique)
        billNumber: formData.billNumber.trim() || formData.id.trim(), // 2. Bill number
        client: formData.client.trim() || "BBMP", // 3. Client
        unit: formData.unit.trim() || formData.ward.trim() || "Municipal Division", // 4. Unit
        workOrder: formData.workOrder.trim() || `WO/${formData.client}/2026/001`, // 5. Work Order
        contract: formData.contract.trim() || `CNT-2025-${formData.client}-001`, // 6. Contract
        billingPeriod: formData.billingPeriod.trim() || "Current RA Period", // 7. Billing period
        billingType: formData.billingType.trim() || "Monthly Running Account (RA) Bill", // 8. Billing type
        amount: formData.amount.trim() || "₹ 35,00,000", // 9. Bill amount
        submissionDate: formData.submissionDate ? new Date(formData.submissionDate).toISOString() : new Date().toISOString(), // 10. Submission date
        expectedPaymentDate: formData.expectedPaymentDate ? new Date(formData.expectedPaymentDate).toISOString() : new Date(Date.now() + 21 * 86400000).toISOString(), // 11. Expected payment date
        paymentStatus: formData.paymentStatus || "UNPAID", // 15. Payment status

        // Contextual workflow fields
        towerId: formData.towerId,
        workflowId: formData.workflowId,
        projectName: formData.projectName.trim(),
        projectType: formData.projectType,
        contractor: formData.contractor.trim() || "State Public Works Contractor",
        ward: formData.ward.trim() || formData.unit || "Municipal Division",
        mbNumber: formData.mbNumber.trim() || "MB-2026/001",
        submitImmediately: !!formData.submitImmediately,
        description: formData.description.trim() || `Billing initiated under workflow ${formData.workflowId}`
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
      if (!res.ok) {
        throw new Error(data.error || "Failed to create new bill project");
      }

      onCreated(data.bill);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save bill project");
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
        style={{ maxWidth: "720px" }}
      >
        <div className="custom-modal-header">
          <div className="custom-modal-title-group">
            <span className="custom-modal-tag">CONFIGURABLE WORKFLOW ENGINE INITIATION</span>
            <h2>Create New Bill / Project Tracker</h2>
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

          {/* DYNAMIC WORKFLOW ENGINE SELECTION */}
          <div className="custom-modal-field">
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Assigned Digital Workflow Engine Template <span className="req">*</span></span>
              {selectedWf && (
                <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700 }}>
                  ✓ {selectedWf.stages?.length || 0} Stages · Total SLA: {selectedWf.totalSlaDays || 21} Days
                </span>
              )}
            </label>
            <select
              name="workflowId"
              value={formData.workflowId}
              onChange={handleChange}
              required
              style={{ background: "#0f172a", border: "1px solid #3b82f6" }}
            >
              {workflowsList.map((w) => (
                <option key={w.id} value={w.id}>
                  [{w.client}] {w.id} — {w.unit} ({w.stages?.length || 0} Stages)
                </option>
              ))}
            </select>
            <span className="field-hint">
              Selected workflow dynamically drives approval routing, role hierarchy, SLAs, and mandatory documents.
            </span>
          </div>

          {/* Tower Association & Bill Code */}
          <div className="custom-modal-row-2">
            <div className="custom-modal-field">
              <label>
                Associated Monitoring Tower <span className="req">*</span>
              </label>
              <select
                name="towerId"
                value={formData.towerId}
                onChange={handleChange}
                required
              >
                {towersList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code} — {t.name} ({t.ward})
                  </option>
                ))}
              </select>
              <span className="field-hint">Telemetry and site tower association</span>
            </div>

            <div className="custom-modal-field">
              <label>
                1. Bill Identifier Code (Unique Bill ID) <span className="req">*</span>
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder="e.g. BILL-1009"
                required
                style={{ fontFamily: "monospace", fontWeight: 700 }}
              />
              <span className="field-hint">Every bill shall have a unique Bill ID</span>
            </div>
          </div>

          {/* Bill Number & Billing Type */}
          <div className="custom-modal-row-2">
            <div className="custom-modal-field">
              <label>
                2. Bill Number / Docket Reference <span className="req">*</span>
              </label>
              <input
                type="text"
                name="billNumber"
                value={formData.billNumber}
                onChange={handleChange}
                placeholder="e.g. BBMP/LAKES/2026/091"
                required
              />
              <span className="field-hint">Department docket or invoice reference</span>
            </div>

            <div className="custom-modal-field">
              <label>
                8. Billing Type <span className="req">*</span>
              </label>
              <input
                type="text"
                name="billingType"
                value={formData.billingType}
                onChange={handleChange}
                placeholder="e.g. Monthly Running Account (RA) Bill"
                required
              />
              <span className="field-hint">Commercial billing category</span>
            </div>
          </div>

          {/* Work Order & Contract */}
          <div className="custom-modal-row-2">
            <div className="custom-modal-field">
              <label>
                5. Work Order Reference <span className="req">*</span>
              </label>
              <input
                type="text"
                name="workOrder"
                value={formData.workOrder}
                onChange={handleChange}
                placeholder="e.g. WO/BBMP/2026/4102"
                required
              />
              <span className="field-hint">Sanctioned work order code</span>
            </div>

            <div className="custom-modal-field">
              <label>
                6. Contract Agreement # <span className="req">*</span>
              </label>
              <input
                type="text"
                name="contract"
                value={formData.contract}
                onChange={handleChange}
                placeholder="e.g. CNT-2025-BBMP-LAK-088"
                required
              />
              <span className="field-hint">Principal contract reference</span>
            </div>
          </div>

          {/* Billing Period, Submission Date, Expected Payment Date */}
          <div className="custom-modal-row-3">
            <div className="custom-modal-field">
              <label>
                7. Billing Period <span className="req">*</span>
              </label>
              <input
                type="text"
                name="billingPeriod"
                value={formData.billingPeriod}
                onChange={handleChange}
                placeholder="e.g. 01 Oct 2026 – 31 Oct 2026"
                required
              />
            </div>

            <div className="custom-modal-field">
              <label>
                10. Submission Date <span className="req">*</span>
              </label>
              <input
                type="date"
                name="submissionDate"
                value={formData.submissionDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="custom-modal-field">
              <label>
                11. Expected Payment Date <span className="req">*</span>
              </label>
              <input
                type="date"
                name="expectedPaymentDate"
                value={formData.expectedPaymentDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="custom-modal-field">
            <label>
              Project Name / Work Scope Title <span className="req">*</span>
            </label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="e.g. Desilting, structural viaduct inspection, or ward maintenance"
              required
            />
          </div>

          <div className="custom-modal-row-3">
            <div className="custom-modal-field">
              <label>Gross Value / Amount <span className="req">*</span></label>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g. ₹ 48,50,000"
                required
              />
            </div>

            <div className="custom-modal-field">
              <label>Measurement Book # (MB)</label>
              <input
                type="text"
                name="mbNumber"
                value={formData.mbNumber}
                onChange={handleChange}
                placeholder="e.g. MB-2026/042-A"
              />
            </div>

            <div className="custom-modal-field">
              <label>Client Organization</label>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleChange}
                placeholder="e.g. BBMP"
              />
            </div>
          </div>

          <div className="custom-modal-row-2">
            <div className="custom-modal-field">
              <label>Executing Contractor</label>
              <input
                type="text"
                name="contractor"
                value={formData.contractor}
                onChange={handleChange}
                placeholder="e.g. Sri Sai Infratech Projects"
              />
            </div>

            <div className="custom-modal-field">
              <label>Unit / Location / Division</label>
              <input
                type="text"
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                placeholder="e.g. Mahadevapura Ward 42"
              />
            </div>
          </div>

          <div className="custom-modal-field">
            <label>Detailed Work Scope / Description</label>
            <textarea
              name="description"
              rows="2"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe work scope, chainage, contractor milestones, and site objectives..."
            />
          </div>

          {/* Submit immediately toggle */}
          <div style={{ marginTop: "10px", background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", color: "#f8fafc" }}>
              <input
                type="checkbox"
                name="submitImmediately"
                checked={formData.submitImmediately}
                onChange={handleChange}
              />
              <span>
                <strong>Submit Immediately into Departmental Review Queue</strong> (Advances from Docketing to Step 2)
              </span>
            </label>
          </div>

          <div className="custom-modal-footer" style={{ marginTop: "16px" }}>
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
              {submitting ? "Initiating in Workflow Engine…" : "🚀 Create & Instantiate Bill Docket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
