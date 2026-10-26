import React, { useState, useEffect, useMemo, useCallback } from "react";
import MasterItemModal from "./MasterItemModal";
import WorkflowEditorModal from "./WorkflowEditorModal";
import MasterDetailsModal from "./MasterDetailsModal";
import {
  calculateWorkflowTracking,
  formatStageDate,
  CANONICAL_JOURNEY_PHASES
} from "./workflowTrackingHelper";

const MASTER_TABS = [
  { id: "clients", label: "Clients", icon: "🏢", countKey: "clients" },
  { id: "units", label: "Units / Divisions", icon: "🏗️", countKey: "units" },
  { id: "services", label: "Services", icon: "⚙️", countKey: "services" },
  { id: "billing-types", label: "Billing Types", icon: "💳", countKey: "billingTypes" },
  { id: "bills", label: "5. Bill Master / Transaction", icon: "📑", countKey: "bills" },
  { id: "workflow-tracking", label: "6. Workflow Tracking", icon: "🛤️", countKey: "bills" },
  { id: "workflows", label: "Workflows (Engine)", icon: "📜", countKey: "workflows" },
  { id: "stages", label: "Workflow Stages", icon: "🪜", countKey: "canonicalStages" },
  { id: "roles", label: "Responsible Roles", icon: "👥", countKey: "roles" },
  { id: "persons", label: "Responsible Persons", icon: "👤", countKey: "persons" },
  { id: "slas", label: "SLA Policies", icon: "⏱️", countKey: "slas" },
  { id: "documents", label: "Mandatory Documents", icon: "📄", countKey: "documents" },
  { id: "escalations", label: "Escalation Rules", icon: "🚨", countKey: "escalations" },
];

export default function MasterManagementView({
  user,
  fetchWithAuth,
  onOpenWorkflow,
  onToast,
  onNavigateToBillTracker
}) {
  const [activeTab, setActiveTab] = useState("clients");
  const [mastersData, setMastersData] = useState({
    clients: [],
    units: [],
    services: [],
    billingTypes: [],
    bills: [],
    workflows: [],
    roles: [],
    persons: [],
    slas: [],
    documents: [],
    escalations: [],
    canonicalStages: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Bill-specific filter state
  const [billFilterClient, setBillFilterClient] = useState("ALL");
  const [billFilterStatus, setBillFilterStatus] = useState("ALL");
  const [billFilterPaymentStatus, setBillFilterPaymentStatus] = useState("ALL");
  const [billFilterBillingType, setBillFilterBillingType] = useState("ALL");
  const [copiedId, setCopiedId] = useState("");

  // 6. Workflow tracking filter state
  const [wtPhaseFilter, setWtPhaseFilter] = useState("ALL");
  const [wtSlaFilter, setWtSlaFilter] = useState("ALL");
  const [expandedJourneyBillId, setExpandedJourneyBillId] = useState(null);

  const handleCopyBillId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast(`Copied Bill ID "${id}" to clipboard`);
    setTimeout(() => setCopiedId(""), 2000);
  };

  // Modals state
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState(null); // type for MasterItemModal
  const [workflowEditorTarget, setWorkflowEditorTarget] = useState(null); // null = closed, "NEW" = new, object = edit
  const [detailsModalCategory, setDetailsModalCategory] = useState(null); // category string for MasterDetailsModal

  const handleInspectCategory = (categoryKey) => {
    setActiveTab(categoryKey);
    setDetailsModalCategory(categoryKey);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    if (onToast) onToast(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const loadAllMasters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await (fetchWithAuth ? fetchWithAuth("http://localhost:4000/api/masters/all") : fetch("http://localhost:4000/api/masters/all"));
      if (res.ok) {
        const data = await res.json();
        setMastersData(data);
      }
    } catch (err) {
      console.warn("Failed to load masters:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    loadAllMasters();
  }, [loadAllMasters]);

  const handleDeleteMasterItem = async (type, id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name || id}" from ${type}?`)) {
      return;
    }
    try {
      const res = await fetchWithAuth(`http://localhost:4000/api/masters/${type}/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete item.");
      showToast(`Deleted "${name || id}" successfully.`);
      loadAllMasters();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteWorkflow = async (id, name) => {
    if (!window.confirm(`Are you sure you want to archive/delete workflow "${id}"?`)) {
      return;
    }
    try {
      const res = await fetchWithAuth(`http://localhost:4000/api/workflows/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete workflow.");
      showToast(`Workflow "${id}" archived successfully.`);
      loadAllMasters();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDuplicateWorkflow = async (id) => {
    try {
      const res = await fetchWithAuth(`http://localhost:4000/api/workflows/${id}/duplicate`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to clone workflow.");
      showToast(`Workflow cloned successfully: ${data.workflow.id}`);
      loadAllMasters();
      setWorkflowEditorTarget(data.workflow);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleResetBaseline = async () => {
    if (!window.confirm("Reset all workflows to the official billing-process baseline document? Any custom edits will be restored to defaults.")) {
      return;
    }
    try {
      const res = await fetchWithAuth("http://localhost:4000/api/workflows/reset-baseline", {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset baseline.");
      showToast(data.message || "Workflows reset to baseline.");
      loadAllMasters();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const exportMasterJson = () => {
    const jsonStr = JSON.stringify(mastersData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billing_control_tower_masters_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Master repository exported successfully.");
  };

  const exportBillMasterCsv = () => {
    const list = mastersData.bills || [];
    if (list.length === 0) {
      alert("No Bill Master records available to export.");
      return;
    }
    const headers = [
      "Bill ID",
      "Bill Number",
      "Client",
      "Unit",
      "Work Order",
      "Contract",
      "Billing Period",
      "Billing Type",
      "Bill Amount",
      "Submission Date",
      "Expected Payment Date",
      "Current Stage",
      "Current Responsible Person/Role",
      "Status",
      "Payment Status"
    ];
    const rows = list.map((b) => [
      `"${b.id || ""}"`,
      `"${b.billNumber || ""}"`,
      `"${b.client || ""}"`,
      `"${b.unit || ""}"`,
      `"${b.workOrder || ""}"`,
      `"${b.contract || ""}"`,
      `"${b.billingPeriod || ""}"`,
      `"${b.billingType || ""}"`,
      `"${(b.amount || "").replace(/"/g, '""')}"`,
      `"${b.submissionDate ? new Date(b.submissionDate).toLocaleDateString() : ""}"`,
      `"${b.expectedPaymentDate ? new Date(b.expectedPaymentDate).toLocaleDateString() : ""}"`,
      `"${b.currentStage || b.currentStageName || ""}"`,
      `"${(b.responsiblePersonRole || `${b.currentPerson || ""} (${b.currentRole || ""})`).replace(/"/g, '""')}"`,
      `"${b.workflowStatus || b.status || ""}"`,
      `"${b.paymentStatus || ""}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bill_master_transaction_register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Bill Master register exported to CSV.");
  };

  const q = searchQuery.trim().toLowerCase();

  const formatCurrency = (num) => {
    if (!num) return "₹ 0";
    if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹ ${(num / 100000).toFixed(2)} L`;
    return `₹ ${num.toLocaleString("en-IN")}`;
  };

  const parseCurrency = (str) => {
    if (!str) return 0;
    if (typeof str === "number") return str;
    return parseFloat(String(str).replace(/[^0-9.]/g, "")) || 0;
  };

  const formatDate = (val) => {
    if (!val) return "—";
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return String(val);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, "").split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const filteredBills = useMemo(() => {
    let list = mastersData.bills || [];
    if (q) {
      list = list.filter((b) => {
        const id = (b.id || "").toLowerCase();
        const num = (b.billNumber || "").toLowerCase();
        const client = (b.client || "").toLowerCase();
        const unit = (b.unit || "").toLowerCase();
        const wo = (b.workOrder || "").toLowerCase();
        const cnt = (b.contract || "").toLowerCase();
        const stage = (b.currentStage || b.currentStageName || "").toLowerCase();
        const person = (b.currentPerson || "").toLowerCase();
        const role = (b.currentRole || "").toLowerCase();
        const bType = (b.billingType || "").toLowerCase();
        return (
          id.includes(q) ||
          num.includes(q) ||
          client.includes(q) ||
          unit.includes(q) ||
          wo.includes(q) ||
          cnt.includes(q) ||
          stage.includes(q) ||
          person.includes(q) ||
          role.includes(q) ||
          bType.includes(q)
        );
      });
    }
    if (billFilterClient !== "ALL") {
      list = list.filter((b) => (b.client || "").toUpperCase() === billFilterClient.toUpperCase());
    }
    if (billFilterStatus !== "ALL") {
      list = list.filter((b) => (b.workflowStatus || b.status || "").toUpperCase() === billFilterStatus.toUpperCase());
    }
    if (billFilterPaymentStatus !== "ALL") {
      list = list.filter((b) => (b.paymentStatus || "").toUpperCase() === billFilterPaymentStatus.toUpperCase());
    }
    if (billFilterBillingType !== "ALL") {
      list = list.filter((b) => (b.billingType || "").toLowerCase().includes(billFilterBillingType.toLowerCase()));
    }
    return list;
  }, [mastersData.bills, q, billFilterClient, billFilterStatus, billFilterPaymentStatus, billFilterBillingType]);

  const billMetrics = useMemo(() => {
    const list = mastersData.bills || [];
    const totalCount = list.length;
    let totalGross = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    list.forEach((b) => {
      const amt = b.amountNum || parseCurrency(b.amount);
      totalGross += amt;
      const pStatus = (b.paymentStatus || "").toUpperCase();
      if (pStatus === "PAID") {
        totalPaid += amt;
      } else {
        totalPending += amt;
      }
      if (pStatus === "OVERDUE" || (b.expectedPaymentDate && new Date(b.expectedPaymentDate).getTime() < Date.now() && pStatus !== "PAID")) {
        totalOverdue += 1;
      }
    });

    return { totalCount, totalGross, totalPaid, totalPending, totalOverdue };
  }, [mastersData.bills]);

  const uniqueClients = useMemo(() => {
    const set = new Set();
    (mastersData.bills || []).forEach((b) => {
      if (b.client) set.add(b.client);
    });
    return Array.from(set).sort();
  }, [mastersData.bills]);

  const uniqueBillingTypes = useMemo(() => {
    const set = new Set();
    (mastersData.bills || []).forEach((b) => {
      if (b.billingType) set.add(b.billingType);
    });
    return Array.from(set).sort();
  }, [mastersData.bills]);

  return (
    <div className="master-management-view">
      {/* HEADER CARD */}
      <div className="master-header-card">
        <div className="master-header-left">
          <div className="master-tag-row">
            <span className="master-badge">Phase I — Billing Workflow Digitisation</span>
            <span className="master-badge-sub">Configurable Digital Workflow Engine Masters</span>
            <span className="master-badge-admin">
              👑 Administrator Console
            </span>
          </div>
          <h2 className="master-title">Enterprise Master Repository & Workflow Engine</h2>

        </div>

        <div className="master-header-stats">
          <div
            className={`mhs-pill ${activeTab === "clients" ? "active" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => handleInspectCategory("clients")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleInspectCategory("clients")}
            title="Click to view all Clients details breakdown"
          >
            <span className="mhs-num">{mastersData.clients?.length || 0}</span>
            <span className="mhs-lbl">Clients</span>
            <span className="mhs-hint">View Details ↗</span>
          </div>

          <div
            className={`mhs-pill ${activeTab === "units" ? "active" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => handleInspectCategory("units")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleInspectCategory("units")}
            title="Click to view all Units details breakdown"
          >
            <span className="mhs-num">{mastersData.units?.length || 0}</span>
            <span className="mhs-lbl">Units</span>
            <span className="mhs-hint">View Details ↗</span>
          </div>

          <div
            className={`mhs-pill ${activeTab === "services" ? "active" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => handleInspectCategory("services")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleInspectCategory("services")}
            title="Click to view all Services details breakdown"
          >
            <span className="mhs-num">{mastersData.services?.length || 0}</span>
            <span className="mhs-lbl">Services</span>
            <span className="mhs-hint">View Details ↗</span>
          </div>

          <div
            className={`mhs-pill ${activeTab === "bills" ? "active" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => handleInspectCategory("bills")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleInspectCategory("bills")}
            title="Click to view all Bill Master / Transactions breakdown"
          >
            <span className="mhs-num">{mastersData.bills?.length || 0}</span>
            <span className="mhs-lbl">Bill Master</span>
            <span className="mhs-hint">15 Fields ↗</span>
          </div>

          <div
            className={`mhs-pill ${activeTab === "workflows" ? "active" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => handleInspectCategory("workflows")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleInspectCategory("workflows")}
            title="Click to view all Workflows details breakdown"
          >
            <span className="mhs-num">{mastersData.workflows?.length || 0}</span>
            <span className="mhs-lbl">Workflows</span>
            <span className="mhs-hint">View Details ↗</span>
          </div>

          <div
            className={`mhs-pill ${activeTab === "roles" ? "active" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => handleInspectCategory("roles")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleInspectCategory("roles")}
            title="Click to view all Roles details breakdown"
          >
            <span className="mhs-num">{mastersData.roles?.length || 0}</span>
            <span className="mhs-lbl">Roles</span>
            <span className="mhs-hint">View Details ↗</span>
          </div>

          <div
            className={`mhs-pill ${activeTab === "documents" ? "active" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => handleInspectCategory("documents")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleInspectCategory("documents")}
            title="Click to view all Mandatory Documents details breakdown"
          >
            <span className="mhs-num">{mastersData.documents?.length || 0}</span>
            <span className="mhs-lbl">Mandatory Docs</span>
            <span className="mhs-hint">View Details ↗</span>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div style={{ marginBottom: "16px", padding: "10px 16px", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "8px", color: "#059669", fontSize: "13px", fontWeight: 700 }}>
          ✓ {toastMessage}
        </div>
      )}

      {/* ACTION BAR: SEARCH, ADD RECORD, EXPORT & BASELINE RESET */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
          <div className="search-input-wrapper" style={{ flex: 1, maxWidth: "450px" }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="wf-search-input"
              placeholder={`Search in ${activeTab === "bills" ? "Bill ID, Number, Client, Work Order, Contract..." : activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="btn-clear-search" onClick={() => setSearchQuery("")}>✕</button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {activeTab === "bills" ? (
            <>
              <button
                type="button"
                className="custom-btn-primary"
                onClick={() => {
                  setEditingItem(null);
                  setModalType("bills");
                }}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span>➕</span>
                <span>Register New Bill / Transaction</span>
              </button>
              <button
                type="button"
                className="master-btn-secondary"
                onClick={exportBillMasterCsv}
                title="Export Bill Master register as CSV"
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span>📊</span>
                <span>Export CSV</span>
              </button>
            </>
          ) : activeTab === "workflows" ? (
            <button
              type="button"
              className="custom-btn-primary"
              onClick={() => setWorkflowEditorTarget("NEW")}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span>➕</span>
              <span>Configure New Workflow</span>
            </button>
          ) : activeTab !== "stages" && (
            <button
              type="button"
              className="custom-btn-primary"
              onClick={() => {
                setEditingItem(null);
                setModalType(activeTab);
              }}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span>➕</span>
              <span>Add to {activeTab.replace("-", " ").toUpperCase()}</span>
            </button>
          )}

          <button
            type="button"
            className="master-btn-secondary"
            onClick={exportMasterJson}
            title="Export master catalog as JSON"
          >
            📥 Export JSON
          </button>

          <button
            type="button"
            className="master-btn-secondary"
            onClick={handleResetBaseline}
            title="Reset workflows to official baseline processes"
          >
            🔄 Baseline Reset
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS FOR ALL 11 MASTERS */}
      <div className="master-tabs" style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "8px" }}>
        {MASTER_TABS.map((tab) => {
          const count = (mastersData[tab.countKey] || []).length;
          return (
            <button
              key={tab.id}
              type="button"
              className={`master-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery("");
              }}
              style={{ whiteSpace: "nowrap" }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className="master-tab-count"
                onClick={(e) => {
                  e.stopPropagation();
                  handleInspectCategory(tab.id);
                }}
                title={`Click number to inspect details for ${tab.label}`}
                style={{ cursor: "pointer" }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* MASTER CONTENT PANELS */}
      <div className="master-content" style={{ marginTop: "16px" }}>

        {/* 1. CLIENTS TAB */}
        {activeTab === "clients" && (
          <div className="master-table-wrapper">
            <table className="master-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Client / Organization Name</th>
                  <th>Sector</th>
                  <th>Department Contact</th>
                  <th>Contact Email / Phone</th>
                  <th style={{ textAlign: "center" }}>Default SLA</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(mastersData.clients || [])
                  .filter((c) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q))
                  .map((c) => (
                    <tr key={c.id}>
                      <td><code className="id-code">{c.code}</code></td>
                      <td><strong>{c.name}</strong></td>
                      <td><span className="client-badge-sm">{c.sector}</span></td>
                      <td style={{ fontSize: "13px" }}>{c.departmentContact || "-"}</td>
                      <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{c.email || "-"} {c.phone ? `· ${c.phone}` : ""}</td>
                      <td style={{ textAlign: "center" }}><span className="sla-days-badge">{c.slaDefault || 2}d</span></td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button
                            type="button"
                            className="btn-tbl-action"
                            onClick={() => {
                              setEditingItem(c);
                              setModalType("clients");
                            }}
                            title="Edit Client"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="btn-tbl-action del"
                            onClick={() => handleDeleteMasterItem("clients", c.id, c.name)}
                            title="Delete Client"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. UNITS / DIVISIONS TAB */}
        {activeTab === "units" && (
          <div className="master-table-wrapper">
            <table className="master-table">
              <thead>
                <tr>
                  <th>Unit ID</th>
                  <th>Unit / Division Name</th>
                  <th>Client Code</th>
                  <th>Zone / Corridor</th>
                  <th>Contact Officer</th>
                  <th>Compliance Target</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(mastersData.units || [])
                  .filter((u) => !q || u.name.toLowerCase().includes(q) || u.clientCode.toLowerCase().includes(q) || (u.zone || "").toLowerCase().includes(q))
                  .map((u) => (
                    <tr key={u.id}>
                      <td><code className="id-code">{u.id}</code></td>
                      <td><strong>{u.name}</strong></td>
                      <td><span className="client-badge-sm">{u.clientCode}</span></td>
                      <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>{u.zone || "-"}</td>
                      <td style={{ fontSize: "13px" }}>{u.contact || "-"}</td>
                      <td><span className="sla-chip sla-good">{u.slaCompliance || "90%"}</span></td>
                      <td><span className="status-active-pill">🟢 Active</span></td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button
                            type="button"
                            className="btn-tbl-action"
                            onClick={() => {
                              setEditingItem(u);
                              setModalType("units");
                            }}
                            title="Edit Unit"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="btn-tbl-action del"
                            onClick={() => handleDeleteMasterItem("units", u.id, u.name)}
                            title="Delete Unit"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. SERVICES TAB */}
        {activeTab === "services" && (
          <div className="services-grid">
            {(mastersData.services || [])
              .filter((s) => !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
              .map((s) => (
                <div key={s.id} className="service-card" style={{ position: "relative" }}>
                  <div className="sc-top">
                    <code className="sc-code">{s.code}</code>
                    <span className="sc-cat">{s.category}</span>
                  </div>
                  <h4 className="sc-name">{s.name}</h4>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "6px 0 10px", lineHeight: 1.5 }}>{s.description || "General services schedule."}</p>
                  <div className="sc-bottom">
                    <div className="sc-meta"><span className="sc-lbl">Unit:</span><span>{s.unit}</span></div>
                    <div className="sc-meta"><span className="sc-lbl">Base Rate:</span><span className="sc-rate">{s.baseRate}</span></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginTop: "12px", borderTop: "1px solid var(--border-light)", paddingTop: "8px" }}>
                    <button
                      type="button"
                      className="btn-tbl-action"
                      onClick={() => {
                        setEditingItem(s);
                        setModalType("services");
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="btn-tbl-action del"
                      onClick={() => handleDeleteMasterItem("services", s.id, s.name)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* 4. BILLING TYPES TAB */}
        {activeTab === "billing-types" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {(mastersData.billingTypes || [])
              .filter((bt) => !q || bt.name.toLowerCase().includes(q) || bt.code.toLowerCase().includes(q))
              .map((bt) => (
                <div key={bt.id} className="master-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <code className="id-code">{bt.code}</code>
                    <span style={{ background: "rgba(var(--accent-primary-rgb),0.1)", color: "var(--accent-primary)", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 700 }}>
                      {bt.billingFrequency}
                    </span>
                  </div>
                  <h4 style={{ margin: "0 0 8px", color: "var(--text-primary)", fontSize: "15px", fontWeight: 700 }}>{bt.name}</h4>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.45, margin: "0 0 12px" }}>{bt.description}</p>
                  <div className="master-card-innerbox" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px", textAlign: "center" }}>
                    <div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Retention</div>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#d97706" }}>{bt.retentionPercent}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Advance Ded.</div>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--accent-primary)" }}>{bt.advanceDeductionPercent}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Terms</div>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#059669" }}>{bt.paymentTermsDays}d</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                    <button
                      type="button"
                      className="btn-tbl-action"
                      onClick={() => {
                        setEditingItem(bt);
                        setModalType("billing-types");
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="btn-tbl-action del"
                      onClick={() => handleDeleteMasterItem("billing-types", bt.id, bt.name)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* 5. BILL MASTER / TRANSACTION TAB */}
        {activeTab === "bills" && (
          <div className="bill-master-container">
            {/* INFORMATIVE SECTION BANNER */}
            <div className="bill-master-info-banner">
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <div className="bmb-icon-badge">📑</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                      5. Bill Master / Transaction Register
                    </h3>
                    <span className="badge-unique-rule">
                      Every bill shall have a unique Bill ID
                    </span>
                    <span className="badge-fifteen-rule">
                      15 Mandatory Statutory Parameters Enforced
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    Centrally tracking all running account and milestone transaction records across <strong>Bill ID (Unique)</strong>, <strong>Bill Number</strong>, <strong>Client</strong>, <strong>Unit</strong>, <strong>Work Order</strong>, <strong>Contract</strong>, <strong>Billing Period</strong>, <strong>Billing Type</strong>, <strong>Bill Amount</strong>, <strong>Submission Date</strong>, <strong>Expected Payment Date</strong>, <strong>Current Stage</strong>, <strong>Responsible Person/Role</strong>, <strong>Status</strong>, and <strong>Payment Status</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* KPI METRICS STRIP */}
            <div className="bm-kpi-grid">
              <div className="bm-kpi-card">
                <div className="bm-kpi-icon" style={{ background: "rgba(37,99,235,0.12)", color: "#2563eb" }}>📑</div>
                <div>
                  <div className="bm-kpi-label">Total Bills Registered</div>
                  <div className="bm-kpi-value">{billMetrics.totalCount} <span className="bm-kpi-sub">Transactions</span></div>
                </div>
              </div>

              <div className="bm-kpi-card">
                <div className="bm-kpi-icon" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>💰</div>
                <div>
                  <div className="bm-kpi-label">Total Sanctioned Value</div>
                  <div className="bm-kpi-value">{formatCurrency(billMetrics.totalGross)}</div>
                </div>
              </div>

              <div className="bm-kpi-card">
                <div className="bm-kpi-icon" style={{ background: "rgba(5,150,105,0.12)", color: "#059669" }}>✅</div>
                <div>
                  <div className="bm-kpi-label">Realized / Paid Amount</div>
                  <div className="bm-kpi-value" style={{ color: "#059669" }}>{formatCurrency(billMetrics.totalPaid)}</div>
                </div>
              </div>

              <div className="bm-kpi-card">
                <div className="bm-kpi-icon" style={{ background: "rgba(217,119,6,0.12)", color: "#d97706" }}>⏳</div>
                <div>
                  <div className="bm-kpi-label">Pending / In-Pipeline</div>
                  <div className="bm-kpi-value" style={{ color: "#d97706" }}>{formatCurrency(billMetrics.totalPending)}</div>
                </div>
              </div>

              <div className="bm-kpi-card">
                <div className="bm-kpi-icon" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>🚨</div>
                <div>
                  <div className="bm-kpi-label">Overdue / SLA Alerts</div>
                  <div className="bm-kpi-value" style={{ color: billMetrics.totalOverdue > 0 ? "#ef4444" : "var(--text-primary)" }}>
                    {billMetrics.totalOverdue} <span className="bm-kpi-sub">Critical</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BILL MASTER SPECIFIC FILTER STRIP */}
            <div className="bm-filter-bar">
              <div className="bm-filter-group">
                <label className="bm-filter-label">Client:</label>
                <select
                  className="bm-select-filter"
                  value={billFilterClient}
                  onChange={(e) => setBillFilterClient(e.target.value)}
                >
                  <option value="ALL">All Clients ({mastersData.bills?.length || 0})</option>
                  {uniqueClients.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="bm-filter-group">
                <label className="bm-filter-label">Workflow Status:</label>
                <select
                  className="bm-select-filter"
                  value={billFilterStatus}
                  onChange={(e) => setBillFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED_EDIT">Returned / Edit</option>
                  <option value="PAID">Paid / Cleared</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div className="bm-filter-group">
                <label className="bm-filter-label">Payment Status:</label>
                <select
                  className="bm-select-filter"
                  value={billFilterPaymentStatus}
                  onChange={(e) => setBillFilterPaymentStatus(e.target.value)}
                >
                  <option value="ALL">All Payment States</option>
                  <option value="UNPAID">⚠️ Unpaid</option>
                  <option value="PROCESSING">⏳ Processing</option>
                  <option value="PAID">✅ Paid</option>
                  <option value="OVERDUE">🚨 Overdue</option>
                </select>
              </div>

              <div className="bm-filter-group">
                <label className="bm-filter-label">Billing Type:</label>
                <select
                  className="bm-select-filter"
                  value={billFilterBillingType}
                  onChange={(e) => setBillFilterBillingType(e.target.value)}
                >
                  <option value="ALL">All Billing Types</option>
                  {uniqueBillingTypes.map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>

              {(billFilterClient !== "ALL" || billFilterStatus !== "ALL" || billFilterPaymentStatus !== "ALL" || billFilterBillingType !== "ALL" || q) && (
                <button
                  type="button"
                  className="btn-clear-filters"
                  onClick={() => {
                    setBillFilterClient("ALL");
                    setBillFilterStatus("ALL");
                    setBillFilterPaymentStatus("ALL");
                    setBillFilterBillingType("ALL");
                    setSearchQuery("");
                  }}
                  title="Clear all active filters"
                >
                  ✕ Reset Filters
                </button>
              )}

              <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--text-muted)", alignSelf: "center" }}>
                Showing <strong>{filteredBills.length}</strong> of <strong>{(mastersData.bills || []).length}</strong> bills
              </div>
            </div>

            {/* BILL MASTER TRANSACTION DATA TABLE */}
            <div className="master-table-wrapper" style={{ overflowX: "auto" }}>
              <table className="master-table bill-master-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: "140px" }}>1. Bill ID (Unique)</th>
                    <th style={{ minWidth: "150px" }}>2. Bill Number</th>
                    <th style={{ minWidth: "110px" }}>3. Client</th>
                    <th style={{ minWidth: "170px" }}>4. Unit</th>
                    <th style={{ minWidth: "130px" }}>5. Work Order</th>
                    <th style={{ minWidth: "140px" }}>6. Contract</th>
                    <th style={{ minWidth: "160px" }}>7. Billing Period</th>
                    <th style={{ minWidth: "160px" }}>8. Billing Type</th>
                    <th style={{ minWidth: "120px", textAlign: "right" }}>9. Bill Amount</th>
                    <th style={{ minWidth: "110px" }}>10. Submission</th>
                    <th style={{ minWidth: "120px" }}>11. Expected Payment</th>
                    <th style={{ minWidth: "180px" }}>12. Current Stage</th>
                    <th style={{ minWidth: "200px" }}>13. Current Responsible Person / Role</th>
                    <th style={{ minWidth: "110px", textAlign: "center" }}>14. Status</th>
                    <th style={{ minWidth: "110px", textAlign: "center" }}>15. Payment Status</th>
                    <th style={{ minWidth: "130px", textAlign: "center", position: "sticky", right: 0, background: "var(--bg-card)", zIndex: 2 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan="16" style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
                        <div style={{ fontSize: "36px", marginBottom: "8px" }}>📑</div>
                        <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>No Bill Master records found</div>
                        <p style={{ margin: "4px 0 16px", fontSize: "13px" }}>
                          No transactions match your current search or filter criteria.
                        </p>
                        <button
                          type="button"
                          className="custom-btn-primary"
                          onClick={() => {
                            setEditingItem(null);
                            setModalType("bills");
                          }}
                        >
                          ➕ Register First Bill Master Transaction
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((b) => {
                      const isOverdue = b.paymentStatus === "OVERDUE" || (b.expectedPaymentDate && new Date(b.expectedPaymentDate).getTime() < Date.now() && b.paymentStatus !== "PAID");
                      const pStatus = (b.paymentStatus || (isOverdue ? "OVERDUE" : "UNPAID")).toUpperCase();
                      const wStatus = (b.workflowStatus || b.status || "UNDER_REVIEW").toUpperCase();

                      return (
                        <tr key={b.id} className="bill-master-row">
                          {/* 1. BILL ID (UNIQUE) */}
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span
                                  className="id-code bill-unique-id"
                                  onClick={() => onNavigateToBillTracker && onNavigateToBillTracker(b.id)}
                                  title="Click to track complete journey in Bill Tracker"
                                  style={{ cursor: "pointer" }}
                                >
                                  {b.id}
                                </span>
                                <button
                                  type="button"
                                  className="btn-copy-mini"
                                  onClick={() => handleCopyBillId(b.id)}
                                  title="Copy unique Bill ID"
                                >
                                  {copiedId === b.id ? "✓" : "📋"}
                                </button>
                              </div>
                              <span className="unique-tag-badge">UNIQUE</span>
                            </div>
                          </td>

                          {/* 2. BILL NUMBER */}
                          <td>
                            <strong style={{ fontSize: "13px", color: "var(--text-primary)", fontFamily: "monospace" }}>
                              {b.billNumber || b.id}
                            </strong>
                          </td>

                          {/* 3. CLIENT */}
                          <td>
                            <span className="client-badge-sm">
                              {b.client || "BBMP"}
                            </span>
                          </td>

                          {/* 4. UNIT */}
                          <td>
                            <div style={{ fontWeight: 600, fontSize: "13px" }}>{b.unit || b.ward || "-"}</div>
                            {b.projectName && (
                              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={b.projectName}>
                                {b.projectName}
                              </div>
                            )}
                          </td>

                          {/* 5. WORK ORDER */}
                          <td>
                            <code className="code-badge-subtle">{b.workOrder || "-"}</code>
                          </td>

                          {/* 6. CONTRACT */}
                          <td>
                            <code className="code-badge-subtle">{b.contract || "-"}</code>
                          </td>

                          {/* 7. BILLING PERIOD */}
                          <td>
                            <span className="period-chip">
                              📅 {b.billingPeriod || "Current RA Period"}
                            </span>
                          </td>

                          {/* 8. BILLING TYPE */}
                          <td>
                            <span className="billing-type-tag">
                              {b.billingType || "Monthly Running Account (RA) Bill"}
                            </span>
                          </td>

                          {/* 9. BILL AMOUNT */}
                          <td style={{ textAlign: "right" }}>
                            <strong style={{ fontSize: "13.5px", color: "var(--text-primary)", fontWeight: 800 }}>
                              {b.amount || formatCurrency(b.amountNum)}
                            </strong>
                          </td>

                          {/* 10. SUBMISSION DATE */}
                          <td>
                            <span style={{ fontSize: "12px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                              {formatDate(b.submissionDate)}
                            </span>
                          </td>

                          {/* 11. EXPECTED PAYMENT DATE */}
                          <td>
                            <div style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                              <span style={{ color: isOverdue ? "#dc2626" : "var(--text-secondary)", fontWeight: isOverdue ? 700 : 500 }}>
                                {formatDate(b.expectedPaymentDate)}
                              </span>
                              {isOverdue && (
                                <span className="sla-chip-mini overdue" style={{ display: "block", marginTop: "2px" }}>
                                  ⚠️ Overdue
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 12. CURRENT STAGE */}
                          <td>
                            <div className="stage-step-chip">
                              Step {b.currentStep || 1}{b.totalSteps ? ` of ${b.totalSteps}` : ""}
                            </div>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", marginTop: "3px" }}>
                              {b.currentStage || b.currentStageName || "Scrutiny"}
                            </div>
                          </td>

                          {/* 13. CURRENT RESPONSIBLE PERSON / ROLE */}
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div className="person-avatar-circle" title={b.currentPerson || "Officer"}>
                                {getInitials(b.currentPerson || b.currentRole || "Off")}
                              </div>
                              <div>
                                <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)" }}>
                                  {b.currentPerson || "Assigned Officer"}
                                </div>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                  {b.currentRole || "Reviewing Authority"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 14. STATUS */}
                          <td style={{ textAlign: "center" }}>
                            <span className={`status-pill status-${wStatus.toLowerCase()}`}>
                              {wStatus === "PAID" ? "🟢 Paid" :
                               wStatus === "UNDER_REVIEW" ? "🟡 Under Review" :
                               wStatus === "APPROVED" ? "🔵 Approved" :
                               wStatus === "REJECTED_EDIT" ? "🔴 Returned / Edit" :
                               wStatus === "CLOSED" ? "⚪ Closed" : wStatus}
                            </span>
                          </td>

                          {/* 15. PAYMENT STATUS */}
                          <td style={{ textAlign: "center" }}>
                            <span className={`payment-status-pill payment-${pStatus.toLowerCase()}`}>
                              {pStatus === "PAID" ? "✅ Paid" :
                               pStatus === "PROCESSING" ? "⏳ Processing" :
                               pStatus === "OVERDUE" ? "🚨 Overdue" :
                               "⚠️ Unpaid"}
                            </span>
                          </td>

                          {/* ACTIONS */}
                          <td style={{ textAlign: "center", position: "sticky", right: 0, background: "var(--bg-card)", zIndex: 1, boxShadow: "-4px 0 8px rgba(0,0,0,0.03)" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                              <button
                                type="button"
                                className="btn-tbl-action"
                                onClick={() => onNavigateToBillTracker && onNavigateToBillTracker(b.id)}
                                title="Open in Bill Tracker & View Stage Journey"
                                style={{ color: "var(--accent-primary)", borderColor: "rgba(var(--accent-primary-rgb),0.3)" }}
                              >
                                🎯 Track
                              </button>
                              <button
                                type="button"
                                className="btn-tbl-action"
                                onClick={() => setActiveTab("workflow-tracking")}
                                title="View in 6. Workflow Tracking Register"
                                style={{ color: "#7c3aed", borderColor: "rgba(124, 58, 237, 0.3)" }}
                              >
                                🛤️ Journey
                              </button>
                              <button
                                type="button"
                                className="btn-tbl-action"
                                onClick={() => {
                                  setEditingItem(b);
                                  setModalType("bills");
                                }}
                                title="Edit Bill Master Record"
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                className="btn-tbl-action del"
                                onClick={() => handleDeleteMasterItem("bills", b.id, b.billNumber || b.id)}
                                title="Delete Bill Record"
                              >
                                🗑️
                              </button>
                            </div>
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

        {/* 6. WORKFLOW TRACKING REGISTER TAB */}
        {activeTab === "workflow-tracking" && (
          <div className="wt-register-container">
            {/* INFORMATIVE SECTION BANNER */}
            <div className="wt-register-info-banner">
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <div className="bmb-icon-badge" style={{ background: "rgba(124, 58, 237, 0.15)", color: "#7c3aed" }}>
                  🛤️
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                      6. Workflow Tracking Register
                    </h3>
                    <span className="badge-unique-rule" style={{ background: "rgba(124, 58, 237, 0.1)", color: "#7c3aed", borderColor: "rgba(124, 58, 237, 0.25)" }}>
                      Submission → Approval stages → Finance → Audit, where applicable → Payment
                    </span>
                    <span className="badge-fifteen-rule">
                      8 Mandated Parameters Enforced
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    Each bill displays its complete journey across <strong>Submission</strong>, <strong>Approval stages</strong>, <strong>Finance</strong>, <strong>Audit (where applicable)</strong>, and <strong>Payment</strong>. The system centrally monitors: <strong>Completed stages</strong>, <strong>Current stage</strong>, <strong>Pending stage</strong>, <strong>Date entered into stage</strong>, <strong>Days pending</strong>, <strong>SLA</strong>, <strong>SLA status</strong>, and <strong>Next stage</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* KPI METRICS STRIP */}
            <div className="bm-kpi-grid">
              <div className="bm-kpi-card" onClick={() => setWtPhaseFilter("ALL")} style={{ cursor: "pointer" }}>
                <div className="bm-kpi-icon" style={{ background: "rgba(37,99,235,0.12)", color: "#2563eb" }}>📑</div>
                <div>
                  <div className="bm-kpi-label">Total Bills Tracked</div>
                  <div className="bm-kpi-value">{mastersData.bills?.length || 0} <span className="bm-kpi-sub">Dockets</span></div>
                </div>
              </div>

              <div className="bm-kpi-card" onClick={() => setWtPhaseFilter("submission")} style={{ cursor: "pointer" }}>
                <div className="bm-kpi-icon" style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}>📥</div>
                <div>
                  <div className="bm-kpi-label">In Submission</div>
                  <div className="bm-kpi-value">
                    {(mastersData.bills || []).filter(b => calculateWorkflowTracking(b)?.currentStage?.phaseId === "submission").length}
                    <span className="bm-kpi-sub">Stage 1</span>
                  </div>
                </div>
              </div>

              <div className="bm-kpi-card" onClick={() => setWtPhaseFilter("approval")} style={{ cursor: "pointer" }}>
                <div className="bm-kpi-icon" style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>✍️</div>
                <div>
                  <div className="bm-kpi-label">In Approval stages</div>
                  <div className="bm-kpi-value">
                    {(mastersData.bills || []).filter(b => calculateWorkflowTracking(b)?.currentStage?.phaseId === "approval").length}
                    <span className="bm-kpi-sub">Field / Exec</span>
                  </div>
                </div>
              </div>

              <div className="bm-kpi-card" onClick={() => setWtPhaseFilter("finance")} style={{ cursor: "pointer" }}>
                <div className="bm-kpi-icon" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>💰</div>
                <div>
                  <div className="bm-kpi-label">In Finance Scrutiny</div>
                  <div className="bm-kpi-value">
                    {(mastersData.bills || []).filter(b => calculateWorkflowTracking(b)?.currentStage?.phaseId === "finance").length}
                    <span className="bm-kpi-sub">DCF / Accts</span>
                  </div>
                </div>
              </div>

              <div className="bm-kpi-card" onClick={() => setWtPhaseFilter("audit")} style={{ cursor: "pointer" }}>
                <div className="bm-kpi-icon" style={{ background: "rgba(124,58,237,0.12)", color: "#7c3aed" }}>🛡️</div>
                <div>
                  <div className="bm-kpi-label">In Audit (Where App.)</div>
                  <div className="bm-kpi-value">
                    {(mastersData.bills || []).filter(b => calculateWorkflowTracking(b)?.currentStage?.phaseId === "audit").length}
                    <span className="bm-kpi-sub">Pre-Audit / DC</span>
                  </div>
                </div>
              </div>

              <div className="bm-kpi-card" onClick={() => setWtPhaseFilter("payment")} style={{ cursor: "pointer" }}>
                <div className="bm-kpi-icon" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>💳</div>
                <div>
                  <div className="bm-kpi-label">In Payment / Disbursed</div>
                  <div className="bm-kpi-value">
                    {(mastersData.bills || []).filter(b => calculateWorkflowTracking(b)?.currentStage?.phaseId === "payment" || b.workflowStatus === "PAID").length}
                    <span className="bm-kpi-sub">Treasury</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FILTER STRIP */}
            <div className="bm-filter-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "12px 16px" }}>
              {/* Workflow Tracking Search Option */}
              <div className="search-input-wrapper" style={{ minWidth: "240px", maxWidth: "340px", height: "34px", padding: "0 10px" }}>
                <span className="search-icon" style={{ fontSize: "12px", marginRight: "6px" }}>🔍</span>
                <input
                  type="text"
                  className="wf-search-input"
                  placeholder="Search workflow bills (ID, project, client)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: "12px", padding: "6px 0" }}
                  title="Search in Workflow Tracking Register"
                />
                {searchQuery && (
                  <button type="button" className="btn-clear-search" onClick={() => setSearchQuery("")} style={{ fontSize: "11px", padding: "2px 4px" }}>✕</button>
                )}
              </div>

              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginRight: "4px" }}>Phase:</span>
                {[
                  { id: "ALL", label: "All Phases" },
                  { id: "submission", label: "📥 1. Submission" },
                  { id: "approval", label: "✍️ 2. Approval stages" },
                  { id: "finance", label: "💰 3. Finance" },
                  { id: "audit", label: "🛡️ 4. Audit, where app." },
                  { id: "payment", label: "💳 5. Payment" }
                ].map((ph) => (
                  <button
                    key={ph.id}
                    type="button"
                    className={`docs-mode-tab ${wtPhaseFilter === ph.id ? "active" : ""}`}
                    onClick={() => setWtPhaseFilter(ph.id)}
                    style={{ fontSize: "11.5px", padding: "4px 10px" }}
                  >
                    {ph.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginRight: "4px" }}>SLA Status:</span>
                {[
                  { id: "ALL", label: "All SLA" },
                  { id: "WITHIN_SLA", label: "🟢 Within SLA" },
                  { id: "APPROACHING_SLA", label: "🟠 Approaching" },
                  { id: "BREACHED_SLA", label: "🔴 Breached" }
                ].map((sla) => (
                  <button
                    key={sla.id}
                    type="button"
                    className={`docs-mode-tab ${wtSlaFilter === sla.id ? "active" : ""}`}
                    onClick={() => setWtSlaFilter(sla.id)}
                    style={{ fontSize: "11.5px", padding: "4px 10px" }}
                  >
                    {sla.label}
                  </button>
                ))}
              </div>
            </div>

            {/* BILL JOURNEY CARDS LIST */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {mastersData.bills
                .filter((b) => {
                  const tracking = calculateWorkflowTracking(b);
                  if (!tracking) return true;
                  if (wtPhaseFilter !== "ALL" && tracking.currentStage?.phaseId !== wtPhaseFilter) return false;
                  if (wtSlaFilter !== "ALL" && tracking.slaStatus !== wtSlaFilter) return false;
                  if (searchQuery) {
                    const match = `${b.id} ${b.billNumber} ${b.projectName} ${b.client} ${b.unit} ${b.contractor}`.toLowerCase();
                    if (!match.includes(searchQuery.toLowerCase())) return false;
                  }
                  return true;
                })
                .map((b) => {
                  const tracking = calculateWorkflowTracking(b);
                  const isExpanded = expandedJourneyBillId === b.id;

                  return (
                    <div key={b.id} className="wt-register-card">
                      {/* Top Header */}
                      <div className="wt-reg-card-top">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <span
                            className="id-code bill-unique-id"
                            onClick={() => onNavigateToBillTracker && onNavigateToBillTracker(b.id)}
                            title="Click to track in Bill Tracker"
                            style={{ cursor: "pointer", fontSize: "14px", fontWeight: 800 }}
                          >
                            {b.id}
                          </span>
                          <span className="client-badge-sm">{b.client || "BBMP"}</span>
                          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{b.unit}</span>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>WO: {b.workOrder}</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>{b.amount}</strong>
                          <span className={`wt-sla-chip ${tracking.slaStatus.toLowerCase()}`}>
                            {tracking.slaStatus === "BREACHED_SLA" ? "🔴 BREACHED" :
                             tracking.slaStatus === "APPROACHING_SLA" ? "🟠 APPROACHING" :
                             "🟢 WITHIN SLA"}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {b.projectName}
                      </div>

                      {/* 5-Phase Macro-Journey Ribbon for this Bill */}
                      <div className="wt-reg-journey-bar">
                        {tracking.journeyPhases.map((ph, idx) => {
                          const isDone = ph.status === "COMPLETED";
                          const isActive = ph.status === "CURRENT";
                          return (
                            <React.Fragment key={ph.id}>
                              <div className={`wt-reg-journey-step ${isDone ? "completed" : isActive ? "active" : "pending"}`}>
                                <span>{ph.icon}</span>
                                <span>{ph.shortLabel || ph.label}</span>
                                <span style={{ fontSize: "10px", opacity: 0.85 }}>
                                  ({ph.completedCount}/{ph.totalCount})
                                </span>
                                {isDone && <span>✓</span>}
                                {isActive && <span>●</span>}
                              </div>
                              {idx < tracking.journeyPhases.length - 1 && (
                                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>➔</span>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* 8 Mandated Specifications Grid */}
                      <div className="wt-reg-criteria-grid">
                        <div className="wt-reg-criterion">
                          <span className="wt-reg-criterion-lbl">1. Completed Stages</span>
                          <span className="wt-reg-criterion-val text-emerald">
                            {tracking.completedStagesCount} / {tracking.totalStages} stages cleared
                          </span>
                        </div>

                        <div className="wt-reg-criterion">
                          <span className="wt-reg-criterion-lbl">2. Current Stage</span>
                          <span className="wt-reg-criterion-val" style={{ color: "var(--accent-primary)" }}>
                            Step {tracking.currentStage.step}: {tracking.currentStage.name}
                          </span>
                        </div>

                        <div className="wt-reg-criterion">
                          <span className="wt-reg-criterion-lbl">3. Pending Stage</span>
                          <span className="wt-reg-criterion-val text-amber">
                            {tracking.pendingStage.name} ({tracking.pendingStagesCount} queued)
                          </span>
                        </div>

                        <div className="wt-reg-criterion">
                          <span className="wt-reg-criterion-lbl">4. Date Entered</span>
                          <span className="wt-reg-criterion-val">
                            {formatStageDate(tracking.dateEnteredIntoStage)}
                          </span>
                        </div>

                        <div className="wt-reg-criterion">
                          <span className="wt-reg-criterion-lbl">5. Days Pending</span>
                          <span className="wt-reg-criterion-val" style={{ color: tracking.daysPending > tracking.stageSlaDays ? "#dc2626" : "inherit" }}>
                            {tracking.daysPending} Day{tracking.daysPending === 1 ? "" : "s"} dwell
                          </span>
                        </div>

                        <div className="wt-reg-criterion">
                          <span className="wt-reg-criterion-lbl">6. Turnaround SLA</span>
                          <span className="wt-reg-criterion-val">
                            {tracking.sla}
                          </span>
                        </div>

                        <div className="wt-reg-criterion">
                          <span className="wt-reg-criterion-lbl">7. SLA Status</span>
                          <span className="wt-reg-criterion-val">
                            {tracking.slaStatus === "BREACHED_SLA" ? "🔴 Breached SLA" :
                             tracking.slaStatus === "APPROACHING_SLA" ? "🟠 Approaching SLA" :
                             "🟢 Within SLA"}
                          </span>
                        </div>

                        <div className="wt-reg-criterion">
                          <span className="wt-reg-criterion-lbl">8. Next Stage</span>
                          <span className="wt-reg-criterion-val" style={{ color: "var(--accent-primary)" }}>
                            {tracking.nextStage ? `Step ${tracking.nextStage.step}: ${tracking.nextStage.name}` : "Payment Disbursed"}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px", flexWrap: "wrap", gap: "8px" }}>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          Authorizing Officer: <strong>{tracking.currentStage.person || tracking.currentStage.role}</strong>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            className="custom-btn-secondary"
                            style={{ padding: "6px 14px", fontSize: "12px" }}
                            onClick={() => setExpandedJourneyBillId(prev => prev === b.id ? null : b.id)}
                          >
                            {isExpanded ? "▲ Hide Stage Matrix" : "▼ Inspect Stage Matrix"}
                          </button>

                          <button
                            type="button"
                            className="custom-btn-primary"
                            style={{ padding: "6px 14px", fontSize: "12px" }}
                            onClick={() => onNavigateToBillTracker && onNavigateToBillTracker(b.id)}
                            title="Open in active Bill Tracker"
                          >
                            🎯 Track in Bill Tracker ›
                          </button>
                        </div>
                      </div>

                      {/* Expanded Stage-by-Stage Matrix Drawer */}
                      {isExpanded && (
                        <div style={{ background: "var(--bg-app)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: "14px", marginTop: "8px" }}>
                          <h5 style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: 800 }}>
                            Stage-by-Stage Operational Audit for {b.id} ({tracking.totalStages} Stages)
                          </h5>
                          <div className="table-responsive">
                            <table className="custom-table" style={{ fontSize: "12px" }}>
                              <thead>
                                <tr>
                                  <th>Step</th>
                                  <th>Phase</th>
                                  <th>Stage Title</th>
                                  <th>Status</th>
                                  <th>SLA</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(b.stages || []).map((stName, idx) => {
                                  const stepNum = idx + 1;
                                  const isDone = stepNum < tracking.currentStage.step;
                                  const isCur = stepNum === tracking.currentStage.step;
                                  const ph = CANONICAL_JOURNEY_PHASES.find(p => p.stages?.some(s => s.step === stepNum));
                                  return (
                                    <tr key={stepNum} style={{ background: isCur ? "rgba(var(--accent-primary-rgb),0.06)" : undefined }}>
                                      <td><strong>Step {stepNum}</strong></td>
                                      <td><span>{ph?.icon || "📋"} {ph?.label || "Approval"}</span></td>
                                      <td><strong>{stName}</strong></td>
                                      <td>
                                        {isDone ? <span className="status-pill status-paid">✓ Passed</span> :
                                         isCur ? <span className="status-pill status-under_review">● Active</span> :
                                         <span className="status-pill status-closed">⏳ Pending</span>}
                                      </td>
                                      <td>{tracking.stageSlaDays}d</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 6. WORKFLOWS (CONFIGURABLE DIGITAL WORKFLOW ENGINE) */}
        {activeTab === "workflows" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Showing <strong>{(mastersData.workflows || []).length} dynamic workflows</strong> currently configured in the digital engine.
                Click <strong>"Configure New Workflow"</strong> or <strong>"✏️ Modify Workflow"</strong> to edit stages, SLAs, and roles.
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
              {(mastersData.workflows || [])
                .filter((w) => !q || w.unit.toLowerCase().includes(q) || w.client.toLowerCase().includes(q) || w.id.toLowerCase().includes(q))
                .map((wf) => (
                  <div key={wf.id} className="master-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <code className="id-code">{wf.id}</code>
                      <span className="client-badge-sm">{wf.client}</span>
                    </div>

                    <h4 style={{ margin: "10px 0 4px", color: "var(--text-primary)", fontSize: "15px", fontWeight: 700 }}>{wf.unit}</h4>
                    <div style={{ fontSize: "12px", color: "var(--accent-primary)", marginBottom: "8px", fontWeight: 600 }}>{wf.serviceType}</div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "6px 0 12px" }}>
                      <span className="stage-count-pill">{wf.stages?.length || 0} Stages</span>
                      <span className="sla-chip sla-good">Total SLA: {wf.totalSlaDays || 21}d</span>
                      {wf.isPilot && <span style={{ background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 700 }}>🎯 Pilot</span>}
                    </div>

                    {/* MINI STAGES PREVIEW */}
                    <div className="master-card-innerbox" style={{ marginBottom: "14px" }}>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 700, textTransform: "uppercase" }}>Stage Route:</div>
                      <div style={{ fontSize: "12px", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>
                        {(wf.stages || []).map((s) => s.name).join(" → ")}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: "10px" }}>
                      <button
                        type="button"
                        className="btn-tbl-action"
                        onClick={() => handleDuplicateWorkflow(wf.id)}
                        title="Duplicate workflow"
                      >
                        📋 Clone
                      </button>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="btn-tbl-action"
                          onClick={() => setWorkflowEditorTarget(wf)}
                          style={{ color: "var(--accent-primary)", borderColor: "rgba(var(--accent-primary-rgb),0.3)", fontWeight: 700 }}
                        >
                          ✏️ Modify Workflow
                        </button>
                        <button
                          type="button"
                          className="btn-tbl-action del"
                          onClick={() => handleDeleteWorkflow(wf.id, wf.unit)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 6. WORKFLOW STAGES (CANONICAL ARCHITECTURE) */}
        {activeTab === "stages" && (
          <div>
            <div style={{ background: "rgba(var(--accent-primary-rgb),0.06)", border: "1px solid rgba(var(--accent-primary-rgb),0.2)", borderRadius: "12px", padding: "18px 22px", marginBottom: "18px" }}>
              <h4 style={{ margin: "0 0 6px", color: "var(--accent-primary)", fontSize: "15px", fontWeight: 700 }}>7 Standard Canonical Stages (Enterprise Baseline)</h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
                Across all organizational workflows, every approval step maps cleanly into these 7 canonical tiers.
                Each tier enforces standardized compliance gates, SLA turnaround parameters, and pre-audit checkpoints.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(mastersData.canonicalStages || []).map((st) => (
                <div key={st.id} className="master-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ background: "linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))", color: "#fff", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>
                    {st.id}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 4px", color: "var(--text-primary)", fontSize: "15px", fontWeight: 700 }}>{st.name}</h4>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{st.objective}</p>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <code className="role-code-badge">{st.defaultRole}</code>
                    <span className="sla-days-badge">{st.defaultSlaDays}d SLA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. RESPONSIBLE ROLES TAB */}
        {activeTab === "roles" && (
          <div className="master-table-wrapper">
            <table className="master-table">
              <thead>
                <tr>
                  <th>Role Code</th>
                  <th>Designation</th>
                  <th>Approval Level</th>
                  <th>Authority & Statutory Scope</th>
                  <th style={{ textAlign: "center" }}>Turnaround SLA</th>
                  <th>Escalation Role</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(mastersData.roles || [])
                  .filter((r) => !q || r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.level.toLowerCase().includes(q))
                  .map((r) => (
                    <tr key={r.id}>
                      <td><code className="role-code-badge">{r.code}</code></td>
                      <td><strong>{r.name}</strong></td>
                      <td><span className={`level-pill level-${(r.level || "").toLowerCase().replace(/[^a-z]/g, "")}`}>{r.level}</span></td>
                      <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{r.authority || "-"}</td>
                      <td style={{ textAlign: "center" }}><span className="sla-hours-badge">{r.slaHours || 24}h</span></td>
                      <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{r.escalationRole || "HOD"}</td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button
                            type="button"
                            className="btn-tbl-action"
                            onClick={() => {
                              setEditingItem(r);
                              setModalType("roles");
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="btn-tbl-action del"
                            onClick={() => handleDeleteMasterItem("roles", r.id, r.name)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 8. RESPONSIBLE PERSONS TAB */}
        {activeTab === "persons" && (
          <div className="master-table-wrapper">
            <table className="master-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Officer Full Name</th>
                  <th>Designated Role</th>
                  <th>Department / Directorate</th>
                  <th>Unit Code</th>
                  <th>Contact Information</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(mastersData.persons || [])
                  .filter((p) => !q || p.name.toLowerCase().includes(q) || (p.roleName || "").toLowerCase().includes(q) || (p.department || "").toLowerCase().includes(q))
                  .map((p) => (
                    <tr key={p.id}>
                      <td><code className="id-code">{p.employeeId || p.id}</code></td>
                      <td><strong>{p.name}</strong></td>
                      <td><code className="role-code-badge">{p.roleCode}</code> <span style={{ fontSize: "12px", color: "var(--text-secondary)", marginLeft: "4px" }}>{p.roleName}</span></td>
                      <td style={{ fontSize: "13px" }}>{p.department || "-"}</td>
                      <td><span className="client-badge-sm">{p.unitCode || "UN-001"}</span></td>
                      <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{p.email} {p.phone ? `· ${p.phone}` : ""}</td>
                      <td><span className="status-active-pill">🟢 Active</span></td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button
                            type="button"
                            className="btn-tbl-action"
                            onClick={() => {
                              setEditingItem(p);
                              setModalType("persons");
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="btn-tbl-action del"
                            onClick={() => handleDeleteMasterItem("persons", p.id, p.name)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 9. SLA POLICIES TAB */}
        {activeTab === "slas" && (
          <div className="master-table-wrapper">
            <table className="master-table">
              <thead>
                <tr>
                  <th>SLA ID</th>
                  <th>Client</th>
                  <th>Workflow / Contract Type</th>
                  <th style={{ textAlign: "center" }}>Total Limit</th>
                  <th style={{ textAlign: "center" }}>Critical Stage Cap</th>
                  <th>Escalation Hierarchy</th>
                  <th>Calendar Mode</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(mastersData.slas || [])
                  .filter((s) => !q || s.code.toLowerCase().includes(q) || s.workflowType.toLowerCase().includes(q) || s.clientCode.toLowerCase().includes(q))
                  .map((s) => (
                    <tr key={s.id}>
                      <td><code className="id-code">{s.code || s.id}</code></td>
                      <td><span className="client-badge-sm">{s.clientCode}</span></td>
                      <td><strong>{s.workflowType}</strong></td>
                      <td style={{ textAlign: "center" }}><span className="sla-days-badge">{s.totalSlaDays}d</span></td>
                      <td style={{ textAlign: "center" }}><span className="critical-sla-badge">{s.criticalStageDays}d</span></td>
                      <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{s.escalationPath || "-"}</td>
                      <td style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>{s.calendarType || "BUSINESS_DAYS"}</td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button
                            type="button"
                            className="btn-tbl-action"
                            onClick={() => {
                              setEditingItem(s);
                              setModalType("slas");
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="btn-tbl-action del"
                            onClick={() => handleDeleteMasterItem("slas", s.id, s.code || s.workflowType)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 10. MANDATORY DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <div className="master-table-wrapper">
            <table className="master-table">
              <thead>
                <tr>
                  <th>Doc Code</th>
                  <th>Document Title</th>
                  <th>Category</th>
                  <th>Allowed Formats</th>
                  <th>Required by Default</th>
                  <th>Verification Guidelines</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(mastersData.documents || [])
                  .filter((d) => !q || d.title.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.category.toLowerCase().includes(q))
                  .map((d) => (
                    <tr key={d.id}>
                      <td><code className="id-code">{d.code}</code></td>
                      <td><strong>{d.title}</strong></td>
                      <td><span className="client-badge-sm">{d.category}</span></td>
                      <td>
                        {(d.allowedExtensions || ["PDF"]).map((ext) => (
                          <span key={ext} style={{ background: "var(--bg-app)", border: "1px solid var(--border-light)", color: "var(--text-secondary)", padding: "2px 7px", borderRadius: "4px", fontSize: "10px", marginRight: "4px", fontWeight: 700 }}>
                            {ext}
                          </span>
                        ))}
                      </td>
                      <td>
                        {d.isRequiredDefault ? (
                          <span style={{ color: "#dc2626", fontSize: "12px", fontWeight: 700 }}>● Mandatory</span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: 500 }}>○ Stage-Specific</span>
                        )}
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--text-secondary)", maxWidth: "340px", lineHeight: 1.45 }}>{d.description || "-"}</td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button
                            type="button"
                            className="btn-tbl-action"
                            onClick={() => {
                              setEditingItem(d);
                              setModalType("documents");
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="btn-tbl-action del"
                            onClick={() => handleDeleteMasterItem("documents", d.id, d.title)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 11. ESCALATION RULES TAB */}
        {activeTab === "escalations" && (
          <div className="master-table-wrapper">
            <table className="master-table">
              <thead>
                <tr>
                  <th>Rule Code</th>
                  <th>Rule Name</th>
                  <th>Trigger Condition</th>
                  <th>Source Role</th>
                  <th>Target Role</th>
                  <th>Automated Action</th>
                  <th>Priority</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(mastersData.escalations || [])
                  .filter((e) => !q || e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q) || e.triggerCondition.toLowerCase().includes(q))
                  .map((e) => (
                    <tr key={e.id}>
                      <td><code className="id-code">{e.code}</code></td>
                      <td><strong>{e.name}</strong></td>
                      <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{e.triggerCondition}</td>
                      <td style={{ fontSize: "12px" }}>{e.sourceRole || "-"}</td>
                      <td style={{ fontSize: "12px", fontWeight: 700, color: "#dc2626" }}>{e.targetRole || "-"}</td>
                      <td><span className="client-badge-sm">{e.action}</span></td>
                      <td>
                        <span className={`sla-sm-badge ${e.priority === "CRITICAL" ? "breached_sla" : e.priority === "HIGH" ? "approaching_sla" : "within_sla"}`}>
                          {e.priority}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button
                            type="button"
                            className="btn-tbl-action"
                            onClick={() => {
                              setEditingItem(e);
                              setModalType("escalations");
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="btn-tbl-action del"
                            onClick={() => handleDeleteMasterItem("escalations", e.id, e.name)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MASTER ITEM CREATE / EDIT MODAL */}
      {modalType && (
        <MasterItemModal
          type={modalType}
          item={editingItem}
          masters={mastersData}
          fetchWithAuth={fetchWithAuth}
          onClose={() => {
            setModalType(null);
            setEditingItem(null);
          }}
          onSaved={() => {
            showToast("Master record saved successfully!");
            loadAllMasters();
          }}
        />
      )}

      {/* WORKFLOW ENGINE CREATE / EDIT MODAL */}
      {workflowEditorTarget && (
        <WorkflowEditorModal
          workflow={workflowEditorTarget === "NEW" ? null : workflowEditorTarget}
          masters={mastersData}
          user={user}
          fetchWithAuth={fetchWithAuth}
          onClose={() => setWorkflowEditorTarget(null)}
          onSaved={(savedWf) => {
            showToast(`Workflow "${savedWf.id}" saved and activated in engine!`);
            loadAllMasters();
          }}
        />
      )}

      {/* MASTER DETAILS INSPECTOR MODAL */}
      {detailsModalCategory && (
        <MasterDetailsModal
          category={detailsModalCategory}
          onSelectCategory={(catId) => {
            setDetailsModalCategory(catId);
            setActiveTab(catId);
          }}
          mastersData={mastersData}
          onClose={() => setDetailsModalCategory(null)}
          onEditItem={(item, cat) => {
            setDetailsModalCategory(null);
            setEditingItem(item);
            setModalType(cat);
          }}
          onAddItem={(cat) => {
            setDetailsModalCategory(null);
            setEditingItem(null);
            setModalType(cat);
          }}
          onViewInTable={(cat) => {
            setDetailsModalCategory(null);
            setActiveTab(cat);
            setSearchQuery("");
          }}
          onOpenWorkflow={(wf) => {
            setDetailsModalCategory(null);
            setWorkflowEditorTarget(wf);
          }}
        />
      )}
    </div>
  );
}
