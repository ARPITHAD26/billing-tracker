import React, { useState, useEffect } from "react";

const CANONICAL_OPTIONS = [
  "Docketing & Registry (Inward / Tapal)",
  "First-Line Administrative Scrutiny",
  "Field / Operational Certification",
  "Middle-Tier Administrative / Technical Sanction",
  "Financial & Accounts Scrutiny",
  "Statutory Pre-Audit & Executive Concurrence",
  "Disbursement & Payment Closure"
];

const ACTION_TYPES = [
  { id: "RECEIPT", label: "Docketing / Inward Receipt" },
  { id: "SCRUTINY", label: "Administrative Scrutiny" },
  { id: "CERTIFICATION", label: "Field / Technical Certification" },
  { id: "SANCTION", label: "Technical & Executive Sanction" },
  { id: "AUDIT", label: "Accounts & Pre-Audit" },
  { id: "APPROVAL", label: "Executive Approval" },
  { id: "PAYMENT", label: "Disbursement & Bank Release" }
];

export default function WorkflowEditorModal({
  workflow = null, // null for create, object for edit
  masters = {},
  user,
  fetchWithAuth,
  onClose,
  onSaved
}) {
  const isEditing = Boolean(workflow && workflow.id);

  // Clients, Units, Services, Billing Types, Roles, Persons, Documents, Escalations from masters
  const clients = masters.clients || [];
  const units = masters.units || [];
  const services = masters.services || [];
  const billingTypes = masters.billingTypes || [];
  const roles = masters.roles || [];
  const persons = masters.persons || [];
  const documents = masters.documents || [];
  const escalations = masters.escalations || [];

  const [formData, setFormData] = useState({
    id: workflow?.id || `WF-${Date.now().toString().slice(-4)}`,
    client: workflow?.client || clients[0]?.name || "BBMP",
    unit: workflow?.unit || units[0]?.name || "BBMP Lakes North Zone",
    category: workflow?.category || "MUNICIPAL",
    serviceType: workflow?.serviceType || services[0]?.name || "Lake Desilting & Bund Restoration",
    billingType: workflow?.billingType || billingTypes[0]?.name || "Monthly Running Account (RA) Bill",
    billingCycle: workflow?.billingCycle || "Monthly",
    isPilot: Boolean(workflow?.isPilot),
    pilotRationale: workflow?.pilotRationale || "",
    description: workflow?.description || ""
  });

  const [stages, setStages] = useState(() => {
    if (workflow && Array.isArray(workflow.stages) && workflow.stages.length > 0) {
      return workflow.stages.map((s, idx) => ({
        step: idx + 1,
        name: s.name || `Stage ${idx + 1}`,
        role: s.role || "Assistant Engineer (AE)",
        roleCode: s.roleCode || "AE",
        personName: s.personName || "",
        dept: s.dept || "Engineering Directorate",
        slaDays: s.slaDays || 2,
        mandatoryDocs: Array.isArray(s.mandatoryDocs) ? [...s.mandatoryDocs] : ["Tax Invoice", "Work Order Copy"],
        escalationRole: s.escalationRole || "Executive Engineer",
        escalationRuleId: s.escalationRuleId || "ESC-001",
        actionType: s.actionType || "SCRUTINY",
        canonicalStage: s.canonicalStage || CANONICAL_OPTIONS[Math.min(idx, CANONICAL_OPTIONS.length - 1)]
      }));
    }
    // Default initial 5-stage workflow for new creation
    return [
      {
        step: 1,
        name: "Tapal Registration & Inward Docketing",
        role: "Tapal Clerk",
        roleCode: "TAPAL",
        personName: "M. Ramesh",
        dept: "Inward Registry",
        slaDays: 1,
        mandatoryDocs: ["Tax Invoice & Covering Letter", "Work Order Sanction Copy"],
        escalationRole: "AEE",
        escalationRuleId: "ESC-001",
        actionType: "RECEIPT",
        canonicalStage: CANONICAL_OPTIONS[0]
      },
      {
        step: 2,
        name: "Case Worker Verification & Muster Check",
        role: "Case Worker",
        roleCode: "CASEWORKER",
        personName: "Deepa Hegde",
        dept: "Administration",
        slaDays: 2,
        mandatoryDocs: ["Form V Biometric Muster Roll & Attendance", "EPF & ESI Challan with Electronic Challan Return (ECR)"],
        escalationRole: "Accounts Superintendent",
        escalationRuleId: "ESC-001",
        actionType: "SCRUTINY",
        canonicalStage: CANONICAL_OPTIONS[1]
      },
      {
        step: 3,
        name: "Field Inspection & Measurement Book Recording",
        role: "Assistant Engineer (AE)",
        roleCode: "AE",
        personName: "K. Venkatesh",
        dept: "Field Engineering",
        slaDays: 2,
        mandatoryDocs: ["Measurement Book (MB) Entry", "Geo-tagged Site Inspection Photos"],
        escalationRole: "AEE",
        escalationRuleId: "ESC-002",
        actionType: "CERTIFICATION",
        canonicalStage: CANONICAL_OPTIONS[2]
      },
      {
        step: 4,
        name: "Executive Scrutiny & Sanction",
        role: "Executive Engineer (EE)",
        roleCode: "EE",
        personName: "Rajesh Kumar",
        dept: "Divisional Directorate",
        slaDays: 3,
        mandatoryDocs: ["25% Check-Measurement Note (KPWD Code)", "Technical Sanction & Rate Concordance Sheet"],
        escalationRole: "Joint Commissioner",
        escalationRuleId: "ESC-002",
        actionType: "APPROVAL",
        canonicalStage: CANONICAL_OPTIONS[3]
      },
      {
        step: 5,
        name: "Disbursement & RTGS Remittance",
        role: "Cash Section & Treasury",
        roleCode: "CASHIER",
        personName: "Anil Mehta",
        dept: "Disbursements",
        slaDays: 1,
        mandatoryDocs: ["RTGS / Bank Remittance Advice"],
        escalationRole: "DCF",
        escalationRuleId: "ESC-001",
        actionType: "PAYMENT",
        canonicalStage: CANONICAL_OPTIONS[6]
      }
    ];
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedStageIdx, setSelectedStageIdx] = useState(0);

  const totalSlaDays = stages.reduce((acc, s) => acc + (Number(s.slaDays) || 0), 0);

  const handleStageChange = (idx, field, value) => {
    setStages((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      if (field === "role") {
        const matched = roles.find((r) => r.name === value || r.code === value);
        if (matched) {
          copy[idx].roleCode = matched.code;
          copy[idx].escalationRole = matched.escalationRole || copy[idx].escalationRole;
        }
      }
      return copy;
    });
  };

  const handleToggleDoc = (stageIdx, docTitle) => {
    setStages((prev) => {
      const copy = [...prev];
      const cur = copy[stageIdx].mandatoryDocs || [];
      if (cur.includes(docTitle)) {
        copy[stageIdx].mandatoryDocs = cur.filter((d) => d !== docTitle);
      } else {
        copy[stageIdx].mandatoryDocs = [...cur, docTitle];
      }
      return copy;
    });
  };

  const addStage = (afterIdx = stages.length - 1) => {
    const newStepNum = afterIdx + 2;
    const newStage = {
      step: newStepNum,
      name: `Custom Stage ${stages.length + 1}`,
      role: roles[0]?.name || "Assistant Engineer",
      roleCode: roles[0]?.code || "AE",
      personName: "",
      dept: "Department Directorate",
      slaDays: 2,
      mandatoryDocs: ["Tax Invoice & Covering Letter"],
      escalationRole: "Executive Engineer",
      escalationRuleId: "ESC-001",
      actionType: "SCRUTINY",
      canonicalStage: CANONICAL_OPTIONS[1]
    };
    const nextStages = [...stages];
    nextStages.splice(afterIdx + 1, 0, newStage);
    const renumbered = nextStages.map((s, i) => ({ ...s, step: i + 1 }));
    setStages(renumbered);
    setSelectedStageIdx(afterIdx + 1);
  };

  const removeStage = (idx) => {
    if (stages.length <= 1) {
      setError("A workflow must have at least one stage.");
      return;
    }
    const nextStages = stages.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step: i + 1 }));
    setStages(nextStages);
    setSelectedStageIdx(Math.max(0, idx - 1));
  };

  const moveStage = (idx, dir) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= stages.length) return;
    const nextStages = [...stages];
    const temp = nextStages[idx];
    nextStages[idx] = nextStages[targetIdx];
    nextStages[targetIdx] = temp;
    const renumbered = nextStages.map((s, i) => ({ ...s, step: i + 1 }));
    setStages(renumbered);
    setSelectedStageIdx(targetIdx);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.client || !formData.unit) {
      setError("Please specify Client and Unit.");
      return;
    }
    if (stages.length === 0) {
      setError("Please define at least one workflow stage.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      ...formData,
      stages
    };

    try {
      const url = isEditing
        ? `http://localhost:4000/api/workflows/${workflow.id}`
        : "http://localhost:4000/api/workflows";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save workflow.");
      }

      onSaved(data.workflow || payload);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentStage = stages[selectedStageIdx] || stages[0];

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-card workflow-editor-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "1160px", width: "95vw", maxHeight: "92vh", display: "flex", flexDirection: "column" }}
      >
        {/* MODAL HEADER */}
        <div className="modal-header" style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px" }}>⚙️</span>
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span className="badge-admin-tag">ADMINISTRATOR WORKFLOW ENGINE</span>
                <span className="badge-rule-tag">{isEditing ? "EDIT MODE" : "CREATION WIZARD"}</span>
              </div>
              <h3 style={{ margin: "4px 0 0", color: "#f8fafc", fontSize: "1.25rem", fontWeight: 800 }}>
                {isEditing ? `Modify Workflow: ${workflow.unit || workflow.id}` : "Configure New Digital Billing Workflow"}
              </h3>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        {error && (
          <div style={{ margin: "14px 24px 0", padding: "10px 14px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", color: "#fca5a5", fontSize: "13px" }}>
            ⚠️ {error}
          </div>
        )}

        {/* BODY (SCROLLABLE) */}
        <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* SECTION 1: WORKFLOW IDENTITY & CLASSIFICATION */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px 20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#93c5fd", marginBottom: "12px" }}>
              1. Master Linkages & Workflow Metadata
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
              <div>
                <label className="field-label">Workflow ID / Code</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.id}
                  disabled={isEditing}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                  placeholder="e.g. WF-35-BBMP-LAKES"
                  style={{ fontFamily: "monospace" }}
                />
              </div>

              <div>
                <label className="field-label">Client (From Client Master)</label>
                <select
                  className="input-field"
                  value={formData.client}
                  onChange={(e) => {
                    const cName = e.target.value;
                    const matched = clients.find((c) => c.name === cName || c.code === cName);
                    setFormData({
                      ...formData,
                      client: cName,
                      category: matched?.sector === "Municipal" ? "MUNICIPAL" : (matched?.sector === "Metro Transit" ? "TRANSIT" : (matched?.sector === "Healthcare" ? "HEALTHCARE" : "ENTERPRISE"))
                    });
                  }}
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.name}>{c.code} — {c.name}</option>
                  ))}
                  {!clients.some((c) => c.name === formData.client) && (
                    <option value={formData.client}>{formData.client}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="field-label">Unit / Division (From Unit Master)</label>
                <select
                  className="input-field"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.name}>[{u.clientCode}] {u.name}</option>
                  ))}
                  {!units.some((u) => u.name === formData.unit) && (
                    <option value={formData.unit}>{formData.unit}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="field-label">Service Type (From Service Master)</label>
                <select
                  className="input-field"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.name}>[{s.category}] {s.name}</option>
                  ))}
                  {!services.some((s) => s.name === formData.serviceType) && (
                    <option value={formData.serviceType}>{formData.serviceType}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="field-label">Billing Type (From Billing Type Master)</label>
                <select
                  className="input-field"
                  value={formData.billingType}
                  onChange={(e) => setFormData({ ...formData, billingType: e.target.value })}
                >
                  {billingTypes.map((bt) => (
                    <option key={bt.id} value={bt.name}>{bt.name} ({bt.billingFrequency})</option>
                  ))}
                  {!billingTypes.some((bt) => bt.name === formData.billingType) && (
                    <option value={formData.billingType}>{formData.billingType}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="field-label">Sector Category</label>
                <select
                  className="input-field"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="MUNICIPAL">🏛️ Civic & Municipal (BBMP / BDA)</option>
                  <option value="TRANSIT">🚆 Metro & Transit (BMRCL)</option>
                  <option value="HEALTHCARE">🏥 Healthcare & Medical Institutes</option>
                  <option value="INDUSTRIAL">🏭 Industrial Infrastructure (KIADB)</option>
                  <option value="ENTERPRISE">⚡ State Enterprises & Research</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "12px", display: "flex", gap: "16px", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#e2e8f0" }}>
                <input
                  type="checkbox"
                  checked={formData.isPilot}
                  onChange={(e) => setFormData({ ...formData, isPilot: e.target.checked })}
                />
                <span style={{ fontWeight: 700, color: formData.isPilot ? "#34d399" : "#94a3b8" }}>
                  🎯 Designate as Executive Pilot Unit (Phase I Testing Priority)
                </span>
              </label>

              {formData.isPilot && (
                <input
                  type="text"
                  className="input-field"
                  style={{ flex: 1, padding: "6px 10px", fontSize: "12px" }}
                  placeholder="Pilot rationale / testing mandate..."
                  value={formData.pilotRationale}
                  onChange={(e) => setFormData({ ...formData, pilotRationale: e.target.value })}
                />
              )}
            </div>
          </div>

          {/* SECTION 2: DYNAMIC STAGE PIPELINE DESIGNER */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#34d399" }}>
                  2. Configurable Stage Pipeline ({stages.length} Stages • Total SLA: {totalSlaDays} Days)
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                  Arrange sequential approval stages, assign responsible roles/persons, configure turnaround SLAs, and attach mandatory audit documents.
                </div>
              </div>
              <button
                type="button"
                className="btn-add-item-row"
                onClick={() => addStage(stages.length - 1)}
                style={{ padding: "7px 14px", fontSize: "12px" }}
              >
                ➕ Add Stage
              </button>
            </div>

            {/* VISUAL STAGE PIPELINE STEPPER */}
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", marginBottom: "16px" }}>
              {stages.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedStageIdx(idx)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "4px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: selectedStageIdx === idx ? "2px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)",
                    background: selectedStageIdx === idx ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.03)",
                    color: selectedStageIdx === idx ? "#ffffff" : "#cbd5e1",
                    minWidth: "140px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: "10px", color: "#94a3b8" }}>
                    <span>STEP {s.step}</span>
                    <span style={{ fontWeight: 700, color: "#34d399" }}>{s.slaDays}d</span>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "125px" }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: "10px", color: "#93c5fd", whiteSpace: "nowrap" }}>
                    👤 {s.role}
                  </div>
                </button>
              ))}
            </div>

            {/* SELECTED STAGE DETAILED CONFIGURATION */}
            {currentStage && (
              <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ background: "#2563eb", color: "#fff", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>
                      Configuring Step {currentStage.step} of {stages.length}
                    </span>
                    <strong style={{ fontSize: "14px", color: "#f8fafc" }}>{currentStage.name}</strong>
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      disabled={selectedStageIdx === 0}
                      onClick={() => moveStage(selectedStageIdx, -1)}
                      title="Move stage earlier"
                      className="btn-stage-ctrl"
                    >
                      ⬅️ Move Earlier
                    </button>
                    <button
                      type="button"
                      disabled={selectedStageIdx === stages.length - 1}
                      onClick={() => moveStage(selectedStageIdx, 1)}
                      title="Move stage later"
                      className="btn-stage-ctrl"
                    >
                      Move Later ➡️
                    </button>
                    <button
                      type="button"
                      onClick={() => addStage(selectedStageIdx)}
                      title="Insert stage right after this"
                      className="btn-stage-ctrl green"
                    >
                      ➕ Insert After
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStage(selectedStageIdx)}
                      title="Delete this stage"
                      className="btn-stage-ctrl red"
                    >
                      🗑️ Delete Stage
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  <div>
                    <label className="field-label">Stage Title / Step Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={currentStage.name}
                      onChange={(e) => handleStageChange(selectedStageIdx, "name", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="field-label">Canonical Stage Classification</label>
                    <select
                      className="input-field"
                      value={currentStage.canonicalStage || CANONICAL_OPTIONS[0]}
                      onChange={(e) => handleStageChange(selectedStageIdx, "canonicalStage", e.target.value)}
                    >
                      {CANONICAL_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="field-label">Responsible Role (From Role Master)</label>
                    <select
                      className="input-field"
                      value={currentStage.role}
                      onChange={(e) => handleStageChange(selectedStageIdx, "role", e.target.value)}
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.name}>[{r.code}] {r.name} — ({r.level})</option>
                      ))}
                      {!roles.some((r) => r.name === currentStage.role) && (
                        <option value={currentStage.role}>{currentStage.role}</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="field-label">Responsible Person (From Person Master)</label>
                    <select
                      className="input-field"
                      value={currentStage.personName || ""}
                      onChange={(e) => handleStageChange(selectedStageIdx, "personName", e.target.value)}
                    >
                      <option value="">-- Unassigned (Role-based Pool) --</option>
                      {persons.map((p) => (
                        <option key={p.id} value={p.name}>{p.name} [{p.roleCode}] — {p.department}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="field-label">Stage SLA (Working Days)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      className="input-field"
                      value={currentStage.slaDays}
                      onChange={(e) => handleStageChange(selectedStageIdx, "slaDays", parseInt(e.target.value, 10) || 1)}
                    />
                  </div>

                  <div>
                    <label className="field-label">Escalation Role / HOD</label>
                    <input
                      type="text"
                      className="input-field"
                      value={currentStage.escalationRole}
                      onChange={(e) => handleStageChange(selectedStageIdx, "escalationRole", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="field-label">Action / Approval Type</label>
                    <select
                      className="input-field"
                      value={currentStage.actionType || "SCRUTINY"}
                      onChange={(e) => handleStageChange(selectedStageIdx, "actionType", e.target.value)}
                    >
                      {ACTION_TYPES.map((a) => (
                        <option key={a.id} value={a.id}>{a.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="field-label">Escalation Rule (From Escalation Master)</label>
                    <select
                      className="input-field"
                      value={currentStage.escalationRuleId || "ESC-001"}
                      onChange={(e) => handleStageChange(selectedStageIdx, "escalationRuleId", e.target.value)}
                    >
                      {escalations.map((esc) => (
                        <option key={esc.id} value={esc.id}>[{esc.code}] {esc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* MANDATORY DOCUMENTS SELECTOR */}
                <div style={{ marginTop: "14px" }}>
                  <label className="field-label" style={{ marginBottom: "6px" }}>
                    Mandatory Documents Required for this Stage (From Document Master)
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {documents.map((doc) => {
                      const isSelected = (currentStage.mandatoryDocs || []).includes(doc.title);
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => handleToggleDoc(selectedStageIdx, doc.title)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "16px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                            border: isSelected ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.12)",
                            background: isSelected ? "rgba(59,130,246,0.22)" : "rgba(255,255,255,0.03)",
                            color: isSelected ? "#93c5fd" : "#94a3b8",
                            transition: "all 0.15s ease"
                          }}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {doc.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="modal-footer" style={{ padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>
            Configured by: <strong>{user?.name || "System Administrator"}</strong> ({user?.role || "Administrator"})
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              type="button"
              className="primary btn-save-wf"
              onClick={handleSave}
              disabled={saving}
              style={{ padding: "9px 24px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", fontWeight: 700 }}
            >
              {saving ? "Saving to Digital Workflow Engine…" : isEditing ? "💾 Update Configured Workflow" : "✨ Publish & Activate Workflow"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
