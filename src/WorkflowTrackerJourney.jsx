import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  calculateWorkflowTracking,
  formatStageDate,
  CANONICAL_JOURNEY_PHASES
} from "./workflowTrackingHelper";
import BillEntireDetailsModal from "./BillEntireDetailsModal";

export default function WorkflowTrackerJourney({
  bill,
  user,
  onStepClick,
  onTransitionStep,
  saving = false,
  onSwitchBill,
  billsList = []
}) {
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showMatrixView, setShowMatrixView] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [modalBill, setModalBill] = useState(null);
  const [copiedBillId, setCopiedBillId] = useState(false);

  // Search states: Bill search, Entire details console, and Stage search
  const [billSearchQuery, setBillSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [searchViewMode, setSearchViewMode] = useState("split"); // "split" | "cards"
  const [showPageEntireDetails, setShowPageEntireDetails] = useState(false);
  const [searchLoadedBillId, setSearchLoadedBillId] = useState(null);
  const [stageSearchQuery, setStageSearchQuery] = useState("");
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const tracking = useMemo(() => {
    return calculateWorkflowTracking(bill);
  }, [bill]);

  if (!tracking) {
    return (
      <div className="card workflow-tracker-loading">
        <p>Loading Workflow Tracking Information…</p>
      </div>
    );
  }

  const {
    completedStages,
    completedStagesCount,
    currentStage,
    pendingStage,
    pendingStagesQueue,
    pendingStagesCount,
    dateEnteredIntoStage,
    daysPending,
    sla,
    stageSlaDays,
    slaStatus,
    slaPercentageConsumed,
    nextStage,
    journeyPhases,
    totalStages,
    progressPercentage
  } = tracking;

  const handleCopyId = () => {
    if (bill?.id) {
      navigator.clipboard.writeText(bill.id);
      setCopiedBillId(true);
      setTimeout(() => setCopiedBillId(false), 2000);
    }
  };

  // Filter bills for docket search across all 15 statutory fields & workflow metadata, with date range
  const filteredBills = useMemo(() => {
    if (!billsList || billsList.length === 0) return [];
    const q = billSearchQuery.trim().toLowerCase();
    const fromMs = dateFrom ? new Date(dateFrom).getTime() : null;
    const toMs = dateTo ? new Date(dateTo + "T23:59:59").getTime() : null;

    let base = billsList;
    // Apply date range filter
    if (fromMs || toMs) {
      base = base.filter((b) => {
        const d = b.submissionDate ? new Date(b.submissionDate).getTime() : null;
        if (!d) return false;
        if (fromMs && d < fromMs) return false;
        if (toMs && d > toMs) return false;
        return true;
      });
    }

    if (!q) {
      return base.slice(0, 12);
    }
    return base.filter((b) => {
      const target = `${b.id || ""} ${b.billNumber || ""} ${b.projectName || ""} ${b.client || ""} ${b.unit || ""} ${b.ward || ""} ${b.contractor || ""} ${b.workOrder || ""} ${b.contract || ""} ${b.mbNumber || ""} ${b.amount || ""} ${b.currentStage || ""} ${b.currentStageName || ""} ${b.currentPerson || ""} ${b.currentRole || ""} ${b.status || ""} ${b.workflowStatus || ""} ${b.paymentStatus || ""} ${b.towerName || ""} ${b.towerCode || ""} ${b.billingType || ""}`.toLowerCase();
      return target.includes(q);
    });
  }, [billsList, billSearchQuery, dateFrom, dateTo]);

  const activeHighlightedBill = useMemo(() => {
    if (filteredBills.length === 0) return null;
    const idx = highlightedIndex >= 0 && highlightedIndex < filteredBills.length ? highlightedIndex : 0;
    return filteredBills[idx] || filteredBills[0];
  }, [filteredBills, highlightedIndex]);

  const highlightedTracking = useMemo(() => {
    return activeHighlightedBill ? calculateWorkflowTracking(activeHighlightedBill) : null;
  }, [activeHighlightedBill]);

  const handleSearchKeyDown = (e) => {
    if (!isSearchOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      setIsSearchOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredBills.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredBills.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredBills.length) {
        handleSelectBill(filteredBills[highlightedIndex].id);
      } else if (filteredBills.length > 0) {
        handleSelectBill(filteredBills[0].id);
      }
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
    }
  };

  const handleSelectBill = (targetId) => {
    if (onSwitchBill && targetId) {
      onSwitchBill(targetId);
      setSearchLoadedBillId(targetId);
      setShowPageEntireDetails(true);
    }
    setIsSearchOpen(false);
    setHighlightedIndex(0);
  };

  // Filter stages based on selected phase filter AND stage search query
  const displayedStages = useMemo(() => {
    if (!bill?.stages) return [];
    return bill.stages
      .map((name, idx) => ({ name, step: idx + 1 }))
      .filter(({ name, step }) => {
        if (selectedPhaseFilter !== "ALL") {
          const ph = journeyPhases.find((p) => p.id === selectedPhaseFilter);
          if (!ph?.stages.some((s) => s.step === step)) return false;
        }
        if (stageSearchQuery.trim()) {
          const q = stageSearchQuery.trim().toLowerCase();
          const phase = CANONICAL_JOURNEY_PHASES.find((p) => p.stages?.some((s) => s.step === step));
          const hist = (bill.history || []).find((h) => h.step === step);
          const matchString = `step ${step} ${name} ${phase?.label || ""} ${hist?.performedBy || ""} ${currentStage.step === step ? currentStage.role : ""}`.toLowerCase();
          if (!matchString.includes(q)) return false;
        }
        return true;
      });
  }, [bill, selectedPhaseFilter, journeyPhases, stageSearchQuery, currentStage]);

  return (
    <section className="card workflow-tracker-card" id="workflow-tracking-section">
      {/* 6. WORKFLOW TRACKING HEADER */}
      <div className="wt-header">
        <div className="wt-title-area">
          <div className="wt-badge-strip">
            <span className="wt-section-badge">
              6. Workflow Tracking & Journey Engine
            </span>
            <span className="wt-mandate-badge">
              Mandatory Statutory Governance
            </span>
            {bill.isPilot && (
              <span className="wt-pilot-badge">
                🎯 {bill.pilotName || "Designated Pilot"}
              </span>
            )}
          </div>

          <h2 className="wt-main-heading">
            End-to-End Bill Lifecycle & Stage Journey
          </h2>
          <p className="wt-subtext">
            Mandatory complete journey tracking across canonical phases:{" "}
            <strong>Submission → Approval stages → Finance → Audit, where applicable → Payment</strong>
          </p>
        </div>

        <div className="wt-header-actions">
          {/* DATE RANGE FILTER */}
          <div className="wt-date-filter-bar">
            <span className="wt-date-filter-label">📅 Date:</span>
            <div className="wt-date-filter-group">
              <label className="wt-date-filter-field-label">From</label>
              <input
                type="date"
                className="wt-date-input"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setIsSearchOpen(true); setHighlightedIndex(0); }}
                title="Filter bills submitted from this date"
              />
            </div>
            <div className="wt-date-filter-group">
              <label className="wt-date-filter-field-label">Upto</label>
              <input
                type="date"
                className="wt-date-input"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => { setDateTo(e.target.value); setIsSearchOpen(true); setHighlightedIndex(0); }}
                title="Filter bills submitted up to this date"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                type="button"
                className="wt-date-clear-btn"
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                title="Clear date filter"
              >
                ✕ Clear
              </button>
            )}
          </div>
          {/* SEARCH OPTION: Dedicated Bill Docket Search with Live Entire Details Console */}
          <div className="wt-search-container" ref={searchContainerRef}>
            <div className="wt-search-input-box">
              <span className="wt-search-icon">🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                className="wt-search-field"
                placeholder="Search bills by ID, project, client, contractor, stage..."
                value={billSearchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setBillSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                title="Search bill dockets in Workflow Tracking (Shows Entire Details)"
              />
              {billSearchQuery && (
                <button
                  type="button"
                  className="wt-search-clear-btn"
                  onClick={() => {
                    setBillSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Menu / Command Console with Entire Details */}
            {isSearchOpen && (
              <div className="wt-search-dropdown">
                <div className="wt-search-dropdown-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>
                      {billSearchQuery ? `Matches (${filteredBills.length}) for "${billSearchQuery}"` : `All Bills (${billsList.length})`}
                    </span>
                    {filteredBills.length > 0 && (
                      <span className="badge-unique-rule" style={{ fontSize: "10px", padding: "1px 6px" }}>
                        Entire Details Enabled
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="wt-search-mode-tabs">
                      <button
                        type="button"
                        className={`wt-search-mode-tab ${searchViewMode === "split" ? "active" : ""}`}
                        onClick={() => setSearchViewMode("split")}
                        title="Split console: Bills list on left + Live entire details on right"
                      >
                        📑 Live Details Split
                      </button>
                      <button
                        type="button"
                        className={`wt-search-mode-tab ${searchViewMode === "cards" ? "active" : ""}`}
                        onClick={() => setSearchViewMode("cards")}
                        title="Card view: Full cards for each match"
                      >
                        📋 Full Cards
                      </button>
                    </div>
                    <span className="wt-search-dropdown-hint">Esc to close</span>
                  </div>
                </div>

                {filteredBills.length === 0 ? (
                  <div className="wt-search-no-results">
                    <p>No bills matching "<strong>{billSearchQuery}</strong>"</p>
                    <span className="wt-search-no-sub">Try searching by ID (e.g. BILL-1001), client (BBMP), contractor, or work order</span>
                  </div>
                ) : searchViewMode === "split" ? (
                  <div className="wt-search-console-layout">
                    {/* Left Column: Bills List */}
                    <div className="wt-search-list-pane">
                      {filteredBills.map((b, idx) => {
                        const isSelected = b.id === bill.id;
                        const isHighlighted = (activeHighlightedBill && activeHighlightedBill.id === b.id) || (!activeHighlightedBill && idx === 0);
                        const bTracking = calculateWorkflowTracking(b);

                        return (
                          <div
                            key={b.id}
                            className={`wt-search-item ${isSelected ? "active-bill" : ""} ${isHighlighted ? "highlighted" : ""}`}
                            onClick={() => handleSelectBill(b.id)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                          >
                            <div className="wt-search-item-top">
                              <span className="wt-search-item-id">{b.id}</span>
                              <span className="wt-search-item-client">{b.client || "BBMP"}</span>
                              {isSelected && <span className="wt-search-item-current-badge">Active</span>}
                              {bTracking && (
                                <span className={`wt-sla-chip ${bTracking.slaStatus.toLowerCase()}`} style={{ fontSize: "9px", padding: "1px 5px" }}>
                                  {bTracking.slaStatus === "BREACHED_SLA" ? "🔴 Breached" :
                                   bTracking.slaStatus === "APPROACHING_SLA" ? "🟠 Warning" :
                                   "🟢 In SLA"}
                                </span>
                              )}

                            </div>
                            <div className="wt-search-item-project">
                              {b.projectName}
                            </div>
                            <div className="wt-search-item-meta" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span>Step {b.currentStep || 1} of {b.totalSteps || b.stages?.length || 15}</span>
                              <span style={{ fontSize: "10.5px", color: "var(--accent-primary)", fontWeight: 700 }}>
                                View Entire Details ›
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Column: Live Entire Details Dossier Pane */}
                    {activeHighlightedBill && highlightedTracking && (
                      <div className="wt-search-live-dossier">
                        {/* Dossier Top Header */}
                        <div className="wt-search-dossier-top">
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                              <span className="id-code" style={{ fontSize: "15px", fontWeight: 800 }}>
                                {activeHighlightedBill.id}
                              </span>
                              <span className="client-badge-sm">{activeHighlightedBill.client || "BBMP"}</span>
                              <span className="status-pill status-under_review" style={{ fontSize: "10px" }}>
                                {activeHighlightedBill.workflowStatus || "UNDER_REVIEW"}
                              </span>
                              <span className={`wt-sla-chip ${highlightedTracking.slaStatus.toLowerCase()}`} style={{ fontSize: "10px" }}>
                                {highlightedTracking.slaStatus === "BREACHED_SLA" ? "🔴 BREACHED SLA" :
                                 highlightedTracking.slaStatus === "APPROACHING_SLA" ? "🟠 APPROACHING SLA" :
                                 "🟢 WITHIN SLA"}
                              </span>
                            </div>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                              {activeHighlightedBill.projectName}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              Step {highlightedTracking.currentStage.step} of {highlightedTracking.totalStages}
                            </div>
                          </div>
                        </div>

                        {/* SECTION 1: MANDATED 15 PROPOSED INFORMATION FIELDS */}
                        <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--accent-primary)" }}>
                          📋 Mandated 15 Statutory Fields (Section 5)
                        </div>
                        <div className="wt-search-dossier-grid">
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">1. Bill ID</span>
                            <span className="wt-search-dossier-field-value id-code">{activeHighlightedBill.id}</span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">2. Bill Number</span>
                            <span className="wt-search-dossier-field-value">{activeHighlightedBill.billNumber || activeHighlightedBill.id}</span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">3. Client & 4. Unit</span>
                            <span className="wt-search-dossier-field-value">{activeHighlightedBill.client || "BBMP"} • {activeHighlightedBill.unit || activeHighlightedBill.ward || "Lakes"}</span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">5. Work Order</span>
                            <span className="wt-search-dossier-field-value font-mono">{activeHighlightedBill.workOrder || "WO/BBMP/2026/4102"}</span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">6. Contract #</span>
                            <span className="wt-search-dossier-field-value font-mono">{activeHighlightedBill.contract || "CNT-2025-BBMP-LAK-088"}</span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">7. Billing Period</span>
                            <span className="wt-search-dossier-field-value">{activeHighlightedBill.billingPeriod || "Current RA Period"}</span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">8. Billing Type</span>
                            <span className="wt-search-dossier-field-value">{activeHighlightedBill.billingType || "Monthly RA Bill"}</span>
                          </div>

                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">10. Submission Date</span>
                            <span className="wt-search-dossier-field-value">{formatStageDate(activeHighlightedBill.submissionDate)}</span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">11. Expected Payment</span>
                            <span className="wt-search-dossier-field-value">{activeHighlightedBill.expectedPaymentDate ? formatStageDate(activeHighlightedBill.expectedPaymentDate) : "Post-Audit Clearance"}</span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">12. Current Stage</span>
                            <span className="wt-search-dossier-field-value" style={{ color: "var(--accent-primary)" }}>
                              Step {highlightedTracking.currentStage.step}: {highlightedTracking.currentStage.name}
                            </span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">13. Responsible Officer</span>
                            <span className="wt-search-dossier-field-value">{activeHighlightedBill.currentPerson || "Assigned"} ({highlightedTracking.currentStage.role})</span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">14. Status</span>
                            <span className="wt-search-dossier-field-value">{activeHighlightedBill.workflowStatus || "UNDER_REVIEW"}</span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">15. Payment Status</span>
                            <span className="wt-search-dossier-field-value font-bold">{activeHighlightedBill.paymentStatus || "UNPAID"}</span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">MB Number</span>
                            <span className="wt-search-dossier-field-value font-mono">{activeHighlightedBill.mbNumber || "MB-2026/042-A"}</span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">Contractor</span>
                            <span className="wt-search-dossier-field-value">{activeHighlightedBill.contractor || "State Works Contractor"}</span>
                          </div>
                        </div>

                        {/* SECTION 2: 8 MANDATED WORKFLOW TRACKING CRITERIA */}
                        <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: "#7c3aed", marginTop: "4px" }}>
                          🛤️ 6. Workflow Tracking (8 Mandated Criteria)
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px" }}>
                          <div className="wt-search-dossier-field" style={{ background: "rgba(16,185,129,0.06)" }}>
                            <span className="wt-search-dossier-field-label">1. Completed Stages</span>
                            <span className="wt-search-dossier-field-value text-emerald">{highlightedTracking.completedStagesCount} / {highlightedTracking.totalStages} stages cleared</span>
                          </div>
                          <div className="wt-search-dossier-field" style={{ background: "rgba(37,99,235,0.06)" }}>
                            <span className="wt-search-dossier-field-label">2. Current Stage</span>
                            <span className="wt-search-dossier-field-value text-primary">Step {highlightedTracking.currentStage.step}: {highlightedTracking.currentStage.name}</span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">3. Pending Stage</span>
                            <span className="wt-search-dossier-field-value text-amber">{highlightedTracking.pendingStage.name} ({highlightedTracking.pendingStagesCount} left)</span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">4. Date Entered</span>
                            <span className="wt-search-dossier-field-value">{formatStageDate(highlightedTracking.dateEnteredIntoStage)}</span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">5. Days Pending</span>
                            <span className="wt-search-dossier-field-value" style={{ color: highlightedTracking.daysPending > highlightedTracking.stageSlaDays ? "#dc2626" : "inherit" }}>
                              {highlightedTracking.daysPending} Days dwell
                            </span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">6. Turnaround SLA</span>
                            <span className="wt-search-dossier-field-value">{highlightedTracking.stageSlaDays} Days Mandated</span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">7. SLA Status</span>
                            <span className="wt-search-dossier-field-value">{highlightedTracking.slaStatus} ({highlightedTracking.slaPercentageConsumed}% consumed)</span>
                          </div>
                          <div className="wt-search-dossier-field">
                            <span className="wt-search-dossier-field-label">8. Next Stage</span>
                            <span className="wt-search-dossier-field-value">{highlightedTracking.nextStage ? `Step ${highlightedTracking.nextStage.step}: ${highlightedTracking.nextStage.name}` : "Payment Disbursed"}</span>
                          </div>
                        </div>

                        {/* Macro 5-Phase Journey Strip */}
                        <div className="wt-reg-journey-bar" style={{ padding: "6px 10px", margin: "2px 0" }}>
                          {highlightedTracking.journeyPhases.map((ph, pIdx) => {
                            const isDone = ph.status === "COMPLETED";
                            const isCur = ph.status === "CURRENT";
                            return (
                              <React.Fragment key={ph.id}>
                                <div className={`wt-reg-journey-step ${isDone ? "completed" : isCur ? "active" : "pending"}`} style={{ fontSize: "10px", padding: "2px 6px" }}>
                                  <span>{ph.icon}</span>
                                  <span>{ph.shortLabel || ph.label}</span>
                                  {isDone && <span>✓</span>}
                                  {isCur && <span>●</span>}
                                </div>
                                {pIdx < highlightedTracking.journeyPhases.length - 1 && (
                                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>➔</span>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        {/* Action Toolbar */}
                        <div className="wt-search-dossier-actions">
                          <button
                            type="button"
                            className="custom-btn-primary"
                            onClick={() => handleSelectBill(activeHighlightedBill.id)}
                            style={{ fontSize: "12px", padding: "6px 14px", display: "flex", alignItems: "center", gap: "6px" }}
                          >
                            <span>🎯</span>
                            <span>Load & Track in Workflow Engine</span>
                          </button>
                          <button
                            type="button"
                            className="custom-btn-secondary"
                            onClick={() => {
                              setModalBill(activeHighlightedBill);
                              setIsSearchOpen(false);
                            }}
                            style={{ fontSize: "12px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}
                          >
                            <span>🔍</span>
                            <span>Open Entire Details Modal</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Full Cards View */
                  <div className="wt-search-results-list" style={{ maxHeight: "460px" }}>
                    {filteredBills.map((b) => {
                      const bTracking = calculateWorkflowTracking(b);
                      const isSelected = b.id === bill.id;
                      return (
                        <div key={b.id} className="wt-dossier-card" style={{ marginBottom: "12px", border: isSelected ? "2px solid var(--accent-primary)" : "1px solid var(--border-light)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <span className="id-code" style={{ fontSize: "14px", fontWeight: 800 }}>{b.id}</span>
                                <span className="client-badge-sm">{b.client || "BBMP"}</span>
                                <span className="status-pill status-under_review" style={{ fontSize: "10px" }}>{b.workflowStatus || "UNDER_REVIEW"}</span>
                                {bTracking && (
                                  <span className={`wt-sla-chip ${bTracking.slaStatus.toLowerCase()}`} style={{ fontSize: "9.5px" }}>
                                    {bTracking.slaStatus === "BREACHED_SLA" ? "🔴 BREACHED" : bTracking.slaStatus === "APPROACHING_SLA" ? "🟠 WARNING" : "🟢 WITHIN SLA"}
                                  </span>
                                )}
                              </div>
                              <h4 style={{ margin: "4px 0 0 0", fontSize: "13px", fontWeight: 700 }}>{b.projectName}</h4>
                            </div>

                          </div>

                          {/* 15 Fields Grid inside Card */}
                          <div className="wt-search-dossier-grid" style={{ marginBottom: "10px" }}>
                            <div className="wt-search-dossier-field">
                              <span className="wt-search-dossier-field-label">Bill / WO</span>
                              <span className="wt-search-dossier-field-value">{b.billNumber || b.id} • {b.workOrder || "WO/BBMP/2026/4102"}</span>
                            </div>
                            <div className="wt-search-dossier-field">
                              <span className="wt-search-dossier-field-label">Contract / MB #</span>
                              <span className="wt-search-dossier-field-value">{b.contract || "CNT-2025"} • {b.mbNumber || "MB-2026/042-A"}</span>
                            </div>
                            <div className="wt-search-dossier-field">
                              <span className="wt-search-dossier-field-label">Billing Period & Type</span>
                              <span className="wt-search-dossier-field-value">{b.billingPeriod || "Current RA"} • {b.billingType || "Monthly RA"}</span>
                            </div>
                            <div className="wt-search-dossier-field">
                              <span className="wt-search-dossier-field-label">Current Stage & Officer</span>
                              <span className="wt-search-dossier-field-value text-primary">Step {b.currentStep || 1}: {b.currentStageName || b.currentStage} ({b.currentRole || "Officer"})</span>
                            </div>
                            <div className="wt-search-dossier-field">
                              <span className="wt-search-dossier-field-label">Submission & Expected Payment</span>
                              <span className="wt-search-dossier-field-value">{formatStageDate(b.submissionDate)} • {b.expectedPaymentDate ? formatStageDate(b.expectedPaymentDate) : "Post-Audit"}</span>
                            </div>
                            <div className="wt-search-dossier-field">
                              <span className="wt-search-dossier-field-label">Contractor & Unit</span>
                              <span className="wt-search-dossier-field-value">{b.contractor || "Contractor"} • {b.unit || b.ward || "Lakes"}</span>
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <button
                              type="button"
                              className="custom-btn-secondary"
                              style={{ fontSize: "11px", padding: "4px 10px" }}
                              onClick={() => {
                                setModalBill(b);
                                setIsSearchOpen(false);
                              }}
                            >
                              🔍 Fullscreen Modal
                            </button>
                            <button
                              type="button"
                              className="custom-btn-primary"
                              style={{ fontSize: "11px", padding: "4px 12px" }}
                              onClick={() => handleSelectBill(b.id)}
                            >
                              🎯 Track in Bill Tracker
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bill Identifier Capsule */}
          <div className="wt-bill-capsule">
            <span className="wt-bill-id" onClick={handleCopyId} title="Click to copy unique Bill ID">
              {bill.id}
            </span>
            <button
              type="button"
              className="btn-copy-chip"
              onClick={handleCopyId}
              title="Copy Bill ID"
            >
              {copiedBillId ? "✓" : "📋"}
            </button>
            <span className="wt-client-chip">{bill.client || "BBMP"}</span>
          </div>

          {/* Entire Details Quick Trigger Button */}
          <button
            type="button"
            className="btn-wt-toggle"
            onClick={() => setModalBill(bill)}
            title="Inspect 100% entire details of this bill docket in full-screen modal"
            style={{ display: "flex", alignItems: "center", gap: "5px" }}
          >
            <span>📑</span>
            <span>Entire Details</span>
          </button>

          {/* Quick Switcher dropdown if available */}
          {billsList.length > 1 && onSwitchBill && (
            <select
              className="wt-quick-switcher"
              value={bill.id}
              onChange={(e) => onSwitchBill(e.target.value)}
              title="Switch bill docket"
            >
              {billsList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} — {b.projectName?.slice(0, 20)}…
                </option>
              ))}
            </select>
          )}

          {/* View Mode Toggle */}
          <button
            type="button"
            className={`btn-wt-toggle ${showMatrixView ? "active" : ""}`}
            onClick={() => setShowMatrixView((prev) => !prev)}
            title="Toggle between Interactive Stepper & Structured Matrix"
          >
            {showMatrixView ? "📈 Visual Stepper" : "📑 Full Stage Matrix"}
          </button>
        </div>
      </div>

      {/* ============================================================
          ON-PAGE EXPANDABLE ENTIRE DETAILS DOSSIER CARD
          Shows all 15 Mandated Fields and 8 Statutory Criteria right on page
          ============================================================ */}
      <div className="wt-page-dossier-card">
        <div
          className="wt-page-dossier-header"
          onClick={() => setShowPageEntireDetails((prev) => !prev)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "16px" }}>📑</span>
            <strong style={{ fontSize: "13.5px", color: "var(--text-primary)" }}>
              Bill Docket Entire Details: <span className="id-code">{bill.id}</span>
            </strong>
            <span className="client-badge-sm">{bill.client || "BBMP"}</span>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{bill.projectName}</span>
            {searchLoadedBillId === bill.id && (
              <span className="wt-pilot-badge" style={{ fontSize: "10px", padding: "2px 6px" }}>
                🔍 Active Search Target
              </span>
            )}
            <span className="status-pill status-under_review" style={{ fontSize: "10.5px" }}>
              {bill.workflowStatus || "UNDER_REVIEW"}
            </span>
            <span className={`wt-sla-chip ${tracking.slaStatus.toLowerCase()}`} style={{ fontSize: "10px" }}>
              {tracking.slaStatus === "BREACHED_SLA" ? "🔴 BREACHED SLA" :
               tracking.slaStatus === "APPROACHING_SLA" ? "🟠 APPROACHING SLA" :
               "🟢 WITHIN SLA"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className="custom-btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                setModalBill(bill);
              }}
              style={{ fontSize: "11px", padding: "4px 9px" }}
              title="Open full-screen modal with export and print"
            >
              🔍 Fullscreen Modal
            </button>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-primary)" }}>
              {showPageEntireDetails ? "▲ Hide Entire Details" : "▼ Show Entire Details (15 Fields + 8 Criteria)"}
            </span>
          </div>
        </div>

        {showPageEntireDetails && (
          <div className="wt-page-dossier-body">
            {/* 15 Proposed Information Fields Grid */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--accent-primary)", marginBottom: "8px" }}>
                Section 5: Mandated 15 Proposed Information Fields
              </div>
              <div className="wt-dossier-grid">
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">1. Bill ID</span>
                  <span className="wt-dossier-value id-code">{bill.id}</span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">2. Bill Number</span>
                  <span className="wt-dossier-value">{bill.billNumber || bill.id}</span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">3. Client</span>
                  <span className="wt-dossier-value"><span className="client-badge-sm">{bill.client || "BBMP"}</span></span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">4. Unit / Division</span>
                  <span className="wt-dossier-value">{bill.unit || bill.ward || "Lakes Division"}</span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">5. Work Order</span>
                  <span className="wt-dossier-value font-mono">{bill.workOrder || bill.workOrderNo || "WO/BBMP/2026/4102"}</span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">6. Contract #</span>
                  <span className="wt-dossier-value font-mono">{bill.contract || bill.contractNo || "CNT-2025-BBMP-LAK-088"}</span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">7. Billing Period</span>
                  <span className="wt-dossier-value">{bill.billingPeriod || "01 Oct 2026 – 31 Oct 2026"}</span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">8. Billing Type</span>
                  <span className="wt-dossier-value">{bill.billingType || "Monthly Running Account (RA) Bill"}</span>
                </div>

                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">10. Submission Date</span>
                  <span className="wt-dossier-value">{formatStageDate(bill.submissionDate)}</span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">11. Expected Payment</span>
                  <span className="wt-dossier-value">{bill.expectedPaymentDate ? formatStageDate(bill.expectedPaymentDate) : "Post-Audit Verification"}</span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">12. Current Stage</span>
                  <span className="wt-dossier-value" style={{ color: "var(--accent-primary)" }}>Step {currentStage.step}: {currentStage.name}</span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">13. Responsible Authority</span>
                  <span className="wt-dossier-value">{bill.currentPerson || "Assigned Officer"} ({currentStage.role})</span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">14. Overall Status</span>
                  <span className="wt-dossier-value">{bill.workflowStatus || "UNDER_REVIEW"}</span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">15. Payment Status</span>
                  <span className="wt-dossier-value">{bill.paymentStatus || "UNPAID"}</span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">MB Number & Contractor</span>
                  <span className="wt-dossier-value">{bill.mbNumber || "MB-2026/042-A"} • {bill.contractor || "Contractor"}</span>
                </div>
              </div>
            </div>

            {/* 8 Mandated Workflow Tracking Criteria Grid */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: "#7c3aed", marginBottom: "8px" }}>
                6. Mandated Workflow Tracking Parameters (8 Statutory Criteria)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
                <div className="wt-dossier-field" style={{ background: "rgba(16,185,129,0.06)" }}>
                  <span className="wt-dossier-label">1. Completed Stages</span>
                  <span className="wt-dossier-value text-emerald">{completedStagesCount} / {totalStages} Cleared</span>
                </div>
                <div className="wt-dossier-field" style={{ background: "rgba(37,99,235,0.06)" }}>
                  <span className="wt-dossier-label">2. Current Stage</span>
                  <span className="wt-dossier-value">Step {currentStage.step}: {currentStage.name}</span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">3. Pending Stage</span>
                  <span className="wt-dossier-value text-amber">{pendingStage.name} ({pendingStagesCount} Queued)</span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">4. Date Entered</span>
                  <span className="wt-dossier-value">{formatStageDate(dateEnteredIntoStage)}</span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">5. Days Pending</span>
                  <span className="wt-dossier-value" style={{ color: daysPending > stageSlaDays ? "#dc2626" : "inherit" }}>
                    {daysPending} Days dwell
                  </span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">6. Turnaround SLA</span>
                  <span className="wt-dossier-value">{stageSlaDays} Days Mandated</span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">7. SLA Status</span>
                  <span className="wt-dossier-value">{slaStatus} ({slaPercentageConsumed}%)</span>
                </div>
                <div className="wt-dossier-field">
                  <span className="wt-dossier-label">8. Next Stage</span>
                  <span className="wt-dossier-value">{nextStage ? `Step ${nextStage.step}: ${nextStage.name}` : "Payment Disbursed"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          SECTION 1: THE 5 CANONICAL MACRO-JOURNEY PHASES
          Submission → Approval stages → Finance → Audit, where applicable → Payment
          ============================================================ */}
      <div className="wt-macro-journey-wrapper">
        <div className="wt-macro-journey-label">
          <span>COMPLETE 5-PHASE STATUTORY JOURNEY</span>
          <span className="wt-filter-hint">
            {selectedPhaseFilter !== "ALL" ? (
              <button
                type="button"
                className="btn-reset-filter"
                onClick={() => setSelectedPhaseFilter("ALL")}
              >
                Reset Filter (Showing {selectedPhaseFilter}) ✕
              </button>
            ) : (
              "Click any phase to filter stages below"
            )}
          </span>
        </div>

        <div className="wt-macro-phases-ribbon">
          {journeyPhases.map((phase, idx) => {
            const isSelected = selectedPhaseFilter === phase.id;
            const isAudit = phase.id === "audit";

            let stateClass = "pending";
            if (!phase.isApplicable) stateClass = "na";
            else if (phase.status === "COMPLETED") stateClass = "completed";
            else if (phase.status === "CURRENT") stateClass = "active";

            return (
              <React.Fragment key={phase.id}>
                <div
                  className={`wt-phase-card ${stateClass} ${isSelected ? "selected-filter" : ""}`}
                  onClick={() => {
                    setSelectedPhaseFilter((prev) => (prev === phase.id ? "ALL" : phase.id));
                  }}
                  role="button"
                  tabIndex={0}
                  title={`${phase.label} (${phase.completedCount}/${phase.totalCount} completed)`}
                >
                  <div className="wt-phase-card-top">
                    <span className="wt-phase-num">0{idx + 1}</span>
                    <span className="wt-phase-icon">{phase.icon}</span>
                    <span className={`wt-phase-pill ${stateClass}`}>
                      {phase.statusLabel}
                    </span>
                  </div>

                  <div className="wt-phase-title">{phase.label}</div>

                  <div className="wt-phase-meta">
                    {phase.isApplicable ? (
                      <span>
                        <strong>{phase.completedCount}</strong> of <strong>{phase.totalCount}</strong> stages
                      </span>
                    ) : (
                      <span className="text-muted">Not applicable for this workflow</span>
                    )}
                  </div>

                  {phase.isApplicable && (
                    <div className="wt-phase-mini-progress">
                      <div
                        className="wt-phase-mini-fill"
                        style={{
                          width: `${phase.totalCount > 0 ? (phase.completedCount / phase.totalCount) * 100 : 0}%`,
                          backgroundColor: phase.color
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Arrow connector between stages */}
                {idx < journeyPhases.length - 1 && (
                  <div className={`wt-phase-arrow ${journeyPhases[idx + 1].status !== "PENDING" ? "arrow-passed" : ""}`}>
                    <span>➔</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          SECTION 2: MANDATED 8-CRITERIA TRACKING HUD
          1. Completed stages
          2. Current stage
          3. Pending stage
          4. Date entered into stage
          5. Days pending
          6. SLA
          7. SLA status
          8. Next stage
          ============================================================ */}
      <div className="wt-hud-container">
        <div className="wt-hud-header">
          <span className="wt-hud-title">⚡ STATUTORY TRACKING DASHBOARD (8 MANDATED CRITERIA)</span>
          <span className="wt-hud-progress-label">
            Overall Completion: <strong>{progressPercentage}%</strong> ({completedStagesCount}/{totalStages} stages cleared)
          </span>
        </div>

        <div className="wt-hud-grid">
          {/* CRITERION 1: COMPLETED STAGES */}
          <div
            className="wt-hud-card hud-completed"
            onClick={() => setShowCompletedModal(true)}
            role="button"
            tabIndex={0}
            title="Click to view full list of cleared and verified stages"
          >
            <div className="wt-hud-card-label">
              <span>1. COMPLETED STAGES</span>
              <span className="wt-badge-view-link">View List ↗</span>
            </div>
            <div className="wt-hud-metric-row">
              <span className="wt-hud-metric-large text-emerald">
                {completedStagesCount}
              </span>
              <span className="wt-hud-metric-sub">/ {totalStages} cleared</span>
            </div>
            <div className="wt-hud-detail-snippet">
              {completedStagesCount > 0 ? (
                <span>Last: <strong>{completedStages[completedStagesCount - 1]?.name}</strong></span>
              ) : (
                <span className="text-muted">Initial submission stage</span>
              )}
            </div>
          </div>

          {/* CRITERION 2: CURRENT STAGE */}
          <div className="wt-hud-card hud-current">
            <div className="wt-hud-card-label">
              <span>2. CURRENT STAGE</span>
              <span className="wt-live-indicator">● ACTIVE</span>
            </div>
            <div className="wt-hud-stage-name">
              Step {currentStage.step}: <strong>{currentStage.name}</strong>
            </div>
            <div className="wt-hud-detail-snippet">
              <span>Authority: <strong style={{ color: "var(--accent-primary)" }}>{currentStage.role}</strong></span>
              {currentStage.person && <span> • {currentStage.person}</span>}
            </div>
          </div>

          {/* CRITERION 3: PENDING STAGE */}
          <div className="wt-hud-card hud-pending">
            <div className="wt-hud-card-label">
              <span>3. PENDING STAGE</span>
              <span className="wt-pending-pill">Awaiting Clearance</span>
            </div>
            <div className="wt-hud-stage-name" style={{ color: "#d97706" }}>
              {pendingStage.name}
            </div>
            <div className="wt-hud-detail-snippet">
              <span>
                <strong>{pendingStagesCount}</strong> total stage{pendingStagesCount === 1 ? "" : "s"} in pipeline
              </span>
            </div>
          </div>

          {/* CRITERION 4: DATE ENTERED INTO STAGE */}
          <div className="wt-hud-card hud-entered">
            <div className="wt-hud-card-label">
              <span>4. DATE ENTERED INTO STAGE</span>
              <span>📅</span>
            </div>
            <div className="wt-hud-metric-date">
              {formatStageDate(dateEnteredIntoStage)}
            </div>
            <div className="wt-hud-detail-snippet">
              <span>
                Entered <strong>{daysPending}</strong> day{daysPending === 1 ? "" : "s"} ago
              </span>
            </div>
          </div>

          {/* CRITERION 5: DAYS PENDING */}
          <div className={`wt-hud-card hud-days ${daysPending > stageSlaDays ? "hud-breached" : ""}`}>
            <div className="wt-hud-card-label">
              <span>5. DAYS PENDING</span>
              <span>⏱️</span>
            </div>
            <div className="wt-hud-metric-row">
              <span className={`wt-hud-metric-large ${daysPending > stageSlaDays ? "text-red" : daysPending >= stageSlaDays * 0.75 ? "text-amber" : "text-emerald"}`}>
                {daysPending}
              </span>
              <span className="wt-hud-metric-sub">Days dwell time</span>
            </div>
            <div className="wt-hud-detail-snippet">
              <span>Benchmark limit: {stageSlaDays} days</span>
            </div>
          </div>

          {/* CRITERION 6: SLA (TURNAROUND TIME) */}
          <div className="wt-hud-card hud-sla">
            <div className="wt-hud-card-label">
              <span>6. SLA (ALLOWANCE)</span>
              <span>🛡️</span>
            </div>
            <div className="wt-hud-metric-row">
              <span className="wt-hud-metric-large" style={{ color: "var(--accent-primary)" }}>
                {stageSlaDays}d
              </span>
              <span className="wt-hud-metric-sub">({stageSlaDays * 24} Hours)</span>
            </div>
            <div className="wt-hud-detail-snippet">
              <span>Statutory Turnaround Limit</span>
            </div>
          </div>

          {/* CRITERION 7: SLA STATUS */}
          <div className={`wt-hud-card hud-sla-status ${slaStatus.toLowerCase()}`}>
            <div className="wt-hud-card-label">
              <span>7. SLA STATUS</span>
              <span>⚡</span>
            </div>
            <div className="wt-sla-status-badge-wrapper">
              <span className={`wt-sla-chip ${slaStatus.toLowerCase()}`}>
                {slaStatus === "BREACHED_SLA" ? "🔴 BREACHED SLA" :
                 slaStatus === "APPROACHING_SLA" ? "🟠 APPROACHING SLA" :
                 "🟢 WITHIN SLA"}
              </span>
            </div>
            <div className="wt-sla-bar-container">
              <div
                className={`wt-sla-bar-fill ${slaStatus.toLowerCase()}`}
                style={{ width: `${Math.min(100, slaPercentageConsumed)}%` }}
              />
            </div>
            <div className="wt-hud-detail-snippet">
              <span>{slaPercentageConsumed}% of stage SLA consumed</span>
            </div>
          </div>

          {/* CRITERION 8: NEXT STAGE */}
          <div className="wt-hud-card hud-next">
            <div className="wt-hud-card-label">
              <span>8. NEXT STAGE</span>
              <span>⏭️</span>
            </div>
            <div className="wt-hud-stage-name" style={{ color: "var(--accent-primary)" }}>
              {nextStage ? (
                <>Step {nextStage.step}: <strong>{nextStage.name}</strong></>
              ) : (
                <strong>Final Payment Disbursed</strong>
              )}
            </div>
            <div className="wt-hud-detail-snippet">
              {nextStage ? (
                <span>Next Authority: <strong>{nextStage.role}</strong> ({nextStage.slaDays}d SLA)</span>
              ) : (
                <span className="text-emerald">Bill lifecycle fully cleared</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 3: INTERACTIVE PROGRESSION TRACK (STEPPER)
          OR STRUCTURED STAGES MATRIX WITH DEDICATED SEARCH FILTER
          ============================================================ */}
      <div className="wt-stage-search-container">
        <div className="wt-stage-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="wt-stage-search-input"
            placeholder="Search stages by name, authority, or checkpoint (e.g., Audit, Chief Engineer, Finance)..."
            value={stageSearchQuery}
            onChange={(e) => setStageSearchQuery(e.target.value)}
            title="Search stages within this workflow"
          />
          {stageSearchQuery && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => setStageSearchQuery("")}
              title="Clear stage search"
              style={{ padding: "0 4px", fontSize: "11px" }}
            >
              ✕
            </button>
          )}
        </div>
        <div className="wt-stage-search-count">
          Showing <strong>{displayedStages.length}</strong> of <strong>{totalStages}</strong> stages
          {stageSearchQuery && (
            <span style={{ color: "var(--accent-primary)", marginLeft: "6px" }}>
              (Filtered by "{stageSearchQuery}")
            </span>
          )}
        </div>
      </div>

      {!showMatrixView ? (
        <div className="wt-stepper-container">
          <div className="wt-stepper-header">
            <div>
              <h3 className="wt-stepper-title">Sequential Stage Progression Tracker</h3>
              <p className="wt-stepper-desc">
                Click any stage node to inspect verified documents, checklist items, and audit entries.
              </p>
            </div>

            {/* Quick Action to Approve & Transition Step */}
            {currentStage.step < totalStages && onTransitionStep && (
              <button
                type="button"
                className="btn-wt-advance"
                disabled={saving}
                onClick={() => onTransitionStep(currentStage.step + 1)}
                title={`Approve Step ${currentStage.step} and advance to Step ${currentStage.step + 1}`}
              >
                {saving ? "Authorizing…" : `✓ Approve & Advance to Step ${currentStage.step + 1}`}
              </button>
            )}
          </div>

          {/* Stepper Node Ribbon */}
          <div className="wt-timeline-scroll">
            <div className="timeline">
              {displayedStages.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", width: "100%" }}>
                  <p style={{ margin: "0 0 6px 0" }}>No stages match search "<strong>{stageSearchQuery}</strong>".</p>
                  <button
                    type="button"
                    className="btn-reset-filter"
                    onClick={() => setStageSearchQuery("")}
                  >
                    Clear Stage Filter ✕
                  </button>
                </div>
              ) : (
                displayedStages.map(({ name: stageName, step }) => {
                  const isCompleted = step < currentStage.step;
                  const isActive = step === currentStage.step;
                  const isUpcoming = step > currentStage.step;
                  const phase = CANONICAL_JOURNEY_PHASES.find(
                    (p) => p.stages?.some((s) => s.step === step)
                  );

                  return (
                    <button
                      key={stageName + step}
                      type="button"
                      className={`node ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""} ${
                        isUpcoming ? "upcoming" : ""
                      }`}
                      onClick={() => onStepClick && onStepClick(step)}
                      title={`Click to view operational protocol & checklist for Step ${step}: ${stageName}`}
                    >
                      <span className="line" />
                      <span className="dot">
                        {isCompleted ? <span className="tick-anim">✓</span> : step}
                      </span>
                      <span className="stage-no">STEP {step}</span>
                      <span className="stage-title">{stageName}</span>
                      {isCompleted ? (
                        <span className="passed-label">PASSED ✓</span>
                      ) : isActive ? (
                        <span className="current-label">CURRENT</span>
                      ) : (
                        <span className="pending-label">PENDING</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* STRUCTURED STAGE MATRIX TABLE */
        <div className="wt-matrix-container">
          <div className="wt-matrix-header">
            <h4>Stage Audit & Parameter Matrix (All {totalStages} Stages)</h4>
            <span className="badge-unique-rule">Statutory Traceability</span>
          </div>

          <div className="table-responsive">
            <table className="custom-table wt-matrix-table">
              <thead>
                <tr>
                  <th>Step #</th>
                  <th>Canonical Phase</th>
                  <th>Stage Name</th>
                  <th>Assigned Authority</th>
                  <th>Status</th>
                  <th>SLA</th>
                  <th>Dwell / Timestamp</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedStages.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                      No stages match search "<strong>{stageSearchQuery}</strong>".
                      <button
                        type="button"
                        className="btn-reset-filter"
                        style={{ marginLeft: "8px" }}
                        onClick={() => setStageSearchQuery("")}
                      >
                        Clear Filter ✕
                      </button>
                    </td>
                  </tr>
                ) : (
                  displayedStages.map(({ name: stName, step: stepNum }) => {
                    const isCompleted = stepNum < currentStage.step;
                    const isActive = stepNum === currentStage.step;
                    const phaseInfo = CANONICAL_JOURNEY_PHASES.find((p) =>
                      p.stages?.some((s) => s.step === stepNum)
                    );
                    const hist = (bill.history || []).find((h) => h.step === stepNum);

                    return (
                      <tr
                        key={stepNum}
                        className={isActive ? "wt-row-active" : isCompleted ? "wt-row-completed" : ""}
                        onClick={() => onStepClick && onStepClick(stepNum)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <strong className="id-code">Step {stepNum}</strong>
                        </td>
                        <td>
                          <span className="wt-table-phase-chip">
                            {phaseInfo?.icon || "📋"} {phaseInfo?.label || "Approval"}
                          </span>
                        </td>
                        <td>
                          <strong>{stName}</strong>
                        </td>
                        <td>
                          <div style={{ fontSize: "12.5px" }}>
                            {hist?.performedBy || (isActive ? currentStage.role : "Reviewing Officer")}
                          </div>
                        </td>
                        <td>
                          {isCompleted ? (
                            <span className="status-pill status-paid">✓ Passed</span>
                          ) : isActive ? (
                            <span className="status-pill status-under_review">● Active</span>
                          ) : (
                            <span className="status-pill status-closed">⏳ Pending</span>
                          )}
                        </td>
                        <td>
                          <span className="sla-days-badge">{stageSlaDays}d</span>
                        </td>
                        <td>
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                            {isCompleted && hist?.savedAt
                              ? formatStageDate(hist.savedAt)
                              : isActive
                              ? `${daysPending} days in stage`
                              : "Queued"}
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-tbl-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onStepClick) onStepClick(stepNum);
                            }}
                          >
                            🔍 Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: COMPLETED STAGES DRILL-DOWN MODAL
          ============================================================ */}
      {showCompletedModal && (
        <div className="custom-modal-backdrop" onClick={() => setShowCompletedModal(false)}>
          <div
            className="custom-modal-card"
            style={{ maxWidth: "680px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="custom-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>✅</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>
                    1. Completed Stages Log ({completedStagesCount} Stages Cleared)
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Bill: {bill.id} • {bill.projectName}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="custom-modal-close"
                onClick={() => setShowCompletedModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="custom-modal-body" style={{ maxHeight: "60vh", overflowY: "auto", padding: "16px 20px" }}>
              {completedStages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                  <p>Bill is currently in its initial submission stage. No stages completed yet.</p>
                </div>
              ) : (
                <div className="wt-completed-list">
                  {completedStages.map((cs) => (
                    <div key={cs.step} className="wt-completed-item">
                      <div className="wt-completed-dot">✓</div>
                      <div className="wt-completed-info">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong>Step {cs.step}: {cs.name}</strong>
                          <span className="wt-phase-tag">{cs.phaseIcon} {cs.phaseLabel}</span>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px" }}>
                          Authorized by: <strong>{cs.authorizedBy}</strong>
                          {cs.completedAt && <span> • {formatStageDate(cs.completedAt)}</span>}
                        </div>
                        <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Action: {cs.action}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="custom-modal-footer">
              <button
                type="button"
                className="custom-btn-secondary"
                onClick={() => setShowCompletedModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
