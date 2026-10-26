import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import StepDetails from "./StepDetails";
import NewBillModal from "./NewBillModal";
import ManualRecordModal from "./ManualRecordModal";
import ManualRecordDetailModal from "./ManualRecordDetailModal";
import NewAuditNoteModal from "./NewAuditNoteModal";
import PdfInspectorModal from "./PdfInspectorModal";
import Login from "./Login";
import WorkflowActionBanner from "./WorkflowActionBanner";
import NewTowerModal from "./NewTowerModal";
import ReportsModal from "./ReportsModal";

import MasterManagementView from "./MasterManagementView";
import SlaNotificationsView from "./SlaNotificationsView";
import ReportsView from "./ReportsView";
import WorkflowTrackerJourney from "./WorkflowTrackerJourney";
import "./styles.css";

const API = "http://localhost:4000/api";

/* ============================================================
   THEME CONFIG
   ============================================================ */
const THEMES = [
  { id: "blue", label: "Ocean Blue", swatch: "#2563eb", emoji: "🌊" },
  { id: "purple", label: "Royal Purple", swatch: "#7c3aed", emoji: "💜" },
  { id: "emerald", label: "Forest Green", swatch: "#059669", emoji: "🌿" },
  { id: "orange", label: "Sunset Orange", swatch: "#ea580c", emoji: "🔥" },
  { id: "dark", label: "Midnight Dark", swatch: "#1e293b", emoji: "🌙" },
];

function applyTheme(themeId) {
  const root = document.documentElement;
  if (!themeId || themeId === "blue") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", themeId);
  }
}




/* ============================================================
   THEME SWITCHER COMPONENT
   ============================================================ */
function ThemeSwitcher({ currentTheme, onThemeChange }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);


  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const active = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <div className="theme-switcher-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="btn-theme-toggle"
        onClick={() => setOpen((p) => !p)}
        title="Switch colour theme"
        aria-label="Open theme switcher"
      >
        <span
          className="theme-dot-preview"
          style={{ background: active.swatch }}
        />
        <span>{active.emoji} Theme</span>
        <span style={{ fontSize: "10px", opacity: 0.7 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="theme-dropdown" role="listbox" aria-label="Color themes">
          <div className="theme-dropdown-label">🎨 Colour Theme</div>
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`theme-option ${currentTheme === theme.id ? "active" : ""}`}
              role="option"
              aria-selected={currentTheme === theme.id}
              onClick={() => {
                onThemeChange(theme.id);
                setOpen(false);
              }}
            >
              <span className="theme-option-swatch" style={{ background: theme.swatch }} />
              <span>{theme.emoji} {theme.label}</span>
              {currentTheme === theme.id && (
                <span className="theme-option-active-tick">✓</span>
              )}
            </button>
          ))}


        </div>
      )}
    </div>
  );
}


function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function getInitials(name) {
  if (!name) return "U";
  const parts = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, "").split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function AppMain({ user, token, onLogout }) {
  const [activeBillId, setActiveBillId] = useState(() => {
    return localStorage.getItem("billing_active_bill_id") || "BILL-1001";
  });
  const [billsList, setBillsList] = useState([]);
  const [bill, setBill] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [inspectedStep, setInspectedStep] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Workflow Navigation & Modal States
  const [activeNavView, setActiveNavView] = useState("bill_tracker"); // "bill_tracker" | "masters" | "sla" | "reports"


  // Manual addition modals state
  const [showNewBillModal, setShowNewBillModal] = useState(false);
  const [showManualRecordModal, setShowManualRecordModal] = useState(false);
  const [selectedManualRecord, setSelectedManualRecord] = useState(null);
  const [showAuditNoteModal, setShowAuditNoteModal] = useState(false);
  const [selectedPdfDoc, setSelectedPdfDoc] = useState(null);
  const [showNewTowerModal, setShowNewTowerModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [docFilter, setDocFilter] = useState("all");

  // Track individually checked/completed steps (user-clicked tick marks)
  const [checkedSteps, setCheckedSteps] = useState(new Set());

  // File upload state
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Theme state — persisted to localStorage
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("billing_theme") || "blue";
  });

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeChange = useCallback((themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem("billing_theme", themeId);
  }, []);

  // Fetch wrapper with Bearer token
  const fetchWithAuth = useCallback(
    async (url, options = {}) => {
      const headers = { ...(options.headers || {}) };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(url, { ...options, headers });
      if (res.status === 401) {
        if (onLogout) onLogout();
      }
      return res;
    },
    [token, onLogout]
  );



  // Load all bills summary for selector
  const loadBillsList = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API}/bills`);
      if (res.ok) {
        const list = await res.json();
        setBillsList(list);
      }
    } catch {
      // Ignore background load error
    }
  }, [fetchWithAuth]);

  // Load bill data whenever activeBillId changes
  const loadBill = useCallback(
    async (targetId = activeBillId) => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${API}/bills/${targetId}`);
        if (!res.ok) {
          if (targetId !== "BILL-1001") {
            return loadBill("BILL-1001");
          }
          throw new Error("Could not load bill details");
        }
        const data = await res.json();
        setBill(data);
        setActiveBillId(data.id);
        localStorage.setItem("billing_active_bill_id", data.id);
        setSelectedStep(data.currentStep);
        setInspectedStep(data.currentStep);
        setShowDetails(true);
        setPhotoIndex(0);
      } catch (err) {
        setToast(err.message || "Failed to load bill information");
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, activeBillId]
  );

  useEffect(() => {
    loadBill(activeBillId);
    loadBillsList();
  }, []);

  const handleBillSwitch = (newId) => {
    setActiveBillId(newId);
    localStorage.setItem("billing_active_bill_id", newId);
    loadBill(newId);
  };

  const handleBillCreated = (newBill) => {
    setBillsList((prev) => {
      const exists = prev.some((b) => b.id === newBill.id);
      if (exists) return prev;
      return [
        ...prev,
        {
          id: newBill.id,
          projectName: newBill.projectName,
          projectType: newBill.projectType,
          currentStep: newBill.currentStep,
          totalSteps: (newBill.stages || []).length,
          amount: newBill.amount,
          contractor: newBill.contractor,
          ward: newBill.ward
        }
      ];
    });
    setBill(newBill);
    setActiveBillId(newBill.id);
    localStorage.setItem("billing_active_bill_id", newBill.id);
    setSelectedStep(newBill.currentStep);
    setInspectedStep(newBill.currentStep);
    setPhotoIndex(0);
    setToast(`Bill "${newBill.id}" created & activated successfully!`);
  };

  const handleRecordCreated = (newDoc, allDocs) => {
    setBill((prev) => ({
      ...prev,
      documents: allDocs || [...(prev.documents || []), newDoc]
    }));
    loadBillsList();
    setToast(`Manual record "${newDoc.name}" added successfully!`);
  };

  const handleAuditNoteAdded = (newHistory) => {
    setBill((prev) => ({
      ...prev,
      history: newHistory
    }));
    setToast("Inspection note recorded in audit log.");
  };

  // Toast timer
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const activeStage = useMemo(() => {
    if (!bill || !bill.stages) return null;
    return bill.stages[bill.currentStep - 1];
  }, [bill]);



  const handleStepClick = (step) => {
    setInspectedStep(step);
    setShowDetails(true);
    if (step >= bill.currentStep) {
      setSelectedStep(step);
    }
    // Always add the tick mark for the clicked step (don't toggle off)
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      next.add(step);
      return next;
    });
    // Smooth-scroll to details panel after render
    setTimeout(() => {
      const panel = document.getElementById("step-details-panel");
      if (panel) {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
  };

  const handleNavigateStep = (newStep) => {
    if (!bill || !bill.stages) return;
    if (newStep >= 1 && newStep <= bill.stages.length) {
      setInspectedStep(newStep);
      setShowDetails(true);
      if (newStep >= bill.currentStep) {
        setSelectedStep(newStep);
      }
      setCheckedSteps((prev) => {
        const next = new Set(prev);
        next.add(newStep);
        return next;
      });
      setTimeout(() => {
        const panel = document.getElementById("step-details-panel");
        if (panel) {
          panel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 80);
    }
  };

  async function saveStep(target = selectedStep) {
    const stepToTransition = target || selectedStep;
    if (!stepToTransition || stepToTransition < bill.currentStep) {
      setToast("Earlier steps cannot be selected. Workflows are forward-only.");
      return;
    }
    if (stepToTransition === bill.currentStep) {
      setToast(`Workflow is already at Step ${stepToTransition} (${bill.stages[stepToTransition - 1]}).`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetchWithAuth(`${API}/bills/${bill.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: stepToTransition })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transition failed");
      setBill(data);
      setSelectedStep(data.currentStep);
      setInspectedStep(data.currentStep);
      setShowDetails(true);
      setToast(data.message || `Workflow updated to Step ${stepToTransition} successfully.`);
    } catch (err) {
      setToast(err.message);
    } finally {
      setSaving(false);
    }
  }

  // File Upload Handlers (PDF & Excel)
  const processFileUpload = async (file) => {
    if (!file) return;

    const allowedExtensions = [".pdf", ".xlsx", ".xls", ".csv"];
    const fileExt = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
      setToast("Invalid file format. Please upload a PDF (.pdf) or Excel (.xlsx, .xls, .csv) document.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setToast("File is too large. Maximum supported file size is 25 MB.");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64Data = reader.result;
        try {
          const res = await fetchWithAuth(`${API}/bills/${bill.id}/documents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: file.name,
              fileData: base64Data,
              fileSize: file.size
            })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Upload failed");

          setBill((prev) => ({
            ...prev,
            documents: data.documents
          }));
          setToast(`Uploaded "${file.name}" successfully.`);
        } catch (uploadErr) {
          if (uploadErr.message !== "Session expired") {
            setToast(uploadErr.message || "Failed to upload document.");
          }
        } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };

      reader.onerror = () => {
        setToast("Error reading file from disk.");
        setUploading(false);
      };
    } catch (err) {
      setToast(err.message || "Upload process failed.");
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFileUpload(file);
    }
  };

  const handleDeleteDocument = async (docId, docName) => {
    if (!window.confirm(`Are you sure you want to remove "${docName}"?`)) return;

    try {
      const res = await fetchWithAuth(`${API}/bills/${bill.id}/documents/${docId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete document");

      setBill((prev) => ({
        ...prev,
        documents: data.documents
      }));
      setToast(`Document "${docName}" removed.`);
    } catch (err) {
      setToast(err.message);
    }
  };

  // Loading bill data
  if (loading && !bill) {
    return (
      <div className="loading">
        <div className="spinner" />
        <div>Loading Billing Tracker Data…</div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="loading">
        <div>Bill record not found.</div>
        <button className="primary" onClick={loadBill} style={{ marginTop: "12px" }}>
          Retry Loading
        </button>
      </div>
    );
  }

  const progress = Math.round((bill.currentStep / bill.stages.length) * 100);
  const documents = bill.documents || [];

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-brand">
          <div>
            <div className="eyebrow">ENTERPRISE GOVERNANCE • BILLING WORKFLOW TRACKER</div>
            <h1>Billing Workflow Tracker</h1>
          </div>
        </div>

        {/* PRIMARY WORKFLOW NAVIGATION TABS */}
        <div className="nav-view-switcher">
          <button
            type="button"
            className={`btn-nav-tab ${activeNavView === "bill_tracker" ? "active" : ""}`}
            onClick={() => setActiveNavView("bill_tracker")}
            title="6. Workflow Tracking: Complete journey from Submission to Payment"
          >
            <span>💼</span>
            <span>6. Workflow Tracking</span>
            {billsList.length > 0 && <span className="nav-tab-count">{billsList.length}</span>}
          </button>
          <button
            type="button"
            className={`btn-nav-tab ${activeNavView === "masters" ? "active" : ""}`}
            onClick={() => setActiveNavView("masters")}
          >
            <span>⚙️</span>
            <span>Masters</span>
          </button>
          <button
            type="button"
            className={`btn-nav-tab ${activeNavView === "sla" ? "active" : ""}`}
            onClick={() => setActiveNavView("sla")}
          >
            <span>⏱️</span>
            <span>SLA & Alerts</span>
          </button>
          <button
            type="button"
            className={`btn-nav-tab ${activeNavView === "reports" ? "active" : ""}`}
            onClick={() => setActiveNavView("reports")}
          >
            <span>📈</span>
            <span>Reports</span>
          </button>
        </div>

        <div className="topbar-right">
          {/* Bill Selector */}
          <div className="bill-selector-wrapper">
            {billsList.length > 0 && (
              <select
                value={bill.id}
                onChange={(e) => {
                  handleBillSwitch(e.target.value);
                  setActiveNavView("bill_tracker");
                }}
                className="bill-selector-select"
                title="Switch active bill docket"
              >
                {billsList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} [{b.client || "BBMP"}] — {b.projectName.length > 22 ? b.projectName.slice(0, 22) + "…" : b.projectName}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              className="btn-add-bill-topbar"
              onClick={() => setShowNewBillModal(true)}
              title="Manually create a new bill docket"
            >
              <span>➕</span>
              <span>New Bill</span>
            </button>
          </div>

          {/* Theme Switcher */}
          <ThemeSwitcher
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
          />

          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px", padding: "4px 10px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
              <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: user.badgeColor || "#2563eb", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#fff" }}>
                {getInitials(user.name || user.username)}
              </span>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#f8fafc" }}>
                  {user.username}
                </span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                  {user.role}
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn-theme-toggle"
            onClick={onLogout}
            title="Sign out of application"
            style={{ marginLeft: "6px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}
          >
            <span>🚪 Logout</span>
          </button>
        </div>
      </header>

      <main>
        {/* VIEW 4: MASTER MANAGEMENT (11 CONFIGURABLE MASTERS) */}
        {activeNavView === "masters" && (
          <MasterManagementView
            user={user}
            fetchWithAuth={fetchWithAuth}
            onToast={(msg) => setToast(msg)}
            onNavigateToBillTracker={(billId) => {
              handleBillSwitch(billId);
              setActiveNavView("bill_tracker");
            }}
          />
        )}

        {/* VIEW 5: SLA & NOTIFICATIONS CENTRE */}
        {activeNavView === "sla" && (
          <SlaNotificationsView
            fetchWithAuth={fetchWithAuth}
            onSelectBill={(id) => {
              handleBillSwitch(id);
              setActiveNavView("bill_tracker");
            }}
          />
        )}

        {/* VIEW 6: REPORTS & ANALYTICS */}
        {activeNavView === "reports" && (
          <ReportsView
            fetchWithAuth={fetchWithAuth}
            onSelectBill={(id) => {
              handleBillSwitch(id);
              setActiveNavView("bill_tracker");
            }}
          />
        )}

        {/* VIEW 3: ACTIVE BILL TRACKER & STAGE JOURNEY */}
        {activeNavView === "bill_tracker" && (
          <>
            {/* Workflow Lifecycle Action Banner (Review, Approve, Reject to Edit, Invoice, Payment, Close) */}
            <WorkflowActionBanner
              bill={bill}
              user={user}
              fetchWithAuth={fetchWithAuth}
              onBillUpdated={(updated) => {
                setBill(updated);
                loadBillsList();
              }}
              onToast={(msg) => setToast(msg)}
            />

            {/* 6. WORKFLOW TRACKING & COMPLETE JOURNEY ENGINE */}
            {/* Submission → Approval stages → Finance → Audit, where applicable → Payment */}
            {/* Shows: Completed stages, Current stage, Pending stage, Date entered into stage, Days pending, SLA, SLA status, Next stage */}
            <WorkflowTrackerJourney
              bill={bill}
              user={user}
              saving={saving}
              onStepClick={handleStepClick}
              onTransitionStep={(target) => saveStep(target)}
              onSwitchBill={handleBillSwitch}
              billsList={billsList}
            />

            {/* Step Details Panel (Checklist, Mandatory Documents & Inspection Notes) */}
            {showDetails && inspectedStep && (
              <StepDetails
                step={inspectedStep}
                totalSteps={bill.stages.length}
                stageName={bill.stages[inspectedStep - 1]}
                currentStep={bill.currentStep}
                bill={bill}
                user={user}
                saving={saving}
                checkedSteps={checkedSteps}
                onToggleCheck={(step) => {
                  setCheckedSteps((prev) => {
                    const next = new Set(prev);
                    if (next.has(step)) {
                      next.delete(step);
                    } else {
                      next.add(step);
                    }
                    return next;
                  });
                }}
                onClose={() => setShowDetails(false)}
                onNavigate={handleNavigateStep}
                onTransition={(target) => saveStep(target)}
              />
            )}

            {!showDetails && (
              <div style={{ textAlign: "center", margin: "16px 0" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowDetails(true);
                    setInspectedStep(bill.currentStep);
                  }}
                >
                  🔍 Show Step {bill.currentStep} Details
                </button>
              </div>
            )}

            <div className="action-bar">
              <div className="action-bar-info">
                <b>
                  Target: Step {selectedStep} — {bill.stages[selectedStep - 1]}
                </b>
                <small>
                  Authorizing as <strong>{user.name}</strong> ({user.role})
                </small>
              </div>
              <button
                className="primary"
                onClick={() => saveStep(selectedStep)}
                disabled={saving || selectedStep < bill.currentStep}
              >
                {saving ? "Authorizing…" : "Approve & Transition Step"}
              </button>
            </div>

            {/* Supporting Documents Section (PDF/Excel Upload & Manual Records) */}
            <section className="card documents-card">
              <div className="section-title">
                <div>
                  <h2>Supporting Documents & Verification Records</h2>
                  <p>
                    Upload official files (PDF/Excel) or manually add Contractor Invoices, Measurement Book records, and Quality Certificates.
                  </p>
                </div>
                <div className="supported-badges">
                  <span className="format-pill pdf">📄 PDF Intelligence</span>
                  <span className="format-pill excel">📊 Excel BoQ</span>
                  <span className="format-pill manual" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#6ee7b7", border: "1px solid rgba(16, 185, 129, 0.3)" }}>✍️ Manual Invoices & Records</span>
                </div>
              </div>

              {/* Action Toolbar: Filter Tabs + Open Manual Add Record */}
              <div className="docs-action-toolbar">
                <div className="docs-mode-tabs">
                  <button
                    type="button"
                    className={`docs-mode-tab ${docFilter === "all" ? "active" : ""}`}
                    onClick={() => setDocFilter("all")}
                  >
                    📁 All ({documents.length})
                  </button>
                  <button
                    type="button"
                    className={`docs-mode-tab ${docFilter === "uploaded" ? "active" : ""}`}
                    onClick={() => setDocFilter("uploaded")}
                  >
                    📄 Uploaded Files ({documents.filter((d) => !d.isManual).length})
                  </button>
                  <button
                    type="button"
                    className={`docs-mode-tab ${docFilter === "manual" ? "active" : ""}`}
                    onClick={() => setDocFilter("manual")}
                  >
                    ✍️ Manual Records ({documents.filter((d) => d.isManual).length})
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-open-manual-record"
                  onClick={() => setShowManualRecordModal(true)}
                  title="Add invoice, measurement record, or quality certificate without uploading a file"
                >
                  <span>✍️</span>
                  <span>+ Manually Add Document / Invoice</span>
                </button>
              </div>

              {/* Drag & Drop Upload Zone (Shown unless filtered to manual only) */}
              {docFilter !== "manual" && (
                <div
                  className={`dropzone-container ${dragActive ? "drag-active" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden-file-input"
                    accept=".pdf, .xlsx, .xls, .csv, application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <div className="dropzone-icon">
                    {uploading ? "⏳" : "📁"}
                  </div>
                  <p className="dropzone-title">
                    {uploading ? (
                      "Processing and uploading file…"
                    ) : (
                      <>
                        Drag & drop your file here, or <span>browse from computer</span>
                      </>
                    )}
                  </p>
                  <p className="dropzone-subtitle">
                    Accepts <strong>.pdf</strong>, <strong>.xlsx</strong>, <strong>.xls</strong>, and <strong>.csv</strong> (Max 25 MB per file)
                  </p>
                </div>
              )}

              {/* Filtered Documents List */}
              {(() => {
                const filteredDocs = documents.filter((doc) => {
                  if (docFilter === "uploaded") return !doc.isManual;
                  if (docFilter === "manual") return !!doc.isManual;
                  return true;
                });

                return (
                  <>
                    <div className="docs-list-heading">
                      <h3>Attached Project Documents & Records</h3>
                      <span className="docs-count-pill">
                        {filteredDocs.length} {filteredDocs.length === 1 ? "Item" : "Items"}
                      </span>
                    </div>

                    {filteredDocs.length === 0 ? (
                      <div className="empty-docs">
                        {docFilter === "manual"
                          ? "No manual records entered yet. Click '+ Manually Add Document / Invoice' above to create one."
                          : "No verification documents attached yet. Upload a Measurement Book (PDF) or BoQ Estimate above, or add a record manually."}
                      </div>
                    ) : (
                      <div className="docs-grid">
                        {filteredDocs.map((doc) => {
                          const isManual = !!doc.isManual;
                          const isPdf = !isManual && (doc.type === "pdf" || doc.name.toLowerCase().endsWith(".pdf"));

                          return (
                            <div className="doc-card" key={doc.id}>
                              <div className="doc-left">
                                <div className={`doc-type-icon ${isManual ? "manual" : isPdf ? "pdf" : "excel"}`}>
                                  {isManual ? "✍️" : isPdf ? "📄" : "📊"}
                                </div>
                                <div className="doc-meta">
                                  <div className="doc-name" title={doc.name}>
                                    {doc.name}
                                    {isManual && <span className="doc-manual-pill">{doc.category || "Manual"}</span>}
                                  </div>
                                  <div className="doc-submeta">
                                    {isManual && doc.refNumber && (
                                      <>
                                        <span>Ref: {doc.refNumber}</span>
                                        <span>•</span>
                                      </>
                                    )}
                                    {!isManual && (
                                      <>
                                        <span>{formatFileSize(doc.size)}</span>
                                        <span>•</span>
                                      </>
                                    )}
                                    <span>{formatDate(doc.uploadedAt || doc.recordDate)}</span>
                                    {doc.uploadedBy && (
                                      <>
                                        <span>•</span>
                                        <span>{doc.uploadedBy}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="doc-actions">
                                {/* Manual record view details button */}
                                {isManual && (
                                  <button
                                    type="button"
                                    className="btn-doc-action view-record"
                                    onClick={() => setSelectedManualRecord(doc)}
                                    title="Inspect manual record details, line items, and voucher"
                                  >
                                    <span>👁️</span>
                                    <span>View Details</span>
                                  </button>
                                )}

                                {/* Deep PDF Inspector button for PDF files */}
                                {isPdf && (
                                  <button
                                    type="button"
                                    className="btn-doc-action inspect-pdf"
                                    onClick={() => setSelectedPdfDoc(doc)}
                                    title="Deep PDF Analysis: Extract full text, inspect tables, entities & summary"
                                  >
                                    <span>🔍</span>
                                    <span>Deep PDF Analysis</span>
                                  </button>
                                )}

                                {/* Standard download/view link */}
                                {doc.url && (
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-doc-action download"
                                    download={doc.name}
                                    title="Download document"
                                  >
                                    <span>⬇</span>
                                    <span>Download</span>
                                  </a>
                                )}

                                <button
                                  type="button"
                                  className="btn-doc-action delete"
                                  onClick={() => handleDeleteDocument(doc.id, doc.name)}
                                  title="Remove record"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </section>

            <section className="card audit-trail-card">
              <div className="section-title">
                <div>
                  <h2>Stage Audit Trail</h2>
                  <p>Immutable history of step transitions and authorizing officers.</p>
                </div>
                <button
                  type="button"
                  className="btn-add-audit-note"
                  onClick={() => setShowAuditNoteModal(true)}
                  title="Add on-site inspection note, measurement cross-check, or verification remark"
                >
                  <span>➕</span>
                  <span>Add Inspection Note</span>
                </button>
              </div>
              <div className="audit-table">
                <div className="tr th">
                  <span>Step</span>
                  <span>Stage</span>
                  <span>Timestamp</span>
                  <span>Due Date</span>
                  <span>Authorized By</span>
                </div>
                {bill.history
                  .slice()
                  .reverse()
                  .map((h, idx) => (
                    <div className="tr" key={`${h.step}-${h.savedAt}-${idx}`}>
                      <span>
                        <b>#{h.step}</b>
                      </span>
                      <span>{bill.stages[h.step - 1]}</span>
                      <span>{formatDate(h.savedAt || h.startedAt)}</span>
                      <span>{formatDate(h.dueAt)}</span>
                      <span>
                        <span className="performer-tag">
                          {h.performedBy || "System Baseline"}
                        </span>
                      </span>
                    </div>
                  ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Manual Creation & Inspection Modals */}
      {showNewBillModal && (
        <NewBillModal
          onClose={() => setShowNewBillModal(false)}
          onCreated={handleBillCreated}
          fetchWithAuth={fetchWithAuth}
          currentBillCount={billsList.length || 1}
        />
      )}

      {showManualRecordModal && (
        <ManualRecordModal
          billId={bill.id}
          stages={bill.stages}
          currentStep={bill.currentStep}
          currentUser={user}
          onClose={() => setShowManualRecordModal(false)}
          onRecordCreated={handleRecordCreated}
          fetchWithAuth={fetchWithAuth}
        />
      )}

      {selectedManualRecord && (
        <ManualRecordDetailModal
          record={selectedManualRecord}
          stages={bill.stages}
          onClose={() => setSelectedManualRecord(null)}
        />
      )}

      {showAuditNoteModal && (
        <NewAuditNoteModal
          billId={bill.id}
          stages={bill.stages}
          currentStep={bill.currentStep}
          currentUser={user}
          onClose={() => setShowAuditNoteModal(false)}
          onNoteAdded={handleAuditNoteAdded}
          fetchWithAuth={fetchWithAuth}
        />
      )}

      {selectedPdfDoc && (
        <PdfInspectorModal
          doc={selectedPdfDoc}
          billId={bill.id}
          fetchWithAuth={fetchWithAuth}
          onClose={() => setSelectedPdfDoc(null)}
        />
      )}

      {showNewTowerModal && (
        <NewTowerModal
          onClose={() => setShowNewTowerModal(false)}
          onCreated={(newTower) => {
            setToast(`Tower "${newTower.name}" registered successfully!`);
          }}
          fetchWithAuth={fetchWithAuth}
        />
      )}

      {showReportsModal && (
        <ReportsModal
          onClose={() => setShowReportsModal(false)}
          fetchWithAuth={fetchWithAuth}
          onSelectBill={(id) => handleBillSwitch(id)}
        />
      )}





      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function App() {
  // Always require credentials every time: start with null (do NOT persist in localStorage)
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Clear any existing stored credentials from older versions so every load prompts for login
  useEffect(() => {
    try {
      localStorage.removeItem("billing_user");
      localStorage.removeItem("billing_token");
      sessionStorage.removeItem("billing_user");
      sessionStorage.removeItem("billing_token");
    } catch {
      // ignore storage access errors
    }
  }, []);

  const handleLoginSuccess = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    // Explicitly kept in memory only — not written to localStorage so refreshing/opening always asks for login
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem("billing_user");
      localStorage.removeItem("billing_token");
      sessionStorage.removeItem("billing_user");
      sessionStorage.removeItem("billing_token");
    } catch {
      // ignore
    }
  }, []);

  if (!user || !token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return <AppMain user={user} token={token} onLogout={handleLogout} />;
}

createRoot(document.getElementById("root")).render(<App />);