import React, { useState } from "react";

export default function Login({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Please enter both username/email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message || "Failed to sign in. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-ambient-glow" />
      <div className="auth-ambient-glow-2" />

      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo-badge">
            <span>🏛️</span>
            <span>Government Portal — Secure Access</span>
          </div>
          <h1>Billing Tower Tracker</h1>
          <p className="auth-subtitle">
            AI-Enabled Billing &amp; Governance Control Tower
          </p>
        </div>
        <div className="auth-card">
          {error && (
            <div className="auth-error-banner">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <label htmlFor="identifier">Username</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="identifier"
                  type="text"
                  className="auth-input"
                  placeholder="billing_tower"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                  Verifying Credentials…
                </>
              ) : (
                <>Sign In to Portal →</>
              )}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: "24px" }}>
            <span>🛡️ Forward-Only Governance &amp; Audit Logging Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
