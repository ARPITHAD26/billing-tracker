import React from "react";
import { getStageDetails } from "./stageData";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default function StepDetails({
  step,
  totalSteps,
  stageName,
  currentStep,
  bill,
  user,
  saving,
  checkedSteps = new Set(),
  onToggleCheck,
  onClose,
  onNavigate,
  onTransition
}) {
  const details = getStageDetails(step, stageName);

  const isCompleted = step < currentStep;
  const isCurrent = step === currentStep;
  const isUpcoming = step > currentStep;
  const isUserChecked = checkedSteps.has(step) && !isCompleted;

  // Track individually checked checklist items within each step
  const [checkedItems, setCheckedItems] = React.useState({});

  const toggleChecklistItem = (stepNum, idx) => {
    setCheckedItems((prev) => {
      const key = `${stepNum}-${idx}`;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const isItemChecked = (stepNum, idx) => {
    if (isCompleted) return true;
    return !!checkedItems[`${stepNum}-${idx}`];
  };

  const totalChecklistItems = details.checklist.length;
  const completedChecklistItems = isCompleted
    ? totalChecklistItems
    : details.checklist.filter((_, idx) => checkedItems[`${step}-${idx}`]).length;

  // Find audit history entry for this step if completed or current
  const historyEntry = (bill.history || [])
    .slice()
    .reverse()
    .find((h) => h.step === step);

  // Match any attached documents that might pertain to this stage
  const attachedDocs = (bill.documents || []).filter((doc) => {
    const docName = doc.name.toLowerCase();
    const stageLower = stageName.toLowerCase();
    if (stageLower.includes("attendance") && (docName.includes("muster") || docName.includes("attendance"))) return true;
    if (stageLower.includes("ae") && (docName.includes("measurement") || docName.includes("mb"))) return true;
    if (stageLower.includes("account") && (docName.includes("boq") || docName.includes("estimate") || docName.includes("rate"))) return true;
    return false;
  });

  return (
    <div className="step-details-container" id="step-details-panel">
      {/* Header */}
      <div className="step-details-header">
        <div className="step-details-title-group">
          <div className="step-badge-row">
            <span className="step-number-pill">
              STEP {step} OF {totalSteps}
            </span>
            {isCompleted && (
              <span className="step-status-pill completed">
                <span className="status-dot">✓</span> COMPLETED & VERIFIED
              </span>
            )}
            {isCurrent && !isUserChecked && (
              <span className="step-status-pill current">
                <span className="status-dot pulsing">●</span> CURRENT ACTIVE STAGE
              </span>
            )}
            {isUserChecked && (
              <span className="step-status-pill user-checked-pill">
                <span className="status-dot">✓</span> CHECKED & INSPECTED
              </span>
            )}
            {isUpcoming && !isUserChecked && (
              <span className="step-status-pill upcoming">
                <span className="status-dot">⏳</span> UPCOMING APPROVAL STAGE
              </span>
            )}
            {!isCompleted && (
              <span className="checklist-progress-pill">
                {completedChecklistItems}/{totalChecklistItems} items
              </span>
            )}
          </div>
          <h3 className="step-main-title">{details.title}</h3>
        </div>

        <div className="step-details-nav">
          <button
            type="button"
            className={`btn-step-check-toggle ${isCompleted || isUserChecked ? "active" : ""}`}
            onClick={() => onToggleCheck && onToggleCheck(step)}
            title={isCompleted ? "Step already completed and verified" : "Click to toggle green tick mark"}
          >
            {isCompleted ? "✓ Verified" : isUserChecked ? "✓ Checked" : "○ Mark as Checked"}
          </button>
          <button
            type="button"
            className="btn-step-nav"
            disabled={step <= 1}
            onClick={() => onNavigate(step - 1)}
            title="View previous step"
          >
            ‹ Prev Step
          </button>
          <span className="step-nav-counter">
            {step} / {totalSteps}
          </span>
          <button
            type="button"
            className="btn-step-nav"
            disabled={step >= totalSteps}
            onClick={() => onNavigate(step + 1)}
            title="View next step"
          >
            Next Step ›
          </button>
          <button
            type="button"
            className="btn-step-close"
            onClick={onClose}
            title="Hide details view"
            aria-label="Close step details"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Meta quick strip */}
      <div className="step-meta-strip">
        <div className="step-meta-item">
          <span className="step-meta-label">Authorizing Official</span>
          <span className="step-meta-value officer-badge">
            👤 {details.role}
          </span>
        </div>
        <div className="step-meta-item">
          <span className="step-meta-label">Directorate / Wing</span>
          <span className="step-meta-value">🏛️ {details.department}</span>
        </div>
        <div className="step-meta-item">
          <span className="step-meta-label">Turnaround SLA</span>
          <span className="step-meta-value sla-badge">⏱️ {details.sla}</span>
        </div>
        <div className="step-meta-item">
          <span className="step-meta-label">Statutory Protocol</span>
          <span className="step-meta-value code-badge">📜 {details.statutoryCode}</span>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="step-details-body">
        {/* Column 1: Scope & Operational Protocol */}
        <div className="step-detail-card">
          <div className="step-card-header">
            <span className="step-card-icon">📋</span>
            <h4>Stage Scope & Operational Protocol</h4>
          </div>
          <div className="step-card-content">
            <div className="step-objective-box">
              <strong>Objective:</strong> {details.objective}
            </div>
            <p className="step-description-text">{details.description}</p>
          </div>
        </div>

        {/* Column 2: Mandatory Checklist & Documents */}
        <div className="step-detail-card">
          <div className="step-card-header">
            <span className="step-card-icon">☑️</span>
            <h4>Verification Checklist & Mandatory Records</h4>
          </div>
          <div className="step-card-content">
            <ul className="step-checklist">
              {details.checklist.map((item, idx) => {
                const itemChecked = isItemChecked(step, idx);
                return (
                  <li
                    key={idx}
                    className={`${itemChecked ? "checked" : ""} checklist-interactive`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isCompleted) {
                        toggleChecklistItem(step, idx);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    title={isCompleted ? "This item is already verified" : `Click to ${itemChecked ? "uncheck" : "check"} this item`}
                  >
                    <span className={`check-bullet ${itemChecked ? "bullet-checked" : ""}`}>
                      {itemChecked ? "✓" : "○"}
                    </span>
                    <span className={itemChecked ? "item-text-checked" : ""}>{item}</span>
                  </li>
                );
              })}
            </ul>

            <div className="step-documents-section">
              <span className="step-docs-title">Required Official Documents:</span>
              <div className="step-doc-tags">
                {details.mandatoryDocuments.map((doc, idx) => (
                  <span key={idx} className="step-doc-tag">
                    📄 {doc}
                  </span>
                ))}
              </div>
            </div>

            {attachedDocs.length > 0 && (
              <div className="matching-attached-docs">
                <span className="matching-docs-title">
                  📎 Uploaded Verification Files ({attachedDocs.length}):
                </span>
                <div className="matching-docs-list">
                  {attachedDocs.map((d) => (
                    <a
                      key={d.id}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="matching-doc-link"
                    >
                      {d.type === "pdf" ? "📄" : "📊"} {d.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Audit Trail & Stage Authorization Status */}
        <div className="step-detail-card audit-col">
          <div className="step-card-header">
            <span className="step-card-icon">🛡️</span>
            <h4>Audit Trail & Execution Record</h4>
          </div>
          <div className="step-card-content">
            {isCompleted && historyEntry ? (
              <div className="step-audit-history completed">
                <div className="audit-field">
                  <span className="audit-label">Status</span>
                  <span className="audit-val success">Approved & Transitioned</span>
                </div>
                <div className="audit-field">
                  <span className="audit-label">Authorized By</span>
                  <span className="audit-val highlight">{historyEntry.performedBy || "Authorized Official"}</span>
                </div>
                <div className="audit-field">
                  <span className="audit-label">Timestamp</span>
                  <span className="audit-val">{formatDate(historyEntry.savedAt || historyEntry.startedAt)}</span>
                </div>
                <div className="audit-field">
                  <span className="audit-label">SLA Target Due Date</span>
                  <span className="audit-val">{formatDate(historyEntry.dueAt)}</span>
                </div>
                <div className="audit-field">
                  <span className="audit-label">Action Log</span>
                  <span className="audit-val italic">{historyEntry.action || "Stage clearance granted"}</span>
                </div>
              </div>
            ) : isCurrent ? (
              <div className="step-audit-history current">
                <div className="audit-field">
                  <span className="audit-label">Current Status</span>
                  <span className="audit-val current-active">● Active In-Review Stage</span>
                </div>
                {historyEntry && (
                  <>
                    <div className="audit-field">
                      <span className="audit-label">Initiated By</span>
                      <span className="audit-val highlight">{historyEntry.performedBy || "System Baseline"}</span>
                    </div>
                    <div className="audit-field">
                      <span className="audit-label">Initiated At</span>
                      <span className="audit-val">{formatDate(historyEntry.startedAt || historyEntry.savedAt)}</span>
                    </div>
                    <div className="audit-field">
                      <span className="audit-label">SLA Deadline</span>
                      <span className="audit-val warning">{formatDate(historyEntry.dueAt)}</span>
                    </div>
                  </>
                )}
                <p className="audit-help-text">
                  This stage is currently awaiting execution and verification files. Once completed, advance to the next step.
                </p>
              </div>
            ) : (
              <div className="step-audit-history upcoming">
                <div className="audit-field">
                  <span className="audit-label">Pipeline Status</span>
                  <span className="audit-val pending">⏳ Pending Preceding Clearances</span>
                </div>
                <div className="audit-field">
                  <span className="audit-label">Prerequisite</span>
                  <span className="audit-val">
                    Step {step - 1}: {bill.stages[step - 2]} approval
                  </span>
                </div>
                <div className="audit-field">
                  <span className="audit-label">Assigned Authority</span>
                  <span className="audit-val highlight">{details.role}</span>
                </div>
                <p className="audit-help-text">
                  Forward progression will unlock this stage once all upstream approvals and documentation are completed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Progression Action */}
      <div className="step-details-footer">
        <div className="footer-status-text">
          {isCompleted && (
            <span className="footer-notice success">
              ✅ Stage #{step} has been successfully completed and cryptographically signed. Workflows are forward-only.
            </span>
          )}
          {isCurrent && (
            <span className="footer-notice info">
              📌 You are viewing the active workflow step. Attach any relevant verification sheets or approve subsequent stages.
            </span>
          )}
          {isUpcoming && (
            <span className="footer-notice action">
              🚀 Ready to transition? Authorizing as <strong>{user.name}</strong> ({user.role})
            </span>
          )}
        </div>

        <div className="footer-actions">
          {isCompleted && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onNavigate(currentStep)}
            >
              Jump to Active Step ({currentStep})
            </button>
          )}

          {isUpcoming && (
            <button
              type="button"
              className="primary btn-approve-step"
              onClick={() => onTransition(step)}
              disabled={saving}
            >
              {saving ? "Authorizing Transition…" : `Approve & Transition to Step ${step}`}
            </button>
          )}

          {isCurrent && (
            <button
              type="button"
              className="primary btn-approve-step"
              onClick={() => onNavigate(Math.min(totalSteps, step + 1))}
            >
              Inspect Next Step ({Math.min(totalSteps, step + 1)}) ›
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
