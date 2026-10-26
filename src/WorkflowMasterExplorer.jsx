import React, { useState, useEffect, useMemo, useCallback } from "react";
import { WORKFLOW_CATALOG as FALLBACK_CATALOG, WORKFLOW_CATEGORIES as STATIC_CATEGORIES, WORKFLOW_METRICS } from "./workflowMasterData";
import WorkflowEditorModal from "./WorkflowEditorModal";

export default function WorkflowMasterExplorer({ user, fetchWithAuth, onSelectPilotBill, onToast }) {
  const [workflowsList, setWorkflowsList] = useState(FALLBACK_CATALOG);
  const [categoriesList, setCategoriesList] = useState(STATIC_CATEGORIES);
  const [mastersData, setMastersData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("WF-01-BBMP-LAKES");
  const [workflowEditorTarget, setWorkflowEditorTarget] = useState(null); // null, "NEW", or workflow object
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    if (onToast) onToast(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const loadWorkflowsAndMasters = useCallback(async () => {
    setLoading(true);
    try {
      const authFetch = fetchWithAuth || fetch;
      const [wfRes, mastersRes] = await Promise.all([
        authFetch("http://localhost:4000/api/workflows"),
        authFetch("http://localhost:4000/api/masters/all")
      ]);

      if (wfRes.ok) {
        const wfData = await wfRes.json();
        if (Array.isArray(wfData.catalog) && wfData.catalog.length > 0) {
          setWorkflowsList(wfData.catalog);
        }
        if (Array.isArray(wfData.categories) && wfData.categories.length > 0) {
          setCategoriesList(wfData.categories);
        }
      }

      if (mastersRes.ok) {
        const mData = await mastersRes.json();
        setMastersData(mData);
      }
    } catch (err) {
      console.warn("Could not load dynamic workflows, using baseline:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    loadWorkflowsAndMasters();
  }, [loadWorkflowsAndMasters]);

  const filteredWorkflows = useMemo(() => {
    return workflowsList.filter((wf) => {
      const matchesCat = selectedCategory === "ALL" || wf.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (wf.unit || "").toLowerCase().includes(q) ||
        (wf.client || "").toLowerCase().includes(q) ||
        (wf.serviceType || "").toLowerCase().includes(q) ||
        (wf.id || "").toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery, workflowsList]);

  const activeWorkflow = useMemo(() => {
    return (
      workflowsList.find((w) => w.id === selectedWorkflowId) ||
      filteredWorkflows[0] ||
      workflowsList[0] ||
      FALLBACK_CATALOG[0]
    );
  }, [selectedWorkflowId, filteredWorkflows, workflowsList]);

  const handleDuplicateWorkflow = async (id) => {
    try {
      const res = await (fetchWithAuth || fetch)(`http://localhost:4000/api/workflows/${id}/duplicate`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to clone workflow.");
      showToast(`Workflow cloned successfully: ${data.workflow.id}`);
      await loadWorkflowsAndMasters();
      setSelectedWorkflowId(data.workflow.id);
      setWorkflowEditorTarget(data.workflow);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteWorkflow = async (id, name) => {
    if (!window.confirm(`Are you sure you want to archive workflow "${name || id}"?`)) {
      return;
    }
    try {
      const res = await (fetchWithAuth || fetch)(`http://localhost:4000/api/workflows/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to archive workflow.");
      showToast(`Workflow "${id}" archived.`);
      await loadWorkflowsAndMasters();
      if (selectedWorkflowId === id) {
        setSelectedWorkflowId("WF-01-BBMP-LAKES");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const avgStages = workflowsList.length > 0
    ? (workflowsList.reduce((acc, w) => acc + (w.stages?.length || 0), 0) / workflowsList.length).toFixed(1)
    : 11.2;

  const maxStages = workflowsList.length > 0
    ? Math.max(...workflowsList.map((w) => w.stages?.length || 0))
    : 16;

  return (
    <div className="workflow-master-view">
      {/* HEADER BAR */}
      <div className="wf-header-card">
        <div className="wf-header-left">
          <div className="wf-tag-row">
            <span className="wf-badge-count">{workflowsList.length} Dynamic Workflows in Engine</span>
            <span className="wf-badge-sub">Derived from Official Billing Process Updations Document</span>
            <span className="wf-badge-compliance">Phase I Configurable Workflow Engine</span>
          </div>
          <h2>Enterprise Digital Workflow Engine</h2>
          <p>
            Digitized, non-hardcoded configuration of all organizational approval matrices across Municipal, Metro Transit, Healthcare, KIADB Industrial Areas, and State Enterprises.
            Authorised administrators can create or modify workflows, stages, responsible roles, persons, SLAs, and mandatory documents.
          </p>
        </div>
        <div className="wf-header-stats">
          <div className="stat-pill">
            <span className="num">{workflowsList.length}</span>
            <span className="lbl">Workflows</span>
          </div>
          <div className="stat-pill">
            <span className="num">{avgStages}</span>
            <span className="lbl">Avg Stages</span>
          </div>
          <div className="stat-pill">
            <span className="num">{maxStages}</span>
            <span className="lbl">Max Stages</span>
          </div>
          <div className="stat-pill">
            <span className="num">{categoriesList.length - 1}</span>
            <span className="lbl">Sectors</span>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div style={{ padding: "10px 16px", background: "rgba(16,185,129,0.18)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: "8px", color: "#34d399", fontSize: "13px", fontWeight: 600 }}>
          ✓ {toastMessage}
        </div>
      )}

      {/* CATEGORY SELECTOR TABS */}
      <div className="wf-category-tabs">
        {categoriesList.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`wf-cat-tab ${selectedCategory === cat.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-name">{cat.name}</span>
            {cat.count && <span className="cat-count">({cat.count})</span>}
          </button>
        ))}
      </div>

      {/* SEARCH AND ACTION BAR */}
      <div className="wf-filter-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: "280px" }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="wf-search-input"
            placeholder="Search by client, unit name, or service type (e.g. BBMP, BMRCL, Bowring, Harohalli)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="custom-btn-primary"
            onClick={() => setWorkflowEditorTarget("NEW")}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <span>➕</span>
            <span>Configure New Workflow</span>
          </button>
        </div>
      </div>

      {/* TWO-COLUMN EXPLORER LAYOUT */}
      <div className="wf-layout-grid">
        {/* LEFT PANE: WORKFLOW LIST CARDS */}
        <div className="wf-list-pane">
          <div className="wf-list-header">
            <span>Workflows ({filteredWorkflows.length})</span>
            <span className="wf-category-indicator">
              Category: {categoriesList.find((c) => c.id === selectedCategory)?.name || "All"}
            </span>
          </div>

          <div className="wf-cards-scroll">
            {filteredWorkflows.map((wf) => (
              <div
                key={wf.id}
                className={`wf-card-item ${activeWorkflow?.id === wf.id ? "active" : ""}`}
                onClick={() => setSelectedWorkflowId(wf.id)}
              >
                <div className="wf-card-top">
                  <span className="wf-index-badge">#{wf.index || wf.id}</span>
                  <span className="wf-client-tag">{wf.client}</span>
                  {wf.isPilot && (
                    <span className="wf-pilot-tag">⭐ PILOT DESIGNATED</span>
                  )}
                  <span className="wf-stage-count">{wf.stages?.length || 0} Stages</span>
                </div>
                <h4 className="wf-card-title">{wf.unit}</h4>
                <div className="wf-service-label">{wf.serviceType}</div>
                <div className="wf-stages-preview">
                  {(wf.stages || []).slice(0, 4).map((s) => s.role).join(" ➔ ")}
                  {(wf.stages || []).length > 4 ? ` ➔ +${wf.stages.length - 4} more` : ""}
                </div>
              </div>
            ))}
            {filteredWorkflows.length === 0 && (
              <div className="wf-no-results">
                <p>No workflows match your search query.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: ACTIVE WORKFLOW STAGE PIPELINE */}
        <div className="wf-detail-pane">
          {activeWorkflow && (
            <div className="wf-active-container">
              {/* DETAIL HEADER */}
              <div className="wf-active-header">
                <div className="active-title-group">
                  <div className="active-badges-row">
                    <span className="badge-wf-id">{activeWorkflow.id}</span>
                    <span className="badge-wf-client">{activeWorkflow.client}</span>
                    <span className="badge-wf-cat">{activeWorkflow.category}</span>
                    {activeWorkflow.isPilot && (
                      <span className="badge-pilot-crown">
                        🎯 DESIGNATED PHASE-I PILOT WORKFLOW
                      </span>
                    )}
                  </div>
                  <h3>{activeWorkflow.unit}</h3>
                  <p className="active-service-sub">
                    <strong>Service Scope:</strong> {activeWorkflow.serviceType} | <strong>Billing Type:</strong> {activeWorkflow.billingType || "Monthly RA"} | <strong>Cycle:</strong> {activeWorkflow.billingCycle || "Monthly"}
                  </p>
                </div>

                {/* WORKFLOW ACTIONS FOR ADMIN */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    type="button"
                    className="custom-btn-primary"
                    onClick={() => setWorkflowEditorTarget(activeWorkflow)}
                    style={{ fontSize: "12px", padding: "7px 14px" }}
                  >
                    ✏️ Modify Workflow
                  </button>
                  <button
                    type="button"
                    className="custom-btn-secondary"
                    onClick={() => handleDuplicateWorkflow(activeWorkflow.id)}
                    style={{ fontSize: "12px", padding: "7px 12px" }}
                  >
                    📋 Clone
                  </button>
                  <button
                    type="button"
                    className="btn-tbl-action del"
                    onClick={() => handleDeleteWorkflow(activeWorkflow.id, activeWorkflow.unit)}
                    style={{ padding: "7px 10px" }}
                    title="Archive this workflow"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* PILOT RATIONALE BANNER */}
              {activeWorkflow.isPilot && activeWorkflow.pilotRationale && (
                <div className="pilot-rationale-box">
                  <div className="pilot-icon">🌟</div>
                  <div className="pilot-text">
                    <h4>Executive Pilot Selection Rationale:</h4>
                    <p>{activeWorkflow.pilotRationale}</p>
                    <div className="pilot-actions-bar">
                      <button
                        type="button"
                        className="btn-launch-pilot-bill"
                        onClick={() => {
                          if (onSelectPilotBill) {
                            const bId = activeWorkflow.id.includes("BBMP") ? "BILL-1001" : "BILL-1002";
                            onSelectPilotBill(bId);
                          }
                        }}
                      >
                        Inspect Active Pilot Bill Docket ➔
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGES SEQUENTIAL PIPELINE */}
              <div className="wf-stages-section">
                <div className="stages-head-row">
                  <h4>
                    Configured Stage Routing Sequence ({activeWorkflow.stages?.length || 0} Sequential Approval Tiers)
                  </h4>
                  <span className="cumulative-sla">
                    Cumulative Baseline SLA:{" "}
                    <strong>
                      {(activeWorkflow.stages || []).reduce((acc, s) => acc + (s.slaDays || 2), 0)} Working Days
                    </strong>
                  </span>
                </div>

                <div className="stages-stepper-timeline">
                  {(activeWorkflow.stages || []).map((stage, sIdx) => (
                    <div key={stage.step || sIdx} className="stage-step-card">
                      <div className="step-num-col">
                        <div className="step-number-bubble">{stage.step}</div>
                        {sIdx < activeWorkflow.stages.length - 1 && (
                          <div className="step-connector-line"></div>
                        )}
                      </div>
                      <div className="step-content-card">
                        <div className="step-top-row">
                          <span className="step-title">{stage.name}</span>
                          <span className="step-sla-badge">
                            ⏱️ SLA: {stage.slaDays} {stage.slaDays === 1 ? "Working Day" : "Working Days"}
                          </span>
                        </div>

                        <div className="step-details-grid">
                          <div>
                            <span className="lbl">Designated Authority:</span>
                            <strong className="val">{stage.role}</strong>
                          </div>
                          <div>
                            <span className="lbl">Responsible Person:</span>
                            <span className="val" style={{ color: stage.personName ? "#34d399" : "#94a3b8" }}>
                              {stage.personName || "Role-based Assignment"}
                            </span>
                          </div>
                          <div>
                            <span className="lbl">Department / Directorate:</span>
                            <span className="val">{stage.dept || "Departmental Office"}</span>
                          </div>
                          <div>
                            <span className="lbl">Escalation Rule & Target:</span>
                            <span className="val text-amber">
                              {stage.escalationRole ? `⚠️ Escalate to ${stage.escalationRole}` : "Director / HOD"}
                            </span>
                          </div>
                        </div>

                        {stage.mandatoryDocs && stage.mandatoryDocs.length > 0 && (
                          <div className="mandatory-docs-row">
                            <span className="docs-lbl">Mandatory Dossier Attachments:</span>
                            <div className="docs-pills">
                              {stage.mandatoryDocs.map((doc, dIdx) => (
                                <span key={dIdx} className="doc-pill">
                                  📄 {doc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WORKFLOW ENGINE CREATE / EDIT MODAL */}
      {workflowEditorTarget && (
        <WorkflowEditorModal
          workflow={workflowEditorTarget === "NEW" ? null : workflowEditorTarget}
          masters={mastersData}
          user={user}
          fetchWithAuth={fetchWithAuth}
          onClose={() => setWorkflowEditorTarget(null)}
          onSaved={(savedWf) => {
            showToast(`Workflow "${savedWf.id}" saved and active!`);
            loadWorkflowsAndMasters();
            setSelectedWorkflowId(savedWf.id);
          }}
        />
      )}
    </div>
  );
}
