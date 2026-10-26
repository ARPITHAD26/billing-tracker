import React, { useState, useEffect } from "react";

export default function HrmsIntegrationModal({ onClose, fetchWithAuth }) {
  const [contracts, setContracts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("inbound");
  const [toastMsg, setToastMsg] = useState("");

  const [form, setForm] = useState({
    workOrderNumber: "WO/BMRCL/R3C/2026/088",
    client: "BMRCL",
    unit: "BMRCL Project Wing",
    service: "Metro Elevated Station Structural Finishing",
    sanctionedAmount: "₹ 85,00,000",
    contractor: "Karnataka Infrastructure & Metro Constr Ltd"
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, lRes] = await Promise.all([
        fetchWithAuth("http://localhost:4000/api/hrms/contracts"),
        fetchWithAuth("http://localhost:4000/api/hrms/sync-logs")
      ]);
      const [cJson, lJson] = await Promise.all([cRes.json(), lRes.json()]);
      setContracts(cJson);
      setLogs(lJson);
    } catch (err) {
      console.error("Failed to load HRMS data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncContract = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetchWithAuth("http://localhost:4000/api/hrms/sync-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      setToastMsg(`✅ Work Order ${form.workOrderNumber} synced from HRMS!`);
      setTimeout(() => setToastMsg(""), 4000);
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestWebhook = async () => {
    try {
      setSubmitting(true);
      const res = await fetchWithAuth("http://localhost:4000/api/hrms/test-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId: "BILL-1002" })
      });
      const data = await res.json();
      setToastMsg(`⚡ Webhook dispatched to HRMS bus successfully!`);
      setTimeout(() => setToastMsg(""), 4000);
      loadData();
    } catch (err) {
      alert("Webhook dispatch error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="proposal-modal-backdrop" onClick={onClose}>
      <div className="hrms-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="proposal-modal-header">
          <div className="p-header-left">
            <div className="p-badge-row">
              <span className="badge-ref">Phase III Architectural Bridge</span>
              <span className="badge-sponsor">HRMS API Simulator</span>
            </div>
            <h2>HRMS Integration Sandbox &amp; Webhook Console</h2>
            <p>
              Validates Section 10 Directive: <em>"Build independently now; integrate with HRMS later."</em> Pre-built API contracts for bidirectional synchronization.
            </p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        {toastMsg && <div className="hrms-toast-banner">{toastMsg}</div>}

        <div className="proposal-tabs-bar">
          <button
            type="button"
            className={`p-tab ${activeTab === "inbound" ? "active" : ""}`}
            onClick={() => setActiveTab("inbound")}
          >
            📥 Inbound Work Order Sync (HRMS ➔ Tower)
          </button>
          <button
            type="button"
            className={`p-tab ${activeTab === "outbound" ? "active" : ""}`}
            onClick={() => setActiveTab("outbound")}
          >
            📤 Outbound Stage Webhooks (Tower ➔ HRMS)
          </button>
          <button
            type="button"
            className={`p-tab ${activeTab === "contracts" ? "active" : ""}`}
            onClick={() => setActiveTab("contracts")}
          >
            📋 Synced Contracts Repository ({contracts.length})
          </button>
        </div>

        <div className="proposal-modal-body">
          {activeTab === "inbound" && (
            <div className="p-tab-pane">
              <h3>Simulate Work Order &amp; Contract Ingestion from HRMS</h3>
              <p>
                When a new tender or work order is sanctioned in HRMS, it automatically creates a registered master in the Billing Control Tower.
              </p>

              <form onSubmit={handleSyncContract} className="hrms-form-grid">
                <div className="form-group">
                  <label>Work Order / Contract Number</label>
                  <input
                    type="text"
                    value={form.workOrderNumber}
                    onChange={(e) => setForm({ ...form, workOrderNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Client Organization</label>
                  <select
                    value={form.client}
                    onChange={(e) => setForm({ ...form, client: e.target.value })}
                  >
                    <option value="BBMP">BBMP (Bruhat Bengaluru Mahanagara Palike)</option>
                    <option value="BMRCL">BMRCL (Bangalore Metro Rail Corp)</option>
                    <option value="KIADB">KIADB (Karnataka Industrial Area Dev)</option>
                    <option value="BMCRI">BMCRI (Bangalore Medical College)</option>
                    <option value="KSMCL">KSMCL (State Minerals Corporation)</option>
                    <option value="KPTCL">KPTCL (Power Transmission Corp)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Unit / Division</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Service Description</label>
                  <input
                    type="text"
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Sanctioned Contract Value</label>
                  <input
                    type="text"
                    value={form.sanctionedAmount}
                    onChange={(e) => setForm({ ...form, sanctionedAmount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contractor / Vendor</label>
                  <input
                    type="text"
                    value={form.contractor}
                    onChange={(e) => setForm({ ...form, contractor: e.target.value })}
                    required
                  />
                </div>

                <div className="form-action-full">
                  <button type="submit" className="btn-p-action" disabled={submitting}>
                    {submitting ? "Synchronizing..." : "Dispatch Inbound Contract Sync ➔"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "outbound" && (
            <div className="p-tab-pane">
              <h3>Outbound Real-time Webhook Dispatcher</h3>
              <p>
                As bills progress through approval stages or are settled by treasury, the Control Tower publishes authenticated webhooks to HRMS.
              </p>

              <div className="webhook-test-box">
                <div className="w-box-head">
                  <strong>Simulate Stage Movement Event:</strong> BILL-1002 (BMRCL Project Wing 80%)
                </div>
                <p>Dispatches event <code>BILL_STAGE_TRANSITION</code> with bill status, current authority, and amount.</p>
                <button
                  type="button"
                  className="btn-p-action"
                  onClick={handleTestWebhook}
                  disabled={submitting}
                >
                  ⚡ Trigger Test Webhook to HRMS Bus
                </button>
              </div>

              <h4>📜 Recent Integration Event Audit Trail</h4>
              <div className="logs-scroll">
                {logs.map((log, idx) => (
                  <div key={idx} className="log-entry">
                    <div className="log-top">
                      <span className="log-event">{log.event}</span>
                      <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="log-detail">
                      {log.workOrder ? `WO: ${log.workOrder} (${log.client})` : `Bill: ${log.billNumber} | Status: ${log.status}`}
                    </div>
                  </div>
                ))}
                {logs.length === 0 && <p className="no-logs">No integration events recorded yet.</p>}
              </div>
            </div>
          )}

          {activeTab === "contracts" && (
            <div className="p-tab-pane">
              <h3>Synchronized Contracts Repository</h3>
              <div className="table-wrapper">
                <table className="p-table">
                  <thead>
                    <tr>
                      <th>Work Order</th>
                      <th>Client</th>
                      <th>Unit</th>
                      <th>Service</th>
                      <th>Sanctioned Value</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((c) => (
                      <tr key={c.contractId}>
                        <td><strong>{c.workOrderNumber}</strong></td>
                        <td>{c.client}</td>
                        <td>{c.unit}</td>
                        <td>{c.service}</td>
                        <td className="text-emerald">₹ {Number(c.sanctionedAmount).toLocaleString("en-IN")}</td>
                        <td><span className="badge-active">ACTIVE</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="proposal-modal-footer">
          <button type="button" className="btn-modal-close" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
