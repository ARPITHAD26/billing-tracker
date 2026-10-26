import React, { useState } from "react";

export default function MasterItemModal({
  type, // "clients" | "units" | "services" | "billing-types" | "roles" | "persons" | "slas" | "documents" | "escalations"
  item = null, // null for create, object for edit
  masters = {},
  fetchWithAuth,
  onClose,
  onSaved
}) {
  const isEditing = Boolean(item && item.id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState(() => {
    if (item) return { ...item };
    switch (type) {
      case "clients":
        return {
          code: "",
          name: "",
          sector: "Municipal",
          departmentContact: "",
          email: "",
          phone: "",
          slaDefault: 2,
          status: "ACTIVE"
        };
      case "units":
        return {
          clientCode: masters.clients?.[0]?.code || "BBMP",
          name: "",
          zone: "",
          location: "",
          contact: "",
          slaCompliance: "95%",
          status: "ACTIVE"
        };
      case "services":
        return {
          code: "",
          name: "",
          category: "Civil Works",
          unit: "Per Cum",
          baseRate: "₹ 1,000",
          description: ""
        };
      case "billing-types":
        return {
          code: "",
          name: "",
          billingFrequency: "Monthly",
          retentionPercent: 5,
          advanceDeductionPercent: 0,
          paymentTermsDays: 30,
          description: "",
          status: "ACTIVE"
        };
      case "bills":
        return {
          id: `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
          billNumber: `INV/2026/${Math.floor(100 + Math.random() * 900)}`,
          client: masters.clients?.[0]?.name || "BBMP",
          unit: masters.units?.[0]?.name || "BBMP Lakes North Zone",
          workOrder: `WO/BBMP/2026/${Math.floor(1000 + Math.random() * 9000)}`,
          contract: `CNT-2025-GEN-${Math.floor(100 + Math.random() * 900)}`,
          billingPeriod: "01 Oct 2026 – 31 Oct 2026",
          billingType: masters.billingTypes?.[0]?.name || "Monthly Running Account (RA) Bill",
          amount: "₹ 35,00,000",
          submissionDate: new Date().toISOString().slice(0, 10),
          expectedPaymentDate: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
          currentStep: 1,
          currentStage: "Tapal Registration",
          currentRole: masters.roles?.[0]?.name || "Assistant Engineer (AE)",
          currentPerson: masters.persons?.[0]?.name || "Assigned Officer",
          workflowStatus: "UNDER_REVIEW",
          status: "UNDER_REVIEW",
          paymentStatus: "UNPAID",
          projectName: "",
          contractor: "State Public Works Contractor",
          mbNumber: `MB-2026/${Math.floor(100 + Math.random() * 900)}`,
          description: ""
        };
      case "roles":
        return {
          code: "",
          name: "",
          level: "Field",
          authority: "",
          slaHours: 24,
          escalationRole: ""
        };
      case "persons":
        return {
          employeeId: `EMP-${Date.now().toString().slice(-4)}`,
          name: "",
          roleCode: masters.roles?.[0]?.code || "AE",
          roleName: masters.roles?.[0]?.name || "Assistant Engineer",
          department: "",
          unitCode: masters.units?.[0]?.id || "UN-001",
          clientCode: masters.clients?.[0]?.code || "BBMP",
          email: "",
          phone: "",
          status: "ACTIVE"
        };
      case "slas":
        return {
          code: "",
          clientCode: masters.clients?.[0]?.code || "BBMP",
          workflowType: "",
          totalSlaDays: 21,
          criticalStageDays: 3,
          warningThresholdPercent: 75,
          breachThresholdPercent: 100,
          escalationPath: "",
          calendarType: "BUSINESS_DAYS",
          status: "ACTIVE"
        };
      case "documents":
        return {
          code: "",
          title: "",
          category: "Statutory Compliance",
          allowedExtensions: ["PDF"],
          maxSizeBytes: 10485760,
          isRequiredDefault: true,
          description: ""
        };
      case "escalations":
        return {
          code: "",
          name: "",
          triggerCondition: "",
          sourceRole: "Current Assignee",
          targetRole: "Supervisor / HOD",
          priority: "HIGH",
          action: "DASHBOARD_ALERT",
          gracePeriodHours: 24,
          description: "",
          status: "ACTIVE"
        };
      default:
        return {};
    }
  });

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = isEditing
        ? `http://localhost:4000/api/masters/${type}/${item.id}`
        : `http://localhost:4000/api/masters/${type}`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save master record.");
      }

      onSaved(data.item || formData);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getTitle = () => {
    const titles = {
      clients: "Client Master",
      units: "Unit / Division Master",
      services: "Service Master",
      "billing-types": "Billing Type Master",
      bills: "5. Bill Master / Transaction",
      roles: "Responsible Role Master",
      persons: "Responsible Person Master",
      slas: "SLA Policy Master",
      documents: "Mandatory Document Master",
      escalations: "Escalation Rule Master"
    };
    const entity = titles[type] || "Master Record";
    return isEditing ? `Edit ${entity}` : `Add New ${entity}`;
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1250 }}>
      <div
        className="modal-card master-item-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "680px", width: "92vw", maxHeight: "88vh", overflowY: "auto" }}
      >
        <div className="modal-header">
          <div>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <span className="badge-admin-tag">PHASE I MASTER MANAGEMENT</span>
              <span className="badge-rule-tag">{type.toUpperCase()}</span>
            </div>
            <h3 style={{ margin: "4px 0 0", color: "#f8fafc", fontSize: "1.2rem", fontWeight: 800 }}>
              {getTitle()}
            </h3>
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        {error && (
          <div style={{ margin: "14px 20px 0", padding: "10px 14px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", color: "#fca5a5", fontSize: "13px" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            
            {/* CLIENTS */}
            {type === "clients" && (
              <>
                <div>
                  <label className="field-label">Client Code (Short)</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.code}
                    onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                    placeholder="e.g. BBMP, BMRCL, KIADB"
                  />
                </div>
                <div>
                  <label className="field-label">Client Full Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Bruhat Bengaluru Mahanagara Palike"
                  />
                </div>
                <div>
                  <label className="field-label">Sector</label>
                  <select
                    className="input-field"
                    value={formData.sector}
                    onChange={(e) => handleChange("sector", e.target.value)}
                  >
                    <option value="Municipal">Municipal</option>
                    <option value="Metro Transit">Metro Transit</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Industrial">Industrial</option>
                    <option value="State Enterprise">State Enterprise</option>
                    <option value="Energy & Utility">Energy & Utility</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Default Stage SLA (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="input-field"
                    value={formData.slaDefault}
                    onChange={(e) => handleChange("slaDefault", parseInt(e.target.value, 10) || 2)}
                  />
                </div>
                <div>
                  <label className="field-label">Department / Contact Officer</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.departmentContact}
                    onChange={(e) => handleChange("departmentContact", e.target.value)}
                    placeholder="e.g. Chief Engineer (Lakes)"
                  />
                </div>
                <div>
                  <label className="field-label">Official Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="official@client.gov.in"
                  />
                </div>
              </>
            )}

            {/* UNITS */}
            {type === "units" && (
              <>
                <div>
                  <label className="field-label">Parent Client</label>
                  <select
                    className="input-field"
                    value={formData.clientCode}
                    onChange={(e) => handleChange("clientCode", e.target.value)}
                  >
                    {(masters.clients || []).map((c) => (
                      <option key={c.id} value={c.code}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Unit / Division Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. BBMP Lakes North Zone"
                  />
                </div>
                <div>
                  <label className="field-label">Zone / Corridor</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.zone}
                    onChange={(e) => handleChange("zone", e.target.value)}
                    placeholder="e.g. Mahadevapura / South Zone"
                  />
                </div>
                <div>
                  <label className="field-label">Location / Sub-division</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="e.g. Bellandur Lake Basin"
                  />
                </div>
                <div>
                  <label className="field-label">Contact Officer</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.contact}
                    onChange={(e) => handleChange("contact", e.target.value)}
                    placeholder="e.g. S. Natarajan"
                  />
                </div>
                <div>
                  <label className="field-label">SLA Compliance Target</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.slaCompliance}
                    onChange={(e) => handleChange("slaCompliance", e.target.value)}
                    placeholder="e.g. 92%"
                  />
                </div>
              </>
            )}

            {/* SERVICES */}
            {type === "services" && (
              <>
                <div>
                  <label className="field-label">Service Code</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.code}
                    onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                    placeholder="e.g. CIVIL-DESILTING"
                  />
                </div>
                <div>
                  <label className="field-label">Service Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Lake Desilting & Bund Restoration"
                  />
                </div>
                <div>
                  <label className="field-label">Category</label>
                  <select
                    className="input-field"
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                  >
                    <option value="Civil Works">Civil Works</option>
                    <option value="Road Works">Road Works</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Metro Transit">Metro Transit</option>
                    <option value="Housekeeping">Housekeeping & Sanitation</option>
                    <option value="Security">Security Services</option>
                    <option value="Manpower">Manpower & Technical Staff</option>
                    <option value="Horticulture">Horticulture</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Unit of Measurement (UoM)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.unit}
                    onChange={(e) => handleChange("unit", e.target.value)}
                    placeholder="e.g. Per Cum, Per Sqm, Lumpsum"
                  />
                </div>
                <div>
                  <label className="field-label">Base Unit Rate</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.baseRate}
                    onChange={(e) => handleChange("baseRate", e.target.value)}
                    placeholder="e.g. ₹ 450"
                  />
                </div>
                <div>
                  <label className="field-label">Description / Scope</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Scope of work details..."
                  />
                </div>
              </>
            )}

            {/* BILLING TYPES */}
            {type === "billing-types" && (
              <>
                <div>
                  <label className="field-label">Billing Type Code</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.code}
                    onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                    placeholder="e.g. MONTHLY-RA, SPLIT-80-20"
                  />
                </div>
                <div>
                  <label className="field-label">Billing Type Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Monthly Running Account (RA) Bill"
                  />
                </div>
                <div>
                  <label className="field-label">Frequency</label>
                  <select
                    className="input-field"
                    value={formData.billingFrequency}
                    onChange={(e) => handleChange("billingFrequency", e.target.value)}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Milestone-based">Milestone-based</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="One-time">One-time / Final</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Statutory Retention (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    className="input-field"
                    value={formData.retentionPercent}
                    onChange={(e) => handleChange("retentionPercent", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="field-label">Payment Terms (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    className="input-field"
                    value={formData.paymentTermsDays}
                    onChange={(e) => handleChange("paymentTermsDays", parseInt(e.target.value, 10) || 30)}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="field-label">Description / Legal SOP Reference</label>
                  <textarea
                    rows="2"
                    className="input-field"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Governance rules, statutory checks, and retention clauses..."
                  />
                </div>
              </>
            )}

            {/* 5. BILL MASTER / TRANSACTION (15 MANDATORY FIELDS) */}
            {type === "bills" && (
              <>
                <div style={{ gridColumn: "1 / -1", background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.25)", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>📑</span>
                  <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                    <strong style={{ color: "var(--accent-primary)" }}>5. Bill Master / Transaction Rule:</strong> Every bill shall have a unique Bill ID. All 15 statutory criteria are enforced below.
                  </div>
                </div>

                {/* 1. BILL ID (UNIQUE) */}
                <div>
                  <label className="field-label">
                    1. Bill ID (Unique) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    className="input-field"
                    value={formData.id || ""}
                    onChange={(e) => handleChange("id", e.target.value.toUpperCase())}
                    placeholder="e.g. BILL-1009"
                    style={{ fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.04em" }}
                  />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px", display: "block" }}>
                    Every bill shall have a unique Bill ID. Cannot be modified after creation.
                  </span>
                </div>

                {/* 2. BILL NUMBER */}
                <div>
                  <label className="field-label">
                    2. Bill Number / Docket # <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.billNumber || ""}
                    onChange={(e) => handleChange("billNumber", e.target.value)}
                    placeholder="e.g. BBMP/LAKES/2026/091"
                  />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px", display: "block" }}>
                    Official department docket or tax invoice reference
                  </span>
                </div>

                {/* 3. CLIENT */}
                <div>
                  <label className="field-label">
                    3. Client Entity <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  {masters.clients && masters.clients.length > 0 ? (
                    <select
                      className="input-field"
                      value={formData.client || ""}
                      onChange={(e) => handleChange("client", e.target.value)}
                      required
                    >
                      <option value="">Select Client...</option>
                      {masters.clients.map((c) => (
                        <option key={c.id || c.code} value={c.code || c.name}>
                          {c.code} — {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={formData.client || ""}
                      onChange={(e) => handleChange("client", e.target.value)}
                      placeholder="e.g. BBMP, BMRCL, KIADB"
                    />
                  )}
                </div>

                {/* 4. UNIT */}
                <div>
                  <label className="field-label">
                    4. Unit / Division <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  {masters.units && masters.units.length > 0 ? (
                    <select
                      className="input-field"
                      value={formData.unit || ""}
                      onChange={(e) => handleChange("unit", e.target.value)}
                      required
                    >
                      <option value="">Select Unit / Division...</option>
                      {masters.units.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} ({u.clientCode || "Govt"})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={formData.unit || ""}
                      onChange={(e) => handleChange("unit", e.target.value)}
                      placeholder="e.g. BBMP Lakes North Zone"
                    />
                  )}
                </div>

                {/* 5. WORK ORDER */}
                <div>
                  <label className="field-label">
                    5. Work Order Reference <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.workOrder || ""}
                    onChange={(e) => handleChange("workOrder", e.target.value)}
                    placeholder="e.g. WO/BBMP/2026/4102"
                  />
                </div>

                {/* 6. CONTRACT */}
                <div>
                  <label className="field-label">
                    6. Contract Agreement # <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.contract || ""}
                    onChange={(e) => handleChange("contract", e.target.value)}
                    placeholder="e.g. CNT-2025-BBMP-LAK-088"
                  />
                </div>

                {/* 7. BILLING PERIOD */}
                <div>
                  <label className="field-label">
                    7. Billing Period <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.billingPeriod || ""}
                    onChange={(e) => handleChange("billingPeriod", e.target.value)}
                    placeholder="e.g. 01 Oct 2026 – 31 Oct 2026"
                  />
                </div>

                {/* 8. BILLING TYPE */}
                <div>
                  <label className="field-label">
                    8. Billing Type <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  {masters.billingTypes && masters.billingTypes.length > 0 ? (
                    <select
                      className="input-field"
                      value={formData.billingType || ""}
                      onChange={(e) => handleChange("billingType", e.target.value)}
                      required
                    >
                      <option value="">Select Billing Type...</option>
                      {masters.billingTypes.map((bt) => (
                        <option key={bt.id} value={bt.name}>
                          {bt.name} ({bt.billingFrequency})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={formData.billingType || ""}
                      onChange={(e) => handleChange("billingType", e.target.value)}
                      placeholder="e.g. Monthly Running Account (RA) Bill"
                    />
                  )}
                </div>

                {/* 9. BILL AMOUNT */}
                <div>
                  <label className="field-label">
                    9. Bill Amount (Gross INR) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.amount || ""}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    placeholder="e.g. ₹ 48,75,000"
                    style={{ fontWeight: 700 }}
                  />
                </div>

                {/* 10. SUBMISSION DATE */}
                <div>
                  <label className="field-label">
                    10. Submission Date <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={formData.submissionDate ? formData.submissionDate.slice(0, 10) : ""}
                    onChange={(e) => handleChange("submissionDate", e.target.value)}
                  />
                </div>

                {/* 11. EXPECTED PAYMENT DATE */}
                <div>
                  <label className="field-label">
                    11. Expected Payment Date <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={formData.expectedPaymentDate ? formData.expectedPaymentDate.slice(0, 10) : ""}
                    onChange={(e) => handleChange("expectedPaymentDate", e.target.value)}
                  />
                </div>

                {/* 12. CURRENT STAGE */}
                <div>
                  <label className="field-label">
                    12. Current Stage <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  {masters.canonicalStages && masters.canonicalStages.length > 0 ? (
                    <select
                      className="input-field"
                      value={formData.currentStage || ""}
                      onChange={(e) => handleChange("currentStage", e.target.value)}
                      required
                    >
                      <option value="">Select Canonical Stage...</option>
                      {masters.canonicalStages.map((st) => (
                        <option key={st.id} value={st.name}>
                          Stage {st.id}: {st.name} ({st.defaultRole})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={formData.currentStage || ""}
                      onChange={(e) => handleChange("currentStage", e.target.value)}
                      placeholder="e.g. Attendance & Labour Certification"
                    />
                  )}
                </div>

                {/* 13A. CURRENT RESPONSIBLE PERSON */}
                <div>
                  <label className="field-label">
                    13a. Current Responsible Person <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  {masters.persons && masters.persons.length > 0 ? (
                    <select
                      className="input-field"
                      value={formData.currentPerson || ""}
                      onChange={(e) => {
                        const selPerson = masters.persons.find((p) => p.name === e.target.value);
                        handleChange("currentPerson", e.target.value);
                        if (selPerson && selPerson.roleName) {
                          handleChange("currentRole", selPerson.roleName);
                        }
                      }}
                      required
                    >
                      <option value="">Select Responsible Officer...</option>
                      {masters.persons.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} ({p.roleName || p.department})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={formData.currentPerson || ""}
                      onChange={(e) => handleChange("currentPerson", e.target.value)}
                      placeholder="e.g. S. Natarajan (Labour Officer)"
                    />
                  )}
                </div>

                {/* 13B. CURRENT RESPONSIBLE ROLE */}
                <div>
                  <label className="field-label">
                    13b. Current Responsible Role <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  {masters.roles && masters.roles.length > 0 ? (
                    <select
                      className="input-field"
                      value={formData.currentRole || ""}
                      onChange={(e) => handleChange("currentRole", e.target.value)}
                      required
                    >
                      <option value="">Select Designated Role...</option>
                      {masters.roles.map((r) => (
                        <option key={r.id || r.code} value={r.name}>
                          [{r.code}] {r.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={formData.currentRole || ""}
                      onChange={(e) => handleChange("currentRole", e.target.value)}
                      placeholder="e.g. Vigilance & Labour Cell"
                    />
                  )}
                </div>

                {/* 14. STATUS */}
                <div>
                  <label className="field-label">
                    14. Status (Workflow Governance) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    className="input-field"
                    value={formData.workflowStatus || formData.status || "UNDER_REVIEW"}
                    onChange={(e) => {
                      handleChange("workflowStatus", e.target.value);
                      handleChange("status", e.target.value);
                    }}
                    required
                  >
                    <option value="UNDER_REVIEW">🟡 UNDER_REVIEW — In Scrutiny</option>
                    <option value="APPROVED">🔵 APPROVED — Sanctioned</option>
                    <option value="REJECTED_EDIT">🔴 REJECTED_EDIT — Returned for Revision</option>
                    <option value="PAID">🟢 PAID — Disbursed & Cleared</option>
                    <option value="CLOSED">⚪ CLOSED — Completed</option>
                  </select>
                </div>

                {/* 15. PAYMENT STATUS */}
                <div>
                  <label className="field-label">
                    15. Payment Status <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    className="input-field"
                    value={formData.paymentStatus || "UNPAID"}
                    onChange={(e) => handleChange("paymentStatus", e.target.value)}
                    required
                  >
                    <option value="UNPAID">⚠️ UNPAID — Pre-payment Clearance</option>
                    <option value="PROCESSING">⏳ PROCESSING — In Treasury Queue</option>
                    <option value="PAID">✅ PAID — Settlement Realized</option>
                    <option value="OVERDUE">🚨 OVERDUE — Exceeded Expected Date</option>
                  </select>
                </div>

                {/* CONTEXTUAL WORK DETAILS */}
                <div style={{ gridColumn: "1 / -1", borderTop: "1px dashed var(--border-light)", paddingTop: "12px", marginTop: "4px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
                    Associated Work & Measurement Details
                  </div>
                </div>

                <div>
                  <label className="field-label">Project / Work Scope Title</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.projectName || ""}
                    onChange={(e) => handleChange("projectName", e.target.value)}
                    placeholder="e.g. Bellandur Lake Desilting & Masonry Silt Weir"
                  />
                </div>

                <div>
                  <label className="field-label">Executing Contractor</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.contractor || ""}
                    onChange={(e) => handleChange("contractor", e.target.value)}
                    placeholder="e.g. Sri Sai Infratech Projects"
                  />
                </div>

                <div>
                  <label className="field-label">Measurement Book # (MB)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.mbNumber || ""}
                    onChange={(e) => handleChange("mbNumber", e.target.value)}
                    placeholder="e.g. MB-2026/042-A"
                  />
                </div>

                <div>
                  <label className="field-label">Description / Scope Summary</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="e.g. Desilting, bund strengthening and masonry weir restoration"
                  />
                </div>
              </>
            )}

            {/* ROLES */}
            {type === "roles" && (
              <>
                <div>
                  <label className="field-label">Role Code / Acronym</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.code}
                    onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                    placeholder="e.g. AE, AEE, EE, JC"
                  />
                </div>
                <div>
                  <label className="field-label">Official Designation</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Assistant Executive Engineer"
                  />
                </div>
                <div>
                  <label className="field-label">Approval Tier / Level</label>
                  <select
                    className="input-field"
                    value={formData.level}
                    onChange={(e) => handleChange("level", e.target.value)}
                  >
                    <option value="Field">Field</option>
                    <option value="Departmental">Departmental / Sub-Division</option>
                    <option value="Circle">Circle Directorate</option>
                    <option value="Finance">Finance & Audit</option>
                    <option value="Compliance">Labour & Compliance</option>
                    <option value="Executive">Executive Council</option>
                    <option value="Treasury">Disbursements & Treasury</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Stage Turnaround SLA (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    className="input-field"
                    value={formData.slaHours}
                    onChange={(e) => handleChange("slaHours", parseInt(e.target.value, 10) || 24)}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="field-label">Statutory Authority & Scrutiny Scope</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.authority}
                    onChange={(e) => handleChange("authority", e.target.value)}
                    placeholder="e.g. 25% Statutory Check-Measurement under KPWD Code"
                  />
                </div>
                <div>
                  <label className="field-label">Default Escalation Role</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.escalationRole}
                    onChange={(e) => handleChange("escalationRole", e.target.value)}
                    placeholder="e.g. Executive Engineer"
                  />
                </div>
              </>
            )}

            {/* PERSONS */}
            {type === "persons" && (
              <>
                <div>
                  <label className="field-label">Employee ID</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.employeeId}
                    onChange={(e) => handleChange("employeeId", e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Officer / Person Full Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Dr. Priya Sharma"
                  />
                </div>
                <div>
                  <label className="field-label">Assigned Role</label>
                  <select
                    className="input-field"
                    value={formData.roleCode}
                    onChange={(e) => {
                      const rCode = e.target.value;
                      const matched = (masters.roles || []).find((r) => r.code === rCode);
                      handleChange("roleCode", rCode);
                      handleChange("roleName", matched?.name || rCode);
                    }}
                  >
                    {(masters.roles || []).map((r) => (
                      <option key={r.id} value={r.code}>[{r.code}] {r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Department / Wing</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    placeholder="e.g. Field Engineering Sub-Division"
                  />
                </div>
                <div>
                  <label className="field-label">Official Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="officer@domain.gov.in"
                  />
                </div>
                <div>
                  <label className="field-label">Contact Phone</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+91 98450 00000"
                  />
                </div>
              </>
            )}

            {/* SLA MASTER */}
            {type === "slas" && (
              <>
                <div>
                  <label className="field-label">SLA Rule Code</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.code}
                    onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                    placeholder="e.g. SLA-BBMP-CIVIL"
                  />
                </div>
                <div>
                  <label className="field-label">Client Code</label>
                  <select
                    className="input-field"
                    value={formData.clientCode}
                    onChange={(e) => handleChange("clientCode", e.target.value)}
                  >
                    {(masters.clients || []).map((c) => (
                      <option key={c.id} value={c.code}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Workflow Type</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.workflowType}
                    onChange={(e) => handleChange("workflowType", e.target.value)}
                    placeholder="e.g. Civil Works & Double Bill"
                  />
                </div>
                <div>
                  <label className="field-label">Total SLA Limit (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    className="input-field"
                    value={formData.totalSlaDays}
                    onChange={(e) => handleChange("totalSlaDays", parseInt(e.target.value, 10) || 21)}
                  />
                </div>
                <div>
                  <label className="field-label">Critical Stage Cap (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="input-field"
                    value={formData.criticalStageDays}
                    onChange={(e) => handleChange("criticalStageDays", parseInt(e.target.value, 10) || 3)}
                  />
                </div>
                <div>
                  <label className="field-label">Escalation Path</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.escalationPath}
                    onChange={(e) => handleChange("escalationPath", e.target.value)}
                    placeholder="e.g. EE → JC → Commissioner"
                  />
                </div>
              </>
            )}

            {/* MANDATORY DOCUMENTS */}
            {type === "documents" && (
              <>
                <div>
                  <label className="field-label">Document Code</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.code}
                    onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                    placeholder="e.g. TAX-INVOICE, MB-BOOK"
                  />
                </div>
                <div>
                  <label className="field-label">Document Title</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="e.g. Measurement Book (MB) Entry"
                  />
                </div>
                <div>
                  <label className="field-label">Category</label>
                  <select
                    className="input-field"
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                  >
                    <option value="Statutory Compliance">Statutory Compliance</option>
                    <option value="Technical & Measurement">Technical & Measurement</option>
                    <option value="Administrative Sanction">Administrative Sanction</option>
                    <option value="Financial & Tax">Financial & Tax</option>
                    <option value="Healthcare Technical">Healthcare Technical</option>
                    <option value="Banking & Payment">Banking & Payment</option>
                    <option value="Pre-Audit & Accounts">Pre-Audit & Accounts</option>
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="field-label">Verification Guidelines & Legal Requirements</label>
                  <textarea
                    rows="2"
                    className="input-field"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Mandatory seals, signatures, and checklist verification points..."
                  />
                </div>
              </>
            )}

            {/* ESCALATIONS */}
            {type === "escalations" && (
              <>
                <div>
                  <label className="field-label">Escalation Rule Code</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.code}
                    onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                    placeholder="e.g. ESC-75-WARN"
                  />
                </div>
                <div>
                  <label className="field-label">Rule Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. SLA Warning at 75% Dwell Limit"
                  />
                </div>
                <div>
                  <label className="field-label">Trigger Condition</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.triggerCondition}
                    onChange={(e) => handleChange("triggerCondition", e.target.value)}
                    placeholder="e.g. 75% of stage turnaround SLA elapsed"
                  />
                </div>
                <div>
                  <label className="field-label">Automated Action</label>
                  <select
                    className="input-field"
                    value={formData.action}
                    onChange={(e) => handleChange("action", e.target.value)}
                  >
                    <option value="DASHBOARD_ALERT">Dashboard Amber Warning & Alert</option>
                    <option value="AUTO_REASSIGN_HOD">Automatic Escalation to HOD / Director</option>
                    <option value="MANAGEMENT_ESCALATION">Critical Executive Council Alert</option>
                    <option value="EMAIL_DISPATCH">Automated Email Notification</option>
                    <option value="BLOCK_TRANSITION">Block Stage Forwarding</option>
                    <option value="SPLIT_DOCKET">Split Parallel Docket</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Priority</label>
                  <select
                    className="input-field"
                    value={formData.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Grace Period (Hours)</label>
                  <input
                    type="number"
                    min="0"
                    max="72"
                    className="input-field"
                    value={formData.gracePeriodHours}
                    onChange={(e) => handleChange("gracePeriodHours", parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              </>
            )}

          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              type="submit"
              className="primary"
              disabled={saving}
              style={{ padding: "8px 22px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", fontWeight: 700 }}
            >
              {saving ? "Saving…" : isEditing ? "Save Changes" : "Create Master Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
