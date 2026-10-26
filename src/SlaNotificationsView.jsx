import React, { useState, useEffect, useCallback } from "react";

const API = "http://localhost:4000/api";

/* ============================================================
   STATIC DEMO SLA ALERTS — augment live bill data
   ============================================================ */
const DEMO_ALERTS = [
  {
    id: "ALT-001",
    type: "BREACHED_SLA",
    urgency: "CRITICAL",
    billId: "BILL-1003",
    billNumber: "KIADB/WF/2026/057",
    client: "KIADB",
    unit: "KIADB Whitefield Ind. Park",
    projectName: "Industrial Road Resurfacing Phase 2 – Whitefield SEZ",
    currentRole: "Chief Engineer (CE)",
    currentPerson: "A. Rangaiah",
    daysInStage: 8,
    stageSlaDays: 3,
    amount: "₹ 92,50,000",
    message: "Stage SLA exceeded by 5 days at Chief Engineer approval.",
    action: "Escalate to Secretary (Works) immediately.",
    issuedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    slaStatus: "BREACHED_SLA",
  },
  {
    id: "ALT-002",
    type: "APPROACHING_SLA",
    urgency: "HIGH",
    billId: "BILL-1006",
    billNumber: "KSMCL/MIN/2026/041",
    client: "KSMCL",
    unit: "KSMCL Quarry Operations",
    projectName: "Granite Quarry Road & Drainage Improvement",
    currentRole: "General Manager (GM)",
    currentPerson: "M. Krishnaswamy",
    daysInStage: 3,
    stageSlaDays: 4,
    amount: "₹ 18,40,000",
    message: "SLA will be breached in less than 24 hours if no action.",
    action: "Remind GM to complete review before end of business day.",
    issuedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    slaStatus: "APPROACHING_SLA",
  },
  {
    id: "ALT-003",
    type: "RETURNED",
    urgency: "HIGH",
    billId: "BILL-1004",
    billNumber: "KPTCL/POWER/2026/078",
    client: "KPTCL",
    unit: "KPTCL Substation Civil Works",
    projectName: "220KV Substation Civil Expansion – Yelahanka",
    currentRole: "Executive Engineer (EE)",
    currentPerson: "P. Balasubramanian",
    daysInStage: 5,
    stageSlaDays: 2,
    amount: "₹ 1,24,00,000",
    message: "Bill returned due to MB measurement discrepancy at EE stage.",
    action: "Field Officer (AEE) to resubmit corrected measurements within 2 days.",
    issuedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    slaStatus: "RETURNED",
  },
  {
    id: "ALT-004",
    type: "APPROACHING_SLA",
    urgency: "WARNING",
    billId: "BILL-1002",
    billNumber: "BMRCL/METRO/2026/034",
    client: "BMRCL",
    unit: "BMRCL Phase 2 Civil Works",
    projectName: "Metro Phase 2B Underground Station Civil Works",
    currentRole: "CSO / General Manager (Ops)",
    currentPerson: "R. Venkataraman",
    daysInStage: 2,
    stageSlaDays: 3,
    amount: "₹ 3,45,00,000",
    message: "SLA deadline approaching in the next 24–48 hours.",
    action: "Verify document checklist is complete before CSO review.",
    issuedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    slaStatus: "APPROACHING_SLA",
  },
];

function UrgencyBadge({ urgency }) {
  if (urgency === "CRITICAL") return <span className="urg-pill critical">🔴 CRITICAL</span>;
  if (urgency === "HIGH")     return <span className="urg-pill high">⚠️ HIGH</span>;
  return <span className="urg-pill warning">🟠 WARNING</span>;
}

function SlaStatusBadge({ status }) {
  if (status === "BREACHED_SLA")   return <span className="sla-status-badge-sm breached">SLA BREACHED</span>;
  if (status === "APPROACHING_SLA") return <span className="sla-status-badge-sm approaching">APPROACHING SLA</span>;
  if (status === "RETURNED")        return <span className="sla-status-badge-sm returned">RETURNED</span>;
  return <span className="sla-status-badge-sm ok">WITHIN SLA</span>;
}

function AgingCard({ label, subtext, value, colorClass, icon }) {
  return (
    <div className={`aging-kpi-card ${colorClass}`}>
      <div className="aging-kpi-top">
        <span className={`aging-kpi-icon ${colorClass}`}>{icon}</span>
        <span className="aging-kpi-lbl">{label}</span>
      </div>
      <div className="aging-kpi-val">{value}</div>
      <div className="aging-kpi-sub">{subtext}</div>
    </div>
  );
}

export default function SlaNotificationsView({ fetchWithAuth, onSelectBill }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL | BREACHED | APPROACHING | RETURNED | OK
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const loadBills = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${API}/bills`);
      if (res.ok) {
        const data = await res.json();
        setBills(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => { loadBills(); }, [loadBills]);

  // Compute aging bands from bills
  const aging = {
    under7: bills.filter(b => (b.daysInStage || 0) < 7).length,
    days7to15: bills.filter(b => (b.daysInStage || 0) >= 7 && (b.daysInStage || 0) <= 15).length,
    days16to30: bills.filter(b => (b.daysInStage || 0) > 15 && (b.daysInStage || 0) <= 30).length,
    over30: bills.filter(b => (b.daysInStage || 0) > 30).length,
  };

  // Merge live bill SLA data with demo alerts
  const liveSlaAlerts = bills
    .filter(b => b.slaStatus === "BREACHED_SLA" || b.slaStatus === "APPROACHING_SLA")
    .map(b => ({
      id: `LIVE-${b.id}`,
      type: b.slaStatus,
      urgency: b.slaStatus === "BREACHED_SLA" ? "CRITICAL" : "HIGH",
      billId: b.id,
      billNumber: b.billNumber,
      client: b.client,
      unit: b.unit,
      projectName: b.projectName,
      currentRole: b.currentRole,
      currentPerson: b.currentPerson,
      daysInStage: b.daysInStage,
      stageSlaDays: b.stageSlaDays,
      amount: b.amount,
      message: b.slaStatus === "BREACHED_SLA"
        ? `Stage SLA exceeded by ${Math.max(0, b.daysInStage - b.stageSlaDays)} days.`
        : "SLA limit approaching within 24 hours.",
      action: b.slaStatus === "BREACHED_SLA"
        ? "Immediate escalation required."
        : "Reminder issued to responsible officer.",
      issuedAt: new Date().toISOString(),
      slaStatus: b.slaStatus,
    }));

  // Combine, deduplicate
  const allAlerts = [
    ...liveSlaAlerts,
    ...DEMO_ALERTS.filter(d => !liveSlaAlerts.some(l => l.billId === d.billId))
  ].filter(a => !dismissedAlerts.has(a.id));

  const filteredAlerts = filter === "ALL"
    ? allAlerts
    : allAlerts.filter(a => {
        if (filter === "BREACHED")   return a.type === "BREACHED_SLA";
        if (filter === "APPROACHING") return a.type === "APPROACHING_SLA";
        if (filter === "RETURNED")   return a.type === "RETURNED";
        return true;
      });

  const criticalCount   = allAlerts.filter(a => a.urgency === "CRITICAL").length;
  const highCount       = allAlerts.filter(a => a.urgency === "HIGH").length;
  const warningCount    = allAlerts.filter(a => a.urgency === "WARNING").length;

  return (
    <div className="sla-notifications-view">
      {/* Header */}
      <div className="sla-header-card">
        <div className="sla-header-left">
          <div className="sla-tag-row">
            <span className="sla-badge">Phase I — Module 4</span>
            <span className="sla-badge-sub">Real-Time Monitoring & Escalation</span>
            <span className="live-telemetry-pill">
              <span className="pulse-dot" /> LIVE SLA ENGINE
            </span>
          </div>
          <h2 className="sla-title">SLA & Notifications Centre</h2>
          <p className="sla-subtitle">
            Real-time monitoring of bill approval timelines across all active workflows. Automatic reminders,
            overdue alerts, and escalation triggers as configured in the SLA matrix.
          </p>
        </div>
        <div className="sla-header-kpis">
          <div className="shk-card critical">
            <div className="shk-val">{criticalCount}</div>
            <div className="shk-lbl">🔴 Critical</div>
          </div>
          <div className="shk-card high">
            <div className="shk-val">{highCount}</div>
            <div className="shk-lbl">⚠️ High</div>
          </div>
          <div className="shk-card warning">
            <div className="shk-val">{warningCount}</div>
            <div className="shk-lbl">🟠 Warning</div>
          </div>
          <button
            type="button"
            className="btn-refresh-sla"
            onClick={loadBills}
            title="Refresh live SLA data"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Aging Analysis */}
      <div className="sla-section">
        <div className="sla-section-head">
          <h3>📅 Bill Ageing Analysis</h3>
          <span className="section-sub">Distribution of active bills by days pending in current stage</span>
        </div>
        <div className="aging-kpi-row">
          <AgingCard label="< 7 Days" subtext="On Track (Normal)" value={loading ? "—" : aging.under7} colorClass="green" icon="🟢" />
          <AgingCard label="7–15 Days" subtext="Review Stage" value={loading ? "—" : aging.days7to15} colorClass="blue" icon="🔵" />
          <AgingCard label="16–30 Days" subtext="Warning Threshold" value={loading ? "—" : aging.days16to30} colorClass="amber" icon="🟠" />
          <AgingCard label="> 30 Days" subtext="Critical Attention" value={loading ? "—" : aging.over30} colorClass="red" icon="🔴" />
        </div>
      </div>

      {/* Alert Centre */}
      <div className="sla-section">
        <div className="sla-section-head">
          <div>
            <h3>🚨 Active SLA Alerts & Escalations</h3>
            <span className="section-sub">Bills requiring attention or executive intervention</span>
          </div>
          <div className="sla-filter-tabs">
            {[
              { id: "ALL", label: `All (${allAlerts.length})` },
              { id: "BREACHED", label: `Breached (${allAlerts.filter(a => a.type === "BREACHED_SLA").length})` },
              { id: "APPROACHING", label: `Approaching (${allAlerts.filter(a => a.type === "APPROACHING_SLA").length})` },
              { id: "RETURNED", label: `Returned (${allAlerts.filter(a => a.type === "RETURNED").length})` },
            ].map(f => (
              <button key={f.id} type="button"
                className={`sla-filter-tab ${filter === f.id ? "active" : ""}`}
                onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="sla-loading">
            <div className="spinner" />
            <p>Loading SLA telemetry…</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="sla-all-clear">
            <span className="all-clear-icon">🟢</span>
            <div>
              <strong>All Clear!</strong>
              <p>No active SLA alerts in this category. All bills are progressing within their configured timelines.</p>
            </div>
          </div>
        ) : (
          <div className="sla-alerts-list">
            {filteredAlerts.map(alert => (
              <div key={alert.id} className={`sla-alert-card urgency-${alert.urgency.toLowerCase()}`}>
                <div className="sac-header">
                  <div className="sac-id-row">
                    <span className="sac-client">{alert.client}</span>
                    <span className="sac-bill-num">{alert.billNumber}</span>
                    <SlaStatusBadge status={alert.slaStatus} />
                  </div>
                  <div className="sac-right">
                    <UrgencyBadge urgency={alert.urgency} />
                    <button
                      type="button"
                      className="sac-dismiss"
                      onClick={() => setDismissedAlerts(prev => new Set([...prev, alert.id]))}
                      title="Dismiss this alert"
                    >✕</button>
                  </div>
                </div>

                <h4 className="sac-project">{alert.projectName}</h4>

                <div className="sac-meta-grid">
                  <div className="sac-meta-item">
                    <span className="sac-lbl">Unit / Division</span>
                    <strong>{alert.unit}</strong>
                  </div>

                  <div className="sac-meta-item">
                    <span className="sac-lbl">Current Stage</span>
                    <strong>{alert.currentRole}</strong>
                  </div>
                  <div className="sac-meta-item">
                    <span className="sac-lbl">Responsible Officer</span>
                    <strong>{alert.currentPerson}</strong>
                  </div>
                  <div className="sac-meta-item">
                    <span className="sac-lbl">Days in Stage</span>
                    <strong className={alert.daysInStage > alert.stageSlaDays ? "text-red" : "text-amber"}>
                      {alert.daysInStage} days (SLA: {alert.stageSlaDays} days)
                    </strong>
                  </div>
                  <div className="sac-meta-item">
                    <span className="sac-lbl">Alert Issued</span>
                    <strong>{new Date(alert.issuedAt).toLocaleString()}</strong>
                  </div>
                </div>

                <div className="sac-message-box">
                  <span className="sac-msg-icon">{alert.urgency === "CRITICAL" ? "🚨" : "⚡"}</span>
                  <div className="sac-msg-body">
                    <div className="sac-msg-text">{alert.message}</div>
                    <div className="sac-action-text"><strong>Recommended Action:</strong> {alert.action}</div>
                  </div>
                </div>

                {/* SLA progress bar */}
                <div className="sac-sla-bar-wrap">
                  <div className="sac-sla-meta">
                    <span className="sac-sla-title">Stage SLA Consumption</span>
                    <span className="sac-sla-pct">
                      {Math.round((alert.daysInStage / (alert.stageSlaDays || 1)) * 100)}% of SLA used
                    </span>
                  </div>
                  <div className="sac-sla-track">
                    <div
                      className={`sac-sla-fill ${alert.daysInStage > alert.stageSlaDays ? "fill-red" : "fill-amber"}`}
                      style={{ width: `${Math.min(100, Math.round((alert.daysInStage / (alert.stageSlaDays || 1)) * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="sac-footer">
                  <button
                    type="button"
                    className="btn-open-bill-sla"
                    onClick={() => onSelectBill && onSelectBill(alert.billId)}
                  >
                    <span>Open Bill Journey</span>
                    <span className="btn-arrow">➔</span>
                  </button>
                  <button type="button" className="btn-send-reminder" disabled title="Automated reminder — Phase 2 AI feature">
                    📧 Send Reminder
                  </button>
                  <button type="button" className="btn-escalate" disabled title="Escalation engine — Phase 2 feature">
                    ⬆️ Escalate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Settings Preview */}
      <div className="sla-section">
        <div className="sla-section-head">
          <h3>🔔 Notification Configuration</h3>
          <span className="section-sub">Automated alert channels (Phase 2 — AI Enablement)</span>
        </div>
        <div className="notif-config-grid">
          {[
            { icon: "📧", channel: "Email Alerts",    desc: "Auto-email at 75% SLA usage to responsible officer",           status: "Phase 2", statusClass: "phase2" },
            { icon: "📱", channel: "SMS Reminders",   desc: "SMS to officer & supervisor at 90% SLA usage",                  status: "Phase 2", statusClass: "phase2" },
            { icon: "🔔", channel: "In-App Alerts",   desc: "Real-time push notification in dashboard at 100% SLA",          status: "Active",  statusClass: "active" },
            { icon: "📋", channel: "Audit Log Entry", desc: "Auto-recorded in bill audit trail on every SLA event",          status: "Active",  statusClass: "active" },
            { icon: "⬆️", channel: "Auto-Escalation", desc: "Escalate to next authority after SLA breach as per config",     status: "Phase 2", statusClass: "phase2" },
            { icon: "🤖", channel: "AI Prediction",  desc: "Predict delay risk 5 days before SLA breach using ML models",   status: "Phase 3", statusClass: "phase3" },
          ].map(n => (
            <div key={n.channel} className="notif-config-card">
              <div className="ncc-icon">{n.icon}</div>
              <div className="ncc-body">
                <div className="ncc-channel">{n.channel}</div>
                <div className="ncc-desc">{n.desc}</div>
              </div>
              <span className={`ncc-status ${n.statusClass}`}>{n.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
