import React from "react";

export default function WorkflowDiagram({
  activeView,
  onNavigateView,
  onFilterStatus,
  stageCounts = {},
  compact = false
}) {
  const counts = {
    DRAFT: stageCounts.DRAFT || 0,
    SUBMITTED: stageCounts.SUBMITTED || 0,
    UNDER_REVIEW: stageCounts.UNDER_REVIEW || 0,
    REJECTED_EDIT: stageCounts.REJECTED_EDIT || 0,
    INVOICE: stageCounts.INVOICE || 0,
    PAYMENT: stageCounts.PAYMENT || 0,
    PAID: stageCounts.PAID || 0,
    CLOSED: stageCounts.CLOSED || 0
  };

  return (
    <div className={`workflow-diagram-card ${compact ? "compact" : ""}`}>
      <div className="workflow-diagram-header">
        <div className="workflow-header-left">
          <span className="workflow-diagram-eyebrow">STANDARDIZED WORKFLOW PIPELINE</span>
          <h3 className="workflow-diagram-title">BBMP Tower Billing Lifecycle Architecture</h3>
        </div>
        <div className="workflow-header-legend">
          <span className="legend-item"><span className="legend-dot green"></span> Live Flow</span>
          <span className="legend-item"><span className="legend-dot red"></span> Rejection Branch</span>
          <span className="legend-item"><span className="legend-dot blue"></span> Clearance Path</span>
        </div>
      </div>

      <div className="workflow-chart-scroll-container">
        <div className="workflow-flowchart">
          {/* Node 1: LOGIN */}
          <div className="flow-step-wrapper">
            <div className="flow-node system static" title="Authentication & Session Guard">
              <div className="node-icon">🔐</div>
              <div className="node-label">LOGIN</div>
              <div className="node-sub">Session Active</div>
            </div>
            <div className="flow-arrow-down">
              <span className="arrow-line"></span>
              <span className="arrow-head">▼</span>
            </div>
          </div>

          {/* Node 3: TOWER MASTER */}
          <div className="flow-step-wrapper">
            <button
              type="button"
              className={`flow-node clickable ${activeView === "towers" ? "active" : ""}`}
              onClick={() => onNavigateView("towers")}
              title="Click to inspect Tower Master Registry"
            >
              <div className="node-icon">🗼</div>
              <div className="node-label">TOWER MASTER</div>
              <div className="node-sub">Asset Registry</div>
            </button>
            <div className="flow-arrow-down">
              <span className="arrow-line"></span>
              <span className="arrow-head">▼</span>
            </div>
          </div>

          {/* Node 4: CREATE BILLING */}
          <div className="flow-step-wrapper">
            <button
              type="button"
              className={`flow-node clickable highlight ${activeView === "create-bill" ? "active" : ""}`}
              onClick={() => onNavigateView("create-bill")}
              title="Click to create a new billing docket"
            >
              <div className="node-icon">➕</div>
              <div className="node-label">CREATE BILLING</div>
              <div className="node-sub">Initiate & Docket</div>
              {counts.DRAFT > 0 && <span className="node-badge count-draft">{counts.DRAFT} Draft</span>}
            </button>
            <div className="flow-arrow-down">
              <span className="arrow-line"></span>
              <span className="arrow-head">▼</span>
            </div>
          </div>

          {/* Node 5: SUBMIT BILLING */}
          <div className="flow-step-wrapper">
            <button
              type="button"
              className={`flow-node clickable ${activeView === "billings" ? "active" : ""}`}
              onClick={() => {
                onNavigateView("billings");
                if (onFilterStatus) onFilterStatus("SUBMITTED");
              }}
              title="Click to view submitted billings"
            >
              <div className="node-icon">📤</div>
              <div className="node-label">SUBMIT BILLING</div>
              <div className="node-sub">Docket Verification</div>
              {counts.SUBMITTED > 0 && <span className="node-badge count-submitted">{counts.SUBMITTED} Pending</span>}
            </button>
            <div className="flow-arrow-down">
              <span className="arrow-line"></span>
              <span className="arrow-head">▼</span>
            </div>
          </div>

          {/* Node 6: REVIEW (Decision Gateway) */}
          <div className="flow-step-wrapper gateway-wrapper">
            <button
              type="button"
              className={`flow-node gateway-node clickable ${activeView === "review" ? "active" : ""}`}
              onClick={() => onNavigateView("review")}
              title="Click to inspect Departmental Review Queue"
            >
              <div className="node-icon">⚖️</div>
              <div className="node-label">REVIEW</div>
              <div className="node-sub">Technical & Financial Scrutiny</div>
              {counts.UNDER_REVIEW > 0 && (
                <span className="node-badge count-review">{counts.UNDER_REVIEW} In Review</span>
              )}
            </button>

            {/* Split branches: Reject -> EDIT vs Approve -> INVOICE */}
            <div className="branch-container">
              {/* Left Branch: Reject -> EDIT */}
              <div className="branch-arm reject-arm">
                <div className="branch-label reject">
                  <span>❌ Reject</span>
                </div>
                <div className="branch-line-v"></div>
                <button
                  type="button"
                  className="flow-node branch-node reject-node clickable"
                  onClick={() => {
                    onNavigateView("billings");
                    if (onFilterStatus) onFilterStatus("REJECTED_EDIT");
                  }}
                  title="Click to view bills rejected and pending edit"
                >
                  <div className="node-icon">✏️</div>
                  <div className="node-label">EDIT</div>
                  <div className="node-sub">Revision Required</div>
                  {counts.REJECTED_EDIT > 0 && (
                    <span className="node-badge count-reject">{counts.REJECTED_EDIT} To Revise</span>
                  )}
                </button>
                <div className="re-loop-arrow" title="Resubmission loops back to Review or Reports">
                  <span className="re-loop-line"></span>
                  <span className="re-loop-text">Resubmit ↺</span>
                </div>
              </div>

              {/* Right Branch: Approve -> INVOICE -> PAYMENT -> PAID -> CLOSED */}
              <div className="branch-arm approve-arm">
                <div className="branch-label approve">
                  <span>✅ Approve</span>
                </div>
                <div className="branch-line-v"></div>

                {/* Sub-node 1: INVOICE */}
                <button
                  type="button"
                  className="flow-node branch-node approve-node clickable"
                  onClick={() => {
                    onNavigateView("billings");
                    if (onFilterStatus) onFilterStatus("INVOICE");
                  }}
                  title="Tax Invoice generated"
                >
                  <div className="node-icon">🧾</div>
                  <div className="node-label">INVOICE</div>
                  <div className="node-sub">Tax Pass Order</div>
                  {counts.INVOICE > 0 && (
                    <span className="node-badge count-invoice">{counts.INVOICE} Invoiced</span>
                  )}
                </button>
                <div className="flow-arrow-down-mini">▼</div>

                {/* Sub-node 2: PAYMENT */}
                <button
                  type="button"
                  className="flow-node branch-node approve-node clickable"
                  onClick={() => {
                    onNavigateView("billings");
                    if (onFilterStatus) onFilterStatus("PAYMENT");
                  }}
                  title="Treasury payment processing"
                >
                  <div className="node-icon">🏦</div>
                  <div className="node-label">PAYMENT</div>
                  <div className="node-sub">Treasury Clearance</div>
                  {counts.PAYMENT > 0 && (
                    <span className="node-badge count-payment">{counts.PAYMENT} Processing</span>
                  )}
                </button>
                <div className="flow-arrow-down-mini">▼</div>

                {/* Sub-node 3: PAID */}
                <button
                  type="button"
                  className="flow-node branch-node approve-node clickable"
                  onClick={() => {
                    onNavigateView("billings");
                    if (onFilterStatus) onFilterStatus("PAID");
                  }}
                  title="Bank UTR confirmed & paid"
                >
                  <div className="node-icon">💰</div>
                  <div className="node-label">PAID</div>
                  <div className="node-sub">UTR Confirmed</div>
                  {counts.PAID > 0 && (
                    <span className="node-badge count-paid">{counts.PAID} Paid</span>
                  )}
                </button>
                <div className="flow-arrow-down-mini">▼</div>

                {/* Sub-node 4: CLOSED */}
                <button
                  type="button"
                  className="flow-node branch-node approve-node clickable"
                  onClick={() => {
                    onNavigateView("billings");
                    if (onFilterStatus) onFilterStatus("CLOSED");
                  }}
                  title="Lifecycle permanently closed and sealed"
                >
                  <div className="node-icon">📁</div>
                  <div className="node-label">CLOSED</div>
                  <div className="node-sub">Audited & Sealed</div>
                  {counts.CLOSED > 0 && (
                    <span className="node-badge count-closed">{counts.CLOSED} Closed</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Unified Destination: REPORTS */}
          <div className="flow-final-reports-row">
            <div className="reports-feeder-lines">
              <span className="feeder-left" title="Edit logs feed to Reports"></span>
              <span className="feeder-right" title="Closed bills feed to Reports"></span>
            </div>
            <button
              type="button"
              className={`flow-node reports-final-node clickable ${activeView === "reports" ? "active" : ""}`}
              onClick={() => onNavigateView("reports")}
              title="Click to open comprehensive Reports & Analytics"
            >
              <div className="node-icon">📈</div>
              <div className="node-label">REPORTS & ANALYTICS</div>
              <div className="node-sub">Consolidated Audit, Financials & Stage Telemetry</div>
              <span className="node-badge count-reports">All Stages Connected →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
