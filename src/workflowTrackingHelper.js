/**
 * 6. WORKFLOW TRACKING HELPER
 * Implements the official requirement:
 * "Each bill shall display its complete journey:
 *  Submission → Approval stages → Finance → Audit, where applicable → Payment
 *  The system shall show:
 *  - Completed stages
 *  - Current stage
 *  - Pending stage
 *  - Date entered into stage
 *  - Days pending
 *  - SLA
 *  - SLA status
 *  - Next stage"
 */

// 5 Canonical Macro-Journey Phases
export const CANONICAL_JOURNEY_PHASES = [
  {
    id: "submission",
    label: "Submission",
    shortLabel: "Submission",
    icon: "📥",
    order: 1,
    color: "#3b82f6",
    description: "Initial receipt, Tapal docketing, work order verification & file registration"
  },
  {
    id: "approval",
    label: "Approval stages",
    shortLabel: "Approval stages",
    icon: "✍️",
    order: 2,
    color: "#6366f1",
    description: "Technical check-measurement, field inspection, and administrative sanctions"
  },
  {
    id: "finance",
    label: "Finance",
    shortLabel: "Finance",
    icon: "💰",
    order: 3,
    color: "#f59e0b",
    description: "Financial scrutiny, rate concordance against SR, and statutory deductions"
  },
  {
    id: "audit",
    label: "Audit, where applicable",
    shortLabel: "Audit",
    icon: "🛡️",
    order: 4,
    color: "#8b5cf6",
    description: "Pre-audit verification, DC Bill pass order, and statutory audit certification"
  },
  {
    id: "payment",
    label: "Payment",
    shortLabel: "Payment",
    icon: "💳",
    order: 5,
    color: "#10b981",
    description: "Disbursement, Treasury scroll release, Cheque/RTGS remittance and docket closure"
  }
];

/**
 * Maps any stage in any of the 34 organizational workflows to one of the 5 canonical phases
 */
export function getStageCanonicalPhase(stageName = "", stepNumber = 1, totalSteps = 12) {
  const s = stageName.toLowerCase();

  // Phase 1: Submission
  if (
    stepNumber === 1 ||
    s.includes("tapal") ||
    s.includes("inward") ||
    s.includes("docket") ||
    s.includes("submission") ||
    s.includes("registry") ||
    s.includes("bill to cso")
  ) {
    return CANONICAL_JOURNEY_PHASES[0];
  }

  // Phase 5: Payment
  if (
    stepNumber === totalSteps ||
    s.includes("payment") ||
    s.includes("disburse") ||
    s.includes("cheque") ||
    s.includes("rtgs") ||
    s.includes("remittance") ||
    s.includes("treasury payment") ||
    s.includes("fund release") ||
    s.includes("closure")
  ) {
    return CANONICAL_JOURNEY_PHASES[4];
  }

  // Phase 4: Audit (where applicable)
  if (
    s.includes("audit") ||
    s.includes("pre-audit") ||
    s.includes("dc bill") ||
    s.includes("reconciliation") ||
    s.includes("scrutiny sheet") ||
    s.includes("audit cert") ||
    s.includes("audit approval")
  ) {
    return CANONICAL_JOURNEY_PHASES[3];
  }

  // Phase 3: Finance
  if (
    s.includes("finance") ||
    s.includes("dcf") ||
    s.includes("account") ||
    s.includes("fa") ||
    s.includes("cao") ||
    s.includes("agm finance") ||
    s.includes("budget") ||
    s.includes("cash section") ||
    s.includes("wage") ||
    s.includes("tax") ||
    s.includes("retention")
  ) {
    return CANONICAL_JOURNEY_PHASES[2];
  }

  // Phase 2: Approval stages (Operational, Technical & Administrative)
  return CANONICAL_JOURNEY_PHASES[1];
}

/**
 * Builds the 5 Canonical Macro-Journey Phases with live progress and applicability for a bill
 */
export function buildJourneyPhases(stages = [], currentStep = 1) {
  const total = stages.length;
  const phaseBuckets = CANONICAL_JOURNEY_PHASES.map((ph) => ({
    ...ph,
    stages: []
  }));

  stages.forEach((name, idx) => {
    const step = idx + 1;
    const phaseInfo = getStageCanonicalPhase(name, step, total);
    const bucket = phaseBuckets.find((p) => p.id === phaseInfo.id) || phaseBuckets[1];
    bucket.stages.push({
      step,
      name,
      completed: step < currentStep,
      active: step === currentStep,
      pending: step > currentStep
    });
  });

  return phaseBuckets.map((ph) => {
    const totalCount = ph.stages.length;
    const hasStages = totalCount > 0;

    if (!hasStages) {
      return {
        ...ph,
        isApplicable: false,
        status: "NOT_APPLICABLE",
        statusLabel: "Not Required",
        completedCount: 0,
        totalCount: 0
      };
    }

    const completedCount = ph.stages.filter((s) => s.completed).length;
    const hasActive = ph.stages.some((s) => s.active);

    let status = "PENDING";
    let statusLabel = "Pending";

    if (completedCount === totalCount) {
      status = "COMPLETED";
      statusLabel = "Completed ✓";
    } else if (hasActive) {
      status = "CURRENT";
      statusLabel = "In Progress ●";
    }

    return {
      ...ph,
      isApplicable: true,
      status,
      statusLabel,
      completedCount,
      totalCount
    };
  });
}

/**
 * Computes all 8 statutory workflow tracking parameters for any bill
 */
export function calculateWorkflowTracking(bill) {
  if (!bill) return null;

  const rawStages = bill.stages && Array.isArray(bill.stages) && bill.stages.length > 0
    ? bill.stages
    : ["Tapal", "AE", "AEE", "EE", "Attendance Certification", "AEE", "JC", "DCF Fund", "EE", "DC Bill", "DCF Payments"];

  const totalSteps = rawStages.length;
  const currentStep = Math.min(Math.max(Number(bill.currentStep) || 1, 1), totalSteps);

  // 1. Completed Stages
  const completedStages = [];
  for (let i = 0; i < currentStep - 1; i++) {
    const stepNum = i + 1;
    const stageName = rawStages[i];
    const phase = getStageCanonicalPhase(stageName, stepNum, totalSteps);
    const historyEntry = (bill.history || []).find((h) => h.step === stepNum);

    completedStages.push({
      step: stepNum,
      name: stageName,
      phaseId: phase.id,
      phaseLabel: phase.label,
      phaseIcon: phase.icon,
      completedAt: historyEntry?.savedAt || historyEntry?.dueAt || null,
      authorizedBy: historyEntry?.performedBy || "Verified Authority",
      action: historyEntry?.action || "Stage clearance granted"
    });
  }

  // 4. Date entered into stage
  let dateEnteredIntoStage = bill.dateEnteredIntoStage;
  if (!dateEnteredIntoStage) {
    const currentHist = (bill.history || [])
      .slice()
      .reverse()
      .find((h) => h.step === currentStep);
    if (currentHist && (currentHist.startedAt || currentHist.savedAt)) {
      dateEnteredIntoStage = currentHist.startedAt || currentHist.savedAt;
    } else if (bill.submissionDate) {
      // Calculate realistic entered date based on current step
      const elapsedDays = Math.max(1, (currentStep - 1) * 2);
      const subMs = new Date(bill.submissionDate).getTime();
      dateEnteredIntoStage = new Date(subMs + elapsedDays * 86400000).toISOString();
    } else {
      dateEnteredIntoStage = new Date().toISOString();
    }
  }

  // 5. Days pending in current stage
  let daysPending = bill.daysInStage !== undefined ? bill.daysInStage : bill.daysPending;
  if (daysPending === undefined || daysPending === null) {
    const enteredMs = new Date(dateEnteredIntoStage).getTime();
    const diffMs = Math.max(0, Date.now() - enteredMs);
    daysPending = Math.round((diffMs / 86400000) * 10) / 10;
  }
  daysPending = Number(daysPending) || 0;

  // 6. SLA for current stage
  const currentStageName = rawStages[currentStep - 1] || `Step ${currentStep}`;
  const stageSlaDays = Number(bill.stageSlaDays) || 2;
  const slaText = `${stageSlaDays} Day${stageSlaDays > 1 ? "s" : ""} (${stageSlaDays * 24}h)`;

  // 7. SLA Status
  let slaStatus = bill.slaStatus;
  if (!slaStatus) {
    if (daysPending > stageSlaDays) {
      slaStatus = "BREACHED_SLA";
    } else if (daysPending >= stageSlaDays * 0.75) {
      slaStatus = "APPROACHING_SLA";
    } else {
      slaStatus = "WITHIN_SLA";
    }
  }

  const slaPercentageConsumed = Math.min(
    200,
    Math.round((daysPending / Math.max(1, stageSlaDays)) * 100)
  );

  // 2. Current Stage details
  const currentPhase = getStageCanonicalPhase(currentStageName, currentStep, totalSteps);
  const currentStage = {
    step: currentStep,
    name: currentStageName,
    role: bill.currentRole || "Assigned Officer",
    person: bill.currentPerson || "Responsible Authority",
    phaseId: currentPhase.id,
    phaseLabel: currentPhase.label,
    phaseIcon: currentPhase.icon,
    dateEntered: dateEnteredIntoStage,
    daysPending,
    slaDays: stageSlaDays,
    slaText,
    slaStatus,
    slaPercentageConsumed
  };

  // 3. Pending Stage
  // Primary pending stage is the active stage awaiting clearance
  const pendingStage = {
    step: currentStep,
    name: currentStageName,
    role: bill.currentRole || "Pending Review Authority",
    phaseLabel: currentPhase.label,
    phaseIcon: currentPhase.icon,
    status: "AWAITING_CLEARANCE",
    remainingStagesCount: totalSteps - currentStep + 1
  };

  // Remaining queued stages after current
  const queuedStages = [];
  for (let i = currentStep; i < totalSteps; i++) {
    const stepNum = i + 1;
    const stageName = rawStages[i];
    const phase = getStageCanonicalPhase(stageName, stepNum, totalSteps);
    queuedStages.push({
      step: stepNum,
      name: stageName,
      phaseId: phase.id,
      phaseLabel: phase.label,
      phaseIcon: phase.icon,
      status: "QUEUED_UPCOMING"
    });
  }

  // 8. Next Stage
  let nextStage = null;
  if (currentStep < totalSteps) {
    const nextStepNum = currentStep + 1;
    const nextStageName = rawStages[nextStepNum - 1];
    const nextPhase = getStageCanonicalPhase(nextStageName, nextStepNum, totalSteps);
    nextStage = {
      step: nextStepNum,
      name: nextStageName,
      phaseId: nextPhase.id,
      phaseLabel: nextPhase.label,
      phaseIcon: nextPhase.icon,
      role: "Next Reviewing Authority",
      slaDays: 2,
      isFinal: nextStepNum === totalSteps
    };
  } else {
    nextStage = {
      step: totalSteps,
      name: "Disbursement & File Closure",
      phaseId: "payment",
      phaseLabel: "Payment",
      phaseIcon: "🏁",
      role: "Treasury Officer",
      slaDays: 1,
      isFinal: true
    };
  }

  // 5 Canonical Journey Phases summary
  const journeyPhases = buildJourneyPhases(rawStages, currentStep);

  return {
    billId: bill.id,
    billNumber: bill.billNumber || bill.id,
    projectName: bill.projectName,
    client: bill.client || "BBMP",
    unit: bill.unit || bill.ward || "Municipal Unit",
    totalStages: totalSteps,
    progressPercentage: Math.round(((currentStep - 1) / totalSteps) * 100),

    // The 8 Mandated Specifications:
    completedStages,
    completedStagesCount: completedStages.length,
    currentStage,
    pendingStage,
    pendingStagesQueue: queuedStages,
    pendingStagesCount: queuedStages.length + 1,
    dateEnteredIntoStage,
    daysPending,
    sla: slaText,
    stageSlaDays,
    slaStatus,
    slaPercentageConsumed,
    nextStage,

    // The 5 Canonical Macro-Phases:
    journeyPhases
  };
}

/**
 * Format timestamp nicely for UI display
 */
export function formatStageDate(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "-";
  }
}
