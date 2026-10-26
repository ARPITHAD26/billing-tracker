/**
 * BILLING CONTROL TOWER - WORKFLOW MASTER CATALOG
 * Derived directly from "Billing Process Updations" official document
 * Covers all 34 organizational workflows across Municipal, Transit, Healthcare,
 * Industrial Infrastructure (KIADB), and State Enterprises.
 */

export const WORKFLOW_CATEGORIES = [
  { id: "ALL", name: "All Categories", count: 34, icon: "🌐" },
  { id: "MUNICIPAL", name: "Civic & Municipal (BBMP / BDA)", count: 4, icon: "🏛️" },
  { id: "TRANSIT", name: "Metro & Transit (BMRCL)", count: 4, icon: "🚆" },
  { id: "HEALTHCARE", name: "Healthcare & Medical Institutes", count: 14, icon: "🏥" },
  { id: "INDUSTRIAL", name: "Industrial Infrastructure (KIADB)", count: 3, icon: "🏭" },
  { id: "ENTERPRISE", name: "State Enterprises & Research", count: 9, icon: "⚡" }
];

export const WORKFLOW_CATALOG = [
  // 1. BBMP Lakes
  {
    id: "WF-01-BBMP-LAKES",
    index: 1,
    client: "BBMP",
    unit: "BBMP Lakes (North, Central, West, East, South Zones)",
    category: "MUNICIPAL",
    serviceType: "Lake Desilting, Bund Strengthening & Civil Works",
    billingCycle: "Monthly / Milestone",
    isPilot: true,
    pilotRationale: "Primary Pilot 1: Complex municipal public works hierarchy (15 stages), double-bill mechanism (DC Bill + DCF Fund release), and mandatory KPWD check-measurements.",
    stages: [
      { step: 1, name: "Tapal Registration", role: "Tapal Clerk", dept: "Inward Registry", slaDays: 1, mandatoryDocs: ["Covering Letter", "Tax Invoice", "Work Order Copy"], escalationRole: "AEE" },
      { step: 2, name: "AE Field Scrutiny", role: "Assistant Engineer (AE)", dept: "Field Engineering", slaDays: 2, mandatoryDocs: ["Measurement Book (MB)", "Geo-tagged Site Photos"], escalationRole: "AEE" },
      { step: 3, name: "AEE Check-Measurement", role: "Assistant Executive Engineer (AEE)", dept: "Sub-Division", slaDays: 2, mandatoryDocs: ["25% Check Measurement Note", "Quality Certificate"], escalationRole: "EE" },
      { step: 4, name: "EE Divisional Scrutiny", role: "Executive Engineer (EE)", dept: "Divisional Directorate", slaDays: 3, mandatoryDocs: ["Technical Sanction Parity", "Divisional Scrutiny Sheet"], escalationRole: "Joint Commissioner" },
      { step: 5, name: "Attendance & Labour Certification", role: "Vigilance & Labour Cell", dept: "Labour Welfare Wing", slaDays: 2, mandatoryDocs: ["Form V Muster Roll", "Labour Welfare Cess Note"], escalationRole: "EE" },
      { step: 6, name: "EE Concurrence", role: "Executive Engineer (EE)", dept: "Divisional Directorate", slaDays: 1, mandatoryDocs: ["Consolidated Scrutiny Docket"], escalationRole: "Joint Commissioner" },
      { step: 7, name: "Joint Commissioner Review", role: "Joint Commissioner (JC)", dept: "Zonal Administration", slaDays: 2, mandatoryDocs: ["Zonal Executive Note"], escalationRole: "Addl. Revenue Commissioner" },
      { step: 8, name: "Additional Revenue Scrutiny", role: "Additional Revenue Officer", dept: "Revenue Directorate", slaDays: 2, mandatoryDocs: ["Tax Clearance Certificate"], escalationRole: "Commissioner" },
      { step: 9, name: "Commissioner Sanction", role: "Special / Addl. Commissioner", dept: "Executive Council", slaDays: 3, mandatoryDocs: ["Administrative Sanction Note"], escalationRole: "CEO / Administrator" },
      { step: 10, name: "DCF Verification", role: "Deputy Controller of Finance (DCF)", dept: "Finance Directorate", slaDays: 2, mandatoryDocs: ["Budget Allocation Voucher"], escalationRole: "Special Commissioner (Finance)" },
      { step: 11, name: "Fund Allocation", role: "Budget & Fund Officer", dept: "Treasury & Funds", slaDays: 2, mandatoryDocs: ["Fund Release Authorization"], escalationRole: "DCF" },
      { step: 12, name: "EE File Endorsement", role: "Executive Engineer (EE)", dept: "Divisional Directorate", slaDays: 1, mandatoryDocs: ["DC Bill Verification Docket"], escalationRole: "DCF" },
      { step: 13, name: "DC Bill Passing", role: "Deputy Controller Bill Wing", dept: "Pre-Audit & Accounts", slaDays: 2, mandatoryDocs: ["DC Bill Order", "Statutory Deductions Sheet"], escalationRole: "DCF" },
      { step: 14, name: "DCF Final Audit Clearance", role: "Deputy Controller of Finance", dept: "Audit & Accounts", slaDays: 1, mandatoryDocs: ["Audit Passed Certificate"], escalationRole: "Chief Finance Officer" },
      { step: 15, name: "Disbursement & Payment", role: "Cash Section & Treasury", dept: "Disbursements", slaDays: 1, mandatoryDocs: ["RTGS / Cheque Advice", "Bank Remittance Receipt"], escalationRole: "DCF" }
    ]
  },
  // 2. BBMP Yelahanka
  {
    id: "WF-02-BBMP-YELAHANKA",
    index: 2,
    client: "BBMP",
    unit: "BBMP Yelahanka Zone",
    category: "MUNICIPAL",
    serviceType: "Ward Infrastructure & Urban Maintenance",
    billingCycle: "Monthly / Milestone",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Inward Registry", slaDays: 1, mandatoryDocs: ["Invoice", "Work Order"], escalationRole: "AEE" },
      { step: 2, name: "AE", role: "Assistant Engineer", dept: "Ward Engineering", slaDays: 2, mandatoryDocs: ["MB Book", "Site Photos"], escalationRole: "AEE" },
      { step: 3, name: "AEE", role: "Assistant Executive Engineer", dept: "Sub-Division", slaDays: 2, mandatoryDocs: ["Check Measurement"], escalationRole: "EE" },
      { step: 4, name: "EE", role: "Executive Engineer", dept: "Division", slaDays: 3, mandatoryDocs: ["Technical Sanction"], escalationRole: "JC" },
      { step: 5, name: "Attendance Certification", role: "Labour Officer", dept: "Vigilance", slaDays: 2, mandatoryDocs: ["Muster Rolls"], escalationRole: "EE" },
      { step: 6, name: "EE Endorsement", role: "Executive Engineer", dept: "Division", slaDays: 1, mandatoryDocs: ["Divisional File"], escalationRole: "JC" },
      { step: 7, name: "JC Approval", role: "Joint Commissioner", dept: "Zonal Administration", slaDays: 2, mandatoryDocs: ["Zonal Endorsement"], escalationRole: "Addl. Revenue Commissioner" },
      { step: 8, name: "Additional Revenue", role: "Addl. Revenue Commissioner", dept: "Revenue Wing", slaDays: 2, mandatoryDocs: ["Tax Note"], escalationRole: "Commissioner" },
      { step: 9, name: "Commissioner Sanction", role: "Commissioner", dept: "Executive Council", slaDays: 3, mandatoryDocs: ["Sanction Order"], escalationRole: "CEO" },
      { step: 10, name: "DCF", role: "DCF", dept: "Finance", slaDays: 2, mandatoryDocs: ["Budget Note"], escalationRole: "CFO" },
      { step: 11, name: "Fund Allocation", role: "Fund Section", dept: "Treasury", slaDays: 2, mandatoryDocs: ["Fund Release Order"], escalationRole: "DCF" },
      { step: 12, name: "EE Filing", role: "Executive Engineer", dept: "Division", slaDays: 1, mandatoryDocs: ["DC Bill Docket"], escalationRole: "DCF" },
      { step: 13, name: "DC Bill", role: "DC Bill Officer", dept: "Accounts", slaDays: 2, mandatoryDocs: ["Bill Voucher"], escalationRole: "DCF" },
      { step: 14, name: "DCF Clearance", role: "DCF", dept: "Finance", slaDays: 1, mandatoryDocs: ["Final Clearance"], escalationRole: "CFO" },
      { step: 15, name: "Payments", role: "Cash Section", dept: "Accounts", slaDays: 1, mandatoryDocs: ["Payment Advice"], escalationRole: "DCF" }
    ]
  },
  // 3. BDA Manpower
  {
    id: "WF-03-BDA-MANPOWER",
    index: 3,
    client: "BDA",
    unit: "BDA Man Power Wing",
    category: "MUNICIPAL",
    serviceType: "Outsourced Technical & Administrative Staff",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Registry", slaDays: 1, mandatoryDocs: ["Invoice", "Muster Summary"], escalationRole: "Case Worker" },
      { step: 2, name: "Case Worker Scrutiny", role: "Case Worker", dept: "Administration", slaDays: 2, mandatoryDocs: ["Bio-metric Attendance", "EPF/ESI Challan"], escalationRole: "DS-1" },
      { step: 3, name: "DS-1 Approval", role: "Deputy Secretary-1 (DS-1)", dept: "Secretariat", slaDays: 2, mandatoryDocs: ["Compliance Verification"], escalationRole: "Finance Member" },
      { step: 4, name: "Finance Member (FM) Scrutiny", role: "Finance Member", dept: "Finance", slaDays: 2, mandatoryDocs: ["Wage Parity Check"], escalationRole: "Accounts Superintendent" },
      { step: 5, name: "Case Worker Re-verification", role: "Case Worker", dept: "Administration", slaDays: 1, mandatoryDocs: ["Scrutiny Docket"], escalationRole: "Accounts Superintendent" },
      { step: 6, name: "Accounts Superintendent Scrutiny", role: "Accounts Superintendent", dept: "Accounts Wing", slaDays: 2, mandatoryDocs: ["Calculation Sheet"], escalationRole: "CAO" },
      { step: 7, name: "Chief Accounts Officer (CAO)", role: "Chief Accounts Officer", dept: "Finance & Accounts", slaDays: 3, mandatoryDocs: ["Statutory Audit Sheet"], escalationRole: "Finance Member" },
      { step: 8, name: "Finance Member Concurrence", role: "Finance Member", dept: "Finance", slaDays: 2, mandatoryDocs: ["Financial Sanction"], escalationRole: "DS-1" },
      { step: 9, name: "DS-1 Processing", role: "Deputy Secretary-1", dept: "Secretariat", slaDays: 1, mandatoryDocs: ["File Docket"], escalationRole: "Secretary" },
      { step: 10, name: "Secretary Approval", role: "Secretary BDA", dept: "Executive Management", slaDays: 2, mandatoryDocs: ["Executive Approval"], escalationRole: "Commissioner" },
      { step: 11, name: "DS-1 Passing Order", role: "Deputy Secretary-1", dept: "Secretariat", slaDays: 1, mandatoryDocs: ["Sanction Order"], escalationRole: "Finance Member" },
      { step: 12, name: "FM Payment Release", role: "Finance Member", dept: "Finance", slaDays: 1, mandatoryDocs: ["Disbursement Order"], escalationRole: "CAO" },
      { step: 13, name: "Disbursement & Payment", role: "Cash Section", dept: "Treasury", slaDays: 1, mandatoryDocs: ["Bank Payment Advice"], escalationRole: "FM" }
    ]
  },
  // 4. BDA Security
  {
    id: "WF-04-BDA-SECURITY",
    index: 4,
    client: "BDA",
    unit: "BDA Security Wing",
    category: "MUNICIPAL",
    serviceType: "Security Guarding Services",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Registry", slaDays: 1, mandatoryDocs: ["Invoice", "Guard Deployment Log"], escalationRole: "Case Worker" },
      { step: 2, name: "Case Worker", role: "Case Worker", dept: "Security Admin", slaDays: 2, mandatoryDocs: ["Deployment Muster", "ESI/EPF Records"], escalationRole: "DS-1" },
      { step: 3, name: "DS-1 Approval", role: "Deputy Secretary-1", dept: "Secretariat", slaDays: 2, mandatoryDocs: ["Administrative Check"], escalationRole: "SP Section" },
      { step: 4, name: "SP Section Scrutiny", role: "Superintendent of Police (Vigilance)", dept: "Vigilance & Security", slaDays: 2, mandatoryDocs: ["Vigilance Clearance"], escalationRole: "Inspector" },
      { step: 5, name: "Inspector Approval", role: "Security Inspector", dept: "Vigilance & Security", slaDays: 1, mandatoryDocs: ["Post Inspection Report"], escalationRole: "DS-1" },
      { step: 6, name: "DS-1 Endorsement", role: "Deputy Secretary-1", dept: "Secretariat", slaDays: 1, mandatoryDocs: ["Verified Docket"], escalationRole: "FM" },
      { step: 7, name: "FM Initial Verification", role: "Finance Member", dept: "Finance", slaDays: 2, mandatoryDocs: ["Financial Estimate"], escalationRole: "Accounts Superintendent" },
      { step: 8, name: "Accounts & CAO Verification", role: "Case Worker / Accts Supt / CAO", dept: "Finance Directorate", slaDays: 3, mandatoryDocs: ["Audit Calculation Note"], escalationRole: "FM" },
      { step: 9, name: "FM Endorsement", role: "Finance Member", dept: "Finance", slaDays: 1, mandatoryDocs: ["Financial Sanction Note"], escalationRole: "DS-1" },
      { step: 10, name: "DS-1 Submission", role: "Deputy Secretary-1", dept: "Secretariat", slaDays: 1, mandatoryDocs: ["Executive Note"], escalationRole: "Secretary" },
      { step: 11, name: "Secretary & Commissioner Sanction", role: "Secretary / Commissioner BDA", dept: "Executive Directorate", slaDays: 3, mandatoryDocs: ["Commissioner Order"], escalationRole: "Finance Member" },
      { step: 12, name: "FM Final Payment Order", role: "Finance Member", dept: "Finance", slaDays: 1, mandatoryDocs: ["Passing Order"], escalationRole: "Cash Section" },
      { step: 13, name: "Payments", role: "Cash Section", dept: "Treasury", slaDays: 1, mandatoryDocs: ["Cheque / NEFT Advice"], escalationRole: "FM" }
    ]
  },
  // 5. BMCRI College
  {
    id: "WF-05-BMCRI-COLLEGE",
    index: 5,
    client: "BMCRI",
    unit: "BMCRI College Security and Housekeeping",
    category: "HEALTHCARE",
    serviceType: "Campus Security & Sanitation Services",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal / Dean Inward", role: "Dean Executive Registry", dept: "Dean Office", slaDays: 1, mandatoryDocs: ["Tax Invoice", "Attendance Log"], escalationRole: "AO" },
      { step: 2, name: "Administrative Officer Scrutiny", role: "Administrative Officer (AO)", dept: "Administration", slaDays: 2, mandatoryDocs: ["Work Order Validation"], escalationRole: "Case Worker" },
      { step: 3, name: "Case Worker Processing", role: "Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["Muster Rolls", "EPF/ESI Records"], escalationRole: "Warden" },
      { step: 4, name: "Warden Bill Certification", role: "Chief Warden", dept: "Student Hostels & Campus", slaDays: 2, mandatoryDocs: ["Hostel Verification Certificate"], escalationRole: "Superintendent" },
      { step: 5, name: "Office Superintendent Scrutiny", role: "Office Superintendent", dept: "College Administration", slaDays: 2, mandatoryDocs: ["Docket Verification Sheet"], escalationRole: "AO" },
      { step: 6, name: "AO Endorsement", role: "Administrative Officer", dept: "Administration", slaDays: 1, mandatoryDocs: ["AO Concurrence Note"], escalationRole: "CAO" },
      { step: 7, name: "Chief Accounts Officer (CAO)", role: "Chief Accounts Officer", dept: "Accounts", slaDays: 3, mandatoryDocs: ["Pre-Audit Checklist", "Tax Calculation"], escalationRole: "Financial Advisor" },
      { step: 8, name: "Financial Advisor (FA) Approval", role: "Financial Advisor", dept: "Finance Wing", slaDays: 2, mandatoryDocs: ["FA Sanction Note"], escalationRole: "Dean" },
      { step: 9, name: "Dean Sanction", role: "Dean & Director BMCRI", dept: "Executive Council", slaDays: 2, mandatoryDocs: ["Executive Sanction Order"], escalationRole: "FA" },
      { step: 10, name: "Cash Section & FA Passing", role: "Case Worker & FA", dept: "Cash & Pre-Audit", slaDays: 2, mandatoryDocs: ["Voucher Generation"], escalationRole: "Dean" },
      { step: 11, name: "Dean Final Sign-off", role: "Dean & Director", dept: "Executive Office", slaDays: 1, mandatoryDocs: ["Final Payment Authorization"], escalationRole: "Treasury" },
      { step: 12, name: "Treasury Payment", role: "Treasury Officer", dept: "Govt Treasury / Bank", slaDays: 1, mandatoryDocs: ["Treasury E-Payment Scroll"], escalationRole: "Dean" }
    ]
  },
  // 6. Victoria Hospital
  {
    id: "WF-06-VICTORIA-HOSPITAL",
    index: 6,
    client: "BMCRI",
    unit: "Victoria Housekeeping and Security",
    category: "HEALTHCARE",
    serviceType: "Hospital Housekeeping & Ward Sanitation",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Hospital Registry", slaDays: 1, mandatoryDocs: ["Invoice", "Muster Summary"], escalationRole: "Medical Superintendent" },
      { step: 2, name: "Medical Superintendent (MS)", role: "Medical Superintendent", dept: "Hospital Administration", slaDays: 1, mandatoryDocs: ["Docket Routing Order"], escalationRole: "Case Worker" },
      { step: 3, name: "Case Worker Initial Verification", role: "Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["Staff Muster", "ESI/EPF"], escalationRole: "Matron" },
      { step: 4, name: "Bill Certification Matron", role: "Nursing Superintendent / Matron", dept: "Nursing & Wards", slaDays: 2, mandatoryDocs: ["Ward Cleanliness Certificate"], escalationRole: "Office Superintendent" },
      { step: 5, name: "Office Superintendent", role: "Office Superintendent", dept: "Hospital Admin", slaDays: 2, mandatoryDocs: ["Attendance Reconciliation"], escalationRole: "AO" },
      { step: 6, name: "Administrative Officer", role: "Administrative Officer", dept: "Hospital Admin", slaDays: 1, mandatoryDocs: ["Administrative Clearance"], escalationRole: "RMO" },
      { step: 7, name: "Resident Medical Officer (RMO)", role: "Resident Medical Officer", dept: "Clinical Services", slaDays: 2, mandatoryDocs: ["Clinical Operations Clearance"], escalationRole: "MS" },
      { step: 8, name: "MS Recommendation", role: "Medical Superintendent", dept: "Hospital Admin", slaDays: 2, mandatoryDocs: ["MS Forwarding Note"], escalationRole: "Case Worker" },
      { step: 9, name: "Case Worker Consolidation", role: "Case Worker", dept: "Establishment", slaDays: 1, mandatoryDocs: ["Verified File Docket"], escalationRole: "Superintendent" },
      { step: 10, name: "Superintendent Endorsement", role: "Superintendent", dept: "Central Admin", slaDays: 1, mandatoryDocs: ["Superintendent Note"], escalationRole: "AO" },
      { step: 11, name: "AO Central Endorsement", role: "Administrative Officer", dept: "Central Admin", slaDays: 1, mandatoryDocs: ["Central Endorsement"], escalationRole: "CAO" },
      { step: 12, name: "Chief Accounts Officer (CAO)", role: "Chief Accounts Officer", dept: "Accounts Wing", slaDays: 3, mandatoryDocs: ["Audit Calculation Sheet"], escalationRole: "Financial Advisor" },
      { step: 13, name: "Financial Advisor (FA)", role: "Financial Advisor", dept: "Finance Directorate", slaDays: 2, mandatoryDocs: ["FA Sanction Note"], escalationRole: "Dean" },
      { step: 14, name: "Dean Sanction", role: "Dean & Director BMCRI", dept: "Executive Council", slaDays: 2, mandatoryDocs: ["Sanction Order"], escalationRole: "FA" },
      { step: 15, name: "Cash Section Pre-Audit", role: "Case Worker & FA", dept: "Cash & Accounts", slaDays: 1, mandatoryDocs: ["Payment Voucher"], escalationRole: "Dean" },
      { step: 16, name: "Dean Treasury Authorization & Payment", role: "Dean & Treasury", dept: "Treasury", slaDays: 2, mandatoryDocs: ["Treasury Disbursement Advice"], escalationRole: "Dean" }
    ]
  },
  // 7. Vanivilas Hospital
  {
    id: "WF-07-VANIVILAS-HOSPITAL",
    index: 7,
    client: "BMCRI",
    unit: "Vanivilas Housekeeping and Security",
    category: "HEALTHCARE",
    serviceType: "Maternity & Children Hospital Sanitation",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Registry", slaDays: 1, mandatoryDocs: ["Invoice"], escalationRole: "MS" },
      { step: 2, name: "MS", role: "Medical Superintendent", dept: "Admin", slaDays: 1, mandatoryDocs: ["Docket"], escalationRole: "Case Worker" },
      { step: 3, name: "Case Worker", role: "Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["Attendance Log"], escalationRole: "Matron" },
      { step: 4, name: "Bill Certification Matron", role: "Matron", dept: "Nursing", slaDays: 2, mandatoryDocs: ["Sanitation Pass"], escalationRole: "Office Supt" },
      { step: 5, name: "Office Superintendent", role: "Office Superintendent", dept: "Admin", slaDays: 2, mandatoryDocs: ["Scrutiny Sheet"], escalationRole: "AO" },
      { step: 6, name: "AO", role: "Administrative Officer", dept: "Admin", slaDays: 1, mandatoryDocs: ["Admin Note"], escalationRole: "RMO" },
      { step: 7, name: "RMO", role: "Resident Medical Officer", dept: "Clinical", slaDays: 2, mandatoryDocs: ["Clinical Clearances"], escalationRole: "MS" },
      { step: 8, name: "MS Review", role: "Medical Superintendent", dept: "Admin", slaDays: 1, mandatoryDocs: ["Forwarding Note"], escalationRole: "Case Worker" },
      { step: 9, name: "Case Worker", role: "Case Worker", dept: "Establishment", slaDays: 1, mandatoryDocs: ["Compiled File"], escalationRole: "Superintendent" },
      { step: 10, name: "Superintendent", role: "Superintendent", dept: "Central Admin", slaDays: 1, mandatoryDocs: ["File Check"], escalationRole: "AO" },
      { step: 11, name: "A/O", role: "Administrative Officer", dept: "Central Admin", slaDays: 1, mandatoryDocs: ["Clearance"], escalationRole: "CAO" },
      { step: 12, name: "CAO", role: "Chief Accounts Officer", dept: "Accounts", slaDays: 3, mandatoryDocs: ["Audit Calculation"], escalationRole: "FA" },
      { step: 13, name: "F A", role: "Financial Advisor", dept: "Finance", slaDays: 2, mandatoryDocs: ["Sanction"], escalationRole: "Dean" },
      { step: 14, name: "Dean", role: "Dean & Director", dept: "Executive Council", slaDays: 2, mandatoryDocs: ["Order"], escalationRole: "Cash Section" },
      { step: 15, name: "Case Worker Cash Sections FA", role: "Cash Section", dept: "Cash Wing", slaDays: 1, mandatoryDocs: ["Voucher"], escalationRole: "Dean" },
      { step: 16, name: "Dean Treasury Payment", role: "Dean & Treasury", dept: "Treasury", slaDays: 2, mandatoryDocs: ["Scroll"], escalationRole: "Dean" }
    ]
  },
  // 8. Minto Hospital
  {
    id: "WF-08-MINTO-HOSPITAL",
    index: 8,
    client: "BMCRI",
    unit: "Minto Housekeeping and Security",
    category: "HEALTHCARE",
    serviceType: "Ophthalmic Hospital Sanitation & Guarding",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Registry", slaDays: 1, mandatoryDocs: ["Invoice"], escalationRole: "MS" },
      { step: 2, name: "MS", role: "Medical Superintendent", dept: "Admin", slaDays: 1, mandatoryDocs: ["Docket"], escalationRole: "Case Worker" },
      { step: 3, name: "Case Worker", role: "Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["Attendance Log"], escalationRole: "Matron" },
      { step: 4, name: "Bill Certification Matron", role: "Matron", dept: "Nursing", slaDays: 2, mandatoryDocs: ["Sanitation Pass"], escalationRole: "Office Supt" },
      { step: 5, name: "Office Superintendent", role: "Office Superintendent", dept: "Admin", slaDays: 2, mandatoryDocs: ["Scrutiny Sheet"], escalationRole: "AO" },
      { step: 6, name: "AO", role: "Administrative Officer", dept: "Admin", slaDays: 1, mandatoryDocs: ["Admin Note"], escalationRole: "RMO" },
      { step: 7, name: "RMO", role: "Resident Medical Officer", dept: "Clinical", slaDays: 2, mandatoryDocs: ["Clinical Clearances"], escalationRole: "MS" },
      { step: 8, name: "MS Review", role: "Medical Superintendent", dept: "Admin", slaDays: 1, mandatoryDocs: ["Forwarding Note"], escalationRole: "Case Worker" },
      { step: 9, name: "Case Worker", role: "Case Worker", dept: "Establishment", slaDays: 1, mandatoryDocs: ["Compiled File"], escalationRole: "Superintendent" },
      { step: 10, name: "Superintendent", role: "Superintendent", dept: "Central Admin", slaDays: 1, mandatoryDocs: ["File Check"], escalationRole: "AO" },
      { step: 11, name: "A/O", role: "Administrative Officer", dept: "Central Admin", slaDays: 1, mandatoryDocs: ["Clearance"], escalationRole: "CAO" },
      { step: 12, name: "CAO", role: "Chief Accounts Officer", dept: "Accounts", slaDays: 3, mandatoryDocs: ["Audit Calculation"], escalationRole: "FA" },
      { step: 13, name: "F A", role: "Financial Advisor", dept: "Finance", slaDays: 2, mandatoryDocs: ["Sanction"], escalationRole: "Dean" },
      { step: 14, name: "Dean", role: "Dean & Director", dept: "Executive Council", slaDays: 2, mandatoryDocs: ["Order"], escalationRole: "Cash Section" },
      { step: 15, name: "Case Worker Cash Sections FA", role: "Cash Section", dept: "Cash Wing", slaDays: 1, mandatoryDocs: ["Voucher"], escalationRole: "Dean" },
      { step: 16, name: "Dean Treasury Payment", role: "Dean & Treasury", dept: "Treasury", slaDays: 2, mandatoryDocs: ["Scroll"], escalationRole: "Dean" }
    ]
  },
  // 9. BMRCL Project Wing
  {
    id: "WF-09-BMRCL-PROJECT",
    index: 9,
    client: "BMRCL",
    unit: "BMRCL Project Wing (80% Operational & 20% HR Streams)",
    category: "TRANSIT",
    serviceType: "Metro Rail Construction & Civil Infrastructure",
    billingCycle: "Milestone (Split 80/20)",
    isPilot: true,
    pilotRationale: "Primary Pilot 2: Split milestone billing where 80% operational milestone routes via CSO Office and GM Operations, and 20% statutory balance is routed through HR Verification.",
    stages: [
      { step: 1, name: "Bill Submission to CSO Office", role: "Chief Security Officer", dept: "CSO Office", slaDays: 1, mandatoryDocs: ["Contractor Invoice", "Work Completion Certificate"], escalationRole: "ASCO" },
      { step: 2, name: "Attendance & ASCO Approval", role: "Assistant Security / Civil Officer", dept: "Civil Directorate", slaDays: 2, mandatoryDocs: ["Site Attendance Muster", "Quality Pass"], escalationRole: "CSO" },
      { step: 3, name: "CSO Approval", role: "Chief Security Officer", dept: "CSO Office", slaDays: 2, mandatoryDocs: ["CSO Operational Clearance"], escalationRole: "Case Worker" },
      { step: 4, name: "E-Office Uploading & GM Ops Approval", role: "Case Worker / GM Operations", dept: "Operations Directorate", slaDays: 3, mandatoryDocs: ["E-Office Docket", "GM Operational Sanction"], escalationRole: "AGM Finance" },
      { step: 5, name: "AGM Finance Verification", role: "Assistant General Manager (Finance)", dept: "Finance Directorate", slaDays: 2, mandatoryDocs: ["Contract Ledger Verification", "TDS/GST Calculation"], escalationRole: "Finance Approval" },
      { step: 6, name: "Finance Approval & Sanction", role: "General Manager (Finance)", dept: "Corporate Finance", slaDays: 2, mandatoryDocs: ["Financial Concurrence Order"], escalationRole: "Audit" },
      { step: 7, name: "Audit Certification & Payments", role: "Internal Auditor & Cashier", dept: "Audit & Disbursements", slaDays: 2, mandatoryDocs: ["Audit Certificate", "Bank NEFT Scroll"], escalationRole: "Director (Finance)" },
      { step: 8, name: "20% Retention HR Verification & Release", role: "HR Manager & Cashier", dept: "HR & Finance", slaDays: 3, mandatoryDocs: ["Form V Statutory Muster", "EPF/ESI Challan"], escalationRole: "GM (HR)" }
    ]
  },
  // 10. BMRCL Security Reach 2E & 3C
  {
    id: "WF-10-BMRCL-REACH2E-3C",
    index: 10,
    client: "BMRCL",
    unit: "BMRCL Metro Security Reach 2E & 3C (80% & 20%)",
    category: "TRANSIT",
    serviceType: "Station Security Guarding Services",
    billingCycle: "Monthly (Split 80/20)",
    isPilot: false,
    stages: [
      { step: 1, name: "Attendance & ASCO Approval", role: "ASCO", dept: "Security", slaDays: 2, mandatoryDocs: ["Muster", "Guard Deployment Log"], escalationRole: "CSO" },
      { step: 2, name: "CSO Approval", role: "Chief Security Officer", dept: "CSO Office", slaDays: 2, mandatoryDocs: ["CSO Sanction"], escalationRole: "GM Operations" },
      { step: 3, name: "E-Office Uploading & GM Ops Approval", role: "Case Worker / GM Ops", dept: "Operations", slaDays: 3, mandatoryDocs: ["E-Office Docket"], escalationRole: "AGM Finance" },
      { step: 4, name: "AGM Finance", role: "AGM Finance", dept: "Finance", slaDays: 2, mandatoryDocs: ["Accounts Verification"], escalationRole: "GM Finance" },
      { step: 5, name: "Finance Approval", role: "GM Finance", dept: "Finance", slaDays: 2, mandatoryDocs: ["Sanction Order"], escalationRole: "Audit" },
      { step: 6, name: "Audit Certification & Payments", role: "Auditor & Cashier", dept: "Disbursements", slaDays: 2, mandatoryDocs: ["Audit Certificate", "Payment Scroll"], escalationRole: "Director Finance" }
    ]
  },
  // 11. BMRCL Security Reach 1
  {
    id: "WF-11-BMRCL-REACH1",
    index: 11,
    client: "BMRCL",
    unit: "BMRCL Metro Security Reach - 1 (80% & 20%)",
    category: "TRANSIT",
    serviceType: "Metro Line 1 Security Guarding",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Bill Submission to CSO Office", role: "CSO Office", dept: "CSO", slaDays: 1, mandatoryDocs: ["Invoice", "Guard Logs"], escalationRole: "ASCO" },
      { step: 2, name: "Attendance & ASCO Approval", role: "ASCO", dept: "Security", slaDays: 2, mandatoryDocs: ["Deployment Muster"], escalationRole: "CSO" },
      { step: 3, name: "CSO Approval", role: "CSO", dept: "CSO Office", slaDays: 2, mandatoryDocs: ["Clearance"], escalationRole: "Case Worker" },
      { step: 4, name: "E-Office Uploading & GM Ops Approval", role: "Case Worker / GM Ops", dept: "Operations", slaDays: 3, mandatoryDocs: ["E-Docket"], escalationRole: "AGM Finance" },
      { step: 5, name: "AGM Finance", role: "AGM Finance", dept: "Finance", slaDays: 2, mandatoryDocs: ["Accounts Check"], escalationRole: "Finance Approval" },
      { step: 6, name: "Finance Approval", role: "GM Finance", dept: "Finance", slaDays: 2, mandatoryDocs: ["Sanction"], escalationRole: "Audit" },
      { step: 7, name: "Audit Certification & Payments", role: "Auditor & Cashier", dept: "Disbursements", slaDays: 2, mandatoryDocs: ["Disbursement Advice"], escalationRole: "Director" }
    ]
  },
  // 12. BMRCL Metro Tom
  {
    id: "WF-12-BMRCL-METRO-TOM",
    index: 12,
    client: "BMRCL",
    unit: "BMRCL Metro Tom (80% & 20%)",
    category: "TRANSIT",
    serviceType: "Track Operations & Maintenance Staff",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Bill Submission", role: "Tom Cell", dept: "Operations", slaDays: 1, mandatoryDocs: ["Invoice", "Tom Log"], escalationRole: "Case Worker" },
      { step: 2, name: "Attendance & Authorization", role: "Case Worker / Authorization", dept: "E-Office", slaDays: 2, mandatoryDocs: ["Muster"], escalationRole: "AGM Finance" },
      { step: 3, name: "AGM Finance", role: "AGM Finance", dept: "Finance", slaDays: 2, mandatoryDocs: ["Ledger Check"], escalationRole: "Finance Approval" },
      { step: 4, name: "Finance Approval", role: "GM Finance", dept: "Finance", slaDays: 2, mandatoryDocs: ["Sanction"], escalationRole: "Audit" },
      { step: 5, name: "Audit Certification & Approval", role: "Internal Audit", dept: "Audit", slaDays: 2, mandatoryDocs: ["Audit Pass"], escalationRole: "Cash Section" },
      { step: 6, name: "Payments", role: "Cash Section", dept: "Disbursements", slaDays: 1, mandatoryDocs: ["Bank Advice"], escalationRole: "Director" }
    ]
  },
  // 13. Bowring Hospital
  {
    id: "WF-13-BOWRING-HOSPITAL",
    index: 13,
    client: "Bowring Hospital",
    unit: "Bowring & Lady Curzon Hospital and Gosha",
    category: "HEALTHCARE",
    serviceType: "Hospital Housekeeping & Sanitation",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Ward Certifications", role: "Ward In-Charge", dept: "Clinical Wards", slaDays: 1, mandatoryDocs: ["Ward Log"], escalationRole: "Matron" },
      { step: 2, name: "Matron Approval", role: "Matron", dept: "Nursing", slaDays: 2, mandatoryDocs: ["Sanitation Report"], escalationRole: "RMO" },
      { step: 3, name: "RMO Scrutiny", role: "Resident Medical Officer", dept: "Medical Administration", slaDays: 2, mandatoryDocs: ["Clinical Clearances"], escalationRole: "Nodal Officer" },
      { step: 4, name: "Nodal Officer Verification", role: "Nodal Officer (Hospital Services)", dept: "Quality Wing", slaDays: 2, mandatoryDocs: ["Service Audit Note"], escalationRole: "MS" },
      { step: 5, name: "Medical Superintendent (MS)", role: "Medical Superintendent", dept: "Hospital Admin", slaDays: 2, mandatoryDocs: ["Forwarding Note"], escalationRole: "Tapal" },
      { step: 6, name: "TAPAL Registration", role: "Tapal Clerk", dept: "Central Registry", slaDays: 1, mandatoryDocs: ["Inward Slip"], escalationRole: "Case Worker" },
      { step: 7, name: "Case Worker Scrutiny", role: "Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["ESI/EPF", "Attendance"], escalationRole: "Cash Section" },
      { step: 8, name: "Cash Section Case Worker", role: "Cash Section Worker", dept: "Cash & Accounts", slaDays: 2, mandatoryDocs: ["Bill Calculation"], escalationRole: "MS" },
      { step: 9, name: "MS Review", role: "Medical Superintendent", dept: "Hospital Admin", slaDays: 1, mandatoryDocs: ["Endorsement"], escalationRole: "FA" },
      { step: 10, name: "Financial Advisor (FA)", role: "Financial Advisor", dept: "Finance Directorate", slaDays: 2, mandatoryDocs: ["FA Sanction Note"], escalationRole: "Dean" },
      { step: 11, name: "Dean Sanction", role: "Dean & Director", dept: "Executive Council", slaDays: 2, mandatoryDocs: ["Dean Sanction Order"], escalationRole: "Cash Section" },
      { step: 12, name: "Cash Section Accounts Payments", role: "Cash Section & Treasury", dept: "Disbursements", slaDays: 1, mandatoryDocs: ["Cheque / Advice"], escalationRole: "Dean" }
    ]
  },
  // 14. SABVMC College
  {
    id: "WF-14-SABVMC-COLLEGE",
    index: 14,
    client: "SABVMC",
    unit: "SABVMC Atal Bihari Vajpayee Medical College",
    category: "HEALTHCARE",
    serviceType: "Campus Security & Hostel Housekeeping",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Nodal Officer Verification", role: "Nodal Officer", dept: "College Admin", slaDays: 1, mandatoryDocs: ["Service Summary"], escalationRole: "Special Officer" },
      { step: 2, name: "Girls & Boys Wardens Approval", role: "Wardens & Special Officer", dept: "Hostels Wing", slaDays: 2, mandatoryDocs: ["Hostel Attendance"], escalationRole: "Tapal" },
      { step: 3, name: "TAPAL Registration", role: "Tapal Clerk", dept: "Registry", slaDays: 1, mandatoryDocs: ["Inward Receipt"], escalationRole: "Case Worker" },
      { step: 4, name: "Case Worker Scrutiny", role: "Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["ESI/EPF Records"], escalationRole: "Dean" },
      { step: 5, name: "Dean Approval", role: "Dean & Director", dept: "Executive Office", slaDays: 2, mandatoryDocs: ["Executive Sanction"], escalationRole: "Case Worker" },
      { step: 6, name: "Case Worker Passing", role: "Case Worker", dept: "Accounts", slaDays: 1, mandatoryDocs: ["Voucher Bill"], escalationRole: "Accounts" },
      { step: 7, name: "Accounts Section Payments", role: "Accounts & Cashier", dept: "Disbursements", slaDays: 1, mandatoryDocs: ["Bank Remittance"], escalationRole: "Dean" }
    ]
  },
  // 15. Charaka Hospital
  {
    id: "WF-15-CHARAKA-HOSPITAL",
    index: 15,
    client: "Charaka Hospital",
    unit: "Charaka Hospital Housekeeping & Security",
    category: "HEALTHCARE",
    serviceType: "Hospital Sanitation Services",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Certifications", role: "Ward In-Charge", dept: "Wards", slaDays: 1, mandatoryDocs: ["Daily Log"], escalationRole: "Matron" },
      { step: 2, name: "Matron Scrutiny", role: "Matron", dept: "Nursing", slaDays: 2, mandatoryDocs: ["Sanitation Pass"], escalationRole: "Nodal Officer" },
      { step: 3, name: "Nodal Officer Review", role: "Nodal Officer", dept: "Admin", slaDays: 2, mandatoryDocs: ["Review Note"], escalationRole: "Special Officer" },
      { step: 4, name: "Special Officer", role: "Special Officer", dept: "Administration", slaDays: 2, mandatoryDocs: ["Clearance Note"], escalationRole: "Tapal" },
      { step: 5, name: "TAPAL", role: "Tapal Clerk", dept: "Registry", slaDays: 1, mandatoryDocs: ["Inward Slip"], escalationRole: "Case Worker" },
      { step: 6, name: "Case Worker", role: "Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["Muster Rolls"], escalationRole: "Dean" },
      { step: 7, name: "Dean Sanction", role: "Dean & Director", dept: "Executive Council", slaDays: 2, mandatoryDocs: ["Sanction Order"], escalationRole: "Accounts" },
      { step: 8, name: "Case Worker Accounts Section Payments", role: "Accounts & Cashier", dept: "Disbursements", slaDays: 1, mandatoryDocs: ["Payment Advice"], escalationRole: "Dean" }
    ]
  },
  // 16. Indira Gandhi
  {
    id: "WF-16-INDIRA-GANDHI",
    index: 16,
    client: "Indira Gandhi Hospital",
    unit: "Indira Gandhi Institute of Child Health",
    category: "HEALTHCARE",
    serviceType: "Paediatric Hospital Housekeeping & Security",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Inward Registry", slaDays: 1, mandatoryDocs: ["Invoice"], escalationRole: "Director" },
      { step: 2, name: "Director Initial Sign", role: "Director", dept: "Executive Office", slaDays: 1, mandatoryDocs: ["Routing Docket"], escalationRole: "Case Worker" },
      { step: 3, name: "Case Worker", role: "Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["Staff Muster"], escalationRole: "Matron" },
      { step: 4, name: "Matron Certification", role: "Matron", dept: "Nursing Administration", slaDays: 2, mandatoryDocs: ["Ward Log"], escalationRole: "MS" },
      { step: 5, name: "Medical Superintendent (MS)", role: "Medical Superintendent", dept: "Medical Admin", slaDays: 2, mandatoryDocs: ["MS Review"], escalationRole: "Case Worker" },
      { step: 6, name: "Case Worker Audit Check", role: "Case Worker", dept: "Accounts", slaDays: 2, mandatoryDocs: ["Tax Deduction Note"], escalationRole: "Accountant" },
      { step: 7, name: "Accountant Scrutiny", role: "Accountant", dept: "Accounts Wing", slaDays: 2, mandatoryDocs: ["Ledger Sheet"], escalationRole: "Superintendent" },
      { step: 8, name: "Superintendent & AO Review", role: "Superintendent / AO", dept: "Administration", slaDays: 2, mandatoryDocs: ["Administrative Review"], escalationRole: "Director" },
      { step: 9, name: "Director Financial Sanction", role: "Director", dept: "Executive Directorate", slaDays: 2, mandatoryDocs: ["Director Sanction Order"], escalationRole: "AO" },
      { step: 10, name: "AO Passing", role: "Administrative Officer", dept: "Administration", slaDays: 1, mandatoryDocs: ["Passing Warrant"], escalationRole: "Superintendent" },
      { step: 11, name: "Superintendent & Cash Section Payment", role: "Cash Section Worker", dept: "Treasury", slaDays: 1, mandatoryDocs: ["Disbursement Advice"], escalationRole: "Director" }
    ]
  },
  // 17. KIADB DO-EE1 & Harohalli
  {
    id: "WF-17-KIADB-HAROHALLI",
    index: 17,
    client: "KIADB",
    unit: "KIADB DO EE1 Office & Harohalli Industrial Area",
    category: "INDUSTRIAL",
    serviceType: "Industrial Infrastructure & Common Facilities",
    billingCycle: "Monthly / Milestone",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Inward Office", slaDays: 1, mandatoryDocs: ["Invoice", "Contract Order"], escalationRole: "Case Worker" },
      { step: 2, name: "Case Worker Scrutiny", role: "Case Worker", dept: "Industrial Cell", slaDays: 2, mandatoryDocs: ["Measurement Book", "Muster"], escalationRole: "Executive Engineer" },
      { step: 3, name: "Engineers Certifications", role: "Site Engineer / AEE", dept: "Engineering Division", slaDays: 3, mandatoryDocs: ["Site Inspection Note", "Quality Pass"], escalationRole: "Case Worker" },
      { step: 4, name: "Case Worker Docketing", role: "Case Worker", dept: "Industrial Cell", slaDays: 1, mandatoryDocs: ["Scrutiny File"], escalationRole: "Head Office" },
      { step: 5, name: "Head Office Approval", role: "General Manager (Admin)", dept: "KIADB Head Office", slaDays: 3, mandatoryDocs: ["Head Office Clearances"], escalationRole: "DC" },
      { step: 6, name: "DC Approval", role: "Development Commissioner (DC)", dept: "Executive Authority", slaDays: 3, mandatoryDocs: ["DC Sanction Note"], escalationRole: "Finance Approval" },
      { step: 7, name: "Finance Approval", role: "Chief Financial Officer", dept: "Finance Wing", slaDays: 2, mandatoryDocs: ["Financial Sanction Order"], escalationRole: "Executive Member" },
      { step: 8, name: "Executive Member (EM) Approval", role: "Executive Member (EM)", dept: "Board Secretariat", slaDays: 3, mandatoryDocs: ["EM Board Clearance"], escalationRole: "EE" },
      { step: 9, name: "Executive Engineer (EE)", role: "Executive Engineer", dept: "Divisional Directorate", slaDays: 2, mandatoryDocs: ["Work Passing Order"], escalationRole: "Cash Section" },
      { step: 10, name: "Payments", role: "Accounts & Cashier", dept: "Disbursements", slaDays: 1, mandatoryDocs: ["Payment Scroll"], escalationRole: "CFO" }
    ]
  },
  // 18. KIADB Peenya & Industrial Clusters
  {
    id: "WF-18-KIADB-PEENYA",
    index: 18,
    client: "KIADB",
    unit: "KIADB Peenya, Awerahalli, Sompura, Dabaspete",
    category: "INDUSTRIAL",
    serviceType: "Industrial Estate Maintenance & Guarding",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Inward Office", slaDays: 1, mandatoryDocs: ["Invoice"], escalationRole: "Case Worker" },
      { step: 2, name: "Case Worker", role: "Case Worker", dept: "Estate Wing", slaDays: 2, mandatoryDocs: ["Attendance Log"], escalationRole: "AEE" },
      { step: 3, name: "Engineers Certifications", role: "Site Engineer", dept: "Engineering", slaDays: 2, mandatoryDocs: ["Site Inspection Report"], escalationRole: "Case Worker" },
      { step: 4, name: "Case Worker Filing", role: "Case Worker", dept: "Estate Wing", slaDays: 1, mandatoryDocs: ["Docket"], escalationRole: "Head Office" },
      { step: 5, name: "Head Office Approval", role: "GM Industrial Areas", dept: "Head Office", slaDays: 3, mandatoryDocs: ["HO Approval"], escalationRole: "DC" },
      { step: 6, name: "DC Approval", role: "Development Commissioner", dept: "Executive", slaDays: 3, mandatoryDocs: ["DC Order"], escalationRole: "Finance" },
      { step: 7, name: "Finance Approval", role: "Finance Officer", dept: "Finance", slaDays: 2, mandatoryDocs: ["Sanction Note"], escalationRole: "EM" },
      { step: 8, name: "EM Approval", role: "Executive Member", dept: "Board", slaDays: 3, mandatoryDocs: ["EM Clearance"], escalationRole: "EE" },
      { step: 9, name: "EE Endorsement", role: "Executive Engineer", dept: "Engineering", slaDays: 2, mandatoryDocs: ["Passing Warrant"], escalationRole: "Cashier" },
      { step: 10, name: "Payments", role: "Cash Section", dept: "Disbursements", slaDays: 1, mandatoryDocs: ["Bank Advice"], escalationRole: "CFO" }
    ]
  },
  // 19. KIADB SEZ, Aerospace & Tech Parks
  {
    id: "WF-19-KIADB-TECHPARKS",
    index: 19,
    client: "KIADB",
    unit: "KIADB SEZ, Aerospace, IT Park, Hardware Park Devanahalli",
    category: "INDUSTRIAL",
    serviceType: "Special Economic Zone & Hi-Tech Park Services",
    billingCycle: "Monthly / Milestone",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Devanahalli Registry", slaDays: 1, mandatoryDocs: ["Invoice", "BoQ Summary"], escalationRole: "Case Worker" },
      { step: 2, name: "Case Worker Scrutiny", role: "Case Worker", dept: "Tech Parks Cell", slaDays: 2, mandatoryDocs: ["Muster", "EPF Records"], escalationRole: "Site Engineer" },
      { step: 3, name: "Engineers Certifications", role: "Executive / Site Engineer", dept: "Works Wing", slaDays: 3, mandatoryDocs: ["Field Measurement Book"], escalationRole: "Case Worker" },
      { step: 4, name: "Case Worker Docketing", role: "Case Worker", dept: "Tech Parks Cell", slaDays: 1, mandatoryDocs: ["Scrutiny File"], escalationRole: "Head Office" },
      { step: 5, name: "Head Office Approval", role: "Chief Development Officer", dept: "Head Office", slaDays: 3, mandatoryDocs: ["HO Approval Note"], escalationRole: "DC" },
      { step: 6, name: "DC Approval", role: "Development Commissioner", dept: "Executive", slaDays: 3, mandatoryDocs: ["Sanction Order"], escalationRole: "Finance" },
      { step: 7, name: "Finance Approval", role: "CFO", dept: "Finance", slaDays: 2, mandatoryDocs: ["Budget Clearance"], escalationRole: "EM" },
      { step: 8, name: "Executive Member (EM) Approval", role: "Executive Member", dept: "Board Secretariat", slaDays: 3, mandatoryDocs: ["Board Sanction"], escalationRole: "EE" },
      { step: 9, name: "Executive Engineer Passing", role: "Executive Engineer", dept: "Division", slaDays: 2, mandatoryDocs: ["Passing Warrant"], escalationRole: "Accounts" },
      { step: 10, name: "Payments", role: "Cash Section", dept: "Disbursements", slaDays: 1, mandatoryDocs: ["NEFT Remittance Scroll"], escalationRole: "CFO" }
    ]
  },
  // 20. KIMO DEO & Technicians
  {
    id: "WF-20-KIMO-DEO",
    index: 20,
    client: "KIMO",
    unit: "KIMO DEO Technicians and Group D",
    category: "HEALTHCARE",
    serviceType: "Hospital Paramedical & Data Entry Services",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Inward Office", slaDays: 1, mandatoryDocs: ["Invoice", "Technician Muster"], escalationRole: "AO" },
      { step: 2, name: "Administrative Officer", role: "Administrative Officer (AO)", dept: "Administration", slaDays: 2, mandatoryDocs: ["Staffing Ledger"], escalationRole: "Director" },
      { step: 3, name: "Director Scrutiny", role: "Director KIMO", dept: "Executive Directorate", slaDays: 2, mandatoryDocs: ["Director Docket"], escalationRole: "CAO" },
      { step: 4, name: "Chief Administrative Officer (CAO)", role: "CAO", dept: "General Administration", slaDays: 2, mandatoryDocs: ["Administrative Sanction"], escalationRole: "FA" },
      { step: 5, name: "Financial Advisor (FA)", role: "Financial Advisor", dept: "Finance Directorate", slaDays: 2, mandatoryDocs: ["Budget Allocation"], escalationRole: "Case Worker" },
      { step: 6, name: "Case Worker Detailed Check", role: "Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["EPF/ESI Records"], escalationRole: "RMO/MS" },
      { step: 7, name: "RMO / MS Bill Certification", role: "RMO / Medical Superintendent", dept: "Medical Directorate", slaDays: 3, mandatoryDocs: ["Hospital Deployment Certificate"], escalationRole: "FA" },
      { step: 8, name: "FA Financial Audit", role: "Financial Advisor", dept: "Finance Directorate", slaDays: 2, mandatoryDocs: ["Audit Concurrence"], escalationRole: "RMO/MS" },
      { step: 9, name: "RMO / MS & FA Joint Endorsement", role: "MS & FA", dept: "Joint Verification", slaDays: 2, mandatoryDocs: ["Joint Certificate"], escalationRole: "Director" },
      { step: 10, name: "Director & FA Sanction", role: "Director & FA", dept: "Executive Council", slaDays: 2, mandatoryDocs: ["Board Sanction Order"], escalationRole: "Case Worker" },
      { step: 11, name: "Case Worker & FA Verification", role: "Case Worker & FA", dept: "Accounts", slaDays: 1, mandatoryDocs: ["Voucher Bill"], escalationRole: "Tally Section" },
      { step: 12, name: "Tally, Cheque Section & Director Payment", role: "Cheque Section & Director", dept: "Disbursements", slaDays: 2, mandatoryDocs: ["Cheque / Advice", "Tally Voucher"], escalationRole: "Director" }
    ]
  },
  // 21. KIMO HK & Security
  {
    id: "WF-21-KIMO-HK-SG",
    index: 21,
    client: "KIMO",
    unit: "KIMO Unit 1, 2, 3 HK ESM and SG",
    category: "HEALTHCARE",
    serviceType: "Hospital Housekeeping & Ex-Servicemen Security",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "AO Inward", role: "Administrative Officer", dept: "Admin", slaDays: 1, mandatoryDocs: ["Invoice", "Guard Muster"], escalationRole: "Director" },
      { step: 2, name: "Director", role: "Director", dept: "Executive", slaDays: 2, mandatoryDocs: ["Executive Docket"], escalationRole: "CAO" },
      { step: 3, name: "CAO", role: "Chief Administrative Officer", dept: "Admin", slaDays: 2, mandatoryDocs: ["Sanction"], escalationRole: "FA" },
      { step: 4, name: "F A", role: "Financial Advisor", dept: "Finance", slaDays: 2, mandatoryDocs: ["Budget Clearance"], escalationRole: "Case Worker" },
      { step: 5, name: "Case Worker", role: "Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["Muster Rolls"], escalationRole: "RMO" },
      { step: 6, name: "RMO / MS Bill Certification", role: "RMO / MS", dept: "Clinical", slaDays: 2, mandatoryDocs: ["Cleanliness Certificate"], escalationRole: "FA" },
      { step: 7, name: "FA Financial Check", role: "Financial Advisor", dept: "Finance", slaDays: 2, mandatoryDocs: ["Accounts Scrutiny"], escalationRole: "MS" },
      { step: 8, name: "RMO / MS FA Review", role: "MS & FA", dept: "Joint Committee", slaDays: 2, mandatoryDocs: ["Joint Review"], escalationRole: "Director" },
      { step: 9, name: "Director FA Sanction", role: "Director & FA", dept: "Board", slaDays: 2, mandatoryDocs: ["Sanction Order"], escalationRole: "Case Worker" },
      { step: 10, name: "Caseworker FA Passing", role: "Case Worker & FA", dept: "Accounts", slaDays: 1, mandatoryDocs: ["Voucher"], escalationRole: "Cheque Section" },
      { step: 11, name: "Cheque Section & Director Payment", role: "Cheque Section & Director", dept: "Disbursements", slaDays: 2, mandatoryDocs: ["Bank Remittance"], escalationRole: "Director" }
    ]
  },
  // 22. KPTCL
  {
    id: "WF-22-KPTCL",
    index: 22,
    client: "KPTCL",
    unit: "KPTCL Transmission Sub-Stations Wing",
    category: "ENTERPRISE",
    serviceType: "Sub-station Security & Electrical Maintenance Support",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Registry Clerk", dept: "Registry", slaDays: 1, mandatoryDocs: ["Invoice", "Station Deployment Log"], escalationRole: "Case Worker" },
      { step: 2, name: "Case Worker Scrutiny", role: "Case Worker", dept: "Transmission Section", slaDays: 2, mandatoryDocs: ["Shift Muster", "ESI/EPF"], escalationRole: "Admin Head" },
      { step: 3, name: "Admin Officer Verification", role: "Administrative Officer", dept: "Zonal Administration", slaDays: 2, mandatoryDocs: ["Zonal Admin Clearance"], escalationRole: "Head Office" },
      { step: 4, name: "Head Office Approval", role: "General Manager (HR & Admin)", dept: "Corporate Office", slaDays: 3, mandatoryDocs: ["Corporate Concurrence"], escalationRole: "Finance Approval" },
      { step: 5, name: "Finance Approval", role: "Director (Finance)", dept: "Corporate Finance", slaDays: 2, mandatoryDocs: ["Financial Sanction Note"], escalationRole: "Admin" },
      { step: 6, name: "Admin Section Endorsement", role: "Administrative Officer", dept: "Administration", slaDays: 1, mandatoryDocs: ["Admin Release Order"], escalationRole: "Case Worker" },
      { step: 7, name: "Case Worker Bill Passing", role: "Case Worker", dept: "Accounts Directorate", slaDays: 1, mandatoryDocs: ["Passing Warrant"], escalationRole: "Cash Section" },
      { step: 8, name: "Disbursement & Payments", role: "Cash Section", dept: "Treasury", slaDays: 1, mandatoryDocs: ["NEFT Payment Scroll"], escalationRole: "Director (Finance)" }
    ]
  },
  // 23. KSMCL
  {
    id: "WF-23-KSMCL",
    index: 23,
    client: "KSMCL",
    unit: "KSMCL Mineral Exploration & Mining Areas",
    category: "ENTERPRISE",
    serviceType: "Mining Site Security, Heavy Weighbridge & Plant Labour",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal Registration", role: "Tapal Clerk", dept: "Mining Division Registry", slaDays: 1, mandatoryDocs: ["Contractor Invoice", "Site Log"], escalationRole: "Case Worker" },
      { step: 2, name: "Case Worker Scrutiny", role: "Case Worker", dept: "Operations Cell", slaDays: 2, mandatoryDocs: ["Weighbridge / Labour Muster", "Statutory Proofs"], escalationRole: "Mines Certification" },
      { step: 3, name: "Mines Operations Certification", role: "Mines Manager / In-Charge", dept: "Mine Operations", slaDays: 2, mandatoryDocs: ["Mining Site Operations Certificate"], escalationRole: "Internal Audit" },
      { step: 4, name: "Internal Audit Certification", role: "Auditor", dept: "Audit Wing", slaDays: 3, mandatoryDocs: ["Audit Compliance Note"], escalationRole: "Finance Approval" },
      { step: 5, name: "Finance Approval", role: "General Manager (Finance)", dept: "Corporate Finance", slaDays: 2, mandatoryDocs: ["Budget Clearance"], escalationRole: "Managing Director" },
      { step: 6, name: "Managing Director (MD) Approval", role: "Managing Director", dept: "Executive Council", slaDays: 3, mandatoryDocs: ["MD Sanction Order"], escalationRole: "Case Worker" },
      { step: 7, name: "Case Worker Filing", role: "Case Worker", dept: "Accounts", slaDays: 1, mandatoryDocs: ["Approved Docket"], escalationRole: "Accounts" },
      { step: 8, name: "Accounts Pre-check", role: "Senior Accountant", dept: "Accounts", slaDays: 2, mandatoryDocs: ["Tax Deduction Voucher"], escalationRole: "Finance" },
      { step: 9, name: "Finance Final Approval & Payment", role: "Disbursements / GM Finance", dept: "Treasury", slaDays: 1, mandatoryDocs: ["Bank Transfer Advice"], escalationRole: "MD" }
    ]
  },
  // 24. Kumara Krupa Bangalore
  {
    id: "WF-24-KUMARA-KRUPA-BLR",
    index: 24,
    client: "Kumara Krupa",
    unit: "Kumara Krupa State Guest House Bangalore",
    category: "ENTERPRISE",
    serviceType: "VIP Protocol Hospitality & Facility Management",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Inward Office", slaDays: 1, mandatoryDocs: ["Invoice", "Duty Roaster"], escalationRole: "Case Worker" },
      { step: 2, name: "Case Worker Scrutiny", role: "Case Worker", dept: "Guest House Admin", slaDays: 2, mandatoryDocs: ["Staff Muster", "EPF/ESI"], escalationRole: "Manager" },
      { step: 3, name: "Guest House Manager", role: "Manager (Hospitality)", dept: "Guest House Directorate", slaDays: 2, mandatoryDocs: ["Guest House Occupancy Summary"], escalationRole: "Accounts Superintendent" },
      { step: 4, name: "Accounts Superintendent", role: "Accounts Superintendent", dept: "Accounts", slaDays: 2, mandatoryDocs: ["Calculation Docket"], escalationRole: "Special Officer" },
      { step: 5, name: "Special Officer Review", role: "Special Officer (Protocol)", dept: "Chief Secretariat", slaDays: 2, mandatoryDocs: ["Protocol Clearance"], escalationRole: "Director" },
      { step: 6, name: "Director Approval", role: "Director of Hospitality", dept: "Executive Directorate", slaDays: 3, mandatoryDocs: ["Executive Sanction Note"], escalationRole: "Special Officer" },
      { step: 7, name: "Special Officer Concurrence", role: "Special Officer", dept: "Secretariat", slaDays: 1, mandatoryDocs: ["Passing Warrant"], escalationRole: "Accounts Superintendent" },
      { step: 8, name: "Accounts Superintendent & Manager", role: "Accounts Supt & Manager", dept: "Accounts Wing", slaDays: 2, mandatoryDocs: ["Pre-payment Voucher"], escalationRole: "Case Worker" },
      { step: 9, name: "Case Worker Final Voucher", role: "Case Worker", dept: "Accounts", slaDays: 1, mandatoryDocs: ["Passed Bill Docket"], escalationRole: "Cashier" },
      { step: 10, name: "Disbursement & Payments", role: "Treasury / Cash Section", dept: "Treasury", slaDays: 1, mandatoryDocs: ["Treasury Payment Advice"], escalationRole: "Director" }
    ]
  },
  // 25. Kumara Krupa Mysore
  {
    id: "WF-25-KUMARA-KRUPA-MYS",
    index: 25,
    client: "Kumara Krupa",
    unit: "Kumara Krupa State Guest House Mysore",
    category: "ENTERPRISE",
    serviceType: "Heritage State Guest House Hospitality Services",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Inward Office", slaDays: 1, mandatoryDocs: ["Invoice"], escalationRole: "Case Worker" },
      { step: 2, name: "Case Worker", role: "Case Worker", dept: "Admin", slaDays: 2, mandatoryDocs: ["Muster Rolls"], escalationRole: "Manager" },
      { step: 3, name: "Manager Scrutiny", role: "Manager", dept: "Guest House Admin", slaDays: 2, mandatoryDocs: ["Service Summary"], escalationRole: "Accounts Supt" },
      { step: 4, name: "Accounts Superintendent", role: "Accounts Supt", dept: "Accounts", slaDays: 2, mandatoryDocs: ["Calculation Sheet"], escalationRole: "Special Officer" },
      { step: 5, name: "Special Officer Review", role: "Special Officer", dept: "Secretariat", slaDays: 2, mandatoryDocs: ["Special Clearance"], escalationRole: "Director" },
      { step: 6, name: "Director Approval", role: "Director", dept: "Executive", slaDays: 3, mandatoryDocs: ["Sanction Order"], escalationRole: "Special Officer" },
      { step: 7, name: "Special Officer Concurrence", role: "Special Officer", dept: "Secretariat", slaDays: 1, mandatoryDocs: ["Passing Note"], escalationRole: "Accounts Supt" },
      { step: 8, name: "Accounts Superintendent & Manager", role: "Accounts Supt & Manager", dept: "Accounts", slaDays: 2, mandatoryDocs: ["Pre-payment Voucher"], escalationRole: "Case Worker" },
      { step: 9, name: "Case Worker Passing", role: "Case Worker", dept: "Accounts", slaDays: 1, mandatoryDocs: ["Passing Order"], escalationRole: "Cashier" },
      { step: 10, name: "Disbursement & Payments", role: "Cash Section", dept: "Treasury", slaDays: 1, mandatoryDocs: ["Bank Remittance"], escalationRole: "Director" }
    ]
  },
  // 26. PMSSY
  {
    id: "WF-26-PMSSY",
    index: 26,
    client: "PMSSY",
    unit: "PMSSY Super Speciality Hospital",
    category: "HEALTHCARE",
    serviceType: "Super Speciality Hospital Sanitation & Support",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Inward Office", slaDays: 1, mandatoryDocs: ["Invoice"], escalationRole: "Case Worker" },
      { step: 2, name: "Case Worker Initial Verification", role: "Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["Attendance Log"], escalationRole: "Certification" },
      { step: 3, name: "Certification Officer", role: "Inspecting Officer", dept: "Quality Wing", slaDays: 2, mandatoryDocs: ["Quality Certificate"], escalationRole: "AO" },
      { step: 4, name: "Administrative Officer", role: "AO", dept: "Administration", slaDays: 2, mandatoryDocs: ["Admin Clearance"], escalationRole: "FA" },
      { step: 5, name: "Financial Advisor (FA)", role: "Financial Advisor", dept: "Finance Directorate", slaDays: 2, mandatoryDocs: ["Budget Note"], escalationRole: "Special Officer" },
      { step: 6, name: "Special Officer Sanction", role: "Special Officer", dept: "Executive Directorate", slaDays: 2, mandatoryDocs: ["Sanction Order"], escalationRole: "FA" },
      { step: 7, name: "FA Financial Clearance", role: "Financial Advisor", dept: "Finance", slaDays: 1, mandatoryDocs: ["FA Concurrence"], escalationRole: "Case Worker" },
      { step: 8, name: "Case Worker Accounts Processing", role: "Case Worker", dept: "Accounts", slaDays: 2, mandatoryDocs: ["Voucher Bill"], escalationRole: "Cashier" },
      { step: 9, name: "Payments", role: "Cash Section", dept: "Disbursements", slaDays: 1, mandatoryDocs: ["Payment Advice"], escalationRole: "Special Officer" }
    ]
  },
  // 27. Sanjay Gandhi HK
  {
    id: "WF-27-SANJAY-GANDHI-HK",
    index: 27,
    client: "Sanjay Gandhi",
    unit: "Sanjay Gandhi Hospital (Housekeeping Wing)",
    category: "HEALTHCARE",
    serviceType: "Hospital Housekeeping & Sanitation",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Registry", slaDays: 1, mandatoryDocs: ["Invoice"], escalationRole: "Director" },
      { step: 2, name: "Director Initial Signature", role: "Director", dept: "Executive Office", slaDays: 1, mandatoryDocs: ["Docket Routing"], escalationRole: "Case Worker" },
      { step: 3, name: "Case Worker Scrutiny", role: "Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["Muster Rolls"], escalationRole: "Matron" },
      { step: 4, name: "Matron Sanitation Certification", role: "Matron", dept: "Nursing", slaDays: 2, mandatoryDocs: ["Ward Log"], escalationRole: "MS" },
      { step: 5, name: "Medical Superintendent (MS)", role: "Medical Superintendent", dept: "Hospital Admin", slaDays: 2, mandatoryDocs: ["MS Review"], escalationRole: "Case Worker" },
      { step: 6, name: "Case Worker Consolidation", role: "Case Worker", dept: "Establishment", slaDays: 1, mandatoryDocs: ["Verified File"], escalationRole: "Accountant" },
      { step: 7, name: "Accountant Scrutiny", role: "Accountant", dept: "Accounts", slaDays: 2, mandatoryDocs: ["Tax Sheet"], escalationRole: "Superintendent" },
      { step: 8, name: "Superintendent & FO Review", role: "Superintendent / FO", dept: "Administration", slaDays: 2, mandatoryDocs: ["Audit Clearance"], escalationRole: "Director" },
      { step: 9, name: "Director Sanction", role: "Director", dept: "Executive Council", slaDays: 2, mandatoryDocs: ["Sanction Order"], escalationRole: "FO" },
      { step: 10, name: "Finance Officer (FO) Passing", role: "FO", dept: "Finance Directorate", slaDays: 1, mandatoryDocs: ["Passing Warrant"], escalationRole: "Cash Section" },
      { step: 11, name: "Superintendent, Case Worker & Cash Section Payment", role: "Cash Section", dept: "Treasury", slaDays: 1, mandatoryDocs: ["Payment Advice"], escalationRole: "Director" }
    ]
  },
  // 28. Sanjay Gandhi SG
  {
    id: "WF-28-SANJAY-GANDHI-SG",
    index: 28,
    client: "Sanjay Gandhi",
    unit: "Sanjay Gandhi Hospital (Security Guards Wing)",
    category: "HEALTHCARE",
    serviceType: "Hospital Security Guarding & Perimeter Safety",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Registry", slaDays: 1, mandatoryDocs: ["Invoice"], escalationRole: "Director" },
      { step: 2, name: "Director Initial Signature", role: "Director", dept: "Executive Office", slaDays: 1, mandatoryDocs: ["Docket Routing"], escalationRole: "Case Worker" },
      { step: 3, name: "Case Worker Scrutiny", role: "Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["Muster Rolls"], escalationRole: "Matron" },
      { step: 4, name: "Matron / Security Incharge", role: "Security Incharge", dept: "Hospital Security", slaDays: 2, mandatoryDocs: ["Guard Post Log"], escalationRole: "MS" },
      { step: 5, name: "Medical Superintendent (MS)", role: "Medical Superintendent", dept: "Hospital Admin", slaDays: 2, mandatoryDocs: ["MS Review"], escalationRole: "Case Worker" },
      { step: 6, name: "Case Worker Consolidation", role: "Case Worker", dept: "Establishment", slaDays: 1, mandatoryDocs: ["Verified File"], escalationRole: "Accountant" },
      { step: 7, name: "Accountant Scrutiny", role: "Accountant", dept: "Accounts", slaDays: 2, mandatoryDocs: ["Tax Sheet"], escalationRole: "Superintendent" },
      { step: 8, name: "Superintendent & FO Review", role: "Superintendent / FO", dept: "Administration", slaDays: 2, mandatoryDocs: ["Audit Clearance"], escalationRole: "Director" },
      { step: 9, name: "Director Sanction", role: "Director", dept: "Executive Council", slaDays: 2, mandatoryDocs: ["Sanction Order"], escalationRole: "FO" },
      { step: 10, name: "Finance Officer (FO) Passing", role: "FO", dept: "Finance Directorate", slaDays: 1, mandatoryDocs: ["Passing Warrant"], escalationRole: "Cash Section" },
      { step: 11, name: "Superintendent, Case Worker & Cash Section Payment", role: "Cash Section", dept: "Treasury", slaDays: 1, mandatoryDocs: ["Payment Advice"], escalationRole: "Director" }
    ]
  },
  // 29. Sanjay Gandhi Staff
  {
    id: "WF-29-SANJAY-GANDHI-STAFF",
    index: 29,
    client: "Sanjay Gandhi",
    unit: "Sanjay Gandhi Hospital (Outsourced Support Staff)",
    category: "HEALTHCARE",
    serviceType: "Ward Attendants & Paramedical Support Staff",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Registry", slaDays: 1, mandatoryDocs: ["Invoice"], escalationRole: "Director" },
      { step: 2, name: "Director Initial Signature", role: "Director", dept: "Executive Office", slaDays: 1, mandatoryDocs: ["Docket Routing"], escalationRole: "Case Worker" },
      { step: 3, name: "Case Worker Scrutiny", role: "Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["Muster Rolls"], escalationRole: "Matron" },
      { step: 4, name: "Matron Ward Certification", role: "Matron", dept: "Nursing", slaDays: 2, mandatoryDocs: ["Ward Log"], escalationRole: "MS" },
      { step: 5, name: "Medical Superintendent (MS)", role: "Medical Superintendent", dept: "Hospital Admin", slaDays: 2, mandatoryDocs: ["MS Review"], escalationRole: "Case Worker" },
      { step: 6, name: "Case Worker Consolidation", role: "Case Worker", dept: "Establishment", slaDays: 1, mandatoryDocs: ["Verified File"], escalationRole: "Accountant" },
      { step: 7, name: "Accountant Scrutiny", role: "Accountant", dept: "Accounts", slaDays: 2, mandatoryDocs: ["Tax Sheet"], escalationRole: "Superintendent" },
      { step: 8, name: "Superintendent & FO Review", role: "Superintendent / FO", dept: "Administration", slaDays: 2, mandatoryDocs: ["Audit Clearance"], escalationRole: "Director" },
      { step: 9, name: "Director Sanction", role: "Director", dept: "Executive Council", slaDays: 2, mandatoryDocs: ["Sanction Order"], escalationRole: "FO" },
      { step: 10, name: "Finance Officer (FO) Passing", role: "FO", dept: "Finance Directorate", slaDays: 1, mandatoryDocs: ["Passing Warrant"], escalationRole: "Cash Section" },
      { step: 11, name: "Superintendent, Case Worker & Cash Section Payment", role: "Cash Section", dept: "Treasury", slaDays: 1, mandatoryDocs: ["Payment Advice"], escalationRole: "Director" }
    ]
  },
  // 30. TECC
  {
    id: "WF-30-TECC",
    index: 30,
    client: "BMCRI",
    unit: "TECC Trauma Care Centre / BMCRI",
    category: "HEALTHCARE",
    serviceType: "Trauma Care Emergency Sanitation & Security",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Inward Office", slaDays: 1, mandatoryDocs: ["Invoice"], escalationRole: "Case Worker" },
      { step: 2, name: "Case Worker", role: "Case Worker", dept: "Admin", slaDays: 2, mandatoryDocs: ["Staff Muster"], escalationRole: "AO" },
      { step: 3, name: "AO", role: "Administrative Officer", dept: "Admin", slaDays: 1, mandatoryDocs: ["Admin Note"], escalationRole: "Special Officer" },
      { step: 4, name: "Special Officer", role: "Special Officer", dept: "Trauma Care", slaDays: 2, mandatoryDocs: ["Emergency Services Note"], escalationRole: "BMCRI Case Worker" },
      { step: 5, name: "BMCRI Case Worker", role: "BMCRI Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["Central Muster"], escalationRole: "Superintendent" },
      { step: 6, name: "Superintendent", role: "Superintendent", dept: "Central Admin", slaDays: 2, mandatoryDocs: ["Scrutiny Sheet"], escalationRole: "AO" },
      { step: 7, name: "AO Central Review", role: "AO", dept: "Central Admin", slaDays: 1, mandatoryDocs: ["Clearance"], escalationRole: "CAO" },
      { step: 8, name: "CAO", role: "Chief Accounts Officer", dept: "Accounts", slaDays: 3, mandatoryDocs: ["Tax Deduction Note"], escalationRole: "FA" },
      { step: 9, name: "FA", role: "Financial Advisor", dept: "Finance", slaDays: 2, mandatoryDocs: ["Sanction"], escalationRole: "Dean" },
      { step: 10, name: "Dean Sanction", role: "Dean & Director", dept: "Executive Council", slaDays: 2, mandatoryDocs: ["Sanction Order"], escalationRole: "Special Officer" },
      { step: 11, name: "TECC Case Worker & FA Review", role: "Case Worker & FA", dept: "Accounts", slaDays: 1, mandatoryDocs: ["Voucher"], escalationRole: "Cashier" },
      { step: 12, name: "Payments", role: "Cash Section", dept: "Disbursements", slaDays: 1, mandatoryDocs: ["Payment Advice"], escalationRole: "Dean" }
    ]
  },
  // 31. GKVK
  {
    id: "WF-31-GKVK",
    index: 31,
    client: "GKVK",
    unit: "GKVK University of Agricultural Sciences",
    category: "ENTERPRISE",
    serviceType: "Campus Farm Labour & Security Services",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Registrar Office", slaDays: 1, mandatoryDocs: ["Invoice"], escalationRole: "Estate Officer" },
      { step: 2, name: "Estate Officer Scrutiny", role: "Estate Officer", dept: "Estate Management", slaDays: 2, mandatoryDocs: ["Farm Deployment Log"], escalationRole: "Case Worker" },
      { step: 3, name: "Case Worker Initial Verification", role: "Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["Biometric Muster"], escalationRole: "Bill Certification" },
      { step: 4, name: "Bill Certification Officer", role: "Inspecting Officer", dept: "Field Verification", slaDays: 2, mandatoryDocs: ["Field Measurement Certificate"], escalationRole: "Case Worker" },
      { step: 5, name: "Case Worker Consolidation", role: "Case Worker", dept: "Establishment", slaDays: 1, mandatoryDocs: ["Compiled File"], escalationRole: "Engineer" },
      { step: 6, name: "Executive Engineer Approval", role: "University Engineer", dept: "Works Division", slaDays: 2, mandatoryDocs: ["Engineering Sanction"], escalationRole: "Accountant" },
      { step: 7, name: "Accountant Scrutiny", role: "Senior Accountant", dept: "Comptroller Office", slaDays: 2, mandatoryDocs: ["Audit Calculations"], escalationRole: "BR Section" },
      { step: 8, name: "Budget & Reconciliation (BR)", role: "BR Officer", dept: "Comptroller Office", slaDays: 2, mandatoryDocs: ["Budget Head Validation"], escalationRole: "Comptroller Superintendent" },
      { step: 9, name: "Comptroller Section Superintendent", role: "Superintendent", dept: "Comptroller Office", slaDays: 2, mandatoryDocs: ["Passing Warrant"], escalationRole: "Comptroller" },
      { step: 10, name: "Comptroller Payments", role: "Comptroller / Finance Officer", dept: "Disbursements", slaDays: 2, mandatoryDocs: ["Bank Remittance Advice"], escalationRole: "Vice Chancellor" }
    ]
  },
  // 32. NCBS
  {
    id: "WF-32-NCBS",
    index: 32,
    client: "NCBS",
    unit: "NCBS National Centre for Biological Sciences",
    category: "ENTERPRISE",
    serviceType: "Research Laboratory Facility & Security Support",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Inward Reception Clerk", dept: "Reception / Inward", slaDays: 1, mandatoryDocs: ["Invoice", "Service Summary"], escalationRole: "Case Worker" },
      { step: 2, name: "Case Worker Scrutiny", role: "Case Worker", dept: "Purchase & Stores", slaDays: 2, mandatoryDocs: ["Muster Rolls", "EPF/ESI proof"], escalationRole: "Security In-Charge" },
      { step: 3, name: "Bill Certification & Security In-Charge", role: "Security In-Charge", dept: "Campus Safety", slaDays: 2, mandatoryDocs: ["Safety Inspection Pass"], escalationRole: "Accounts" },
      { step: 4, name: "Accounts Section Approval", role: "Accounts Officer", dept: "Finance", slaDays: 2, mandatoryDocs: ["Tax TDS Sheet"], escalationRole: "Superintendent" },
      { step: 5, name: "Superintendent Scrutiny", role: "Office Superintendent", dept: "Administration", slaDays: 2, mandatoryDocs: ["Audit Scrutiny Sheet"], escalationRole: "Cheque Section" },
      { step: 6, name: "Cheque Section Preparation", role: "Cheque Officer", dept: "Finance", slaDays: 1, mandatoryDocs: ["Cheque / NEFT Docket"], escalationRole: "Dean / Head Finance" },
      { step: 7, name: "Final Disbursement & Payments", role: "Head of Finance / Cashier", dept: "Disbursements", slaDays: 1, mandatoryDocs: ["Bank Advice"], escalationRole: "Director NCBS" }
    ]
  },
  // 33. HIMS
  {
    id: "WF-33-HIMS",
    index: 33,
    client: "HIMS",
    unit: "Hassan Institute of Medical Sciences",
    category: "HEALTHCARE",
    serviceType: "Hospital Housekeeping, Wards & Security",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Inward Office", slaDays: 1, mandatoryDocs: ["Invoice"], escalationRole: "Case Worker" },
      { step: 2, name: "Case Worker", role: "Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["Muster Summary"], escalationRole: "Bill Certification" },
      { step: 3, name: "Bill Certification Officer", role: "Inspecting Officer", dept: "Hospital Inspection", slaDays: 2, mandatoryDocs: ["Sanitation Quality Note"], escalationRole: "Case Worker" },
      { step: 4, name: "Case Worker Docketing", role: "Case Worker", dept: "Establishment", slaDays: 1, mandatoryDocs: ["Docket"], escalationRole: "RMO" },
      { step: 5, name: "Resident Medical Officer (RMO)", role: "RMO", dept: "Medical Administration", slaDays: 2, mandatoryDocs: ["Clinical Clearances"], escalationRole: "MS" },
      { step: 6, name: "Medical Superintendent (MS)", role: "Medical Superintendent", dept: "Hospital Admin", slaDays: 2, mandatoryDocs: ["MS Forwarding Note"], escalationRole: "CAO" },
      { step: 7, name: "Chief Administrative Officer (CAO)", role: "CAO", dept: "Administration", slaDays: 2, mandatoryDocs: ["Administrative Clearance"], escalationRole: "FA" },
      { step: 8, name: "Financial Advisor (FA)", role: "Financial Advisor", dept: "Finance Directorate", slaDays: 2, mandatoryDocs: ["Financial Sanction Note"], escalationRole: "Director" },
      { step: 9, name: "Director Approval", role: "Director HIMS", dept: "Executive Council", slaDays: 2, mandatoryDocs: ["Director Sanction Order"], escalationRole: "DC-Bill" },
      { step: 10, name: "DC - Bill Verification", role: "DC Bill Section", dept: "Pre-Audit", slaDays: 2, mandatoryDocs: ["DC Bill Voucher"], escalationRole: "Accounts" },
      { step: 11, name: "Accounts Final Clearance", role: "Senior Accounts Officer", dept: "Accounts", slaDays: 1, mandatoryDocs: ["Passing Warrant"], escalationRole: "Cashier" },
      { step: 12, name: "Payments", role: "Cash Section / Treasury", dept: "Disbursements", slaDays: 1, mandatoryDocs: ["Payment Scroll"], escalationRole: "Director" }
    ]
  },
  // 34. YIMS
  {
    id: "WF-34-YIMS",
    index: 34,
    client: "YIMS",
    unit: "Yadgiri Institute of Medical Sciences",
    category: "HEALTHCARE",
    serviceType: "Hospital Housekeeping & Security Support",
    billingCycle: "Monthly",
    isPilot: false,
    stages: [
      { step: 1, name: "Tapal", role: "Tapal Clerk", dept: "Inward Office", slaDays: 1, mandatoryDocs: ["Invoice"], escalationRole: "Case Worker" },
      { step: 2, name: "Case Worker Initial Verification", role: "Case Worker", dept: "Establishment", slaDays: 2, mandatoryDocs: ["Staff Muster"], escalationRole: "Bill Certification" },
      { step: 3, name: "Bill Certification", role: "Inspection Officer", dept: "Hospital Wards", slaDays: 2, mandatoryDocs: ["Cleanliness Certificate"], escalationRole: "Case Worker" },
      { step: 4, name: "Case Worker Processing", role: "Case Worker", dept: "Establishment", slaDays: 1, mandatoryDocs: ["Docket"], escalationRole: "FA" },
      { step: 5, name: "Financial Advisor (FA) Initial Review", role: "Financial Advisor", dept: "Finance Directorate", slaDays: 2, mandatoryDocs: ["FA Review Note"], escalationRole: "Dean" },
      { step: 6, name: "Dean Sanction", role: "Dean & Director", dept: "Executive Council", slaDays: 2, mandatoryDocs: ["Dean Sanction Order"], escalationRole: "FA" },
      { step: 7, name: "FA Financial Concurrence", role: "Financial Advisor", dept: "Finance Directorate", slaDays: 2, mandatoryDocs: ["Concurrence Warrant"], escalationRole: "Case Worker" },
      { step: 8, name: "Case Worker & Cheque Section", role: "Case Worker & Cheque Section", dept: "Accounts", slaDays: 2, mandatoryDocs: ["Cheque Preparation Note"], escalationRole: "Dean" },
      { step: 9, name: "Dean Final Payment Sign-off", role: "Dean & Director", dept: "Executive Council", slaDays: 1, mandatoryDocs: ["Final Payment Order"], escalationRole: "Treasury" },
      { step: 10, name: "Disbursement & Payments", role: "Treasury / Cash Section", dept: "Disbursements", slaDays: 1, mandatoryDocs: ["Bank Remittance Scroll"], escalationRole: "Dean" }
    ]
  }
];

export const WORKFLOW_METRICS = {
  totalCatalogedWorkflows: 34,
  totalPilotWorkflows: 2,
  averageStagesPerWorkflow: 11.2,
  maxStages: 16, // Victoria, Vanivilas, Minto
  minStages: 6,  // BMRCL Reach 2E & 3C 80%
  sectorsCovered: 5,
  commonStagePatternsCount: 7
};
