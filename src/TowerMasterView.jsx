import React, { useState } from "react";

export default function TowerMasterView({
  towers = [],
  bills = [],
  onCreateBillingForTower,
  onViewTowerBills,
  onTowerCreated,
  fetchWithAuth,
  user
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'table'

  // New Tower form state
  const [newTowerForm, setNewTowerForm] = useState({
    name: "",
    code: "",
    ward: "",
    zone: "Mahadevapura Zone",
    contractor: "",
    budget: "₹ 50,00,000",
    location: "",
    description: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const filteredTowers = towers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.contractor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBudget = towers.reduce((acc, t) => acc + (t.budgetNum || 0), 0);
  const totalBilled = towers.reduce((acc, t) => acc + (t.totalBilledNum || 0), 0);
  const totalPaid = towers.reduce((acc, t) => acc + (t.totalPaidNum || 0), 0);

  const handleCreateTower = async (e) => {
    e.preventDefault();
    if (!newTowerForm.name.trim()) {
      setFormError("Tower Name is required.");
      return;
    }
    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetchWithAuth("http://localhost:4000/api/towers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTowerForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register tower.");

      if (onTowerCreated) onTowerCreated(data.tower);
      setShowAddModal(false);
      setNewTowerForm({
        name: "",
        code: "",
        ward: "",
        zone: "Mahadevapura Zone",
        contractor: "",
        budget: "₹ 50,00,000",
        location: "",
        description: ""
      });
    } catch (err) {
      setFormError(err.message || "Failed to create tower.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tower-master-view">
      {/* Header Banner */}
      <div className="view-banner">
        <div className="view-banner-content">
          <div className="banner-tag">INFRASTRUCTURE ASSET REGISTRY</div>
          <h2>Tower Master Directory</h2>
          <p>
            Central registry of all BBMP drainage, weir telemetry, aeration masts, and civil towers.
            Select any tower to initiate a new billing lifecycle docket.
          </p>
        </div>
        <button
          type="button"
          className="primary btn-add-tower"
          onClick={() => setShowAddModal(true)}
        >
          <span>🗼</span>
          <span>+ Register New Tower</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">TOTAL REGISTERED TOWERS</div>
          <div className="kpi-value">{towers.length}</div>
          <div className="kpi-sub">
            {towers.filter((t) => t.status === "ACTIVE").length} Operational •{" "}
            {towers.filter((t) => t.status === "MAINTENANCE").length} In Maintenance
          </div>
        </div>

      </div>

      {/* Action Toolbar */}
      <div className="tower-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by Tower Code, Name, Ward, or Contractor…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              ✕
            </button>
          )}
        </div>

        <div className="filter-group">
          <span className="filter-label">Status:</span>
          {["ALL", "ACTIVE", "MAINTENANCE"].map((st) => (
            <button
              key={st}
              type="button"
              className={`pill-filter ${statusFilter === st ? "active" : ""}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="view-mode-toggle">
          <button
            type="button"
            className={`btn-mode ${viewMode === "cards" ? "active" : ""}`}
            onClick={() => setViewMode("cards")}
            title="Grid Card View"
          >
            🔲 Grid
          </button>
          <button
            type="button"
            className={`btn-mode ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
            title="Table View"
          >
            📑 Table
          </button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === "cards" ? (
        <div className="towers-grid">
          {filteredTowers.length === 0 ? (
            <div className="empty-state-card">
              <span className="empty-icon">🗼</span>
              <h3>No towers found matching criteria</h3>
              <p>Adjust your search filters or click "+ Register New Tower" above.</p>
            </div>
          ) : (
            filteredTowers.map((tower) => (
              <div className="tower-card" key={tower.id}>
                <div className="tower-card-header">
                  <div className="tower-code-pill">
                    <span className="tower-icon">🗼</span>
                    <span>{tower.code}</span>
                  </div>
                  <span className={`status-pill ${tower.status.toLowerCase()}`}>
                    ● {tower.status}
                  </span>
                </div>

                <h3 className="tower-title">{tower.name}</h3>
                <p className="tower-desc">{tower.description}</p>

                <div className="tower-details-list">
                  <div className="detail-row">
                    <span className="dt-label">📍 Ward / Division:</span>
                    <span className="dt-value">{tower.ward}</span>
                  </div>
                  <div className="detail-row">
                    <span className="dt-label">🏢 Zone:</span>
                    <span className="dt-value">{tower.zone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="dt-label">👷 Assigned Contractor:</span>
                    <span className="dt-value highlight">{tower.contractor}</span>
                  </div>
                  <div className="detail-row">
                    <span className="dt-label">💰 Sanctioned Budget:</span>
                    <span className="dt-value text-blue">{tower.budget}</span>
                  </div>
                  <div className="detail-row">
                    <span className="dt-label">📊 Billed to Date:</span>
                    <span className="dt-value text-amber">{tower.totalBilled}</span>
                  </div>
                  <div className="detail-row">
                    <span className="dt-label">💳 Disbursed (Paid):</span>
                    <span className="dt-value text-emerald">{tower.totalPaid}</span>
                  </div>
                </div>

                <div className="tower-card-footer">
                  <button
                    type="button"
                    className="btn-create-billing"
                    onClick={() => onCreateBillingForTower(tower)}
                    title={`Create a new billing entry for ${tower.name}`}
                  >
                    <span>➕</span>
                    <span>Create Billing</span>
                  </button>

                  <button
                    type="button"
                    className="btn-view-bills"
                    onClick={() => onViewTowerBills(tower)}
                    title={`View all billings for ${tower.name}`}
                  >
                    <span>📋</span>
                    <span>Bills ({tower.billCount || 0})</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table View */
        <div className="card table-container-card">
          <table className="master-data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Tower Name & Location</th>
                <th>Ward & Zone</th>
                <th>Contractor</th>
                <th>Budget</th>
                <th>Total Billed</th>
                <th>Total Paid</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTowers.map((tower) => (
                <tr key={tower.id}>
                  <td>
                    <span className="code-tag">{tower.code}</span>
                  </td>
                  <td>
                    <strong>{tower.name}</strong>
                    <div className="sub-text">{tower.location}</div>
                  </td>
                  <td>
                    <div>{tower.ward}</div>
                    <small className="muted">{tower.zone}</small>
                  </td>
                  <td>{tower.contractor}</td>
                  <td>
                    <strong className="text-blue">{tower.budget}</strong>
                  </td>
                  <td>
                    <span className="text-amber">{tower.totalBilled}</span>
                  </td>
                  <td>
                    <span className="text-emerald">{tower.totalPaid}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${tower.status.toLowerCase()}`}>
                      ● {tower.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-cell">
                      <button
                        type="button"
                        className="btn-action-sm primary"
                        onClick={() => onCreateBillingForTower(tower)}
                        title="Create Billing"
                      >
                        ➕ Bill
                      </button>
                      <button
                        type="button"
                        className="btn-action-sm secondary"
                        onClick={() => onViewTowerBills(tower)}
                        title="View Bills"
                      >
                        Bills ({tower.billCount || 0})
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Register New Tower */}
      {showAddModal && (
        <div className="custom-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div
            className="custom-modal-window"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <div className="custom-modal-header">
              <div className="custom-modal-title-group">
                <span className="custom-modal-tag">ASSET MASTER REGISTRATION</span>
                <h2>Register New Infrastructure Tower</h2>
              </div>
              <button
                type="button"
                className="custom-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTower} className="custom-modal-body">
              {formError && <div className="custom-modal-error-alert">{formError}</div>}

              <div className="custom-modal-row-2">
                <div className="custom-modal-field">
                  <label>
                    Tower Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Varthur Lake Outlet Monitoring Tower"
                    value={newTowerForm.name}
                    onChange={(e) => setNewTowerForm({ ...newTowerForm, name: e.target.value })}
                  />
                </div>

                <div className="custom-modal-field">
                  <label>Tower Reference Code</label>
                  <input
                    type="text"
                    placeholder="e.g. TWR-VTR-06"
                    value={newTowerForm.code}
                    onChange={(e) => setNewTowerForm({ ...newTowerForm, code: e.target.value })}
                  />
                  <span className="field-hint">Auto-generated if left blank</span>
                </div>
              </div>

              <div className="custom-modal-row-2">
                <div className="custom-modal-field">
                  <label>Ward / Division</label>
                  <input
                    type="text"
                    placeholder="e.g. Ward 149, Varthur"
                    value={newTowerForm.ward}
                    onChange={(e) => setNewTowerForm({ ...newTowerForm, ward: e.target.value })}
                  />
                </div>

                <div className="custom-modal-field">
                  <label>BBMP Zone</label>
                  <select
                    value={newTowerForm.zone}
                    onChange={(e) => setNewTowerForm({ ...newTowerForm, zone: e.target.value })}
                  >
                    <option value="Mahadevapura Zone">Mahadevapura Zone</option>
                    <option value="East Zone">East Zone</option>
                    <option value="South Zone">South Zone</option>
                    <option value="West Zone">West Zone</option>
                    <option value="Yelahanka Zone">Yelahanka Zone</option>
                    <option value="Bommanahalli Zone">Bommanahalli Zone</option>
                  </select>
                </div>
              </div>

              <div className="custom-modal-row-2">
                <div className="custom-modal-field">
                  <label>Designated Contractor</label>
                  <input
                    type="text"
                    placeholder="e.g. Sri Sai Infratech Projects"
                    value={newTowerForm.contractor}
                    onChange={(e) => setNewTowerForm({ ...newTowerForm, contractor: e.target.value })}
                  />
                </div>

                <div className="custom-modal-field">
                  <label>Sanctioned Budget</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹ 65,00,000"
                    value={newTowerForm.budget}
                    onChange={(e) => setNewTowerForm({ ...newTowerForm, budget: e.target.value })}
                  />
                </div>
              </div>

              <div className="custom-modal-field">
                <label>Physical GPS / Location Coordinates</label>
                <input
                  type="text"
                  placeholder="e.g. Varthur Lake South-East Sluice Gate, Chainage 1+240"
                  value={newTowerForm.location}
                  onChange={(e) => setNewTowerForm({ ...newTowerForm, location: e.target.value })}
                />
              </div>

              <div className="custom-modal-field">
                <label>Technical Description & Purpose</label>
                <textarea
                  rows="2"
                  placeholder="Details regarding water telemetry, desilting measurement mast, structural capacity..."
                  value={newTowerForm.description}
                  onChange={(e) => setNewTowerForm({ ...newTowerForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className="custom-modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary btn-modal-submit" disabled={submitting}>
                  {submitting ? "Registering…" : "Register Tower into Master"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
