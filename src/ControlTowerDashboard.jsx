import React, { useState, useEffect } from "react";

export default function ControlTowerDashboard({
  fetchWithAuth,
  onSelectBill,
  onNavigateToBills,
  onNavigateToWorkflows,
  onNavigateToSla,
  onOpenProposal,
  onOpenHrms
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadSummary() {
      try {
        setLoading(true);
        const res = await fetchWithAuth("http://localhost:4000/api/control-tower/summary");
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        const json = await res.json();
        if (isMounted) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSummary();
    return () => { isMounted = false; };
  }, [refreshTrigger, fetchWithAuth]);

  if (loading && !data) {
    return (
      <div className="control-tower-loading">
        <div className="spinner"></div>
        <p>Telemetry sync in progress... Connecting to Billing Control Tower Engine</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="control-tower-error">
        <h3>Control Tower Telemetry Error</h3>
        <p>{error}</p>
        <button onClick={() => setRefreshTrigger((prev) => prev + 1)} className="btn-retry">
          Retry Telemetry Ingestion
        </button>
      </div>
    );
  }

  const { metrics, clientPerformance, stageBottlenecks, aging, interventionQueue, pilotUnits } = data || {};

  return (
    <div className="control-tower-dashboard">
      {/* EXECUTIVE HEADER */}
      <div className="tower-header-card">
        <div className="tower-header-left">
          <div className="tower-badge-row">
            <span className="live-telemetry-pill">
              <span className="pulse-dot"></span> LIVE CONTROL TOWER ACTIVE
            </span>
            <span className="governance-pill">
              🏢 Enterprise Governance: Col. Jyothi (Product Owner) | Raghavendra (Lead)
            </span>
            <span className="phase-pill">Phase I — Workflow Digitisation Baseline</span>
          </div>
          <h1 className="tower-title">Executive Billing Control Tower</h1>
          <p className="tower-subtitle">
            Centralized monitoring, SLA tracking, bottleneck analytics, and payment governance across 34 public sector and autonomous institutions.
          </p>
        </div>
        <div className="tower-header-actions">
          <button
            type="button"
            className="btn-header-action primary"
            onClick={onOpenProposal}
            title="Review Phase-I Technical Deliverables Submitted to CEO"
          >
            📋 Phase-I Technical Proposal
          </button>
          <button
            type="button"
            className="btn-header-action secondary"
            onClick={onNavigateToWorkflows}
            title="Browse all 34 workflows cataloged from official matrix"
          >
            📜 34-Workflow Master
          </button>
          <button
            type="button"
            className="btn-header-action outline"
            onClick={onOpenHrms}
            title="Simulate future integration with HRMS"
          >
            ⚡ HRMS API Hub
          </button>
          <button
            type="button"
            className="btn-refresh"
            onClick={() => setRefreshTrigger((p) => p + 1)}
            title="Refresh Live Telemetry"
          >
            🔄
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="tower-kpi-grid">
        <div
          className="tower-kpi-card"
          onClick={() => onNavigateToBills && onNavigateToBills()}
          style={{ cursor: "pointer" }}
          title="Click number to view all inwarded bills in Bill Tracker"
        >
          <div className="kpi-icon-wrap blue">📑</div>
          <div className="kpi-body">
            <div className="kpi-label">Total Bills Inwarded</div>
            <div className="kpi-val">{metrics?.totalBills || 0}</div>
            <div className="kpi-sub">Across 34 Active Workflows · View bills ↗</div>
          </div>
        </div>

        <div
          className="tower-kpi-card highlighted"
          onClick={() => onNavigateToBills && onNavigateToBills()}
          style={{ cursor: "pointer" }}
          title="Click number to view pipeline bills in Bill Tracker"
        >
          <div className="kpi-icon-wrap emerald">💰</div>
          <div className="kpi-body">
            <div className="kpi-label">Value Under Processing</div>
            <div className="kpi-val">{metrics?.totalBillingValue || "₹ 0"}</div>
            <div className="kpi-sub">{metrics?.billsInProcess || 0} bills in approval pipeline · View details ↗</div>
          </div>
        </div>

        <div
          className="tower-kpi-card"
          onClick={() => onNavigateToBills && onNavigateToBills()}
          style={{ cursor: "pointer" }}
          title="Click number to view settled and disbursed bills"
        >
          <div className="kpi-icon-wrap green">✅</div>
          <div className="kpi-body">
            <div className="kpi-label">Settled & Disbursed</div>
            <div className="kpi-val">{metrics?.billsPaid || 0}</div>
            <div className="kpi-sub">Electronic Treasury / RTGS · View bills ↗</div>
          </div>
        </div>

        <div
          className="tower-kpi-card danger"
          onClick={() => (onNavigateToSla ? onNavigateToSla() : onNavigateToBills && onNavigateToBills())}
          style={{ cursor: "pointer" }}
          title="Click number to view SLA breached bills in SLA & Alerts"
        >
          <div className="kpi-icon-wrap red">🔴</div>
          <div className="kpi-body">
            <div className="kpi-label">SLA Breached</div>
            <div className="kpi-val text-red">{metrics?.billsOverdue || 0}</div>
            <div className="kpi-sub">Overdue beyond stage limit · View alerts ↗</div>
          </div>
        </div>

        <div
          className="tower-kpi-card warning"
          onClick={() => (onNavigateToSla ? onNavigateToSla() : onNavigateToBills && onNavigateToBills())}
          style={{ cursor: "pointer" }}
          title="Click number to view approaching SLA bills"
        >
          <div className="kpi-icon-wrap amber">🟠</div>
          <div className="kpi-body">
            <div className="kpi-label">Approaching SLA</div>
            <div className="kpi-val text-amber">{metrics?.billsApproachingSla || 0}</div>
            <div className="kpi-sub">&lt; 24h before escalation · View alerts ↗</div>
          </div>
        </div>

        <div
          className="tower-kpi-card purple"
          onClick={() => onNavigateToBills && onNavigateToBills()}
          style={{ cursor: "pointer" }}
          title="Click number to view returned/objection bills"
        >
          <div className="kpi-icon-wrap purple">⚠️</div>
          <div className="kpi-body">
            <div className="kpi-label">Returned / Objections</div>
            <div className="kpi-val text-purple">{metrics?.billsReturned || 0}</div>
            <div className="kpi-sub">In vendor revision queue · View bills ↗</div>
          </div>
        </div>
      </div>

      {/* SECTION 8 DIRECTIVE: PROMINENT INTERVENTION QUEUE */}
      <div className="tower-section intervention-section">
        <div className="section-head-bar">
          <div className="head-left">
            <h2 className="section-title">
              🚨 Bills Requiring Management / Intervention Today
            </h2>
            <p className="section-sub">
              Mandatory executive intervention required to resolve bottlenecks, clear audit objections, or override SLA escalations.
            </p>
          </div>
          <div className="head-right">
            <span className="intervention-count-badge">
              {interventionQueue?.length || 0} Priority Action{interventionQueue?.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {interventionQueue && interventionQueue.length > 0 ? (
          <div className="intervention-cards-grid">
            {interventionQueue.map((item) => (
              <div key={item.id} className={`intervention-card urgency-${item.urgency.toLowerCase()}`}>
                <div className="card-top-row">
                  <div className="bill-tag">
                    <span className="client-badge">{item.client}</span>
                    <span className="bill-id-badge">{item.billNumber}</span>
                  </div>
                  <span className={`urgency-pill ${item.urgency.toLowerCase()}`}>
                    {item.urgency === "CRITICAL" ? "🔴 CRITICAL" : item.urgency === "HIGH" ? "⚠️ HIGH PRIORITY" : "🟠 WARNING"}
                  </span>
                </div>

                <h3 className="item-project-name">{item.projectName}</h3>

                <div className="item-meta-grid">
                  <div>
                    <span className="meta-lbl">Unit / Division:</span>
                    <strong className="meta-val">{item.unit}</strong>
                  </div>
                  <div>
                    <span className="meta-lbl">Bill Amount:</span>
                    <strong className="meta-val text-emerald">{item.amount}</strong>
                  </div>
                  <div>
                    <span className="meta-lbl">Pending Stage:</span>
                    <strong className="meta-val">{item.currentRole} (Step {item.currentStep})</strong>
                  </div>
                  <div>
                    <span className="meta-lbl">Responsible Person:</span>
                    <strong className="meta-val">{item.currentPerson}</strong>
                  </div>
                  <div>
                    <span className="meta-lbl">Stage Dwell Time:</span>
                    <strong className={`meta-val ${item.daysInStage > item.stageSlaDays ? "text-red" : "text-amber"}`}>
                      {item.daysInStage} Days (SLA: {item.stageSlaDays} Days)
                    </strong>
                  </div>
                  <div>
                    <span className="meta-lbl">SLA Status:</span>
                    <strong className={`meta-val status-${item.slaStatus.toLowerCase()}`}>
                      {item.slaStatus === "BREACHED_SLA" ? "🔴 SLA Breached" : "🟠 Approaching SLA"}
                    </strong>
                  </div>
                </div>

                {item.flagReason && (
                  <div className="flag-reason-box">
                    <span className="flag-icon">⚠️</span>
                    <span className="flag-text"><strong>Audit Objection:</strong> {item.flagReason}</span>
                  </div>
                )}

                <div className="action-row">
                  <div className="action-prompt">
                    <span className="action-label">Directive Action:</span>
                    <span className="action-text">{item.actionRequired}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-open-bill"
                    onClick={() => onSelectBill(item.id)}
                  >
                    Open Journey & Action ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-interventions-banner">
            <span className="check-icon">🟢</span>
            <span>All bills are within normative SLA parameters. No executive overrides required today.</span>
          </div>
        )}
      </div>

      {/* PILOT UNITS VALIDATION (SECTION 13 REQUIREMENT) */}
      <div className="tower-section pilot-section">
        <div className="section-head-bar">
          <div className="head-left">
            <h2 className="section-title">🎯 Phase-I Pilot Units Validation</h2>
            <p className="section-sub">
              Targeted validation of initial workflows before operationalizing all 34 workflows (Section 13 Directive).
            </p>
          </div>
        </div>

        <div className="pilot-cards-grid">
          {pilotUnits?.map((p) => (
            <div key={p.id} className="pilot-card">
              <div className="pilot-card-top">
                <span className="pilot-badge">{p.id}</span>
                <span className={`pilot-status-pill ${p.status.toLowerCase()}`}>
                  {p.status === "HEALTHY" ? "🟢 Normative Progression" : "🟠 Attention Required"}
                </span>
              </div>
              <h3 className="pilot-name">{p.name}</h3>
              <p className="pilot-sector"><strong>Sector:</strong> {p.sector}</p>
              <div className="pilot-metrics-row">
                <div className="p-metric">
                  <span className="p-lbl">Approval Stages</span>
                  <span className="p-val">{p.stagesCount} Tiers</span>
                </div>
                <div className="p-metric">
                  <span className="p-lbl">SLA Compliance</span>
                  <span className="p-val text-emerald">{p.slaCompliance}</span>
                </div>
                <div className="p-metric">
                  <span className="p-lbl">Active Docket</span>
                  <span className="p-val text-blue">{p.activeBillId}</span>
                </div>
              </div>
              <p className="pilot-note">{p.note}</p>
              <button
                type="button"
                className="btn-view-pilot-bill"
                onClick={() => {
                  const billId = p.activeBillId.split(" ")[0];
                  onSelectBill(billId);
                }}
              >
                Inspect Pilot Bill Journey ➔
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* TWO-COLUMN GRID: CLIENT PERFORMANCE & BOTTLENECK RADAR */}
      <div className="tower-two-col">
        {/* CLIENT PERFORMANCE */}
        <div className="tower-col-card">
          <div className="card-head">
            <h3>🏢 Client & Unit Performance Matrix</h3>
            <span className="card-sub">{clientPerformance?.length || 0} Monitored Client Entities</span>
          </div>
          <div className="table-responsive">
            <table className="control-tower-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Total Bills</th>
                  <th>Gross Value</th>
                  <th>In Process</th>
                  <th>Paid</th>
                  <th>Breached</th>
                  <th>Avg Days</th>
                  <th>Health</th>
                </tr>
              </thead>
              <tbody>
                {clientPerformance?.map((c) => (
                  <tr key={c.client}>
                    <td><strong>{c.client}</strong></td>
                    <td>{c.billCount}</td>
                    <td className="text-emerald">{c.formattedValue}</td>
                    <td>{c.inProcessCount}</td>
                    <td className="text-green">{c.paidCount}</td>
                    <td className={c.breachedCount > 0 ? "text-red bold" : ""}>{c.breachedCount}</td>
                    <td>{c.avgDays}d</td>
                    <td>
                      <span className={`health-dot dot-${c.slaHealth.toLowerCase()}`}>
                        {c.slaHealth === "GREEN" ? "🟢 Normal" : c.slaHealth === "AMBER" ? "🟠 Warning" : "🔴 Delayed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTLENECK RADAR & AGING */}
        <div className="tower-col-card">
          <div className="card-head">
            <h3>⏳ Workflow Bottlenecks & Ageing Radar</h3>
            <span className="card-sub">Highest cumulative stage dwell times</span>
          </div>

          <div className="bottlenecks-list">
            {stageBottlenecks?.slice(0, 5).map((s, idx) => (
              <div key={idx} className="bottleneck-item">
                <div className="b-row-top">
                  <span className="b-stage-name">
                    <span className="b-rank">{idx + 1}.</span> {s.stage} ({s.client})
                  </span>
                  <span className="b-dwell-badge">
                    {s.totalDwellDays} Cumulative Days ({s.count} Bill{s.count > 1 ? "s" : ""})
                  </span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className={`progress-bar-fill ${s.breachedCount > 0 ? "fill-red" : "fill-blue"}`}
                    style={{ width: `${Math.min(100, (s.totalDwellDays / 12) * 100)}%` }}
                  />
                </div>
                {s.breachedCount > 0 && (
                  <span className="b-breach-warning">
                    ⚠️ {s.breachedCount} bill{s.breachedCount > 1 ? "s" : ""} currently exceeded statutory SLA!
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="aging-analysis-box">
            <h4>📅 Ageing-wise Breakdown</h4>
            <div className="aging-grid">
              <div className="aging-cell">
                <span className="aging-val text-green">{aging?.under7Days || 0}</span>
                <span className="aging-lbl">&lt; 7 Days</span>
              </div>
              <div className="aging-cell">
                <span className="aging-val text-blue">{aging?.days8To15 || 0}</span>
                <span className="aging-lbl">8 — 15 Days</span>
              </div>
              <div className="aging-cell">
                <span className="aging-val text-amber">{aging?.days16To30 || 0}</span>
                <span className="aging-lbl">16 — 30 Days</span>
              </div>
              <div className="aging-cell">
                <span className="aging-val text-red">{aging?.over30Days || 0}</span>
                <span className="aging-lbl">&gt; 30 Days (Critical)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
