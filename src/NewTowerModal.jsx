import React, { useState } from "react";

export default function NewTowerModal({ onClose, onCreated, fetchWithAuth, currentTowerCount = 5 }) {
  const nextNum = currentTowerCount + 101;
  const [formData, setFormData] = useState({
    code: `TWR-GEN-0${currentTowerCount + 1}`,
    name: "",
    ward: "Ward 42, Bellandur",
    zone: "Mahadevapura Zone",
    contractor: "Sri Sai Infratech Projects",
    budget: "₹ 65,00,000",
    location: "Lake Inflow Weir, Sector 3",
    description: "Hydraulic inflow aeration tower, water quality sensing station, and desilting telemetry point."
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please provide a valid Tower Name.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetchWithAuth("http://localhost:4000/api/towers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register tower");
      }

      onCreated(data.tower);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save tower");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div
        className="custom-modal-window"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="custom-modal-header">
          <div className="custom-modal-title-group">
            <span className="custom-modal-tag">MASTER ASSET REGISTRATION</span>
            <h2>Register New Infrastructure Tower</h2>
          </div>
          <button
            type="button"
            className="custom-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="custom-modal-body">
          {error && <div className="custom-modal-error-alert">{error}</div>}

          <div className="custom-modal-row-2">
            <div className="custom-modal-field">
              <label>
                Tower Name / Facility <span className="req">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Agara Bio-Filter Inflow Tower"
                required
              />
            </div>

            <div className="custom-modal-field">
              <label>Tower Asset Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. TWR-AGR-06"
              />
            </div>
          </div>

          <div className="custom-modal-row-3">
            <div className="custom-modal-field">
              <label>Sanctioned Budget</label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g. ₹ 65,00,000"
              />
            </div>

            <div className="custom-modal-field">
              <label>Municipal Zone</label>
              <input
                type="text"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                placeholder="e.g. Mahadevapura Zone"
              />
            </div>

            <div className="custom-modal-field">
              <label>Ward Name / Number</label>
              <input
                type="text"
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                placeholder="e.g. Ward 174, HSR Layout"
              />
            </div>
          </div>

          <div className="custom-modal-row-2">
            <div className="custom-modal-field">
              <label>Default Executing Contractor</label>
              <input
                type="text"
                name="contractor"
                value={formData.contractor}
                onChange={handleChange}
                placeholder="e.g. Sri Sai Infratech Projects"
              />
            </div>

            <div className="custom-modal-field">
              <label>Physical Geospatial Location / Weir Point</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Agara Lake South Spillway Point"
              />
            </div>
          </div>

          <div className="custom-modal-field">
            <label>Asset Description & Purpose</label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Aeration station with automated telemetry sensors and desilting volume monitors."
            />
          </div>

          <div className="custom-modal-footer">
            <button
              type="button"
              className="custom-btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="custom-btn-primary"
              disabled={submitting}
            >
              {submitting ? "Registering…" : "✓ Register Master Tower"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
