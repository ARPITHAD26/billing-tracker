import React, { useState, useMemo } from "react";
import {
  calculateWorkflowTracking,
  formatStageDate,
  CANONICAL_JOURNEY_PHASES
} from "./workflowTrackingHelper";

export default function BillEntireDetailsModal({
  bill,
  onClose,
  onSwitchBill
}) {
  const [activeTab, setActiveTab] = useState("all-fields");
  const [copiedNotification, setCopiedNotification] = useState("");

  const tracking = useMemo(() => {
    return calculateWorkflowTracking(bill);
  }, [bill]);

  if (!bill) return null;

  const handleCopyField = (label, val) => {
    navigator.clipboard.writeText(String(val || ""));
    setCopiedNotification(`Copied ${label}`);
    setTimeout(() => setCopiedNotification(""), 2000);
  };

  const handleCopyAllDetails = () => {
    const summary = {
      // 15 Mandated Fields
      billId: bill.id,
      billNumber: bill.billNumber || bill.id,
      client: bill.client || "BBMP",
      unit: bill.unit || bill.ward || "Municipal Unit",
      workOrder: bill.workOrder || bill.workOrderNo || "WO/BBMP/2026/001",
      contract: bill.contract || bill.contractNo || "CNT-2025-GEN-001",
      billingPeriod: bill.billingPeriod || "Current RA Period",
      billingType: bill.billingType || "Monthly Running Account (RA) Bill",
      amount: bill.amount || "—",
      submissionDate: bill.submissionDate || "—",
      expectedPaymentDate: bill.expectedPaymentDate || "—",
      currentStage: tracking?.currentStage?.name || bill.currentStage || "—",
      currentResponsiblePersonRole: `${bill.currentPerson || "Assigned"} (${bill.currentRole || "Authority"})`,
      workflowStatus: bill.workflowStatus || bill.status || "UNDER_REVIEW",
      paymentStatus: bill.paymentStatus || "UNPAID",
      
      // 8 Workflow Tracking Criteria
      completedStagesCount: tracking?.completedStagesCount,
      totalStages: tracking?.totalStages,
      currentStep: tracking?.currentStage?.step,
      pendingStage: tracking?.pendingStage?.name,
      pendingStagesCount: tracking?.pendingStagesCount,
      dateEnteredIntoStage: tracking?.dateEnteredIntoStage,
      daysPending: tracking?.daysPending,
      stageSla: tracking?.sla,
      slaStatus: tracking?.slaStatus,
      nextStage: tracking?.nextStage?.name || "Payment Disbursed",
      
      // Additional Context
      contractor: bill.contractor || "State Public Works Contractor",
      projectName: bill.projectName || "General Project",
      mbNumber: bill.mbNumber || "MB-2026/042-A",
      towerCode: bill.towerCode || "TWR-GEN",
      towerName: bill.towerName || "General Tower"
    };

    navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
    setCopiedNotification("Entire details copied as JSON to clipboard!");
    setTimeout(() => setCopiedNotification(""), 2500);
  };

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div
        className="custom-modal-card wt-entire-details-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "880px", width: "95vw", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* MODAL HEADER */}
        <div className="custom-modal-header" style={{ borderBottom: "1px solid var(--border-light)", padding: "16px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flex: 1 }}>
            <div className="bmb-icon-badge" style={{ background: "rgba(37,99,235,0.12)", color: "#2563eb", fontSize: "20px", padding: "8px 10px", borderRadius: "8px" }}>
              📑
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span className="id-code" style={{ fontSize: "16px", fontWeight: 800 }}>{bill.id}</span>
                <span className="client-badge-sm">{bill.client || "BBMP"}</span>
                {bill.isPilot && (
                  <span className="wt-pilot-badge" style={{ fontSize: "10px", padding: "2px 6px" }}>
                    🎯 {bill.pilotName || "Designated Pilot"}
                  </span>
                )}
                <span className={`wt-sla-chip ${tracking?.slaStatus?.toLowerCase()}`} style={{ fontSize: "10px" }}>
                  {tracking?.slaStatus === "BREACHED_SLA" ? "🔴 BREACHED SLA" :
                   tracking?.slaStatus === "APPROACHING_SLA" ? "🟠 APPROACHING SLA" :
                   "🟢 WITHIN SLA"}
                </span>
                <span className="status-pill status-under_review" style={{ fontSize: "10.5px" }}>
                  {bill.workflowStatus || "UNDER_REVIEW"}
                </span>
              </div>
              <h3 style={{ margin: "4px 0 0 0", fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                {bill.projectName}
              </h3>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <strong style={{ fontSize: "18px", color: "var(--text-primary)", fontWeight: 800 }}>
              {bill.amount || "—"}
            </strong>
            <button
              type="button"
              className="custom-modal-close"
              onClick={onClose}
              title="Close modal"
              style={{ fontSize: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
            >
              ✕
            </button>
          </div>
        </div>

        {copiedNotification && (
          <div style={{ background: "rgba(16,185,129,0.14)", color: "#059669", padding: "8px 22px", fontSize: "12px", fontWeight: 700, borderBottom: "1px solid rgba(16,185,129,0.25)" }}>
            ✓ {copiedNotification}
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div style={{ display: "flex", gap: "6px", padding: "10px 22px", background: "var(--bg-app)", borderBottom: "1px solid var(--border-light)", flexWrap: "wrap" }}>
          {[
            { id: "all-fields", label: "📋 15 Statutory Fields", badge: "Mandated" },
            { id: "workflow-tracking", label: "🛤️ 6. Workflow Tracking & Journey", badge: "8 Criteria" },
            { id: "stage-matrix", label: "📑 15-Stage Audit Matrix", badge: `${bill.stages?.length || 15} Stages` },
            { id: "raw-json", label: "💾 Raw Data & Export", badge: "JSON" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`docs-mode-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ fontSize: "12px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span>{tab.label}</span>
              <span style={{ fontSize: "9.5px", opacity: 0.8, background: activeTab === tab.id ? "rgba(255,255,255,0.25)" : "var(--border-light)", padding: "1px 5px", borderRadius: "4px" }}>
                {tab.badge}
              </span>
            </button>
          ))}
        </div>

        {/* MODAL BODY */}
        <div className="custom-modal-body" style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {/* TAB 1: 15 MANDATED STATUTORY FIELDS */}
          {activeTab === "all-fields" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-primary)" }}>
                    Section 5: Mandated 15 Proposed Information Fields
                  </h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                    Comprehensive audit parameters recorded under statutory billing governance.
                  </p>
                </div>
                <button
                  type="button"
                  className="custom-btn-secondary"
                  onClick={handleCopyAllDetails}
                  style={{ fontSize: "11.5px", padding: "5px 10px" }}
                >
                  📋 Copy All Fields
                </button>
              </div>

              {/* Group 1: General & Identification */}
              <div className="wt-dossier-card">
                <div className="wt-dossier-card-title">
                  <span>🏢 1. Identification & Contractual Mandates</span>
                </div>
                <div className="wt-dossier-grid">
                  <div className="wt-dossier-field" onClick={() => handleCopyField("Bill ID", bill.id)} title="Click to copy">
                    <span className="wt-dossier-label">1. Bill ID (Unique)</span>
                    <span className="wt-dossier-value id-code">{bill.id}</span>
                  </div>
                  <div className="wt-dossier-field" onClick={() => handleCopyField("Bill Number", bill.billNumber || bill.id)}>
                    <span className="wt-dossier-label">2. Bill Number</span>
                    <span className="wt-dossier-value">{bill.billNumber || bill.id}</span>
                  </div>
                  <div className="wt-dossier-field">
                    <span className="wt-dossier-label">3. Client</span>
                    <span className="wt-dossier-value">
                      <span className="client-badge-sm">{bill.client || "BBMP"}</span>
                    </span>
                  </div>
                  <div className="wt-dossier-field">
                    <span className="wt-dossier-label">4. Unit / Division</span>
                    <span className="wt-dossier-value">{bill.unit || bill.ward || "Lakes Division"}</span>
                  </div>
                  <div className="wt-dossier-field" onClick={() => handleCopyField("Work Order", bill.workOrder || "WO/BBMP/2026/001")}>
                    <span className="wt-dossier-label">5. Work Order Number</span>
                    <span className="wt-dossier-value font-mono">{bill.workOrder || bill.workOrderNo || "WO/BBMP/2026/4102"}</span>
                  </div>
                  <div className="wt-dossier-field" onClick={() => handleCopyField("Contract No", bill.contract || "CNT-2025-GEN-001")}>
                    <span className="wt-dossier-label">6. Contract Number</span>
                    <span className="wt-dossier-value font-mono">{bill.contract || bill.contractNo || "CNT-2025-BBMP-LAK-088"}</span>
                  </div>
                  <div className="wt-dossier-field">
                    <span className="wt-dossier-label">Measurement Book (MB) #</span>
                    <span className="wt-dossier-value font-mono">{bill.mbNumber || "MB-2026/042-A"}</span>
                  </div>
                  <div className="wt-dossier-field">
                    <span className="wt-dossier-label">Contractor / Vendor</span>
                    <span className="wt-dossier-value">{bill.contractor || "Sri Sai Infratech Projects Pvt Ltd"}</span>
                  </div>
                </div>
              </div>

              {/* Group 2: Financials & Accounting */}
              <div className="wt-dossier-card">
                <div className="wt-dossier-card-title">
                  <span>💰 2. Financials, Billing & Disbursement</span>
                </div>
                <div className="wt-dossier-grid">
                  <div className="wt-dossier-field">
                    <span className="wt-dossier-label">7. Billing Period</span>
                    <span className="wt-dossier-value">{bill.billingPeriod || "01 Oct 2026 – 31 Oct 2026"}</span>
                  </div>
                  <div className="wt-dossier-field">
                    <span className="wt-dossier-label">8. Billing Type</span>
                    <span className="wt-dossier-value">{bill.billingType || "Monthly Running Account (RA) Bill"}</span>
                  </div>
                  <div className="wt-dossier-field">
                    <span className="wt-dossier-label">9. Gross Bill Amount</span>
                    <span className="wt-dossier-value text-emerald" style={{ fontSize: "16px", fontWeight: 800 }}>
                      {bill.amount || "—"}
                    </span>
                  </div>
                  <div className="wt-dossier-field">
                    <span className="wt-dossier-label">10. Submission Date</span>
                    <span className="wt-dossier-value">{formatStageDate(bill.submissionDate)}</span>
                  </div>
                  <div className="wt-dossier-field">
                    <span className="wt-dossier-label">11. Expected Payment Date</span>
                    <span className="wt-dossier-value">
                      {bill.expectedPaymentDate ? formatStageDate(bill.expectedPaymentDate) : "Scheduled Post-Audit Verification"}
                    </span>
                  </div>
                  <div className="wt-dossier-field">
                    <span className="wt-dossier-label">15. Payment Status</span>
                    <span className="wt-dossier-value">
                      <span className={`status-pill ${bill.paymentStatus === "PAID" ? "status-paid" : bill.paymentStatus === "OVERDUE" ? "status-flagged" : "status-closed"}`}>
                        {bill.paymentStatus || "UNPAID"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Group 3: Current Governance & Workflow Custody */}
              <div className="wt-dossier-card">
                <div className="wt-dossier-card-title">
                  <span>🏛️ 3. Workflow Custody & Responsible Authority</span>
                </div>
                <div className="wt-dossier-grid">
                  <div className="wt-dossier-field">
                    <span className="wt-dossier-label">12. Current Stage</span>
                    <span className="wt-dossier-value" style={{ color: "var(--accent-primary)", fontWeight: 700 }}>
                      Step {tracking?.currentStage?.step || bill.currentStep || 1}: {tracking?.currentStage?.name || bill.currentStage || "Tapal"}
                    </span>
                  </div>
                  <div className="wt-dossier-field">
                    <span className="wt-dossier-label">13. Responsible Person / Role</span>
                    <span className="wt-dossier-value">
                      <strong>{bill.currentPerson || "Assigned Officer"}</strong> ({bill.currentRole || tracking?.currentStage?.role || "Reviewing Authority"})
                    </span>
                  </div>
                  <div className="wt-dossier-field">
                    <span className="wt-dossier-label">14. Overall Status</span>
                    <span className="wt-dossier-value">
                      <span className="status-pill status-under_review">
                        {bill.workflowStatus || bill.status || "UNDER_REVIEW"}
                      </span>
                    </span>
                  </div>
                  <div className="wt-dossier-field">
                    <span className="wt-dossier-label">Days Dwell in Current Stage</span>
                    <span className="wt-dossier-value" style={{ color: tracking?.daysPending > (tracking?.stageSlaDays || 2) ? "#dc2626" : "inherit" }}>
                      {tracking?.daysPending || 0} Day{tracking?.daysPending === 1 ? "" : "s"} (SLA: {tracking?.sla || "2 Days"})
                    </span>
                  </div>
                  <div className="wt-dossier-field">
                    <span className="wt-dossier-label">Tower / Infrastructure Asset</span>
                    <span className="wt-dossier-value">
                      {bill.towerName || "Bellandur Lake Monitoring Tower"} ({bill.towerCode || "TWR-BLR-01"})
                    </span>
                  </div>
                  <div className="wt-dossier-field">
                    <span className="wt-dossier-label">Project Classification</span>
                    <span className="wt-dossier-value">{bill.projectType || "BBMP_LAKES"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 6. WORKFLOW TRACKING & MANDATED 8 CRITERIA */}
          {activeTab === "workflow-tracking" && tracking && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-primary)" }}>
                  6. Workflow Tracking Mandated Specification
                </h4>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                  Mandatory complete journey tracking across canonical phases: <strong>Submission → Approval stages → Finance → Audit, where applicable → Payment</strong>
                </p>
              </div>

              {/* 5-Phase Macro-Journey Pipeline Ribbon */}
              <div className="wt-reg-journey-bar" style={{ padding: "12px 16px", borderRadius: "8px" }}>
                {tracking.journeyPhases.map((ph, idx) => {
                  const isDone = ph.status === "COMPLETED";
                  const isCur = ph.status === "CURRENT";
                  return (
                    <React.Fragment key={ph.id}>
                      <div className={`wt-reg-journey-step ${isDone ? "completed" : isCur ? "active" : "pending"}`} style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: "16px" }}>{ph.icon}</span>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
                          <span style={{ fontWeight: 700, fontSize: "12px" }}>{ph.label}</span>
                          <span style={{ fontSize: "10.5px", opacity: 0.85 }}>
                            {ph.completedCount}/{ph.totalCount} stages cleared
                          </span>
                        </div>
                        {isDone && <span style={{ marginLeft: "4px" }}>✓</span>}
                        {isCur && <span style={{ marginLeft: "4px" }}>●</span>}
                      </div>
                      {idx < tracking.journeyPhases.length - 1 && (
                        <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>➔</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* 8 Mandated Statutory Parameters Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                {/* 1. Completed Stages */}
                <div className="wt-hud-card hud-completed" style={{ padding: "14px" }}>
                  <div className="wt-hud-card-label">
                    <span>1. Completed Stages</span>
                    <span>✓</span>
                  </div>
                  <div className="wt-hud-metric-row">
                    <span className="wt-hud-metric-large text-emerald">{tracking.completedStagesCount}</span>
                    <span className="wt-hud-metric-sub">/ {tracking.totalStages} stages cleared</span>
                  </div>
                  <div className="wt-hud-detail-snippet">
                    {tracking.completedStagesCount > 0 ? (
                      <span>Last: <strong>{tracking.completedStages[tracking.completedStagesCount - 1]?.name}</strong></span>
                    ) : (
                      <span>Initial submission stage</span>
                    )}
                  </div>
                </div>

                {/* 2. Current Stage */}
                <div className="wt-hud-card hud-current" style={{ padding: "14px" }}>
                  <div className="wt-hud-card-label">
                    <span>2. Current Stage</span>
                    <span className="wt-live-indicator">LIVE ●</span>
                  </div>
                  <div className="wt-hud-stage-name" style={{ color: "var(--accent-primary)" }}>
                    Step {tracking.currentStage.step}: <strong>{tracking.currentStage.name}</strong>
                  </div>
                  <div className="wt-hud-detail-snippet">
                    Authority: <strong>{bill.currentPerson || "Assigned Officer"}</strong> ({tracking.currentStage.role})
                  </div>
                </div>

                {/* 3. Pending Stage */}
                <div className="wt-hud-card hud-pending-stage" style={{ padding: "14px" }}>
                  <div className="wt-hud-card-label">
                    <span>3. Pending Stage</span>
                    <span>⏳</span>
                  </div>
                  <div className="wt-hud-stage-name text-amber">
                    <strong>{tracking.pendingStage.name}</strong>
                  </div>
                  <div className="wt-hud-detail-snippet">
                    Queue: <strong>{tracking.pendingStagesCount}</strong> stages remaining
                  </div>
                </div>

                {/* 4. Date entered into stage */}
                <div className="wt-hud-card hud-date-entered" style={{ padding: "14px" }}>
                  <div className="wt-hud-card-label">
                    <span>4. Date Entered Stage</span>
                    <span>📅</span>
                  </div>
                  <div className="wt-hud-date-val">
                    {formatStageDate(tracking.dateEnteredIntoStage)}
                  </div>
                  <div className="wt-hud-detail-snippet">
                    Logged in official tracking ledger
                  </div>
                </div>

                {/* 5. Days pending */}
                <div className="wt-hud-card hud-days-pending" style={{ padding: "14px" }}>
                  <div className="wt-hud-card-label">
                    <span>5. Days Pending</span>
                    <span>⏱️</span>
                  </div>
                  <div className="wt-hud-metric-row">
                    <span className="wt-hud-metric-large text-amber" style={{ color: tracking.daysPending > tracking.stageSlaDays ? "#dc2626" : "inherit" }}>
                      {tracking.daysPending}
                    </span>
                    <span className="wt-hud-metric-sub">Day{tracking.daysPending === 1 ? "" : "s"} dwell</span>
                  </div>
                  <div className="wt-hud-detail-snippet">
                    Stage SLA baseline: <strong>{tracking.stageSlaDays} days</strong>
                  </div>
                </div>

                {/* 6. SLA */}
                <div className="wt-hud-card hud-sla" style={{ padding: "14px" }}>
                  <div className="wt-hud-card-label">
                    <span>6. Turnaround SLA</span>
                    <span>🎯</span>
                  </div>
                  <div className="wt-hud-metric-row">
                    <span className="wt-hud-metric-large">{tracking.stageSlaDays}</span>
                    <span className="wt-hud-metric-sub">days mandated</span>
                  </div>
                  <div className="wt-hud-detail-snippet">
                    Statutory Citizen Charter SLA
                  </div>
                </div>

                {/* 7. SLA Status */}
                <div className={`wt-hud-card hud-sla-status ${tracking.slaStatus.toLowerCase()}`} style={{ padding: "14px" }}>
                  <div className="wt-hud-card-label">
                    <span>7. SLA Status</span>
                    <span>⚡</span>
                  </div>
                  <div className="wt-sla-status-badge-wrapper" style={{ margin: "6px 0" }}>
                    <span className={`wt-sla-chip ${tracking.slaStatus.toLowerCase()}`}>
                      {tracking.slaStatus === "BREACHED_SLA" ? "🔴 BREACHED SLA" :
                       tracking.slaStatus === "APPROACHING_SLA" ? "🟠 APPROACHING SLA" :
                       "🟢 WITHIN SLA"}
                    </span>
                  </div>
                  <div className="wt-sla-bar-container">
                    <div
                      className={`wt-sla-bar-fill ${tracking.slaStatus.toLowerCase()}`}
                      style={{ width: `${Math.min(100, tracking.slaPercentageConsumed)}%` }}
                    />
                  </div>
                  <div className="wt-hud-detail-snippet">
                    <span>{tracking.slaPercentageConsumed}% of stage SLA consumed</span>
                  </div>
                </div>

                {/* 8. Next Stage */}
                <div className="wt-hud-card hud-next" style={{ padding: "14px" }}>
                  <div className="wt-hud-card-label">
                    <span>8. Next Stage</span>
                    <span>⏭️</span>
                  </div>
                  <div className="wt-hud-stage-name" style={{ color: "var(--accent-primary)" }}>
                    {tracking.nextStage ? (
                      <>Step {tracking.nextStage.step}: <strong>{tracking.nextStage.name}</strong></>
                    ) : (
                      <strong>Final Payment Disbursed</strong>
                    )}
                  </div>
                  <div className="wt-hud-detail-snippet">
                    {tracking.nextStage ? (
                      <span>Authority: <strong>{tracking.nextStage.role}</strong> ({tracking.nextStage.slaDays}d SLA)</span>
                    ) : (
                      <span className="text-emerald">Bill lifecycle fully cleared</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 15-STAGE AUDIT MATRIX */}
          {activeTab === "stage-matrix" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-primary)" }}>
                    Complete Stage Progression & Clearance Matrix
                  </h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                    Sequential audit checkpoints from Step 1 (Tapal) to Step {bill.stages?.length || 15} (Payment Disbursed).
                  </p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="custom-table wt-matrix-table" style={{ fontSize: "12px" }}>
                  <thead>
                    <tr>
                      <th>Step</th>
                      <th>Phase</th>
                      <th>Stage Name</th>
                      <th>Assigned Authority</th>
                      <th>Status</th>
                      <th>SLA</th>
                      <th>Clearance Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(bill.stages || [
                      "Tapal", "AE", "AEE", "EE", "Attendance Certification", "AEE",
                      "JC", "DCF Fund", "EE", "DC Bill", "DCF Payments"
                    ]).map((stName, idx) => {
                      const stepNum = idx + 1;
                      const isCompleted = stepNum < (bill.currentStep || 1);
                      const isActive = stepNum === (bill.currentStep || 1);
                      const phaseInfo = CANONICAL_JOURNEY_PHASES.find((p) =>
                        p.stages?.some((s) => s.step === stepNum)
                      );
                      const hist = (bill.history || []).find((h) => h.step === stepNum);

                      return (
                        <tr
                          key={stepNum}
                          className={isActive ? "wt-row-active" : isCompleted ? "wt-row-completed" : ""}
                        >
                          <td>
                            <strong className="id-code">Step {stepNum}</strong>
                          </td>
                          <td>
                            <span className="wt-table-phase-chip" style={{ fontSize: "11px", padding: "2px 6px" }}>
                              {phaseInfo?.icon || "📋"} {phaseInfo?.label || "Approval"}
                            </span>
                          </td>
                          <td>
                            <strong>{stName}</strong>
                          </td>
                          <td>
                            <div>{hist?.performedBy || (isActive ? (bill.currentRole || "Assigned Officer") : "Mandated Authority")}</div>
                          </td>
                          <td>
                            {isCompleted ? (
                              <span className="status-pill status-paid" style={{ fontSize: "10.5px" }}>✓ Passed</span>
                            ) : isActive ? (
                              <span className="status-pill status-under_review" style={{ fontSize: "10.5px" }}>● Active</span>
                            ) : (
                              <span className="status-pill status-closed" style={{ fontSize: "10.5px" }}>⏳ Pending</span>
                            )}
                          </td>
                          <td>
                            <span className="sla-days-badge" style={{ fontSize: "10.5px" }}>
                              {tracking?.stageSlaDays || 2}d
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>
                              {isCompleted && hist?.savedAt
                                ? formatStageDate(hist.savedAt)
                                : isActive
                                ? `Active since ${formatStageDate(tracking?.dateEnteredIntoStage)}`
                                : "Awaiting Prior Clearance"}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: RAW STATUTORY DATA & EXPORT */}
          {activeTab === "raw-json" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 800 }}>Raw Statutory JSON Ledger</h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                    Direct machine-readable representation of this bill docket and workflow audit records.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="custom-btn-secondary"
                    onClick={() => {
                      const str = JSON.stringify({ bill, tracking }, null, 2);
                      const blob = new Blob([str], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `bill_entire_details_${bill.id}_${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    style={{ fontSize: "11.5px", padding: "5px 12px" }}
                  >
                    💾 Download JSON
                  </button>
                  <button
                    type="button"
                    className="custom-btn-primary"
                    onClick={handleCopyAllDetails}
                    style={{ fontSize: "11.5px", padding: "5px 12px" }}
                  >
                    📋 Copy to Clipboard
                  </button>
                </div>
              </div>

              <pre style={{
                background: "var(--bg-app)",
                border: "1px solid var(--border-light)",
                borderRadius: "var(--radius-sm)",
                padding: "16px",
                fontSize: "12px",
                fontFamily: "monospace",
                overflowX: "auto",
                maxHeight: "380px",
                color: "var(--text-primary)"
              }}>
                {JSON.stringify({ bill, tracking }, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="custom-modal-footer" style={{ borderTop: "1px solid var(--border-light)", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Showing 100% complete dossier for <strong>{bill.id}</strong> ({bill.projectName})
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {onSwitchBill && (
              <button
                type="button"
                className="custom-btn-primary"
                onClick={() => {
                  onSwitchBill(bill.id);
                  onClose();
                }}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span>🎯</span>
                <span>Track This Bill in Workflow Engine</span>
              </button>
            )}
            <button
              type="button"
              className="custom-btn-secondary"
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
