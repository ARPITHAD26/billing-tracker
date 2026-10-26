import React, { useState, useEffect, useMemo } from "react";

const parseCurrency = (str) => {
  if (!str) return 0;
  if (typeof str === "number") return str;
  return parseFloat(String(str).replace(/[^0-9.]/g, "")) || 0;
};

const formatCurrency = (num) => {
  if (!num) return "₹ 0";
  if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹ ${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `₹ ${(num / 1000).toFixed(1)} K`;
  return `₹ ${num.toLocaleString("en-IN")}`;
};

const formatDate = (val) => {
  if (!val) return "—";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return String(val); }
};

const getMonthLabel = (val) => {
  if (!val) return "Unknown";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "Unknown";
    return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  } catch { return "Unknown"; }
};

const isOverdue = (bill) => {
  const pStatus = (bill.paymentStatus || "").toUpperCase();
  if (pStatus === "PAID") return false;
  if (pStatus === "OVERDUE") return true;
  if (bill.expectedPaymentDate && new Date(bill.expectedPaymentDate).getTime() < Date.now()) return true;
  return false;
};

const getDaysOld = (bill) => {
  const ref = bill.submissionDate || bill.createdAt;
  if (!ref) return 0;
  return Math.floor((Date.now() - new Date(ref).getTime()) / (1000 * 60 * 60 * 24));
};

const getAgeingBucket = (days) => {
  if (days <= 30) return "0–30 days";
  if (days <= 60) return "31–60 days";
  if (days <= 90) return "61–90 days";
  if (days <= 180) return "91–180 days";
  return "180+ days";
};

const PALETTE = [
  "#6366f1","#22d3ee","#f59e0b","#10b981","#f43f5e",
  "#8b5cf6","#14b8a6","#fb923c","#84cc16","#ec4899",
  "#3b82f6","#ef4444","#a3e635","#facc15","#c084fc"
];

/* ============================================================
   DRILL-DOWN MODAL
   ============================================================ */
function DrillDownModal({ title, icon, color, bills, onClose, onSelectBill }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return bills;
    const q = search.toLowerCase();
    return bills.filter(
      (b) =>
        (b.id || "").toLowerCase().includes(q) ||
        (b.client || "").toLowerCase().includes(q) ||
        (b.unit || "").toLowerCase().includes(q) ||
        (b.paymentStatus || "").toLowerCase().includes(q) ||
        (b.currentStage || b.currentStageName || "").toLowerCase().includes(q)
    );
  }, [bills, search]);

  const totalAmt = useMemo(() => filtered.reduce((s, b) => s + (b.amountNum || parseCurrency(b.amount)), 0), [filtered]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="ddm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ddm-modal" style={{ "--ddm-color": color }}>

        {/* Header */}
        <div className="ddm-header">
          <div className="ddm-header-left">
            <span className="ddm-header-icon">{icon}</span>
            <div>
              <div className="ddm-header-title">{title}</div>
              <div className="ddm-header-sub">
                {bills.length} bill{bills.length !== 1 ? "s" : ""} · Total: <strong>{formatCurrency(totalAmt)}</strong>
              </div>
            </div>
          </div>
          <button className="ddm-close-btn" onClick={onClose} title="Close">✕</button>
        </div>

        {/* Search */}
        <div className="ddm-search-wrap">
          <span className="ddm-search-icon">🔍</span>
          <input
            className="ddm-search-input"
            placeholder="Search by Bill ID, Client, Unit, Stage…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="ddm-search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        {/* Summary strip */}
        <div className="ddm-summary-strip">
          <div className="ddm-summary-item">
            <span className="ddm-summary-num" style={{ color }}>{filtered.length}</span>
            <span className="ddm-summary-lbl">Bills Shown</span>
          </div>
          <div className="ddm-summary-item">
            <span className="ddm-summary-num">{formatCurrency(totalAmt)}</span>
            <span className="ddm-summary-lbl">Total Value</span>
          </div>
          <div className="ddm-summary-item">
            <span className="ddm-summary-num ddm-green">
              {filtered.filter(b => (b.paymentStatus||"").toUpperCase() === "PAID").length}
            </span>
            <span className="ddm-summary-lbl">Paid</span>
          </div>
          <div className="ddm-summary-item">
            <span className="ddm-summary-num ddm-red">
              {filtered.filter(b => isOverdue(b)).length}
            </span>
            <span className="ddm-summary-lbl">Overdue</span>
          </div>
        </div>

        {/* Table */}
        <div className="ddm-table-wrap">
          {filtered.length === 0 ? (
            <div className="ddm-empty">
              <span>🔎</span>
              <p>No bills match your search.</p>
            </div>
          ) : (
            <table className="ddm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bill ID</th>
                  <th>Client</th>
                  <th>Unit / Service</th>
                  <th>Submitted</th>
                  <th>Amount</th>
                  <th>Stage</th>
                  <th>Payment</th>
                  <th>Age</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => {
                  const days = getDaysOld(b);
                  const pStatus = (b.paymentStatus || "").toUpperCase();
                  const payBadge = pStatus === "PAID" ? "ddm-pill-green"
                    : isOverdue(b) ? "ddm-pill-red"
                    : pStatus === "PENDING" ? "ddm-pill-amber"
                    : "ddm-pill-gray";
                  const amt = b.amountNum || parseCurrency(b.amount);
                  return (
                    <tr
                      key={b.id}
                      className="ddm-row"
                      onClick={() => { if (onSelectBill) { onSelectBill(b.id); onClose(); } }}
                      title="Click to open bill details"
                    >
                      <td><span className="ddm-rank">{i + 1}</span></td>
                      <td><span className="ddm-bill-id">{b.id}</span></td>
                      <td className="ddm-cell-main">{b.client || "—"}</td>
                      <td className="ddm-cell-sub">{b.unit || b.service || "—"}</td>
                      <td>{formatDate(b.submissionDate || b.createdAt)}</td>
                      <td className="ddm-amt">{formatCurrency(amt)}</td>
                      <td>
                        <span className="ddm-stage-pill">
                          {b.currentStage || b.currentStageName || "—"}
                        </span>
                      </td>
                      <td>
                        <span className={`ddm-pill ${payBadge}`}>
                          {!pStatus ? "Not Set" : pStatus.charAt(0) + pStatus.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`ddm-age-pill ${days > 90 ? "ddm-age-red" : days > 30 ? "ddm-age-amber" : "ddm-age-green"}`}>
                          {days}d
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="ddm-footer">
          <span>Click any row to open full bill details</span>
          <button className="ddm-footer-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, subLabel, subValue, color, highlight, onClick, clickable }) {
  return (
    <div
      className={`dash-kpi-card${highlight ? " dash-kpi-highlight" : ""}${clickable ? " dash-kpi-clickable" : ""}`}
      style={{ "--kpi-color": color }}
      onClick={onClick}
      title={clickable ? `Click to view ${label}` : undefined}
    >
      <div className="dash-kpi-icon">{icon}</div>
      <div className="dash-kpi-body">
        <div className="dash-kpi-value">
          {value}
          {clickable && <span className="dash-kpi-click-hint">🔍</span>}
        </div>
        <div className="dash-kpi-label">{label}</div>
        {subLabel && (
          <div className="dash-kpi-sub">
            <span>{subLabel}:</span>
            {subValue && <strong> {subValue}</strong>}
          </div>
        )}
      </div>
      <div className="dash-kpi-glow" />
    </div>
  );
}

function BarRow({ label, count, total, amount, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="dash-bar-row">
      <div className="dash-bar-label" title={label}>{label}</div>
      <div className="dash-bar-track">
        <div className="dash-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="dash-bar-meta">
        <span className="dash-bar-count">{count}</span>
        <span className="dash-bar-pct">{pct}%</span>
        {amount !== undefined && <span className="dash-bar-amt">{formatCurrency(amount)}</span>}
      </div>
    </div>
  );
}


function SectionHeader({ icon, title, sub }) {
  return (
    <div className="dash-section-header">
      <span className="dash-section-icon">{icon}</span>
      <div>
        <div className="dash-section-title">{title}</div>
        {sub && <div className="dash-section-sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function DashboardView({ fetchWithAuth, onSelectBill }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeAnalysis, setActiveAnalysis] = useState("client");
  const [lastRefresh, setLastRefresh] = useState(null);
  const [drillDown, setDrillDown] = useState(null); // { title, icon, color, bills }

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await (fetchWithAuth
        ? fetchWithAuth("http://localhost:4000/api/masters/all")
        : fetch("http://localhost:4000/api/masters/all"));
      if (!res.ok) throw new Error("Failed to load dashboard data");
      const data = await res.json();
      setBills(data.bills || []);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const metrics = useMemo(() => {
    const total = bills.length;
    let totalValue = 0, paid = 0, paidValue = 0, pending = 0, pendingValue = 0;
    let overdue = 0, overdueValue = 0, inProcess = 0, inProcessValue = 0;
    let returned = 0, requiresIntervention = 0;
    bills.forEach((b) => {
      const amt = b.amountNum || parseCurrency(b.amount);
      totalValue += amt;
      const pStatus = (b.paymentStatus || "").toUpperCase();
      const wfStatus = (b.workflowStatus || b.status || "").toUpperCase();
      if (pStatus === "PAID") { paid++; paidValue += amt; }
      else if (isOverdue(b)) { overdue++; overdueValue += amt; }
      else if (pStatus === "PENDING" || pStatus === "") { pending++; pendingValue += amt; }
      if (pStatus !== "PAID" && !isOverdue(b) && wfStatus !== "RETURNED" && wfStatus !== "REJECTED") { inProcess++; inProcessValue += amt; }
      if (wfStatus === "RETURNED" || wfStatus === "REJECTED") returned++;
      if (wfStatus === "ON_HOLD" || wfStatus === "INTERVENTION_NEEDED" || wfStatus === "ESCALATED") requiresIntervention++;
    });
    return { total, totalValue, paid, paidValue, pending, pendingValue, overdue, overdueValue, inProcess, inProcessValue, returned, requiresIntervention };
  }, [bills]);

  // Bill filter functions for each KPI card
  const kpiFilters = useMemo(() => ({
    total: bills,
    inProcess: bills.filter(b => {
      const pStatus = (b.paymentStatus || "").toUpperCase();
      const wfStatus = (b.workflowStatus || b.status || "").toUpperCase();
      return pStatus !== "PAID" && !isOverdue(b) && wfStatus !== "RETURNED" && wfStatus !== "REJECTED";
    }),
    paid: bills.filter(b => (b.paymentStatus || "").toUpperCase() === "PAID"),
    pending: bills.filter(b => {
      const pStatus = (b.paymentStatus || "").toUpperCase();
      return !isOverdue(b) && (pStatus === "PENDING" || pStatus === "");
    }),
    overdue: bills.filter(b => isOverdue(b)),
    returned: bills.filter(b => {
      const wfStatus = (b.workflowStatus || b.status || "").toUpperCase();
      return wfStatus === "RETURNED" || wfStatus === "REJECTED";
    }),
    requiresIntervention: bills.filter(b => {
      const wfStatus = (b.workflowStatus || b.status || "").toUpperCase();
      return wfStatus === "ON_HOLD" || wfStatus === "INTERVENTION_NEEDED" || wfStatus === "ESCALATED";
    }),
  }), [bills]);

  const openDrillDown = (key, title, icon, color) => {
    setDrillDown({ title, icon, color, bills: kpiFilters[key] || [] });
  };

  const analysisData = useMemo(() => {
    const group = (keyFn) => {
      const map = {};
      bills.forEach((b) => {
        const key = keyFn(b) || "Unknown";
        if (!map[key]) map[key] = { count: 0, amount: 0, paid: 0, overdue: 0 };
        map[key].count++;
        map[key].amount += b.amountNum || parseCurrency(b.amount);
        if ((b.paymentStatus || "").toUpperCase() === "PAID") map[key].paid++;
        if (isOverdue(b)) map[key].overdue++;
      });
      return Object.entries(map).map(([key, v]) => ({ key, ...v })).sort((a, b) => b.amount - a.amount);
    };
    return {
      clientWise: group((b) => b.client),
      unitWise: group((b) => b.unit),
      serviceWise: group((b) => b.service || b.billingType || "General"),
      stageWise: group((b) => b.currentStage || b.currentStageName || "Unknown Stage"),
      ageing: group((b) => getAgeingBucket(getDaysOld(b))),
      monthWise: group((b) => getMonthLabel(b.submissionDate || b.createdAt)),
      paymentStatus: group((b) => {
        const s = (b.paymentStatus || "").toUpperCase();
        return !s ? "Not Set" : s.charAt(0) + s.slice(1).toLowerCase();
      }),
    };
  }, [bills]);

  const analysisTabs = [
    { id: "client", label: "Client-wise", icon: "🏢", rows: analysisData.clientWise },
    { id: "unit", label: "Unit-wise", icon: "🏗️", rows: analysisData.unitWise },
    { id: "service", label: "Service-wise", icon: "⚙️", rows: analysisData.serviceWise },
    { id: "stage", label: "Stage-wise", icon: "🪜", rows: analysisData.stageWise },
    { id: "ageing", label: "Ageing-wise", icon: "📅", rows: analysisData.ageing },
    { id: "month", label: "Month-wise", icon: "📆", rows: analysisData.monthWise },
    { id: "payment", label: "Payment Status", icon: "💳", rows: analysisData.paymentStatus },
  ];

  const activeTab = analysisTabs.find((t) => t.id === activeAnalysis) || analysisTabs[0];

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>Loading dashboard data…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="dash-error">
        <span>⚠️</span>
        <p>{error}</p>
        <button className="dash-btn-retry" onClick={loadDashboard}>Retry</button>
      </div>
    );
  }

  return (
    <div className="dash-root">

      {/* DRILL-DOWN MODAL */}
      {drillDown && (
        <DrillDownModal
          title={drillDown.title}
          icon={drillDown.icon}
          color={drillDown.color}
          bills={drillDown.bills}
          onClose={() => setDrillDown(null)}
          onSelectBill={onSelectBill}
        />
      )}

      {/* HEADER */}
      <div className="dash-header">
        <div className="dash-header-left">
          <div className="dash-header-eyebrow">Management Dashboard · Real-time Analytics</div>
          <h2 className="dash-header-title">📊 Billing Command Centre</h2>
          <div className="dash-header-sub">
            {bills.length} bills · Last refreshed {lastRefresh ? lastRefresh.toLocaleTimeString("en-IN") : "—"}
          </div>
        </div>
        <button className="dash-btn-refresh" onClick={loadDashboard}>🔄 Refresh</button>
      </div>

      {/* SECTION LABEL */}
      <div className="dash-section-label">Overall Summary</div>

      {/* KPI GRID — all count cards are clickable */}
      <div className="dash-kpi-grid">
        <KpiCard icon="📑" label="Total Bills" color="#6366f1" value={metrics.total} subLabel="Total Value" subValue={formatCurrency(metrics.totalValue)} highlight clickable onClick={() => openDrillDown("total", "Total Bills", "📑", "#6366f1")} />
        <KpiCard icon="⚡" label="Bills In Process" color="#22d3ee" value={metrics.inProcess} subLabel="Value" subValue={formatCurrency(metrics.inProcessValue)} clickable onClick={() => openDrillDown("inProcess", "Bills In Process", "⚡", "#22d3ee")} />
        <KpiCard icon="✅" label="Bills Paid" color="#10b981" value={metrics.paid} subLabel="Realised" subValue={formatCurrency(metrics.paidValue)} clickable onClick={() => openDrillDown("paid", "Bills Paid", "✅", "#10b981")} />
        <KpiCard icon="⏳" label="Bills Pending" color="#f59e0b" value={metrics.pending} subLabel="Pending Value" subValue={formatCurrency(metrics.pendingValue)} clickable onClick={() => openDrillDown("pending", "Bills Pending", "⏳", "#f59e0b")} />
        <KpiCard icon="🔴" label="Bills Overdue" color="#f43f5e" value={metrics.overdue} subLabel="Overdue Value" subValue={formatCurrency(metrics.overdueValue)} clickable onClick={() => openDrillDown("overdue", "Bills Overdue", "🔴", "#f43f5e")} />
        <KpiCard icon="↩️" label="Bills Returned" color="#fb923c" value={metrics.returned} clickable onClick={() => openDrillDown("returned", "Bills Returned", "↩️", "#fb923c")} />
        <KpiCard icon="🚨" label="Requires Intervention" color="#8b5cf6" value={metrics.requiresIntervention} clickable onClick={() => openDrillDown("requiresIntervention", "Requires Intervention", "🚨", "#8b5cf6")} />
      </div>


      {/* ANALYSIS SECTION */}
      <div className="dash-section-label" style={{ marginTop: 36 }}>Analysis</div>

      <div className="dash-analysis-tabs">
        {analysisTabs.map((t) => (
          <button key={t.id} type="button" className={`dash-analysis-tab${activeAnalysis === t.id ? " active" : ""}`} onClick={() => setActiveAnalysis(t.id)}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="dash-analysis-panel">
        <SectionHeader icon={activeTab.icon} title={`${activeTab.label} Breakdown`} sub={`${activeTab.rows.length} group(s) · ${bills.length} total bills`} />
        {activeTab.rows.length === 0 ? (
          <div className="dash-analysis-empty">No data available. Register bills with the relevant field populated.</div>
        ) : (
          <div className="dash-analysis-content">
            <div className="dash-bars-col">
              {activeTab.rows.map((row, i) => (
                <BarRow key={row.key} label={row.key} count={row.count} total={bills.length} amount={row.amount} color={PALETTE[i % PALETTE.length]} />
              ))}
            </div>
            <div className="dash-analysis-table-wrap">
              <table className="dash-analysis-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{activeTab.label.replace("-wise","")}</th>
                    <th>Bills</th>
                    <th>Total Value</th>
                    <th>Paid</th>
                    <th>Overdue</th>
                    <th>Realisation</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab.rows.map((row, i) => (
                    <tr key={row.key} className="dash-arow">
                      <td><span className="dash-rank-badge" style={{ background: PALETTE[i % PALETTE.length] }}>{i + 1}</span></td>
                      <td className="dash-arow-name" title={row.key}>{row.key}</td>
                      <td><span className="dash-pill dash-pill-blue">{row.count}</span></td>
                      <td className="dash-arow-amt">{formatCurrency(row.amount)}</td>
                      <td><span className="dash-pill dash-pill-green">{row.paid}</span></td>
                      <td>{row.overdue > 0 ? <span className="dash-pill dash-pill-red">{row.overdue}</span> : <span className="dash-pill dash-pill-gray">0</span>}</td>
                      <td>
                        <div className="dash-mini-bar-wrap">
                          <div className="dash-mini-bar" style={{ width: `${row.count > 0 ? Math.round((row.paid / row.count) * 100) : 0}%`, background: "#10b981" }} />
                          <span>{row.count > 0 ? `${Math.round((row.paid / row.count) * 100)}%` : "—"}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* RECENT BILLS TABLE */}
      <div className="dash-recent-section">
        <SectionHeader icon="🕑" title="Recent Bills" sub="Latest 10 bill transactions" />
        <div className="dash-recent-table-wrap">
          <table className="dash-recent-table">
            <thead>
              <tr>
                <th>Bill ID</th><th>Client</th><th>Unit</th>
                <th>Submitted</th><th>Amount</th><th>Stage</th>
                <th>Payment</th><th>Age</th>
              </tr>
            </thead>
            <tbody>
              {[...bills]
                .sort((a, b) => new Date(b.submissionDate || b.createdAt || 0) - new Date(a.submissionDate || a.createdAt || 0))
                .slice(0, 10)
                .map((b) => {
                  const days = getDaysOld(b);
                  const pStatus = (b.paymentStatus || "").toUpperCase();
                  const badgeClass = pStatus === "PAID" ? "dash-pill-green" : pStatus === "OVERDUE" ? "dash-pill-red" : pStatus === "PENDING" ? "dash-pill-amber" : "dash-pill-gray";
                  return (
                    <tr key={b.id} className="dash-recent-row" onClick={() => onSelectBill && onSelectBill(b.id)}>
                      <td className="dash-recent-id">{b.id}</td>
                      <td className="dash-recent-client">{b.client || "—"}</td>
                      <td>{b.unit || "—"}</td>
                      <td>{formatDate(b.submissionDate)}</td>
                      <td className="dash-arow-amt">{formatCurrency(b.amountNum || parseCurrency(b.amount))}</td>
                      <td><span className="dash-stage-pill">{b.currentStage || b.currentStageName || "—"}</span></td>
                      <td><span className={`dash-pill ${badgeClass}`}>{!pStatus ? "Not Set" : pStatus.charAt(0) + pStatus.slice(1).toLowerCase()}</span></td>
                      <td><span className={`dash-age-pill ${days > 90 ? "dash-age-pill-red" : days > 30 ? "dash-age-pill-amber" : "dash-age-pill-green"}`}>{days}d</span></td>
                    </tr>
                  );
                })}
              {bills.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px", opacity: 0.5 }}>No bill records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
