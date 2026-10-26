import React, { useState } from "react";

export default function ProposalReviewModal({ onClose, onLaunchPilot }) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Executive Directive", icon: "🏢" },
    { id: "wfs", label: "1. 34-Workflow Master", icon: "📜" },
    { id: "stages", label: "2. Common vs Specific Stages", icon: "🔄" },
    { id: "database", label: "3. Database Architecture", icon: "🗄️" },
    { id: "architecture", label: "4 & 5. App Architecture & Screens", icon: "🏗️" },
    { id: "roles", label: "6. User-Role RACI Matrix", icon: "👥" },
    { id: "api", label: "7. HRMS API Architecture", icon: "⚡" },
    { id: "timeline", label: "8 & 9. 8-Week Timeline & Resources", icon: "📅" },
    { id: "pilots", label: "10. Two Pilot Units Justification", icon: "🎯" },
    { id: "finance", label: "11. Finance Questionnaire", icon: "📝" }
  ];

  return (
    <div className="proposal-modal-backdrop" onClick={onClose}>
      <div className="proposal-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* MODAL HEADER */}
        <div className="proposal-modal-header">
          <div className="p-header-left">
            <div className="p-badge-row">
              <span className="badge-ref">Ref: BCT-IT-PHASE1-PROPOSAL-2026-v1.0</span>
              <span className="badge-sponsor">Project Sponsor: CEO</span>
              <span className="badge-owner">Product Owner: Col. Jyothi</span>
              <span className="badge-tech">Tech Lead: Raghavendra</span>
            </div>
            <h2>Phase-I Technical Proposal: Billing Control Tower</h2>
            <p>
              Submission of the 11 Core IT Deliverables derived from official Billing Process Updations document prior to full-scale development.
            </p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="proposal-tabs-bar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`p-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="proposal-modal-body">
          {activeTab === "overview" && (
            <div className="p-tab-pane">
              <h3>Executive Directive & Background</h3>
              <div className="directive-quote-box">
                <blockquote>
                  "The IT team is directed to initiate development of the Billing Control Tower as an independent application, without waiting for completion of the ongoing HRMS development. The Billing Control Tower shall subsequently be integrated with HRMS through appropriate APIs. The principle shall be: <strong>Build independently now; integrate with HRMS later.</strong>"
                </blockquote>
              </div>

              <div className="directive-grid">
                <div className="d-card">
                  <h4>🎯 Core Management Objectives</h4>
                  <ul>
                    <li>Real-time visibility over all submitted, processing, and disbursed bills.</li>
                    <li>Stage-by-stage dwell time tracking and bottleneck identification.</li>
                    <li>SLA compliance monitoring with automated warning tiers (🟢 Within SLA, 🟠 Approaching, 🔴 Breached).</li>
                    <li>Comprehensive audit trail of returned/rejected bills and root-cause reasons.</li>
                    <li>Client &amp; Unit-wise financial performance analysis.</li>
                    <li>Prominent identification of bills requiring management intervention today.</li>
                  </ul>
                </div>

                <div className="d-card">
                  <h4>⚖️ Phased Roadmap Strategy</h4>
                  <ul>
                    <li><strong>Phase I (Immediate Focus):</strong> Workflow Master digitisation, bill transaction tracking, forward-only governance, and pilot validation. (NO hardcoded individual workflows).</li>
                    <li><strong>Phase II (Post-Pilot):</strong> AI Document Assistant (OCR bill extraction), AI Validation (missing files, date/rate checks), and Natural Language Billing Assistant.</li>
                    <li><strong>Phase III (Enterprise Integration):</strong> HRMS bidirectional integration (work order sync and payment status webhooks).</li>
                    <li><strong>Future Integration:</strong> OpsVision operational delivery reconciliation before billing.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "wfs" && (
            <div className="p-tab-pane">
              <h3>Deliverable 1: 34-Workflow Master (Derived from Matrix)</h3>
              <p>
                Extracted from the official <em>Billing Process Updations</em> document, cataloging all 34 workflows across Municipal, Transit, Healthcare, Industrial, and Enterprise sectors.
              </p>
              <div className="table-wrapper">
                <table className="p-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Client</th>
                      <th>Unit / Division</th>
                      <th>Stages</th>
                      <th>Approval Routing Baseline</th>
                      <th>Designation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>1</strong></td>
                      <td>BBMP</td>
                      <td>BBMP Lakes (North, Central, West, East, South)</td>
                      <td>15</td>
                      <td>Tapal ➔ AE ➔ AEE ➔ EE ➔ Attendance Cert ➔ EE ➔ JC ➔ Addl Revenue ➔ Commr ➔ DCF ➔ Fund ➔ EE ➔ DC Bill ➔ DCF ➔ Payments</td>
                      <td><span className="badge-pilot">PILOT 1 (North)</span></td>
                    </tr>
                    <tr>
                      <td><strong>2</strong></td>
                      <td>BBMP</td>
                      <td>BBMP Yelahanka Zone</td>
                      <td>15</td>
                      <td>Tapal ➔ AE ➔ AEE ➔ EE ➔ Attendance Cert ➔ EE ➔ JC ➔ Addl Revenue ➔ Commr ➔ DCF ➔ Fund ➔ EE ➔ DC Bill ➔ DCF ➔ Payments</td>
                      <td>Standard</td>
                    </tr>
                    <tr>
                      <td><strong>3</strong></td>
                      <td>BDA</td>
                      <td>BDA Man Power Wing</td>
                      <td>13</td>
                      <td>Tapal ➔ Case Worker ➔ DS-1 ➔ FM ➔ Case Worker ➔ Accts Supt ➔ CAO ➔ FM ➔ DS-1 ➔ Secretary ➔ DS-1 ➔ FM ➔ Payments</td>
                      <td>Standard</td>
                    </tr>
                    <tr>
                      <td><strong>4</strong></td>
                      <td>BDA</td>
                      <td>BDA Security Wing</td>
                      <td>13</td>
                      <td>Tapal ➔ Case Worker ➔ DS-1 ➔ SP Section ➔ Inspector ➔ DS-1 ➔ FM ➔ Accounts/CAO ➔ FM ➔ DS-1 ➔ Secretary/Commr ➔ FM ➔ Payments</td>
                      <td>Standard</td>
                    </tr>
                    <tr>
                      <td><strong>5</strong></td>
                      <td>BMCRI</td>
                      <td>BMCRI College Security & Housekeeping</td>
                      <td>12</td>
                      <td>Tapal/Dean ➔ AO ➔ Case Worker ➔ Warden Cert ➔ Supt ➔ AO ➔ CAO ➔ FA ➔ Dean ➔ Cash Section/FA ➔ Dean ➔ Treasury Payment</td>
                      <td>Standard</td>
                    </tr>
                    <tr>
                      <td><strong>6</strong></td>
                      <td>BMCRI</td>
                      <td>Victoria Hospital Housekeeping & Security</td>
                      <td>16</td>
                      <td>Tapal ➔ MS ➔ Case Worker ➔ Matron Cert ➔ Office Supt ➔ AO ➔ RMO ➔ MS ➔ Case Worker ➔ Supt ➔ AO ➔ CAO ➔ FA ➔ Dean ➔ Cash Section ➔ Dean Treasury</td>
                      <td>Standard</td>
                    </tr>
                    <tr>
                      <td><strong>9</strong></td>
                      <td>BMRCL</td>
                      <td>BMRCL Project Wing (80% Operational Milestone)</td>
                      <td>7</td>
                      <td>Bill to CSO Office ➔ Attendance & ASCO Approval ➔ CSO Approval ➔ Case Worker E-Office / GM Ops ➔ AGM Finance ➔ Finance Approval ➔ Audit & Payments</td>
                      <td><span className="badge-pilot">PILOT 2 (80%)</span></td>
                    </tr>
                    <tr>
                      <td><strong>9</strong></td>
                      <td>BMRCL</td>
                      <td>BMRCL Project Wing (20% Statutory HR Stream)</td>
                      <td>8</td>
                      <td>20% Bill to CSO / HR Verification ➔ HR Manager Approval ➔ Accounts Verification ➔ AGM Finance ➔ Finance Approval ➔ Audit Cert ➔ Audit Approval ➔ Payments</td>
                      <td><span className="badge-pilot">PILOT 2 (20%)</span></td>
                    </tr>
                    <tr>
                      <td><strong>17</strong></td>
                      <td>KIADB</td>
                      <td>KIADB Harohalli Industrial Area & DO EE1</td>
                      <td>10</td>
                      <td>Tapal ➔ Case Worker ➔ Engineers Cert ➔ Case Worker ➔ Head Office Approval ➔ DC Approval ➔ Finance Approval ➔ EM Approval ➔ EE ➔ Payments</td>
                      <td>Standard</td>
                    </tr>
                    <tr>
                      <td><strong>23</strong></td>
                      <td>KSMCL</td>
                      <td>Mineral Exploration & Mining Division</td>
                      <td>9</td>
                      <td>Tapal ➔ Case Worker ➔ Mines Cert ➔ Audit ➔ Finance Approval ➔ MD Approval ➔ Case Worker ➔ Accounts ➔ Finance Approval Payments</td>
                      <td>Standard</td>
                    </tr>
                    <tr>
                      <td><strong>24</strong></td>
                      <td>Kumara Krupa</td>
                      <td>State Guest House Bangalore & Mysore</td>
                      <td>10</td>
                      <td>Tapal ➔ Case Worker ➔ Manager ➔ Accounts Supt ➔ Special Officer ➔ Director ➔ Special Officer ➔ Accounts Supt/Manager ➔ Case Worker ➔ Payments</td>
                      <td>Standard</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "stages" && (
            <div className="p-tab-pane">
              <h3>Deliverable 2: Common vs. Client-Specific Stages Analysis</h3>
              <div className="directive-grid">
                <div className="d-card">
                  <h4>🏛️ 7 Universal Canonical Stages</h4>
                  <ol>
                    <li><strong>Docketing & Inward:</strong> Central registry timestamp and tracking barcode generation (Tapal).</li>
                    <li><strong>First-Line Scrutiny:</strong> Primary docket maintenance and document completeness check (Case Worker).</li>
                    <li><strong>Field Certification:</strong> Measurement Book entries (AE), Ward logs (Matron), or Safety inspects (ASCO).</li>
                    <li><strong>Administrative Sanction:</strong> Check-measurements (AEE), Technical scrutiny (EE), or Medical Super (MS).</li>
                    <li><strong>Financial Review:</strong> Schedule of Rates check, Tax deductions (TDS, GST-TDS, Labour Cess) by CAO/FA.</li>
                    <li><strong>Statutory Pre-Audit & Sign-Off:</strong> Pre-audit certification and HOD approval (Dean, Commr, MD).</li>
                    <li><strong>Disbursement & Treasury Scroll:</strong> Electronic RTGS/NEFT generation by Cash Section.</li>
                  </ol>
                </div>

                <div className="d-card">
                  <h4>⚙️ Client-Specific Custom Routing Rules</h4>
                  <ul>
                    <li><strong>BBMP Municipal Double Bill:</strong> Preliminary DC Bill scrutinised before final DCF Fund allocation order.</li>
                    <li><strong>BMRCL 80/20 Split Streams:</strong> 80% Operational Milestone passes via CSO/GM Ops, while 20% statutory balance is gated by HR compliance.</li>
                    <li><strong>Autonomous Hospitals:</strong> Quad-tier medical hierarchy (Matron ➔ RMO ➔ MS ➔ Dean) before Treasury disbursement.</li>
                    <li><strong>KIADB Industrial Areas:</strong> Board Executive Member (EM) and Development Commissioner (DC) sanctions required.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "database" && (
            <div className="p-tab-pane">
              <h3>Deliverable 3: Proposed Database Architecture</h3>
              <p>Relational PostgreSQL 16 schema designed for forward-only governance, non-repudiation, and immutability.</p>
              <div className="code-spec-box">
                <pre>{`-- CORE BILLS TABLE
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_number VARCHAR(64) UNIQUE NOT NULL,
    work_order_id VARCHAR(64) REFERENCES hrms_work_orders(id),
    client_code VARCHAR(32) NOT NULL,
    unit_code VARCHAR(64) NOT NULL,
    workflow_id VARCHAR(64) REFERENCES workflow_masters(id),
    gross_amount NUMERIC(14,2) NOT NULL,
    net_payable NUMERIC(14,2) NOT NULL,
    current_step INT NOT NULL DEFAULT 1,
    current_role VARCHAR(64) NOT NULL,
    current_person VARCHAR(128),
    workflow_status VARCHAR(32) NOT NULL DEFAULT 'UNDER_REVIEW',
    sla_status VARCHAR(32) NOT NULL DEFAULT 'WITHIN_SLA',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_payment_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT TRAIL & TRANSITIONS (IMMUTABLE APPEND-ONLY)
CREATE TABLE bill_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE RESTRICT,
    step_number INT NOT NULL,
    stage_name VARCHAR(128) NOT NULL,
    action_taken VARCHAR(64) NOT NULL,
    performed_by_id VARCHAR(64) NOT NULL,
    performed_by_name VARCHAR(128) NOT NULL,
    performed_by_role VARCHAR(64) NOT NULL,
    entered_at TIMESTAMPTZ NOT NULL,
    exited_at TIMESTAMPTZ,
    duration_hours INT,
    sla_compliance_state VARCHAR(32) NOT NULL,
    remarks TEXT
);`}</pre>
              </div>
            </div>
          )}

          {activeTab === "architecture" && (
            <div className="p-tab-pane">
              <h3>Deliverables 4 &amp; 5: Application Architecture &amp; Screen Inventory</h3>
              <div className="directive-grid">
                <div className="d-card">
                  <h4>🖥️ Screen &amp; Module Inventory</h4>
                  <ul>
                    <li><strong>MOD-01: Control Tower Dashboard:</strong> Live cockpit, SLA breach alarms, and daily intervention queue.</li>
                    <li><strong>MOD-02: Bill Master &amp; Journey:</strong> Stage stepper, forward governance, and payment vouchers.</li>
                    <li><strong>MOD-03: 34-Workflow Engine:</strong> Configurable visual graph of sequential approval tiers.</li>
                    <li><strong>MOD-04: SLA &amp; Escalation Command:</strong> Aging radar (0-7d, 8-15d, 16-30d, 30d+) and automated escalation.</li>
                    <li><strong>MOD-05: Stage Scrutiny Inbox:</strong> Role-filtered approval and return console.</li>
                    <li><strong>MOD-06: Return &amp; Rejection Hub:</strong> Categorized objection defect tracking and resubmission.</li>
                    <li><strong>MOD-07: Audit Trail Console:</strong> Cryptographic non-repudiation and officer logs.</li>
                    <li><strong>MOD-08: HRMS Integration Hub:</strong> Bidirectional API simulator and contract sync.</li>
                  </ul>
                </div>

                <div className="d-card">
                  <h4>⚙️ Technical Stack &amp; Design Principles</h4>
                  <ul>
                    <li><strong>Frontend:</strong> React 19 SPA with responsive enterprise design system and live telemetry widgets.</li>
                    <li><strong>Backend:</strong> Node.js / Express micro-modular architecture.</li>
                    <li><strong>Database:</strong> PostgreSQL 16 with append-only audit partitions.</li>
                    <li><strong>Caching &amp; Locks:</strong> Redis for distributed concurrency locks and fast SLA counters.</li>
                    <li><strong>Security:</strong> Scrypt password hashing, session tokens, and strict role guards.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "roles" && (
            <div className="p-tab-pane">
              <h3>Deliverable 6: User-Role Matrix (RACI Governance)</h3>
              <table className="p-table">
                <thead>
                  <tr>
                    <th>Role Designation</th>
                    <th>Typical Authority</th>
                    <th>Dashboard</th>
                    <th>Create Bill</th>
                    <th>Approve Stage</th>
                    <th>Reject / Return</th>
                    <th>Config Workflows</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Executive Leadership</strong></td>
                    <td>CEO, Col. Jyothi</td>
                    <td>Full (All Clients)</td>
                    <td>No</td>
                    <td>View Only</td>
                    <td>View Only</td>
                    <td>No</td>
                  </tr>
                  <tr>
                    <td><strong>Technical Lead</strong></td>
                    <td>Raghavendra</td>
                    <td>Full (Engineering)</td>
                    <td>Yes</td>
                    <td>Override / Debug</td>
                    <td>Override / Debug</td>
                    <td>Yes</td>
                  </tr>
                  <tr>
                    <td><strong>Field Officer</strong></td>
                    <td>AE, Matron, ASCO, Warden</td>
                    <td>Assigned Unit</td>
                    <td>Yes</td>
                    <td>Step 1 — 3 Only</td>
                    <td>No</td>
                    <td>No</td>
                  </tr>
                  <tr>
                    <td><strong>Divisional Head</strong></td>
                    <td>EE, MS, CSO, DS-1, GM Ops</td>
                    <td>Division Only</td>
                    <td>No</td>
                    <td>Step 4 — 8</td>
                    <td>Yes (With Defect Code)</td>
                    <td>No</td>
                  </tr>
                  <tr>
                    <td><strong>Finance &amp; Accounts</strong></td>
                    <td>CAO, FA, AGM Finance, DCF</td>
                    <td>All Bills</td>
                    <td>No</td>
                    <td>Finance Steps</td>
                    <td>Yes</td>
                    <td>No</td>
                  </tr>
                  <tr>
                    <td><strong>Statutory Auditor</strong></td>
                    <td>Pre-Audit Officer, Auditor</td>
                    <td>Read All</td>
                    <td>No</td>
                    <td>Audit Steps</td>
                    <td>Yes</td>
                    <td>No</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "api" && (
            <div className="p-tab-pane">
              <h3>Deliverable 7: API Architecture for Future HRMS Integration</h3>
              <p>
                Strict RESTful architecture enabling seamless plug-and-play synchronization with HRMS without rebuilding billing logic:
              </p>
              <div className="api-spec-cards">
                <div className="api-card">
                  <span className="method post">POST</span>
                  <span className="endpoint">/api/v1/integration/hrms/work-orders</span>
                  <p>Inbound contract synchronization: imports client, work order, sanctioned amount, and rates.</p>
                </div>
                <div className="api-card">
                  <span className="method post">POST</span>
                  <span className="endpoint">/api/v1/integration/hrms/personnel-sync</span>
                  <p>Inbound employee &amp; role synchronization: updates officer roster and authority spending limits.</p>
                </div>
                <div className="api-card">
                  <span className="method post">POST</span>
                  <span className="endpoint">https://hrms.corp/api/v1/billing-events/stage-transition</span>
                  <p>Outbound Webhook: notifies HRMS in real-time when bills move stages or breach SLAs.</p>
                </div>
                <div className="api-card">
                  <span className="method post">POST</span>
                  <span className="endpoint">https://hrms.corp/api/v1/billing-events/payment-completed</span>
                  <p>Outbound Webhook: notifies HRMS upon final electronic disbursement with UTR details.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="p-tab-pane">
              <h3>Deliverables 8 &amp; 9: Phase-I Development Timeline (8 Weeks) &amp; Squad</h3>
              <div className="directive-grid">
                <div className="d-card">
                  <h4>📅 8-Week Phased Sprint Roadmap</h4>
                  <ul>
                    <li><strong>Sprints 1 &amp; 2 (Weeks 1 — 4):</strong> Database schema migration, Workflow Master repository, and forward-only state machine engine.</li>
                    <li><strong>Sprints 3 &amp; 4 (Weeks 5 — 8):</strong> Pilot deployments (BBMP Lakes North &amp; BMRCL 80/20), SLA monitor service, and Executive Control Tower Dashboard sign-off.</li>
                  </ul>
                </div>

                <div className="d-card">
                  <h4>👥 Dedicated Squad Allocation</h4>
                  <ul>
                    <li><strong>Technical Lead &amp; Architect (1 FTE — Raghavendra):</strong> Solution architecture &amp; governance.</li>
                    <li><strong>Senior Full-Stack Engineer (1 FTE):</strong> Node.js / PostgreSQL workflow engine &amp; state machine.</li>
                    <li><strong>Senior Frontend Engineer (1 FTE):</strong> React 19 UI &amp; Control Tower dashboard.</li>
                    <li><strong>Functional QA &amp; Business Analyst (1 FTE):</strong> Government workflow validation &amp; testing.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pilots" && (
            <div className="p-tab-pane">
              <h3>Deliverable 10: Two Proposed Pilot Units &amp; Justification</h3>
              <div className="directive-grid">
                <div className="d-card pilot-highlight-card">
                  <h4>Pilot 1: BBMP Lakes North Zone</h4>
                  <p><strong>Sector:</strong> Civic &amp; Municipal Infrastructure (Public Works)</p>
                  <p><strong>Workflow:</strong> 15 Sequential Approval Stages</p>
                  <p>
                    <strong>Why Selected:</strong> Exhibits the most stringent civil engineering hierarchy (AE measurement book recording, mandatory 25% KPWD check-measurements by AEE, and EE technical scrutiny) alongside the complex <em>Double Bill</em> mechanism (DC Bill + DCF Fund release).
                  </p>
                  <button
                    type="button"
                    className="btn-p-action"
                    onClick={() => {
                      onLaunchPilot("BILL-1001");
                      onClose();
                    }}
                  >
                    Open Pilot 1 Docket (BILL-1001) ➔
                  </button>
                </div>

                <div className="d-card pilot-highlight-card">
                  <h4>Pilot 2: BMRCL Project Wing (80/20 Split)</h4>
                  <p><strong>Sector:</strong> Mass Rapid Transit Infrastructure (Corporate PSU)</p>
                  <p><strong>Workflow:</strong> Dual-Stream Milestone Approval (7 stages for 80%, 8 stages for 20%)</p>
                  <p>
                    <strong>Why Selected:</strong> Validates corporate milestone billing where operational execution (80% via CSO &amp; GM Operations) is decoupled from statutory labour and HR compliance (20% via HR Manager &amp; EPF/ESI muster verification).
                  </p>
                  <button
                    type="button"
                    className="btn-p-action"
                    onClick={() => {
                      onLaunchPilot("BILL-1002");
                      onClose();
                    }}
                  >
                    Open Pilot 2 Docket (BILL-1002) ➔
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "finance" && (
            <div className="p-tab-pane">
              <h3>Deliverable 11: Information Required from Finance/Accounts</h3>
              <p>The IT team requests validation from the Finance &amp; Accounts directorate on four key parameter sets:</p>
              <div className="directive-grid">
                <div className="d-card">
                  <h4>1. SLA Durations (Working Days)</h4>
                  <p>Formal business days allowed at each authority tier (e.g. Tapal: 1d; AE Site Check: 3d; CAO Audit: 2d; Treasury: 1d) excluding public holidays.</p>
                </div>
                <div className="d-card">
                  <h4>2. Mandatory Attachment Checklist</h4>
                  <p>Required compliance proofs per sector (e.g. Form V muster rolls for security, lab compaction test reports for civil works, ESI/EPF bank scrolls).</p>
                </div>
                <div className="d-card">
                  <h4>3. Escalation Rules</h4>
                  <p>Trigger points for automated warnings (e.g. at 75% elapsed SLA) and designated senior authorities for escalation.</p>
                </div>
                <div className="d-card">
                  <h4>4. Rejection Taxonomy</h4>
                  <p>Standardized defect codes (e.g. Rate dispute, Quantity deviation, Statutory under-remittance) to avoid ambiguous narrative rejections.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="proposal-modal-footer">
          <span className="footer-status">Status: Submitted for Executive Review by CEO &amp; Col. Jyothi</span>
          <button type="button" className="btn-modal-close" onClick={onClose}>Close Review Console</button>
        </div>
      </div>
    </div>
  );
}
