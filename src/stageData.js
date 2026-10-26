// Comprehensive BBMP Engineering & Billing Workflow Stage Definitions
export const STAGE_DETAILS = {
  1: {
    title: "Tapal — Inward Office Registration",
    role: "Inward Section & Tapal Registry Clerk",
    department: "BBMP Central Inward & Dispatch Wing",
    sla: "1 Working Day (24 Hours)",
    objective: "Official receipt, registration, and docketing of contractor billing dossiers and physical measurement books.",
    description: "Registers the incoming lake maintenance bill dossier into the central BBMP Tapal system, issues a unique docket registration slip, verifies original work order citations, and assigns physical file routing to the respective Ward Assistant Engineer.",
    checklist: [
      "Inward docket timestamp and tracking number generated",
      "Verification of original contractor invoice and letterhead",
      "Work order sanction copy attached and cross-referenced",
      "Physical dossier dispatched to Assistant Engineer (AE)"
    ],
    mandatoryDocuments: [
      "Original Tax Invoice",
      "Work Order Copy",
      "Inward Docket Slip",
      "Contractor Covering Letter"
    ],
    statutoryCode: "BBMP-ENG-OP-SOP-01"
  },
  2: {
    title: "AE — Site Inspection & Measurement Book (MB) Entry",
    role: "Assistant Engineer (AE)",
    department: "BBMP Ward 42 Field Engineering Division",
    sla: "2 to 3 Working Days",
    objective: "Physical on-site inspection, verification of lake desilting depth & earthwork, and recording in the official Measurement Book.",
    description: "Conducts physical site verification at the lake site, records precise measurements of bund maintenance, silt extraction, weed clearing, and structural masonry in the official Measurement Book (MB), accompanied by mandatory geo-tagged photographic evidence.",
    checklist: [
      "On-site physical inspection of lake bunds and water inlets",
      "Precise depth and volumetric measurements entered in MB",
      "High-resolution geo-tagged photographs taken before/during work",
      "Preliminary quantity deviation check against sanctioned estimate"
    ],
    mandatoryDocuments: [
      "Measurement Book (MB) Entries",
      "Geo-tagged Site Photos",
      "Field Inspection Diary",
      "Chainage Measurement Sheet"
    ],
    statutoryCode: "KPWD / BBMP Manual Vol. 1 - Para 142"
  },
  3: {
    title: "AEE — Check-Measurement & Quality Verification",
    role: "Assistant Executive Engineer (AEE)",
    department: "BBMP Sub-Division Engineering Office",
    sla: "2 Working Days",
    objective: "Statutory 25%+ check-measurement and verification of material quality and schedule of rates.",
    description: "Exercises mandatory check-measurement on at least 25% of the total measured quantities as per Karnataka Public Works Department (KPWD) code, reviews third-party soil/concrete test certificates, and confirms unit rates adhere to the approved Schedule of Rates (SR).",
    checklist: [
      "Minimum 25% check-measurements physically verified and signed in MB",
      "Third-party laboratory quality test reports verified and approved",
      "Unit rates verified against current BBMP Schedule of Rates (SR)",
      "Check-measurement certificate endorsed on docket"
    ],
    mandatoryDocuments: [
      "Check-Measurement Certificate",
      "Third-Party Lab Quality Test Reports",
      "Schedule of Rates (SR) Comparison Sheet"
    ],
    statutoryCode: "KPWD Code Art. 219"
  },
  4: {
    title: "EE — Divisional Technical Scrutiny & Sanction Check",
    role: "Executive Engineer (EE)",
    department: "BBMP Divisional Engineering Directorate",
    sla: "3 Working Days",
    objective: "Comprehensive technical review, budget head validation, and scrutiny of contractual compliance.",
    description: "Performs technical scrutiny of the entire billing docket, ensures full compliance with Technical Sanction (TS) and Administrative Approval (AA) limits, assesses milestone timelines, and inspects contractor bank guarantees or insurance policies.",
    checklist: [
      "Technical Sanction (TS) and Administrative Approval (AA) parity checked",
      "Contractor milestone delivery and penalty/LD assessment completed",
      "Budget availability under designated lake development head verified",
      "Divisional technical scrutiny certificate signed"
    ],
    mandatoryDocuments: [
      "Technical Sanction (TS) Order",
      "Administrative Approval (AA) Notification",
      "Divisional Scrutiny Sheet"
    ],
    statutoryCode: "BBMP Financial Code Rule 88"
  },
  5: {
    title: "Attendance Certification — Labour & Machinery Verification",
    role: "Site Verification Officer & EE Wing",
    department: "BBMP Labour Monitoring & Project Vigilance Cell",
    sla: "1 to 2 Working Days",
    objective: "Verification of daily labour muster rolls, equipment logbooks, and statutory minimum wage compliance.",
    description: "Scrutinizes contractor's daily labour attendance records, biometric muster rolls, earthmoving equipment and weed-harvester hour-meter logs, and certifies statutory compliances including Labour Welfare Cess and EPF/ESI contributions.",
    checklist: [
      "Daily labour attendance cross-verified with site biometric records",
      "Heavy machinery and weed harvester logbooks verified",
      "Labour Welfare Cess (1%) and statutory insurance deductions calculated",
      "Attendance and equipment deployment certificate issued"
    ],
    mandatoryDocuments: [
      "Labour Muster Roll (Form V)",
      "Machinery Logbook Certified Summary",
      "Labour Welfare Cess Calculation Sheet",
      "EPF/ESI Remittance Proofs"
    ],
    statutoryCode: "Building & Other Construction Workers Act, Sec 3"
  },
  6: {
    title: "AEE — Post-Certification Scrutiny & Docket Forwarding",
    role: "Assistant Executive Engineer (AEE)",
    department: "BBMP Sub-Division Engineering Office",
    sla: "2 Working Days",
    objective: "Consolidation of certified muster rolls, check measurements, and sub-divisional recommendation.",
    description: "Consolidates verified attendance certificates, check-measurement records, and contractor claims into a formal recommendation dossier addressed to the Zonal Joint Commissioner for administrative clearance.",
    checklist: [
      "Consolidation of site measurements and labour attendance certificates",
      "Preparation of sub-divisional forwarding note",
      "Verification that no past audit objections remain unresolved",
      "Docket sealed and forwarded to Zonal Joint Commissioner"
    ],
    mandatoryDocuments: [
      "Consolidated Sub-Divisional Forwarding Note",
      "Compliance Checklist Endorsement",
      "Sub-Division Register Extract"
    ],
    statutoryCode: "BBMP-OP-ENG-06"
  },
  7: {
    title: "JC — Joint Commissioner Administrative Clearance",
    role: "Joint Commissioner (JC)",
    department: "BBMP Zonal Administration Directorate",
    sla: "3 Working Days",
    objective: "Zonal administrative review, ward public interest clearance, and expenditure concurrence.",
    description: "Administrative clearance by the Zonal Joint Commissioner, reviewing public satisfaction, completion of public lake amenity requirements, and formal endorsement authorizing fund release through BBMP revenue channels.",
    checklist: [
      "Zonal administrative scrutiny and Ward Committee clearance noted",
      "Grievance redressal portal checked for pending public objections",
      "Expenditure sanction concurrence granted",
      "Forwarded to Revenue & Accounts Directorate"
    ],
    mandatoryDocuments: [
      "Zonal Administrative Clearance Memo",
      "Ward Inspection Endorsement",
      "Zonal Sanction Order"
    ],
    statutoryCode: "Karnataka Municipal Corporations (KMC) Act Sec 89"
  },
  8: {
    title: "Additional Revenue Commissioner / Accounts Concurrence",
    role: "Additional Revenue Commissioner / Senior Accounts Officer",
    department: "BBMP Revenue Mobilization & Pre-Audit Wing",
    sla: "3 Working Days",
    objective: "Statutory tax audit, GST TDS, Income Tax TDS, and royalty deductions.",
    description: "Conducts strict statutory financial scrutiny, calculates statutory deductions including 2% GST TDS, 2% Income Tax TDS, mineral royalty deductions on desilted silt/clay, and retention of contractor security deposit (SD) and performance guarantee.",
    checklist: [
      "GST TDS (2%) and Income Tax TDS (2%) computed and verified",
      "Mines & Geology mineral royalty deduction calculated",
      "Security Deposit retention (5%) deducted from gross bill amount",
      "Tax deduction schedule and pre-audit pass order prepared"
    ],
    mandatoryDocuments: [
      "Tax Deduction at Source (TDS) Schedule",
      "Royalty Deduction Statement",
      "Pre-Audit Scrutiny Sheet",
      "Tax Deduction Summary Challan"
    ],
    statutoryCode: "GST Act 2017 Sec 51 & Income Tax Act Sec 194C"
  },
  9: {
    title: "DCF Fund — Forest, Ecology & Special Lake Grant Release",
    role: "Deputy Conservator of Forests (DCF)",
    department: "BBMP Forest, Environment & Lakes Wing",
    sla: "2 Working Days",
    objective: "Environmental compliance check and release order under dedicated lake conservation funds.",
    description: "Specialized scrutiny by the Deputy Conservator of Forests (Lakes & Environment) ensuring that desilting, shoreline biodiversity preservation, and wetland protection guidelines were adhered to, releasing funds allocated under the Lake Ecology head.",
    checklist: [
      "Ecology & biodiversity conservation standards verified",
      "Lake wetland boundary protection compliance reviewed",
      "Allocation sanctioned from DCF Dedicated Lake Fund",
      "Formal Fund Release Order (FRO) issued"
    ],
    mandatoryDocuments: [
      "DCF Fund Sanction Order",
      "Wetland Conservation Compliance Certificate",
      "Afforestation & Shoreline Report"
    ],
    statutoryCode: "KLCDA Act 2014 & Wetland Rules"
  },
  10: {
    title: "EE — Pre-Disbursement Technical Audit & Pass Order",
    role: "Executive Engineer (EE)",
    department: "BBMP Divisional Engineering Directorate",
    sla: "2 Working Days",
    objective: "Final divisional review, net payable bill certification, and formal Pass Order signing.",
    description: "Reviews all tax deductions, attendance certificates, and administrative approvals, compiles the net payable amount, and signs the statutory Bill Pass Order on the face of the Measurement Book and bill docket.",
    checklist: [
      "Final arithmetic verification of gross vs net payable amounts",
      "Verification that all statutory deductions match treasury schedules",
      "Signing of official Pass Order on Measurement Book and bill jacket",
      "Docket transmitted to Treasury Superintendent for DC Bill preparation"
    ],
    mandatoryDocuments: [
      "Official Bill Pass Order",
      "Net Payable Determination Sheet",
      "Final Docket Jacket"
    ],
    statutoryCode: "BBMP Account Code Vol. 1 Rule 112"
  },
  11: {
    title: "DC Bill — Detailed Contingent Bill Preparation",
    role: "Accounts Superintendent & Treasury Officer",
    department: "BBMP Central Treasury & IFMS Portal",
    sla: "2 Working Days",
    objective: "Generation of Form 57 Detailed Contingent (DC) Bill and state treasury token allocation.",
    description: "Prepares the statutory Form 57 DC Bill in the Integrated Financial Management System (IFMS) / Khajane II portal, maps expenditure head classification, and generates the unique payment token for electronic bank clearance.",
    checklist: [
      "Form 57 Detailed Contingent Bill drafted in IFMS / Khajane II",
      "Budget classification heads and sub-heads matched",
      "Treasury electronic payment token generated",
      "Voucher file sealed for banking transmission"
    ],
    mandatoryDocuments: [
      "Form 57 DC Bill (IFMS Generated)",
      "Treasury Payment Token Slip",
      "Pass Order Docket Summary"
    ],
    statutoryCode: "Karnataka Financial Code (KFC) Art. 165"
  },
  12: {
    title: "DCF Payments — Treasury Disbursement & File Closure",
    role: "Chief Finance Officer & State Bank Treasury Desk",
    department: "BBMP Treasury & Electronic Banking Division",
    sla: "1 Working Day",
    objective: "Electronic Fund Transfer (RTGS / PFMS), payment scroll generation, and permanent archive of completed bill.",
    description: "Executes direct bank transfer (RTGS / PFMS) to the contractor's verified bank account, confirms bank transaction reference (UTR) number, issues disbursement advice, and permanently seals the bill docket in the BBMP electronic archives.",
    checklist: [
      "Bank account IFSC and beneficiary name verified with PFMS registry",
      "Electronic Fund Transfer (RTGS) executed and UTR reference logged",
      "Disbursement scroll generated and transmitted to Auditor General",
      "File status updated to 'DISBURSED & COMPLETED'"
    ],
    mandatoryDocuments: [
      "Bank RTGS / NEFT Advice Slip",
      "Disbursement Payment Scroll",
      "Final File Closure & Discharge Endorsement"
    ],
    statutoryCode: "Reserve Bank of India / Treasury Payment Norms"
  }
};

export function getStageDetails(stepNumber, stageName) {
  if (STAGE_DETAILS[stepNumber]) {
    return STAGE_DETAILS[stepNumber];
  }

  // Graceful fallback for custom or unmapped stages
  return {
    title: `Step ${stepNumber} — ${stageName}`,
    role: "Designated Workflow Officer",
    department: "BBMP Project Oversight Division",
    sla: "2 to 3 Working Days",
    objective: `Review and authorization for stage "${stageName}".`,
    description: `Official verification and departmental scrutiny for ${stageName} under the BBMP municipal billing workflow. Verification of compliance, technical records, and statutory approvals.`,
    checklist: [
      `Review prerequisite requirements for ${stageName}`,
      "Verify supporting documentation and site records",
      "Endorse official recommendation and sign off in system"
    ],
    mandatoryDocuments: [
      "Stage Verification Record",
      "Authorized Endorsement Order"
    ],
    statutoryCode: "BBMP Standard Workflow Procedure"
  };
}
