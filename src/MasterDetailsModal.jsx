import React, { useState, useMemo } from "react";
import {
  calculateWorkflowTracking,
  formatStageDate,
  CANONICAL_JOURNEY_PHASES
} from "./workflowTrackingHelper";

const CATEGORY_META = {
  clients: {
    title: "Clients & Entities",
    singular: "Client",
    icon: "🏢",
    countKey: "clients",
    subtitle: "Public sector entities, municipal corporations, urban transit authorities, and government directorates",
    color: "#2563eb"
  },
  units: {
    title: "Units & Divisions",
    singular: "Unit",
    icon: "🏗️",
    countKey: "units",
    subtitle: "Zonal administrative divisions, corridor wings, and project execution divisions",
    color: "#0891b2"
  },
  services: {
    title: "Services & Schedules",
    singular: "Service",
    icon: "⚙️",
    countKey: "services",
    subtitle: "Contractual work categories, schedule items, standard units, and sanctioned base rates",
    color: "#7c3aed"
  },
  "billing-types": {
    title: "Billing Formats & Commercial Types",
    singular: "Billing Type",
    icon: "💳",
    countKey: "billingTypes",
    subtitle: "Standardized invoicing cycles, advance deductions, retention policies, and payment terms",
    color: "#d97706"
  },
  bills: {
    title: "5. Bill Master / Transactions",
    singular: "Bill Master Record",
    icon: "📑",
    countKey: "bills",
    subtitle: "Every bill shall have a unique Bill ID. Complete audit register across 15 mandatory statutory parameters.",
    color: "#0284c7"
  },
  workflows: {
    title: "Configurable Workflow Engines",
    singular: "Workflow",
    icon: "📜",
    countKey: "workflows",
    subtitle: "End-to-end digital approval pipelines, multi-tier statutory routes, and escalation matrices",
    color: "#059669"
  },
  stages: {
    title: "Canonical Workflow Stages",
    singular: "Stage",
    icon: "🪜",
    countKey: "canonicalStages",
    subtitle: "Enterprise 7-tier standardized statutory scrutiny and verification gates",
    color: "#4f46e5"
  },
  roles: {
    title: "Responsible Authority Roles",
    singular: "Role",
    icon: "👥",
    countKey: "roles",
    subtitle: "Designated approval authorities, statutory scope, turnaround SLAs, and escalation hierarchies",
    color: "#dc2626"
  },
  persons: {
    title: "Responsible Officers & Persons",
    singular: "Officer",
    icon: "👤",
    countKey: "persons",
    subtitle: "Assigned personnel, contact details, directorates, and operational jurisdiction",
    color: "#2563eb"
  },
  slas: {
    title: "SLA Policies & Timelines",
    singular: "SLA Policy",
    icon: "⏱️",
    countKey: "slas",
    subtitle: "Statutory turnaround limits, critical stage caps, and calendar calculation models",
    color: "#d97706"
  },
  documents: {
    title: "Mandatory Compliance Documents",
    singular: "Document",
    icon: "📄",
    countKey: "documents",
    subtitle: "Statutory attachments, measurement sheets, quality certificates, and required formats",
    color: "#0284c7"
  },
  escalations: {
    title: "Automated Escalation Rules",
    singular: "Escalation Rule",
    icon: "🚨",
    countKey: "escalations",
    subtitle: "Breach triggers, priority hierarchies, and automated alerting protocols",
    color: "#e11d48"
  }
};

export default function MasterDetailsModal({
  category,
  onSelectCategory,
  mastersData = {},
  onClose,
  onEditItem,
  onAddItem,
  onViewInTable,
  onOpenWorkflow
}) {
  const [activeCategory, setActiveCategory] = useState(category || "clients");
  const [searchQuery, setSearchQuery] = useState("");

  const currentMeta = CATEGORY_META[activeCategory] || CATEGORY_META.clients;
  const items = mastersData[currentMeta.countKey] || [];

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      return Object.values(item).some((val) => {
        if (typeof val === "string") return val.toLowerCase().includes(q);
        if (typeof val === "number") return String(val).includes(q);
        if (Array.isArray(val)) {
          return val.some((sub) =>
            typeof sub === "string" ? sub.toLowerCase().includes(q) : typeof sub === "object" ? JSON.stringify(sub).toLowerCase().includes(q) : false
          );
        }
        return false;
      });
    });
  }, [items, searchQuery]);

  const handleCategorySwitch = (catId) => {
    setActiveCategory(catId);
    setSearchQuery("");
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  const handleExportCategory = () => {
    const jsonStr = JSON.stringify(items, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billing_control_tower_${activeCategory}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="custom-modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="master-details-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: "16px",
          width: "95vw",
          maxWidth: "1050px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          overflow: "hidden",
          animation: "fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border-light)",
            background: "linear-gradient(to right, rgba(var(--accent-primary-rgb), 0.05), transparent)",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(var(--accent-primary-rgb), 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0
                }}
              >
                {currentMeta.icon}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: "1.28rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    {items.length} {currentMeta.title}
                  </h3>
                  <span
                    style={{
                      background: "rgba(var(--accent-primary-rgb), 0.12)",
                      color: "var(--accent-primary)",
                      fontWeight: 700,
                      fontSize: "12px",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      border: "1px solid rgba(var(--accent-primary-rgb), 0.25)"
                    }}
                  >
                    {filteredItems.length} of {items.length} records
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  {currentMeta.subtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "20px",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "6px 10px",
                borderRadius: "8px",
                lineHeight: 1,
                transition: "all 0.15s ease"
              }}
              aria-label="Close modal"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>

          {/* QUICK CATEGORY SWITCHER PILLS (Shows all categories with their numbers) */}
          <div
            style={{
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              paddingBottom: "4px",
              scrollbarWidth: "thin"
            }}
          >
            {Object.entries(CATEGORY_META).map(([catKey, meta]) => {
              const count = (mastersData[meta.countKey] || []).length;
              const isActive = activeCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => handleCategorySwitch(catKey)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: isActive ? 700 : 500,
                    border: isActive
                      ? "1px solid var(--accent-primary)"
                      : "1px solid var(--border-light)",
                    background: isActive
                      ? "var(--accent-primary)"
                      : "var(--bg-app)",
                    color: isActive ? "#ffffff" : "var(--text-secondary)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                    boxShadow: isActive ? "0 2px 6px rgba(var(--accent-primary-rgb), 0.3)" : "none"
                  }}
                  title={`Switch to ${meta.title} (${count})`}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.singular}</span>
                  <span
                    style={{
                      background: isActive ? "rgba(255, 255, 255, 0.3)" : "rgba(15, 23, 42, 0.08)",
                      color: isActive ? "#ffffff" : "var(--text-primary)",
                      padding: "1px 6px",
                      borderRadius: "10px",
                      fontSize: "11px",
                      fontWeight: 800
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SEARCH AND FILTER BAR */}
        <div
          style={{
            padding: "12px 24px",
            borderBottom: "1px solid var(--border-light)",
            background: "var(--bg-app)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            flexWrap: "wrap"
          }}
        >
          <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: "var(--text-muted)" }}>
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Filter through ${items.length} ${currentMeta.title.toLowerCase()}...`}
              style={{
                width: "100%",
                padding: "8px 34px 8px 36px",
                borderRadius: "8px",
                border: "1px solid var(--border-light)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none"
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: "13px"
                }}
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {onAddItem && activeCategory !== "stages" && (
              <button
                type="button"
                className="custom-btn-primary"
                onClick={() => {
                  onClose();
                  onAddItem(activeCategory);
                }}
                style={{ fontSize: "12px", padding: "7px 14px" }}
              >
                ➕ Add New {currentMeta.singular}
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCategory}
              style={{
                padding: "7px 12px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-primary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
              title="Download JSON export"
            >
              📥 Export JSON
            </button>
          </div>
        </div>

        {/* MODAL BODY: DETAILED LIST OF ITEMS */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>🔍</div>
              <h4 style={{ margin: "0 0 4px", color: "var(--text-primary)" }}>No matching records found</h4>
              <p style={{ margin: 0, fontSize: "13px" }}>
                Try adjusting your search query or switch categories above.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  activeCategory === "services" || activeCategory === "workflows" || activeCategory === "billing-types"
                    ? "repeat(auto-fill, minmax(320px, 1fr))"
                    : "1fr",
                gap: "12px"
              }}
            >
              {filteredItems.map((item, idx) => {
                return (
                  <ItemDetailCard
                    key={item.id || item.code || idx}
                    item={item}
                    category={activeCategory}
                    onEdit={() => {
                      onClose();
                      if (activeCategory === "workflows" && onOpenWorkflow) {
                        onOpenWorkflow(item);
                      } else if (onEditItem) {
                        onEditItem(item, activeCategory);
                      }
                    }}
                    onViewInTable={() => {
                      onClose();
                      if (onViewInTable) {
                        onViewInTable(activeCategory, item.id);
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--border-light)",
            background: "var(--bg-app)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px"
          }}
        >
          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            Showing <strong>{filteredItems.length}</strong> items in <strong>{currentMeta.title}</strong>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onViewInTable) onViewInTable(activeCategory, null);
              }}
              style={{
                padding: "8px 16px",
                background: "rgba(var(--accent-primary-rgb), 0.1)",
                color: "var(--accent-primary)",
                border: "1px solid rgba(var(--accent-primary-rgb), 0.3)",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              📋 Open Full Table View
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 18px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
                color: "var(--text-primary)",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ITEM DETAIL CARD COMPONENT
function ItemDetailCard({ item, category, onEdit, onViewInTable }) {
  switch (category) {
    case "clients":
      return (
        <div className="master-detail-row-card">
          <div className="mdrc-top">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <code className="id-code">{item.code}</code>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                {item.name}
              </h4>
              <span className="client-badge-sm">{item.sector}</span>
            </div>
            <span className="sla-days-badge">{item.slaDefault || 2}d Default SLA</span>
          </div>
          <div className="mdrc-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginTop: "10px" }}>
            <div>
              <span className="mdrc-lbl">Department Contact</span>
              <div style={{ fontSize: "13px", fontWeight: 600 }}>{item.departmentContact || "Chief Engineer / Director"}</div>
            </div>
            <div>
              <span className="mdrc-lbl">Email & Phone</span>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                {item.email || "dept@karnataka.gov.in"} {item.phone ? `· ${item.phone}` : ""}
              </div>
            </div>
            <div>
              <span className="mdrc-lbl">Status</span>
              <span className="status-active-pill">🟢 Active Client</span>
            </div>
          </div>
          <div className="mdrc-actions">
            <button type="button" className="btn-sm-action" onClick={onViewInTable}>
              🔍 View in Table
            </button>
            <button type="button" className="btn-sm-action" onClick={onEdit}>
              ✏️ Edit Client
            </button>
          </div>
        </div>
      );

    case "units":
      return (
        <div className="master-detail-row-card">
          <div className="mdrc-top">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <code className="id-code">{item.id}</code>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                {item.name}
              </h4>
              <span className="client-badge-sm">{item.clientCode}</span>
            </div>
            <span className="sla-chip sla-good">{item.slaCompliance || "90%"} Target</span>
          </div>
          <div className="mdrc-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginTop: "10px" }}>
            <div>
              <span className="mdrc-lbl">Zone / Corridor</span>
              <div style={{ fontSize: "13px", fontWeight: 600 }}>{item.zone || "Central Zonal Corridor"}</div>
            </div>
            <div>
              <span className="mdrc-lbl">Contact Officer</span>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.contact || "Executive Engineer"}</div>
            </div>
            <div>
              <span className="mdrc-lbl">Division Status</span>
              <span className="status-active-pill">🟢 Operational</span>
            </div>
          </div>
          <div className="mdrc-actions">
            <button type="button" className="btn-sm-action" onClick={onViewInTable}>
              🔍 View in Table
            </button>
            <button type="button" className="btn-sm-action" onClick={onEdit}>
              ✏️ Edit Unit
            </button>
          </div>
        </div>
      );

    case "services":
      return (
        <div className="master-detail-row-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="mdrc-top">
              <code className="id-code">{item.code}</code>
              <span className="sc-cat">{item.category}</span>
            </div>
            <h4 style={{ margin: "8px 0 4px", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
              {item.name}
            </h4>
            <p style={{ margin: "4px 0 10px", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              {item.description || "Official engineering rate schedule item."}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-app)", padding: "8px 12px", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Unit: <strong>{item.unit}</strong></span>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--accent-primary)" }}>{item.baseRate}</span>
            </div>
          </div>
          <div className="mdrc-actions" style={{ marginTop: "12px" }}>
            <button type="button" className="btn-sm-action" onClick={onViewInTable}>
              🔍 View
            </button>
            <button type="button" className="btn-sm-action" onClick={onEdit}>
              ✏️ Edit
            </button>
          </div>
        </div>
      );

    case "workflows":
      return (
        <div className="master-detail-row-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="mdrc-top">
              <code className="id-code">{item.id}</code>
              <span className="client-badge-sm">{item.client}</span>
            </div>
            <h4 style={{ margin: "8px 0 2px", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
              {item.unit}
            </h4>
            <div style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: 600, marginBottom: "8px" }}>
              {item.serviceType}
            </div>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
              <span className="stage-count-pill">{item.stages?.length || 0} Stages</span>
              <span className="sla-chip sla-good">Total SLA: {item.totalSlaDays || 21}d</span>
              {item.isPilot && (
                <span style={{ background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a", padding: "1px 6px", borderRadius: "8px", fontSize: "11px", fontWeight: 700 }}>
                  🎯 Pilot
                </span>
              )}
            </div>

            <div style={{ background: "var(--bg-app)", padding: "8px 10px", borderRadius: "6px", fontSize: "11px", color: "var(--text-secondary)" }}>
              <div style={{ fontWeight: 700, marginBottom: "3px", color: "var(--text-muted)" }}>APPROVAL PIPELINE:</div>
              <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {(item.stages || []).map((s) => s.name || s.stageName).join(" → ")}
              </div>
            </div>
          </div>

          <div className="mdrc-actions" style={{ marginTop: "12px" }}>
            <button type="button" className="btn-sm-action" onClick={onViewInTable}>
              🔍 View
            </button>
            <button type="button" className="btn-sm-action" onClick={onEdit}>
              ✏️ Modify Engine
            </button>
          </div>
        </div>
      );

    case "roles":
      return (
        <div className="master-detail-row-card">
          <div className="mdrc-top">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <code className="role-code-badge">{item.code}</code>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                {item.name}
              </h4>
              <span className={`level-pill level-${(item.level || "").toLowerCase().replace(/[^a-z]/g, "")}`}>
                {item.level}
              </span>
            </div>
            <span className="sla-hours-badge">{item.slaHours || 24}h Turnaround</span>
          </div>
          <div className="mdrc-grid" style={{ gridTemplateColumns: "2fr 1fr 1fr", marginTop: "10px" }}>
            <div>
              <span className="mdrc-lbl">Authority & Statutory Scope</span>
              <div style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.45 }}>
                {item.authority || "Statutory bill scrutinizing authority."}
              </div>
            </div>
            <div>
              <span className="mdrc-lbl">Escalation Role</span>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#dc2626" }}>
                {item.escalationRole || "Head of Department (HOD)"}
              </div>
            </div>
            <div>
              <span className="mdrc-lbl">Approval Level</span>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.level || "Field"} Level</div>
            </div>
          </div>
          <div className="mdrc-actions">
            <button type="button" className="btn-sm-action" onClick={onViewInTable}>
              🔍 View in Table
            </button>
            <button type="button" className="btn-sm-action" onClick={onEdit}>
              ✏️ Edit Role
            </button>
          </div>
        </div>
      );

    case "documents":
      return (
        <div className="master-detail-row-card">
          <div className="mdrc-top">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <code className="id-code">{item.code}</code>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                {item.title}
              </h4>
              <span className="client-badge-sm">{item.category}</span>
            </div>
            {item.isRequiredDefault ? (
              <span style={{ color: "#dc2626", fontSize: "12px", fontWeight: 700 }}>● Mandatory</span>
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: 500 }}>○ Stage-Specific</span>
            )}
          </div>
          <div className="mdrc-grid" style={{ gridTemplateColumns: "3fr 1fr", marginTop: "10px" }}>
            <div>
              <span className="mdrc-lbl">Verification Guidelines & Statutory Purpose</span>
              <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                {item.description || "Compliance document required during statutory scrutiny."}
              </div>
            </div>
            <div>
              <span className="mdrc-lbl">Allowed Formats</span>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                {(item.allowedExtensions || ["PDF"]).map((ext) => (
                  <span
                    key={ext}
                    style={{
                      background: "var(--bg-app)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-secondary)",
                      padding: "2px 7px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 700
                    }}
                  >
                    {ext}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mdrc-actions">
            <button type="button" className="btn-sm-action" onClick={onViewInTable}>
              🔍 View in Table
            </button>
            <button type="button" className="btn-sm-action" onClick={onEdit}>
              ✏️ Edit Document
            </button>
          </div>
        </div>
      );

    case "billing-types":
      return (
        <div className="master-detail-row-card">
          <div className="mdrc-top">
            <code className="id-code">{item.code}</code>
            <span style={{ background: "rgba(var(--accent-primary-rgb),0.1)", color: "var(--accent-primary)", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 700 }}>
              {item.billingFrequency}
            </span>
          </div>
          <h4 style={{ margin: "8px 0 4px", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
            {item.name}
          </h4>
          <p style={{ margin: "4px 0 10px", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
            {item.description}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", background: "var(--bg-app)", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700 }}>RETENTION</div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#d97706" }}>{item.retentionPercent}%</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700 }}>ADVANCE DED.</div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--accent-primary)" }}>{item.advanceDeductionPercent}%</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700 }}>TERMS</div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#059669" }}>{item.paymentTermsDays}d</div>
            </div>
          </div>
          <div className="mdrc-actions" style={{ marginTop: "12px" }}>
            <button type="button" className="btn-sm-action" onClick={onViewInTable}>
              🔍 View
            </button>
            <button type="button" className="btn-sm-action" onClick={onEdit}>
              ✏️ Edit
            </button>
          </div>
        </div>
      );

    case "bills": {
      const isOverdue = item.paymentStatus === "OVERDUE" || (item.expectedPaymentDate && new Date(item.expectedPaymentDate).getTime() < Date.now() && item.paymentStatus !== "PAID");
      const pStatus = (item.paymentStatus || (isOverdue ? "OVERDUE" : "UNPAID")).toUpperCase();
      const wStatus = (item.workflowStatus || item.status || "UNDER_REVIEW").toUpperCase();

      return (
        <div className="master-detail-row-card" style={{ borderLeft: "4px solid var(--accent-primary)" }}>
          <div className="mdrc-top" style={{ flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <code className="id-code" style={{ fontSize: "13px", fontWeight: 800 }}>
                {item.id}
              </code>
              <span className="unique-tag-badge">UNIQUE BILL ID</span>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                {item.billNumber || item.id}
              </span>
              <span className="client-badge-sm">{item.client}</span>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginLeft: "auto" }}>
              <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
                {item.amount}
              </span>
              <span className={`payment-status-pill payment-${pStatus.toLowerCase()}`}>
                {pStatus === "PAID" ? "✅ Paid" : pStatus === "PROCESSING" ? "⏳ Processing" : pStatus === "OVERDUE" ? "🚨 Overdue" : "⚠️ Unpaid"}
              </span>
              <span className={`status-pill status-${wStatus.toLowerCase()}`}>
                {wStatus}
              </span>
            </div>
          </div>

          <div className="mdrc-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: "12px", gap: "10px" }}>
            <div>
              <span className="mdrc-lbl">Unit / Location</span>
              <div style={{ fontSize: "13px", fontWeight: 600 }}>{item.unit}</div>
              {item.projectName && <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{item.projectName}</div>}
            </div>
            <div>
              <span className="mdrc-lbl">Work Order & Contract</span>
              <div style={{ fontSize: "12px", fontFamily: "monospace" }}>
                WO: <strong>{item.workOrder || "-"}</strong>
              </div>
              <div style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-secondary)" }}>
                CNT: <strong>{item.contract || "-"}</strong>
              </div>
            </div>
            <div>
              <span className="mdrc-lbl">Billing Period & Type</span>
              <div style={{ fontSize: "12.5px", fontWeight: 600 }}>📅 {item.billingPeriod || "Current RA Period"}</div>
              <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{item.billingType}</div>
            </div>
            <div>
              <span className="mdrc-lbl">Timelines & Expected Payment</span>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Submitted: <strong>{item.submissionDate ? new Date(item.submissionDate).toLocaleDateString() : "-"}</strong>
              </div>
              <div style={{ fontSize: "12px", color: isOverdue ? "#dc2626" : "var(--text-primary)", fontWeight: isOverdue ? 700 : 500 }}>
                Expected: <strong>{item.expectedPaymentDate ? new Date(item.expectedPaymentDate).toLocaleDateString() : "-"}</strong>
                {isOverdue && " (OVERDUE)"}
              </div>
            </div>
            <div>
              <span className="mdrc-lbl">Current Stage</span>
              <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--accent-primary)" }}>
                {item.currentStage || item.currentStageName || `Step ${item.currentStep || 1}`}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Step {item.currentStep || 1} of {item.totalSteps || 15}</div>
            </div>
            <div>
              <span className="mdrc-lbl">Current Responsible Person / Role</span>
              <div style={{ fontSize: "12.5px", fontWeight: 700 }}>
                {item.currentPerson || "Assigned Officer"}
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                {item.currentRole || "Reviewing Authority"}
              </div>
            </div>
          </div>

          {/* 6. WORKFLOW TRACKING MANDATED SPECIFICATION */}
          {(() => {
            const tracking = calculateWorkflowTracking(item);
            if (!tracking) return null;
            return (
              <div style={{ marginTop: "14px", background: "var(--bg-app)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "13px" }}>🛤️</span>
                    <strong style={{ fontSize: "12px", color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      6. Complete Workflow Journey Tracking
                    </strong>
                  </div>
                  <span className={`wt-sla-chip ${tracking.slaStatus.toLowerCase()}`} style={{ fontSize: "10.5px", padding: "2px 6px" }}>
                    {tracking.slaStatus === "BREACHED_SLA" ? "🔴 BREACHED SLA" : tracking.slaStatus === "APPROACHING_SLA" ? "🟠 APPROACHING SLA" : "🟢 WITHIN SLA"}
                  </span>
                </div>

                {/* 5-Phase Macro-Journey Pipeline */}
                <div className="wt-reg-journey-bar" style={{ marginBottom: "10px", padding: "6px 10px" }}>
                  {tracking.journeyPhases.map((ph, idx) => {
                    const isDone = ph.status === "COMPLETED";
                    const isCur = ph.status === "CURRENT";
                    return (
                      <React.Fragment key={ph.id}>
                        <div className={`wt-reg-journey-step ${isDone ? "completed" : isCur ? "active" : "pending"}`} style={{ fontSize: "11px", padding: "3px 6px" }}>
                          <span>{ph.icon}</span>
                          <span>{ph.shortLabel || ph.label}</span>
                          <span style={{ fontSize: "9.5px", opacity: 0.85 }}>({ph.completedCount}/{ph.totalCount})</span>
                          {isDone && <span>✓</span>}
                          {isCur && <span>●</span>}
                        </div>
                        {idx < tracking.journeyPhases.length - 1 && (
                          <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>➔</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* 8 Statutory Criteria Grid */}
                <div className="wt-reg-criteria-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px", padding: "8px" }}>
                  <div className="wt-reg-criterion">
                    <span className="wt-reg-criterion-lbl">1. Completed Stages</span>
                    <span className="wt-reg-criterion-val text-emerald" style={{ fontSize: "11.5px" }}>
                      {tracking.completedStagesCount} / {tracking.totalStages} stages
                    </span>
                  </div>
                  <div className="wt-reg-criterion">
                    <span className="wt-reg-criterion-lbl">2. Current Stage</span>
                    <span className="wt-reg-criterion-val" style={{ fontSize: "11.5px", color: "var(--accent-primary)" }}>
                      Step {tracking.currentStage.step}: {tracking.currentStage.name}
                    </span>
                  </div>
                  <div className="wt-reg-criterion">
                    <span className="wt-reg-criterion-lbl">3. Pending Stage</span>
                    <span className="wt-reg-criterion-val text-amber" style={{ fontSize: "11.5px" }}>
                      {tracking.pendingStage.name} ({tracking.pendingStagesCount} queued)
                    </span>
                  </div>
                  <div className="wt-reg-criterion">
                    <span className="wt-reg-criterion-lbl">4. Date Entered</span>
                    <span className="wt-reg-criterion-val" style={{ fontSize: "11.5px" }}>
                      {formatStageDate(tracking.dateEnteredIntoStage)}
                    </span>
                  </div>
                  <div className="wt-reg-criterion">
                    <span className="wt-reg-criterion-lbl">5. Days Pending</span>
                    <span className="wt-reg-criterion-val" style={{ fontSize: "11.5px", color: tracking.daysPending > tracking.stageSlaDays ? "#dc2626" : "inherit" }}>
                      {tracking.daysPending} Day{tracking.daysPending === 1 ? "" : "s"} dwell
                    </span>
                  </div>
                  <div className="wt-reg-criterion">
                    <span className="wt-reg-criterion-lbl">6. Turnaround SLA</span>
                    <span className="wt-reg-criterion-val" style={{ fontSize: "11.5px" }}>
                      {tracking.sla}
                    </span>
                  </div>
                  <div className="wt-reg-criterion">
                    <span className="wt-reg-criterion-lbl">7. SLA Status</span>
                    <span className="wt-reg-criterion-val" style={{ fontSize: "11.5px" }}>
                      {tracking.slaStatus === "BREACHED_SLA" ? "🔴 Breached" : tracking.slaStatus === "APPROACHING_SLA" ? "🟠 Approaching" : "🟢 Within SLA"}
                    </span>
                  </div>
                  <div className="wt-reg-criterion">
                    <span className="wt-reg-criterion-lbl">8. Next Stage</span>
                    <span className="wt-reg-criterion-val" style={{ fontSize: "11.5px", color: "var(--accent-primary)" }}>
                      {tracking.nextStage ? `Step ${tracking.nextStage.step}: ${tracking.nextStage.name}` : "Disbursed"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="mdrc-actions" style={{ marginTop: "14px", borderTop: "1px solid var(--border-light)", paddingTop: "10px" }}>
            <button type="button" className="btn-sm-action" onClick={onViewInTable}>
              📋 Open in Bill Master Register
            </button>
            <button type="button" className="btn-sm-action" onClick={onEdit}>
              ✏️ Edit Bill Record
            </button>
          </div>
        </div>
      );
    }

    case "stages":
      return (
        <div className="master-detail-row-card">
          <div className="mdrc-top">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ background: "var(--accent-primary)", color: "#fff", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "12px" }}>
                {item.id}
              </div>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                {item.name}
              </h4>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <code className="role-code-badge">{item.defaultRole}</code>
              <span className="sla-days-badge">{item.defaultSlaDays}d SLA</span>
            </div>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {item.objective}
          </p>
          <div className="mdrc-actions">
            <button type="button" className="btn-sm-action" onClick={onViewInTable}>
              🔍 View in Table
            </button>
          </div>
        </div>
      );

    case "persons":
      return (
        <div className="master-detail-row-card">
          <div className="mdrc-top">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <code className="id-code">{item.employeeId || item.id}</code>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                {item.name}
              </h4>
              <code className="role-code-badge">{item.roleCode}</code>
            </div>
            <span className="status-active-pill">🟢 Active</span>
          </div>
          <div className="mdrc-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginTop: "10px" }}>
            <div>
              <span className="mdrc-lbl">Role & Directorate</span>
              <div style={{ fontSize: "13px", fontWeight: 600 }}>{item.roleName} ({item.department || "Engineering"})</div>
            </div>
            <div>
              <span className="mdrc-lbl">Unit / Assignment</span>
              <span className="client-badge-sm">{item.unitCode || "UN-001"}</span>
            </div>
            <div>
              <span className="mdrc-lbl">Contact</span>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                {item.email} {item.phone ? `· ${item.phone}` : ""}
              </div>
            </div>
          </div>
          <div className="mdrc-actions">
            <button type="button" className="btn-sm-action" onClick={onViewInTable}>
              🔍 View in Table
            </button>
            <button type="button" className="btn-sm-action" onClick={onEdit}>
              ✏️ Edit Officer
            </button>
          </div>
        </div>
      );

    case "slas":
      return (
        <div className="master-detail-row-card">
          <div className="mdrc-top">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <code className="id-code">{item.code || item.id}</code>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                {item.workflowType}
              </h4>
              <span className="client-badge-sm">{item.clientCode}</span>
            </div>
            <span className="sla-days-badge">{item.totalSlaDays}d Total SLA</span>
          </div>
          <div className="mdrc-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginTop: "10px" }}>
            <div>
              <span className="mdrc-lbl">Critical Stage Cap</span>
              <span className="critical-sla-badge">{item.criticalStageDays}d max</span>
            </div>
            <div>
              <span className="mdrc-lbl">Escalation Path</span>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.escalationPath || "AE → AEE → EE → CE"}</div>
            </div>
            <div>
              <span className="mdrc-lbl">Calendar Calculation Mode</span>
              <div style={{ fontSize: "12px", fontWeight: 600 }}>{item.calendarType || "BUSINESS_DAYS"}</div>
            </div>
          </div>
          <div className="mdrc-actions">
            <button type="button" className="btn-sm-action" onClick={onViewInTable}>
              🔍 View in Table
            </button>
            <button type="button" className="btn-sm-action" onClick={onEdit}>
              ✏️ Edit SLA
            </button>
          </div>
        </div>
      );

    case "escalations":
      return (
        <div className="master-detail-row-card">
          <div className="mdrc-top">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <code className="id-code">{item.code}</code>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                {item.name}
              </h4>
            </div>
            <span className={`sla-sm-badge ${item.priority === "CRITICAL" ? "breached_sla" : item.priority === "HIGH" ? "approaching_sla" : "within_sla"}`}>
              {item.priority}
            </span>
          </div>
          <div className="mdrc-grid" style={{ gridTemplateColumns: "2fr 1fr 1fr", marginTop: "10px" }}>
            <div>
              <span className="mdrc-lbl">Trigger Condition</span>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.45 }}>{item.triggerCondition}</div>
            </div>
            <div>
              <span className="mdrc-lbl">Hierarchy Route</span>
              <div style={{ fontSize: "12px", fontWeight: 700 }}>
                {item.sourceRole || "AE"} → <span style={{ color: "#dc2626" }}>{item.targetRole || "EE"}</span>
              </div>
            </div>
            <div>
              <span className="mdrc-lbl">Automated Action</span>
              <span className="client-badge-sm">{item.action}</span>
            </div>
          </div>
          <div className="mdrc-actions">
            <button type="button" className="btn-sm-action" onClick={onViewInTable}>
              🔍 View in Table
            </button>
            <button type="button" className="btn-sm-action" onClick={onEdit}>
              ✏️ Edit Rule
            </button>
          </div>
        </div>
      );

    default:
      return (
        <div className="master-detail-row-card">
          <pre style={{ margin: 0, fontSize: "12px" }}>{JSON.stringify(item, null, 2)}</pre>
        </div>
      );
  }
}
