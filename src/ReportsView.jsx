import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pie, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const API = "http://localhost:4000/api";

const CHART_PALETTE = [
  "#3b82f6", // Royal Blue
  "#10b981", // Emerald Green
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#ef4444", // Crimson Red
  "#84cc16", // Lime
  "#a855f7"  // Violet
];

/* ============================================================
   REPORT TYPES
   ============================================================ */
const REPORT_TYPES = [
  { id: "client",  label: "Client-wise Report",     icon: "🏢", desc: "Bills and amounts grouped by client organisation" },
  { id: "unit",    label: "Unit-wise Report",       icon: "🏗️", desc: "Approval performance by organisational division" },
  { id: "stage",   label: "Stage-wise Report",      icon: "📊", desc: "Workflow funnel — bills at each approval stage" },
  { id: "aging",   label: "Ageing Report",          icon: "📅", desc: "Bills segmented by days pending in current stage" },
  { id: "payment", label: "Payment Status Report",  icon: "💰", desc: "Payment cleared vs pending vs in-progress" },
];

const STATUS_LABELS = {
  SUBMITTED:    { label: "Submitted",       cls: "submitted",   color: "#3b82f6" },
  UNDER_REVIEW: { label: "Under Review",   cls: "under_review",color: "#8b5cf6" },
  INVOICE:      { label: "Invoice Stage",  cls: "invoice",     color: "#f59e0b" },
  PAYMENT:      { label: "Payment Queue",  cls: "payment",     color: "#ea580c" },
  PAID:         { label: "Paid & Settled", cls: "paid",        color: "#10b981" },
  CLOSED:       { label: "Closed",         cls: "paid",        color: "#059669" },
  REJECTED_EDIT:{ label: "Returned / Edit",cls: "rejected",    color: "#ef4444" },
  RETURNED:     { label: "Returned",       cls: "rejected",    color: "#ef4444" },
};

function formatCurrency(num) {
  if (!num) return "₹ 0";
  if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000)   return `₹ ${(num / 100000).toFixed(2)} L`;
  return `₹ ${Number(num).toLocaleString("en-IN")}`;
}

function parseCurrency(str) {
  if (!str) return 0;
  if (typeof str === "number") return str;
  return parseFloat(String(str).replace(/[^0-9.]/g, "")) || 0;
}

/* ============================================================
   CLIENT-WISE REPORT WITH PIE, DOUGHNUT & BAR CHARTS
   ============================================================ */
function ClientReport({ bills }) {
  const [chartType, setChartType] = useState("pie"); // "pie" | "doughnut" | "bar"
  const [metric, setMetric] = useState("value"); // "value" | "count"
  const [selectedClient, setSelectedClient] = useState(null);
  const [viewMode, setViewMode] = useState("both"); // "both" | "chart" | "table"

  const grouped = useMemo(() => {
    const map = {};
    bills.forEach(b => {
      const key = b.client || b.clientName || "BBMP";
      if (!map[key]) {
        map[key] = { client: key, bills: [], totalValue: 0, paid: 0, inProcess: 0, breached: 0 };
      }
      map[key].bills.push(b);
      map[key].totalValue += parseCurrency(b.amount || b.grossAmount);
      if (b.workflowStatus === "PAID" || b.workflowStatus === "CLOSED") map[key].paid++;
      else map[key].inProcess++;
      if (b.slaStatus === "BREACHED_SLA") map[key].breached++;
    });
    return Object.values(map).sort((a, b) => b.totalValue - a.totalValue);
  }, [bills]);

  const grandTotal = useMemo(() => grouped.reduce((s, r) => s + r.totalValue, 0), [grouped]);
  const grandBills = useMemo(() => grouped.reduce((s, r) => s + r.bills.length, 0), [grouped]);

  const filteredRows = useMemo(() => {
    if (!selectedClient) return grouped;
    return grouped.filter(r => r.client === selectedClient);
  }, [grouped, selectedClient]);

  const chartData = useMemo(() => {
    const labels = grouped.map(r => r.client);
    const dataValues = grouped.map(r => (metric === "value" ? r.totalValue : r.bills.length));
    const colors = grouped.map((_, i) => CHART_PALETTE[i % CHART_PALETTE.length]);
    return {
      labels,
      datasets: [
        {
          label: metric === "value" ? "Gross Value (₹)" : "Total Bills",
          data: dataValues,
          backgroundColor: colors,
          borderColor: colors.map(c => c),
          borderWidth: 2,
          hoverOffset: 10,
        }
      ]
    };
  }, [grouped, metric]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 650,
      easing: "easeOutQuart"
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#f8fafc",
        titleFont: { size: 13, weight: "bold" },
        bodyColor: "#e2e8f0",
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        borderColor: "rgba(148, 163, 184, 0.2)",
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const label = context.label || "";
            const total = metric === "value" ? grandTotal : grandBills;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            if (metric === "value") {
              return ` ${label}: ${pct}% share`;
            }
            return ` ${label}: ${val} bills (${pct}% share)`;
          }
        }
      }
    }
  }), [metric, grandTotal, grandBills]);

  const barOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: chartOptions.plugins.tooltip
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 11, weight: 600 } }
      },
      y: {
        grid: { color: "rgba(148, 163, 184, 0.15)" },
        ticks: {
          color: "#64748b",
          callback: (v) => metric === "value" ? `${v}` : v
        }
      }
    }
  }), [metric, chartOptions]);

  return (
    <div className="client-report-container">
      {/* Interactive Pie / Doughnut / Bar Chart Showcase Card */}
      {viewMode !== "table" && (
        <div className="reports-chart-card">
          <div className="reports-chart-header">
            <div className="reports-chart-title-group">
              <span className="reports-chart-badge">Visual Analytics</span>
              <h4 className="reports-chart-title">Client Portfolio Distribution</h4>
            </div>

            <div className="reports-chart-controls">
              {/* Metric Selector */}
              <div className="chart-ctrl-group">
                <button
                  type="button"
                  className={`chart-ctrl-btn ${metric === "value" ? "active" : ""}`}
                  onClick={() => setMetric("value")}
                  title="Show portfolio distribution by gross value"
                >
                  <span>Bills</span> Count
                </button>
                <button
                  type="button"
                  className={`chart-ctrl-btn ${metric === "count" ? "active" : ""}`}
                  onClick={() => setMetric("count")}
                  title="Show portfolio distribution by bill count"
                >
                  <span>📑</span> Bill Count
                </button>
              </div>

              {/* Chart Type Selector: Pie / Doughnut / Bar */}
              <div className="chart-ctrl-group">
                <button
                  type="button"
                  className={`chart-ctrl-btn ${chartType === "pie" ? "active" : ""}`}
                  onClick={() => setChartType("pie")}
                  title="Pie Chart"
                >
                  <span>🥧</span> Pie
                </button>
                <button
                  type="button"
                  className={`chart-ctrl-btn ${chartType === "doughnut" ? "active" : ""}`}
                  onClick={() => setChartType("doughnut")}
                  title="Doughnut Chart"
                >
                  <span>🍩</span> Doughnut
                </button>
                <button
                  type="button"
                  className={`chart-ctrl-btn ${chartType === "bar" ? "active" : ""}`}
                  onClick={() => setChartType("bar")}
                  title="Bar Chart"
                >
                  <span>📊</span> Bar
                </button>
              </div>

              {/* View Layout Toggle */}
              <div className="chart-ctrl-group">
                <button
                  type="button"
                  className={`chart-ctrl-btn ${viewMode === "both" ? "active" : ""}`}
                  onClick={() => setViewMode("both")}
                  title="Show both chart and detailed table"
                >
                  Chart + Table
                </button>
                <button
                  type="button"
                  className={`chart-ctrl-btn ${viewMode === "chart" ? "active" : ""}`}
                  onClick={() => setViewMode("chart")}
                  title="Show visual chart only"
                >
                  Chart Only
                </button>
              </div>
            </div>
          </div>

          <div className="reports-chart-grid">
            {/* Left Column: Canvas Chart */}
            <div className="reports-chart-canvas-wrap">
              {chartType === "pie" && <Pie data={chartData} options={chartOptions} />}
              {chartType === "doughnut" && (
                <>
                  <Doughnut data={chartData} options={chartOptions} />
                  <div className="reports-chart-center-metric">
                    <div className="rccm-val">
                      {metric === "value" ? `${grandBills} bills` : grandBills}
                    </div>
                    <div className="rccm-lbl">
                      {metric === "value" ? "Total Portfolio" : "Total Bills"}
                    </div>
                  </div>
                </>
              )}
              {chartType === "bar" && <Bar data={chartData} options={barOptions} />}
            </div>

            {/* Right Column: Interactive Client Legend & Metrics Breakdown */}
            <div className="reports-chart-breakdown">
              {grouped.map((r, i) => {
                const color = CHART_PALETTE[i % CHART_PALETTE.length];
                const pct = grandTotal > 0 ? ((r.totalValue / grandTotal) * 100).toFixed(1) : 0;
                const isSelected = selectedClient === r.client;
                return (
                  <div
                    key={r.client}
                    className={`chart-client-item ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedClient(isSelected ? null : r.client)}
                    title={`Click to ${isSelected ? "clear filter" : `filter table by ${r.client}`}`}
                  >
                    <div className="cci-left">
                      <span className="cci-dot" style={{ background: color }} />
                      <div>
                        <div className="cci-name">{r.client}</div>
                        <div className="cci-sub">
                          {r.bills.length} bill{r.bills.length !== 1 ? "s" : ""} · {r.paid} paid · {r.breached > 0 ? `${r.breached} SLA breach` : "0 breaches"}
                        </div>
                      </div>
                    </div>
                    <div className="cci-right">
                      <span className="cci-val">{r.bills.length} bills</span>
                      <span className="cci-pct">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filter notification banner if a client is selected */}
      {selectedClient && (
        <div className="chart-filter-banner">
          <span>
            🔍 Filtering by client: <strong>{selectedClient}</strong> ({filteredRows[0]?.bills?.length || 0} bills)
          </span>
          <button type="button" className="btn-clear-filter" onClick={() => setSelectedClient(null)}>
            ✕ Clear filter (show all clients)
          </button>
        </div>
      )}

      {/* Client Data Table */}
      {viewMode !== "chart" && (
        <div className="report-table-wrapper">
          <table className="report-data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Total Bills</th>
                <th>In Process</th>
                <th>Paid/Settled</th>
                <th>SLA Breached</th>
                <th>Compliance</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(r => {
                const compliancePct = r.bills.length > 0 ? Math.round(((r.bills.length - r.breached) / r.bills.length) * 100) : 100;
                return (
                  <tr key={r.client}>
                    <td><strong className="client-name-cell">{r.client}</strong></td>
                    <td style={{ textAlign: "center", fontWeight: 700 }}>{r.bills.length}</td>
                    <td style={{ textAlign: "center" }}><span className="count-blue">{r.inProcess}</span></td>
                    <td style={{ textAlign: "center" }}><span className="count-green">{r.paid}</span></td>
                    <td style={{ textAlign: "center" }}>
                      {r.breached > 0 ? <span className="count-red">{r.breached}</span> : <span className="count-green">0</span>}
                    </td>
                    <td>
                      <div className="compliance-bar-wrap">
                        <div className="compliance-track">
                          <div
                            className={`compliance-fill ${compliancePct >= 90 ? "fill-green" : compliancePct >= 75 ? "fill-amber" : "fill-red"}`}
                            style={{ width: `${compliancePct}%` }}
                          />
                        </div>
                        <span className="compliance-pct">{compliancePct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   UNIT-WISE REPORT WITH PIE / DOUGHNUT CHART
   ============================================================ */
function UnitReport({ bills }) {
  const [chartType, setChartType] = useState("pie");

  const grouped = useMemo(() => {
    const map = {};
    bills.forEach(b => {
      const key = b.unit || b.ward || "Municipal Unit";
      if (!map[key]) map[key] = { unit: key, client: b.client || "BBMP", bills: [], totalValue: 0, avgDays: 0, slaBreaches: 0 };
      map[key].bills.push(b);
      map[key].totalValue += parseCurrency(b.amount);
      map[key].avgDays += b.daysInStage || 0;
      if (b.slaStatus === "BREACHED_SLA") map[key].slaBreaches++;
    });
    return Object.values(map).map(r => ({
      ...r,
      avgDays: r.bills.length > 0 ? Math.round(r.avgDays / r.bills.length) : 0
    })).sort((a, b) => b.totalValue - a.totalValue);
  }, [bills]);

  const grandTotal = useMemo(() => grouped.reduce((s, r) => s + r.totalValue, 0), [grouped]);

  const chartData = useMemo(() => {
    return {
      labels: grouped.map(r => r.unit),
      datasets: [{
        label: "Gross Value (₹)",
        data: grouped.map(r => r.totalValue),
        backgroundColor: grouped.map((_, i) => CHART_PALETTE[i % CHART_PALETTE.length]),
        borderWidth: 2,
        hoverOffset: 8
      }]
    };
  }, [grouped]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const pct = grandTotal > 0 ? ((val / grandTotal) * 100).toFixed(1) : 0;
            return ` ${context.label}: (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <div>
      <div className="reports-chart-card">
        <div className="reports-chart-header">
          <div className="reports-chart-title-group">
            <span className="reports-chart-badge">Unit Division</span>
            <h4 className="reports-chart-title">Unit-wise Portfolio Breakdown</h4>
          </div>
          <div className="reports-chart-controls">
            <div className="chart-ctrl-group">
              <button
                type="button"
                className={`chart-ctrl-btn ${chartType === "pie" ? "active" : ""}`}
                onClick={() => setChartType("pie")}
              >
                <span>🥧</span> Pie
              </button>
              <button
                type="button"
                className={`chart-ctrl-btn ${chartType === "doughnut" ? "active" : ""}`}
                onClick={() => setChartType("doughnut")}
              >
                <span>🍩</span> Doughnut
              </button>
            </div>
          </div>
        </div>

        <div className="reports-chart-grid">
          <div className="reports-chart-canvas-wrap">
            {chartType === "pie" ? (
              <Pie data={chartData} options={chartOptions} />
            ) : (
              <>
                <Doughnut data={chartData} options={chartOptions} />
                <div className="reports-chart-center-metric">
                  <div className="rccm-val">{formatCurrency(grandTotal)}</div>
                  <div className="rccm-lbl">All Units</div>
                </div>
              </>
            )}
          </div>
          <div className="reports-chart-breakdown">
            {grouped.map((r, i) => {
              const color = CHART_PALETTE[i % CHART_PALETTE.length];
              const pct = grandTotal > 0 ? ((r.totalValue / grandTotal) * 100).toFixed(1) : 0;
              return (
                <div key={r.unit} className="chart-client-item">
                  <div className="cci-left">
                    <span className="cci-dot" style={{ background: color }} />
                    <div>
                      <div className="cci-name">{r.unit}</div>
                      <div className="cci-sub">{r.client} · {r.bills.length} bills</div>
                    </div>
                  </div>
                  <div className="cci-right">
                    <span className="cci-val">{r.bills.length} bills</span>
                    <span className="cci-pct">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="report-table-wrapper">
        <table className="report-data-table">
          <thead>
            <tr>
              <th>Unit / Division</th>
              <th>Client</th>
              <th>Bills</th>
              <th>Avg Days in Stage</th>
              <th>SLA Breaches</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(r => (
              <tr key={r.unit}>
                <td><strong style={{ fontSize: "13px" }}>{r.unit}</strong></td>
                <td><span className="client-badge-sm">{r.client}</span></td>
                <td style={{ textAlign: "center", fontWeight: 700 }}>{r.bills.length}</td>
                <td style={{ textAlign: "center" }}>
                  <span className={r.avgDays > 5 ? "count-red" : r.avgDays > 3 ? "count-amber" : "count-green"}>
                    {r.avgDays}d
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>
                  {r.slaBreaches > 0 ? <span className="count-red">{r.slaBreaches}</span> : <span className="count-green">0</span>}
                </td>
                <td>
                  <span className={`perf-badge ${r.slaBreaches === 0 && r.avgDays <= 3 ? "good" : r.slaBreaches <= 1 ? "warn" : "poor"}`}>
                    {r.slaBreaches === 0 && r.avgDays <= 3 ? "🟢 Healthy" : r.slaBreaches <= 1 ? "🟠 Moderate" : "🔴 Delayed"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   STAGE-WISE REPORT WITH DOUGHNUT / PIE CHART & FUNNEL
   ============================================================ */
function StageReport({ bills }) {
  const [chartType, setChartType] = useState("doughnut");
  const stageCounts = {};
  const statusOrder = ["SUBMITTED", "UNDER_REVIEW", "REJECTED_EDIT", "RETURNED", "INVOICE", "PAYMENT", "PAID", "CLOSED"];
  
  bills.forEach(b => {
    const st = b.workflowStatus || "SUBMITTED";
    if (!stageCounts[st]) stageCounts[st] = { status: st, count: 0, totalValue: 0 };
    stageCounts[st].count++;
    stageCounts[st].totalValue += parseCurrency(b.amount);
  });
  
  const total = bills.length || 1;
  const rows = statusOrder.filter(s => stageCounts[s]).map(s => ({ ...stageCounts[s] }));
  const grandTotal = rows.reduce((s, r) => s + r.totalValue, 0);

  const chartData = useMemo(() => {
    return {
      labels: rows.map(r => (STATUS_LABELS[r.status] ? STATUS_LABELS[r.status].label : r.status)),
      datasets: [{
        label: "Bills in Stage",
        data: rows.map(r => r.count),
        backgroundColor: rows.map(r => (STATUS_LABELS[r.status] ? STATUS_LABELS[r.status].color : "#64748b")),
        borderWidth: 2,
        hoverOffset: 8
      }]
    };
  }, [rows]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const count = context.raw || 0;
            const pct = Math.round((count / total) * 100);
            const row = rows[context.dataIndex];
            return ` ${context.label}: ${count} bills (${pct}%) — ${formatCurrency(row?.totalValue || 0)}`;
          }
        }
      }
    }
  };

  return (
    <div>
      {/* Stage Visual Pie / Doughnut Chart Card */}
      <div className="reports-chart-card">
        <div className="reports-chart-header">
          <div className="reports-chart-title-group">
            <span className="reports-chart-badge">Workflow Funnel</span>
            <h4 className="reports-chart-title">Stage-wise Workflow Distribution</h4>
          </div>
          <div className="reports-chart-controls">
            <div className="chart-ctrl-group">
              <button
                type="button"
                className={`chart-ctrl-btn ${chartType === "doughnut" ? "active" : ""}`}
                onClick={() => setChartType("doughnut")}
              >
                <span>🍩</span> Doughnut
              </button>
              <button
                type="button"
                className={`chart-ctrl-btn ${chartType === "pie" ? "active" : ""}`}
                onClick={() => setChartType("pie")}
              >
                <span>🥧</span> Pie
              </button>
            </div>
          </div>
        </div>

        <div className="reports-chart-grid">
          <div className="reports-chart-canvas-wrap">
            {chartType === "doughnut" ? (
              <>
                <Doughnut data={chartData} options={chartOptions} />
                <div className="reports-chart-center-metric">
                  <div className="rccm-val">{bills.length}</div>
                  <div className="rccm-lbl">Active Bills</div>
                </div>
              </>
            ) : (
              <Pie data={chartData} options={chartOptions} />
            )}
          </div>
          <div className="reports-chart-breakdown">
            {rows.map(r => {
              const sl = STATUS_LABELS[r.status] || { label: r.status, color: "#64748b" };
              const pct = Math.round((r.count / total) * 100);
              return (
                <div key={r.status} className="chart-client-item">
                  <div className="cci-left">
                    <span className="cci-dot" style={{ background: sl.color }} />
                    <div>
                      <div className="cci-name">{sl.label}</div>
                      <div className="cci-sub">{r.count} bills</div>
                    </div>
                  </div>
                  <div className="cci-right">
                    <span className="cci-val">{r.count} bill{r.count !== 1 ? "s" : ""}</span>
                    <span className="cci-pct">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Funnel Progress Bars */}
      <div className="funnel-bars">
        {rows.map(r => {
          const pct = Math.round((r.count / total) * 100);
          const sl = STATUS_LABELS[r.status] || { label: r.status, cls: "default" };
          return (
            <div key={r.status} className="funnel-bar-row">
              <div className="fbr-label">
                <span className={`status-dot dot-${sl.cls}`} />
                <span className="fbr-status-name">{sl.label}</span>
              </div>
              <div className="fbr-track">
                <div className={`fbr-fill fill-${sl.cls}`} style={{ width: `${Math.max(pct, 3)}%` }} />
              </div>
              <div className="fbr-right">
                <span className="fbr-count">{r.count} bill{r.count !== 1 ? "s" : ""}</span>

                <span className="fbr-pct">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="stage-report-note">
        Total bills: <strong>{bills.length}</strong>
      </div>
    </div>
  );
}

/* ============================================================
   AGEING REPORT
   ============================================================ */
function AgingReport({ bills }) {
  const bands = [
    { label: "< 7 Days",     cls: "green",  filter: b => (b.daysInStage || 0) < 7 },
    { label: "7–15 Days",    cls: "blue",   filter: b => (b.daysInStage || 0) >= 7 && (b.daysInStage || 0) <= 15 },
    { label: "16–30 Days",   cls: "amber",  filter: b => (b.daysInStage || 0) > 15 && (b.daysInStage || 0) <= 30 },
    { label: "31–45 Days",   cls: "orange", filter: b => (b.daysInStage || 0) > 30 && (b.daysInStage || 0) <= 45 },
    { label: "> 45 Days",    cls: "red",    filter: b => (b.daysInStage || 0) > 45 },
  ];
  const [activeBand, setActiveBand] = useState(null);
  const displayBills = activeBand ? bills.filter(activeBand.filter) : [];

  return (
    <div>
      <div className="aging-band-cards">
        {bands.map(band => {
          const matching = bills.filter(band.filter);
          const isActive = activeBand === band;
          return (
            <button
              key={band.label}
              type="button"
              className={`aging-band-card aging-${band.cls} ${isActive ? "selected" : ""}`}
              onClick={() => setActiveBand(isActive ? null : band)}
            >
              <div className="abc-val">{matching.length}</div>
              <div className="abc-label">{band.label}</div>
              <div className="abc-sub">{matching.length} bills</div>
            </button>
          );
        })}
      </div>

      {activeBand && (
        <div className="aging-detail-table">
          <div className="adt-head">
            Bills aged <strong>{activeBand.label}</strong> ({displayBills.length} bills)
          </div>
          <div className="report-table-wrapper">
            <table className="report-data-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Stage</th>
                  <th>Days in Stage</th>
                  <th>SLA Status</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayBills.map(b => (
                  <tr key={b.id}>
                    <td><code className="bill-id-code">{b.id}</code></td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {b.projectName}
                    </td>
                    <td><span className="client-badge-sm">{b.client}</span></td>
                    <td style={{ fontSize: "12px" }}>{b.currentRole || `Step ${b.currentStep}`}</td>
                    <td style={{ textAlign: "center" }}>
                      <strong className={b.daysInStage > (b.stageSlaDays || 2) ? "count-red" : "count-green"}>
                        {b.daysInStage}d
                      </strong>
                    </td>
                    <td>
                      <span className={`sla-sm-badge ${(b.slaStatus || "WITHIN_SLA").toLowerCase()}`}>
                        {b.slaStatus === "BREACHED_SLA" ? "🔴 Breached" : b.slaStatus === "APPROACHING_SLA" ? "🟠 Approaching" : "🟢 OK"}
                      </span>
                    </td>
                    <td className="val-green">{b.currentRole || `Step ${b.currentStep}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!activeBand && <div className="aging-hint">Click a band above to see the detailed bill list.</div>}
    </div>
  );
}

/* ============================================================
   PAYMENT STATUS REPORT WITH PIE / DOUGHNUT CHART
   ============================================================ */
function PaymentReport({ bills }) {
  const paid    = bills.filter(b => b.workflowStatus === "PAID" || b.workflowStatus === "CLOSED");
  const inQueue = bills.filter(b => b.workflowStatus === "PAYMENT" || b.workflowStatus === "INVOICE");
  const pending = bills.filter(b => !["PAID", "CLOSED", "PAYMENT", "INVOICE"].includes(b.workflowStatus));

  const paidTotal    = paid.reduce((s, b) => s + parseCurrency(b.amount), 0);
  const inQueueTotal = inQueue.reduce((s, b) => s + parseCurrency(b.amount), 0);
  const pendingTotal = pending.reduce((s, b) => s + parseCurrency(b.amount), 0);
  const grandTotal   = paidTotal + inQueueTotal + pendingTotal;

  const chartData = {
    labels: ["Paid & Settled", "In Payment Queue", "Under Approval"],
    datasets: [{
      data: [paidTotal, inQueueTotal, pendingTotal],
      backgroundColor: ["#10b981", "#f59e0b", "#3b82f6"],
      borderWidth: 2,
      hoverOffset: 8
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const pct = grandTotal > 0 ? ((val / grandTotal) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${formatCurrency(val)} (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <div>
      {/* Payment Visual Doughnut Chart Card */}
      <div className="reports-chart-card">
        <div className="reports-chart-header">
          <div className="reports-chart-title-group">
            <span className="reports-chart-badge">Disbursement Intelligence</span>
            <h4 className="reports-chart-title">Payment Settlement Breakdown</h4>
          </div>
        </div>

        <div className="reports-chart-grid">
          <div className="reports-chart-canvas-wrap">
            <Doughnut data={chartData} options={chartOptions} />
            <div className="reports-chart-center-metric">
              <div className="rccm-val">{bills.length} bills</div>
              <div className="rccm-lbl">Disbursement Portfolio</div>
            </div>
          </div>
          <div className="reports-chart-breakdown">
            <div className="chart-client-item">
              <div className="cci-left">
                <span className="cci-dot" style={{ background: "#10b981" }} />
                <div>
                  <div className="cci-name">Paid & Settled</div>
                  <div className="cci-sub">{paid.length} bills cleared via RTGS</div>
                </div>
              </div>
              <div className="cci-right">
                <span className="cci-val">{paid.length} bills</span>
                <span className="cci-pct">{grandTotal > 0 ? Math.round((paidTotal / grandTotal) * 100) : 0}%</span>
              </div>
            </div>
            <div className="chart-client-item">
              <div className="cci-left">
                <span className="cci-dot" style={{ background: "#f59e0b" }} />
                <div>
                  <div className="cci-name">In Payment Queue</div>
                  <div className="cci-sub">{inQueue.length} bills at Invoice/Payment stage</div>
                </div>
              </div>
              <div className="cci-right">
                <span className="cci-val">{inQueue.length} bills</span>
                <span className="cci-pct">{grandTotal > 0 ? Math.round((inQueueTotal / grandTotal) * 100) : 0}%</span>
              </div>
            </div>
            <div className="chart-client-item">
              <div className="cci-left">
                <span className="cci-dot" style={{ background: "#3b82f6" }} />
                <div>
                  <div className="cci-name">Under Approval</div>
                  <div className="cci-sub">{pending.length} bills in review pipeline</div>
                </div>
              </div>
              <div className="cci-right">
                <span className="cci-val">{pending.length} bills</span>
                <span className="cci-pct">{grandTotal > 0 ? Math.round((pendingTotal / grandTotal) * 100) : 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="payment-summary-cards">
        <div className="psc-card paid">
          <div className="psc-icon">✅</div>
          <div className="psc-body">
            <div className="psc-val">{paid.length} bills</div>
            <div className="psc-lbl">Paid & Settled</div>
            <div className="psc-count">{paid.length} bills via RTGS/Treasury</div>
          </div>
        </div>
        <div className="psc-card queue">
          <div className="psc-icon">⏳</div>
          <div className="psc-body">
            <div className="psc-val">{inQueue.length} bills</div>
            <div className="psc-lbl">In Payment Queue</div>
            <div className="psc-count">{inQueue.length} bills at Invoice/Payment stage</div>
          </div>
        </div>
        <div className="psc-card pending">
          <div className="psc-icon">📋</div>
          <div className="psc-body">
            <div className="psc-val">{pending.length} bills</div>
            <div className="psc-lbl">Under Approval</div>
            <div className="psc-count">{pending.length} bills in workflow pipeline</div>
          </div>
        </div>
      </div>

      <div className="payment-progress-bar-wrap">
        <div className="ppb-label">Portfolio Disbursement Progress</div>
        <div className="ppb-track">
          <div className="ppb-fill paid"  style={{ width: `${grandTotal > 0 ? (paidTotal / grandTotal) * 100 : 0}%` }} title="Paid" />
          <div className="ppb-fill queue" style={{ width: `${grandTotal > 0 ? (inQueueTotal / grandTotal) * 100 : 0}%` }} title="In Queue" />
          <div className="ppb-fill pend"  style={{ width: `${grandTotal > 0 ? (pendingTotal / grandTotal) * 100 : 0}%` }} title="Pending" />
        </div>
        <div className="ppb-legend">
          <span className="ppb-leg-item paid">Paid: {grandTotal > 0 ? Math.round((paidTotal / grandTotal) * 100) : 0}%</span>
          <span className="ppb-leg-item queue">In Queue: {grandTotal > 0 ? Math.round((inQueueTotal / grandTotal) * 100) : 0}%</span>
          <span className="ppb-leg-item pend">Pending: {grandTotal > 0 ? Math.round((pendingTotal / grandTotal) * 100) : 0}%</span>
        </div>
      </div>

      <div className="report-table-wrapper" style={{ marginTop: "20px" }}>
        <div className="payment-table-head">All Bills — Payment Status</div>
        <table className="report-data-table">
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Project</th>
              <th>Client</th>
              <th>Payment Status</th>
              <th>Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {bills.map(b => {
              const sl = STATUS_LABELS[b.workflowStatus] || { label: b.workflowStatus || "—", cls: "default" };
              return (
                <tr key={b.id}>
                  <td><code className="bill-id-code">{b.id}</code></td>
                  <td style={{ fontSize: "13px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {b.projectName}
                  </td>
                  <td><span className="client-badge-sm">{b.client}</span></td>
                  <td><span className={`status-pill-badge ${sl.cls}`}>{sl.label}</span></td>
                  <td style={{ fontSize: "12px", color: b.paymentDate ? "#34d399" : "#64748b" }}>
                    {b.paymentDate ? new Date(b.paymentDate).toLocaleDateString() : b.expectedPaymentDate ? `Exp: ${new Date(b.expectedPaymentDate).toLocaleDateString()}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN REPORTS VIEW
   ============================================================ */
export default function ReportsView({ fetchWithAuth, onSelectBill }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState("client");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${API}/reports`);
      if (res.ok) {
        const data = await res.json();
        setBills(data.bills || []);
      }
    } catch {
      // fallback: load bills list
      try {
        const res2 = await fetchWithAuth(`${API}/bills`);
        if (res2.ok) setBills(await res2.json());
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => { loadData(); }, [loadData]);

  const totalValue = bills.reduce((s, b) => s + parseCurrency(b.amount), 0);
  const paidCount  = bills.filter(b => b.workflowStatus === "PAID" || b.workflowStatus === "CLOSED").length;
  const breachedCount = bills.filter(b => b.slaStatus === "BREACHED_SLA").length;

  return (
    <div className="reports-full-view">
      {/* Header */}
      <div className="reports-header-card">
        <div className="reports-header-left">
          <div className="reports-tag-row">
            <span className="reports-badge">Phase I — Module 6</span>
            <span className="reports-badge-sub">Analytics & Intelligence</span>
          </div>
          <h2 className="reports-title">Billing Analytics & Reports</h2>
          <p className="reports-subtitle">
            Client-wise, unit-wise, stage-wise and ageing analysis across all active billing workflows.
            Interactive pie charts, breakdown metrics and governance audit records.
          </p>
        </div>
        <div className="reports-summary-kpis">
          <div className="rsk-item"><div className="rsk-val">{bills.length}</div><div className="rsk-lbl">Total Bills</div></div>
          <div className="rsk-item"><div className="rsk-val">{paidCount}</div><div className="rsk-lbl">Paid/Settled</div></div>
          <div className="rsk-item"><div className="rsk-val val-red">{breachedCount}</div><div className="rsk-lbl">SLA Breached</div></div>
          <button type="button" className="btn-refresh-reports" onClick={loadData} title="Refresh data">🔄</button>
        </div>
      </div>

      {/* Report type selector */}
      <div className="reports-type-tabs">
        {REPORT_TYPES.map(rt => (
          <button
            key={rt.id}
            type="button"
            className={`report-type-tab ${activeReport === rt.id ? "active" : ""}`}
            onClick={() => setActiveReport(rt.id)}
          >
            <span className="rtt-icon">{rt.icon}</span>
            <div>
              <div className="rtt-label">{rt.label}</div>
              <div className="rtt-desc">{rt.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Report content */}
      <div className="reports-body-card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
            <div className="spinner" style={{ margin: "0 auto 12px" }} />
            <p>Loading analytics data…</p>
          </div>
        ) : (
          <>
            {activeReport === "client"  && <ClientReport  bills={bills} />}
            {activeReport === "unit"    && <UnitReport    bills={bills} />}
            {activeReport === "stage"   && <StageReport   bills={bills} />}
            {activeReport === "aging"   && <AgingReport   bills={bills} />}
            {activeReport === "payment" && <PaymentReport bills={bills} />}
          </>
        )}
      </div>

      {/* Export actions */}
      <div className="reports-export-bar">
        <span className="export-note">📊 Data reflects live in-memory server state. Export features require database persistence (Phase 2).</span>
        <div className="export-btns">
          <button type="button" className="btn-export" disabled title="CSV export — Phase 2">⬇️ Export CSV</button>
          <button type="button" className="btn-export" onClick={() => window.print()} title="Print this report">🖨️ Print Report</button>
        </div>
      </div>
    </div>
  );
}
