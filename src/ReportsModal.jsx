import React, { useState, useEffect } from "react";
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ReportsModal({ onClose, fetchWithAuth, onSelectBill }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    let mounted = true;
    fetchWithAuth("http://localhost:4000/api/reports")
      .then((res) => res.json())
      .then((rep) => {
        if (mounted) {
          setData(rep);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [fetchWithAuth]);

  const summary = data?.summary || {};
  const stageCounts = summary.stageCounts || {};
  const allBills = data?.bills || [];
  // Compute client‑wise aggregation for charts
  const clientTotals = {};
  allBills.forEach(b => {
    const client = b.client || b.clientName || b.towerName || 'BBMP';
    const gross = b.grossAmount || parseFloat(String(b.formattedGross || b.amount || 0).replace(/[^0-9.-]+/g, '')) || 0;
    clientTotals[client] = (clientTotals[client] || 0) + gross;
  });
  const clientPieData = {
    labels: Object.keys(clientTotals),
    datasets: [{
      data: Object.values(clientTotals),
      backgroundColor: ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fdba74'],
    }],
  };
  const clientBarData = {
  // Bar chart data remains unchanged

    labels: Object.keys(clientTotals),
    datasets: [{
      label: 'Gross Billed (₹)',
      data: Object.values(clientTotals),
      backgroundColor: '#34d399',
    }],
  };

  // Pie chart options for enhanced design
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 14 },
          color: '#e2e8f0',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: '#475569',
        borderWidth: 1,
      },
    },
    layout: {
      padding: { top: 10, bottom: 10, left: 10, right: 10 },
    },
    cutout: '0%',
  };

  const filteredBills = statusFilter === "ALL"
    ? allBills
    : allBills.filter((b) => b.workflowStatus === statusFilter);

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div
        className="custom-modal-window wide reports-modal-window"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="custom-modal-header">
          <div className="custom-modal-title-group">
            <span className="custom-modal-tag">EXECUTIVE METRICS & AUDIT INTELLIGENCE</span>
            <h2>Tower Billing Lifecycle Analytics Report</h2>
          </div>
          <button type="button" className="custom-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="custom-modal-body">
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
              Loading aggregated analytics across all towers…
            </div>
          ) : (
            <>
              {/* Top High-Level Metrics */}
              <div className="reports-kpi-grid">
                <div className="reports-kpi-card">
                  <span className="kpi-label">Total Gross Billed</span>
                  <strong className="kpi-val blue">{summary.totalGrossBilled || "₹ 0"}</strong>
                  <span className="kpi-sub">Across {data?.towersCount || 5} Municipal Towers</span>
                </div>

                <div className="reports-kpi-card">
                  <span className="kpi-label">Disbursed / Paid</span>
                  <strong className="kpi-val green">{summary.totalPaid || "₹ 0"}</strong>
                  <span className="kpi-sub">RTGS cleared & audited</span>
                </div>

                <div className="reports-kpi-card">
                  <span className="kpi-label">Under Active Review</span>
                  <strong className="kpi-val yellow">{summary.totalInReview || "₹ 0"}</strong>
                  <span className="kpi-sub">In departmental queue</span>
                </div>

                <div className="reports-kpi-card">
                  <span className="kpi-label">Review Rejection Rate</span>
                  <strong className="kpi-val red">{summary.rejectionRate || "0%"}</strong>
                  <span className="kpi-sub">Returned to Edit stage</span>
                </div>
              </div>

              {/* Stage Funnel Bar */}
              <div className="stage-funnel-container">
                <h4>Billing Lifecycle Funnel Breakdown</h4>
                <div className="funnel-chips-row">
                  <button
                    type="button"
                    className={`funnel-chip ${statusFilter === "ALL" ? "active" : ""}`}
                    onClick={() => setStatusFilter("ALL")}
                  >
                    All Bills ({stageCounts.TOTAL || 0})
                  </button>
                  <button
                    type="button"
                    className={`funnel-chip ${statusFilter === "SUBMITTED" ? "active" : ""}`}
                    onClick={() => setStatusFilter("SUBMITTED")}
                  >
                    Submitted ({stageCounts.SUBMITTED || 0})
                  </button>
                  <button
                    type="button"
                    className={`funnel-chip ${statusFilter === "UNDER_REVIEW" ? "active" : ""}`}
                    onClick={() => setStatusFilter("UNDER_REVIEW")}
                  >
                    Under Review ({stageCounts.UNDER_REVIEW || 0})
                  </button>
                  <button
                    type="button"
                    className={`funnel-chip ${statusFilter === "REJECTED_EDIT" ? "active" : ""}`}
                    onClick={() => setStatusFilter("REJECTED_EDIT")}
                  >
                    Rejected / Edit ({stageCounts.REJECTED_EDIT || 0})
                  </button>
                  <button
                    type="button"
                    className={`funnel-chip ${statusFilter === "INVOICE" ? "active" : ""}`}
                    onClick={() => setStatusFilter("INVOICE")}
                  >
                    Invoice ({stageCounts.INVOICE || 0})
                  </button>
                  <button
                    type="button"
                    className={`funnel-chip ${statusFilter === "PAYMENT" ? "active" : ""}`}
                    onClick={() => setStatusFilter("PAYMENT")}
                  >
                    Payment Queue ({stageCounts.PAYMENT || 0})
                  </button>
                  <button
                    type="button"
                    className={`funnel-chip ${statusFilter === "PAID" ? "active" : ""}`}
                    onClick={() => setStatusFilter("PAID")}
                  >
                    Paid ({stageCounts.PAID || 0})
                  </button>
                  <button
                    type="button"
                    className={`funnel-chip ${statusFilter === "CLOSED" ? "active" : ""}`}
                    onClick={() => setStatusFilter("CLOSED")}
                  >
                    Closed ({stageCounts.CLOSED || 0})
                  </button>
                </div>
              </div>
                {/* Client-wise Pie Chart */}
                <div className="pie-chart-section" style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ width: '100%', height: '100%' }}>
                    <Pie data={clientPieData} options={pieOptions} />
                  </div>
                </div>

              {/* Table of Bills */}
              <div className="reports-table-container">
                <table className="reports-data-table">
                  <thead>
                    <tr>
                      <th>Bill Code</th>
                      <th>Master Tower</th>
                      <th>Project Title</th>
                      <th>Status</th>
                      <th>Voucher / UTR</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((b) => (
                      <tr key={b.id}>
                        <td><b>{b.id}</b></td>
                        <td>
                          <span className="tower-code-pill">{b.towerCode}</span>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{b.towerName}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "#f8fafc" }}>{b.projectName}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{b.contractor}</div>
                        </td>
                        <td>
                          <span className={`status-pill-badge ${b.workflowStatus.toLowerCase()}`}>
                            {b.workflowStatus}
                          </span>
                        </td>
                        <td style={{ fontSize: "12px", fontFamily: "monospace" }}>
                          {b.utrNumber !== "-" ? b.utrNumber : b.invoiceNo !== "-" ? b.invoiceNo : "-"}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-select-bill-report"
                            onClick={() => {
                              onSelectBill(b.id);
                              onClose();
                            }}
                          >
                            Open →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="custom-modal-footer">
            <button type="button" className="custom-btn-secondary" onClick={() => window.print()}>
              🖨️ Print Report
            </button>
            <button type="button" className="custom-btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
