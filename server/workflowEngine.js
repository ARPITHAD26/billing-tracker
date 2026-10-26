import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { WORKFLOW_CATALOG as BASELINE_WORKFLOW_CATALOG, WORKFLOW_CATEGORIES as BASELINE_WORKFLOW_CATEGORIES } from "../src/workflowMasterData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");
const storeFilePath = path.join(dataDir, "workflow_engine_store.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// ============================================================
// DEFAULT MASTER DATA SEEDS (Fulfilling Phase I Deliverables)
// ============================================================

export const DEFAULT_CLIENTS = [
  { id: "CL-001", code: "BBMP", name: "Bruhat Bengaluru Mahanagara Palike", sector: "Municipal", departmentContact: "Chief Engineer (Lakes & Infra)", email: "ce.lakes@bbmp.gov.in", phone: "+91 80 2266 0000", activeWorkflows: 12, activeUnits: 8, slaDefault: 2, status: "ACTIVE" },
  { id: "CL-002", code: "BMRCL", name: "Bangalore Metro Rail Corporation Ltd.", sector: "Metro Transit", departmentContact: "General Manager (Operations & Finance)", email: "gm.ops@bmrc.co.in", phone: "+91 80 2296 9300", activeWorkflows: 6, activeUnits: 4, slaDefault: 3, status: "ACTIVE" },
  { id: "CL-003", code: "KIADB", name: "Karnataka Industrial Areas Development Board", sector: "Industrial", departmentContact: "Chief Development Officer", email: "cdo@kiadb.net", phone: "+91 80 2221 5383", activeWorkflows: 4, activeUnits: 3, slaDefault: 3, status: "ACTIVE" },
  { id: "CL-004", code: "BMCRI", name: "Bangalore Medical College & Research Institute", sector: "Healthcare", departmentContact: "Dean & Director", email: "dean@bmcri.org", phone: "+91 80 2670 1150", activeWorkflows: 5, activeUnits: 4, slaDefault: 2, status: "ACTIVE" },
  { id: "CL-005", code: "BDA", name: "Bangalore Development Authority", sector: "Municipal", departmentContact: "Finance Member & Secretary", email: "secy@bdabangalore.org", phone: "+91 80 2334 2661", activeWorkflows: 3, activeUnits: 2, slaDefault: 2, status: "ACTIVE" },
  { id: "CL-006", code: "Bowring Hospital", name: "Bowring & Lady Curzon Hospital and Gosha", sector: "Healthcare", departmentContact: "Medical Superintendent", email: "ms@bowring.gov.in", phone: "+91 80 2559 1325", activeWorkflows: 2, activeUnits: 1, slaDefault: 2, status: "ACTIVE" },
  { id: "CL-007", code: "KSMCL", name: "Karnataka State Mining & Geology Corp.", sector: "State Enterprise", departmentContact: "Managing Director", email: "md@ksmcl.karnataka.gov.in", phone: "+91 80 2226 2300", activeWorkflows: 3, activeUnits: 2, slaDefault: 4, status: "ACTIVE" },
  { id: "CL-008", code: "KPTCL", name: "Karnataka Power Transmission Corp. Ltd.", sector: "Energy & Utility", departmentContact: "Chief Engineer (Transmission)", email: "ce.trans@kptcl.com", phone: "+91 80 2221 4526", activeWorkflows: 4, activeUnits: 3, slaDefault: 3, status: "ACTIVE" },
  { id: "CL-009", code: "GKVK", name: "University of Agricultural Sciences (GKVK)", sector: "Education/Govt", departmentContact: "Comptroller & Estate Officer", email: "comptroller@uasbangalore.edu.in", phone: "+91 80 2333 0153", activeWorkflows: 2, activeUnits: 1, slaDefault: 3, status: "ACTIVE" },
  { id: "CL-010", code: "NCBS", name: "National Centre for Biological Sciences", sector: "Research Institute", departmentContact: "Head of Administration & Finance", email: "admin@ncbs.res.in", phone: "+91 80 2366 6001", activeWorkflows: 2, activeUnits: 1, slaDefault: 2, status: "ACTIVE" },
];

export const DEFAULT_UNITS = [
  { id: "UN-001", clientCode: "BBMP", name: "BBMP Lakes North Zone", contact: "S. Natarajan", zone: "Mahadevapura", location: "Bellandur & KR Puram Lakes", bills: 8, slaCompliance: "88%", status: "ACTIVE" },
  { id: "UN-002", clientCode: "BBMP", name: "BBMP Lakes South Zone", contact: "R. Krishnamurthy", zone: "Bannerghatta Rd", location: "South Corridor Lakes", bills: 5, slaCompliance: "92%", status: "ACTIVE" },
  { id: "UN-003", clientCode: "BBMP", name: "BBMP Yelahanka Zone", contact: "P. Venkatesh", zone: "Yelahanka", location: "Ward 05 & Ward 18", bills: 6, slaCompliance: "79%", status: "ACTIVE" },
  { id: "UN-004", clientCode: "BBMP", name: "BBMP Solid Waste Management", contact: "A. Reddy", zone: "East Zone", location: "Central Processing Units", bills: 3, slaCompliance: "95%", status: "ACTIVE" },
  { id: "UN-005", clientCode: "BMRCL", name: "BMRCL Phase 2 Civil Works (Reach 3C)", contact: "D. Bhat", zone: "Central Corridor", location: "Peenya - Jalahalli Reach", bills: 4, slaCompliance: "98%", status: "ACTIVE" },
  { id: "UN-006", clientCode: "BMRCL", name: "BMRCL Project Wing (80% Operational)", contact: "R. Chandrashekhar, KAS", zone: "HQ & Corridor", location: "Metro Bhavan CSO Office", bills: 4, slaCompliance: "100%", status: "ACTIVE" },
  { id: "UN-007", clientCode: "BMRCL", name: "BMRCL Project Wing (20% Statutory HR)", contact: "Col. Jyothi", zone: "Corporate", location: "HR Compliance Wing", bills: 3, slaCompliance: "90%", status: "ACTIVE" },
  { id: "UN-008", clientCode: "BMCRI", name: "Victoria Hospital Housekeeping & Security", contact: "Dr. Savitha Patil", zone: "Central Bengaluru", location: "Victoria Hospital Complex", bills: 4, slaCompliance: "85%", status: "ACTIVE" },
  { id: "UN-009", clientCode: "BMCRI", name: "Vanivilas Hospital Housekeeping & Security", contact: "Dr. Geetha S.", zone: "Central Bengaluru", location: "KR Road Campus", bills: 2, slaCompliance: "90%", status: "ACTIVE" },
  { id: "UN-010", clientCode: "BMCRI", name: "Minto Hospital Housekeeping & Security", contact: "Dr. M. Rao", zone: "Central Bengaluru", location: "Chamarajpet Campus", bills: 2, slaCompliance: "88%", status: "ACTIVE" },
  { id: "UN-011", clientCode: "BDA", name: "BDA Man Power Wing", contact: "S. K. Murthy", zone: "Kumara Park", location: "BDA Head Office", bills: 3, slaCompliance: "91%", status: "ACTIVE" },
  { id: "UN-012", clientCode: "Bowring Hospital", name: "Bowring & Lady Curzon Hospital", contact: "Deepa Hegde", zone: "Shivajinagar", location: "Hospital Wards & OPD", bills: 2, slaCompliance: "80%", status: "ACTIVE" },
  { id: "UN-013", clientCode: "KIADB", name: "Harohalli & DO EE1 Office", contact: "G. Prasad", zone: "Ramanagara", location: "Harohalli Industrial Area", bills: 3, slaCompliance: "85%", status: "ACTIVE" },
  { id: "UN-014", clientCode: "KSMCL", name: "KSMCL Quarry & Mining Operations", contact: "B. Kumar", zone: "Tumkur Dist.", location: "Sand & Mineral Pits", bills: 2, slaCompliance: "75%", status: "ACTIVE" },
  { id: "UN-015", clientCode: "KPTCL", name: "KPTCL Substation Civil Works", contact: "H. Reddy", zone: "North Bengaluru", location: "220kV Grid Substation", bills: 3, slaCompliance: "83%", status: "ACTIVE" },
];

export const DEFAULT_SERVICES = [
  { id: "SV-001", code: "CIVIL-DESILTING", name: "Lake Desilting & Bund Restoration", category: "Civil Works", unit: "Per Cum", baseRate: "₹ 450", description: "Excavation, silt dredging, bund profiling, and boulder pitching." },
  { id: "SV-002", code: "CIVIL-MASONRY", name: "Masonry Weir & Sluice Gate Construction", category: "Civil Works", unit: "Per Sqm", baseRate: "₹ 2,800", description: "Granite masonry overflow weirs, RCC chute blocks, and intake gates." },
  { id: "SV-003", code: "METRO-VIADUCT", name: "Viaduct Segmental Casting & Pier Cap Works", category: "Metro Transit", unit: "Per Rmt", baseRate: "₹ 85,000", description: "Structural concrete viaduct piers, pre-cast segment stitching, and bearings." },
  { id: "SV-004", code: "MECH-AERATOR", name: "Lake Aeration System Installation & Maintenance", category: "Mechanical", unit: "Per Unit", baseRate: "₹ 85,000", description: "Surface aerator fountains, HDPE air diffusers, and compressor lines." },
  { id: "SV-005", code: "ELEC-SUBSTATION", name: "Power Substation Civil & LT/HT Electrical Works", category: "Electrical", unit: "Lumpsum", baseRate: "₹ 45,00,000", description: "Transformer yards, switchgear panels, and cabling infrastructure." },
  { id: "SV-006", code: "SAN-HOSPITAL", name: "Hospital Deep Sanitation & Ward Housekeeping", category: "Housekeeping", unit: "Per Sqft / Mo", baseRate: "₹ 18", description: "24x7 clinical ward disinfection, linen management, and biomedical waste." },
  { id: "SV-007", code: "MANPOWER-DEO", name: "Outsourced Technical Staff & DEO Personnel", category: "Manpower", unit: "Per Head / Mo", baseRate: "₹ 28,500", description: "Skilled DEOs, accounting assistants, and project coordinators." },
  { id: "SV-008", code: "SECURITY-GUARD", name: "Armed & Unarmed Facility Security Services", category: "Security", unit: "Per Guard / Mo", baseRate: "₹ 24,000", description: "Trained security personnel, perimeter patrol, and access control." },
  { id: "SV-009", code: "CIVIL-CULVERT", name: "Stormwater Culvert & Drain Remodeling", category: "Civil Works", unit: "Per Rmt", baseRate: "₹ 8,500", description: "RCC box culverts, retaining walls, and silt baffle chambers." },
  { id: "SV-010", code: "HORT-PLANTATION", name: "Bund Afforestation & Green Belt Development", category: "Horticulture", unit: "Per Ha", baseRate: "₹ 1,20,000", description: "Soil preparation, native tree saplings, drip irrigation, and 3-year maintenance." },
];

export const DEFAULT_BILLING_TYPES = [
  {
    id: "BT-001",
    code: "MONTHLY-RA",
    name: "Monthly Running Account (RA) Bill",
    billingFrequency: "Monthly",
    retentionPercent: 5,
    advanceDeductionPercent: 10,
    paymentTermsDays: 30,
    description: "Standard monthly running account bill for ongoing public works and services based on certified measurement book entries.",
    status: "ACTIVE"
  },
  {
    id: "BT-002",
    code: "SPLIT-80-20",
    name: "Split Milestone Billing (80% Ops / 20% Retention)",
    billingFrequency: "Milestone-based",
    retentionPercent: 20,
    advanceDeductionPercent: 0,
    paymentTermsDays: 15,
    description: "BMRCL & transit model: 80% operational milestone cleared via CSO & GM Operations; 20% statutory HR retention released after compliance.",
    status: "ACTIVE"
  },
  {
    id: "BT-003",
    code: "DOUBLE-BILL",
    name: "Double Bill Route (DC Bill + DCF Fund Allocation)",
    billingFrequency: "Monthly / Milestone",
    retentionPercent: 5,
    advanceDeductionPercent: 5,
    paymentTermsDays: 28,
    description: "BBMP Municipal code: 15-tier approval involving technical check-measurement, Zonal JC, DCF Fund allocation, and DC Bill pass order.",
    status: "ACTIVE"
  },
  {
    id: "BT-004",
    code: "MILESTONE-STAGE",
    name: "Milestone Progress Bill",
    billingFrequency: "Milestone-based",
    retentionPercent: 5,
    advanceDeductionPercent: 0,
    paymentTermsDays: 21,
    description: "Contractual milestone billing triggered at designated physical deliverables (e.g. 25%, 50%, 75%, 100% completion).",
    status: "ACTIVE"
  },
  {
    id: "BT-005",
    code: "RETENTION-RELEASE",
    name: "Statutory Retention & Security Deposit Release",
    billingFrequency: "One-time",
    retentionPercent: 0,
    advanceDeductionPercent: 0,
    paymentTermsDays: 30,
    description: "Final statutory release of withheld 5% or 20% retention after completion of defect liability period and labour clearance.",
    status: "ACTIVE"
  },
  {
    id: "BT-006",
    code: "LUMPSUM-TURNKEY",
    name: "Lumpsum Turnkey Contract Bill",
    billingFrequency: "Quarterly / Milestone",
    retentionPercent: 10,
    advanceDeductionPercent: 0,
    paymentTermsDays: 20,
    description: "Fixed lumpsum contract billing against certified turnkey deliverables and performance guarantees.",
    status: "ACTIVE"
  }
];

export const DEFAULT_ROLES = [
  { id: "RL-001", code: "AE", name: "Assistant Engineer", level: "Field", authority: "Field Scrutiny, MB Measurements, and Site Inspection", slaHours: 24, escalationRole: "AEE" },
  { id: "RL-002", code: "AEE", name: "Assistant Executive Engineer", level: "Field", authority: "25% Statutory Check-Measurement & Technical Sanction Parity", slaHours: 48, escalationRole: "EE" },
  { id: "RL-003", code: "EE", name: "Executive Engineer", level: "Departmental", authority: "Divisional Directorate Scrutiny & Sanction Endorsement", slaHours: 48, escalationRole: "JC" },
  { id: "RL-004", code: "JC", name: "Joint Commissioner", level: "Executive", authority: "Zonal Executive Sanction & Policy Approval", slaHours: 72, escalationRole: "COMMR" },
  { id: "RL-005", code: "COMMR", name: "Special / Addl. Commissioner", level: "Executive", authority: "High-Value Administrative Sanction (> ₹ 25L)", slaHours: 72, escalationRole: "CEO" },
  { id: "RL-006", code: "DCF", name: "Deputy Controller of Finance", level: "Finance", authority: "Pre-Audit, Budget Concordance, and DC Bill Passing", slaHours: 48, escalationRole: "CFO" },
  { id: "RL-007", code: "TAPAL", name: "Tapal & Inward Clerk", level: "Registry", authority: "Docket Registration, Work Order Verification & File Dispatch", slaHours: 24, escalationRole: "AEE" },
  { id: "RL-008", code: "CASEWORKER", name: "Case Worker / Inward Section", level: "Administration", authority: "Document Completeness, Attendance Register, and Rate Concordance", slaHours: 48, escalationRole: "ACCOUNTS_SUPT" },
  { id: "RL-009", code: "MATRON", name: "Matron / Nursing Superintendent", level: "Field", authority: "Ward Cleanliness, Linen, and Hygiene Inspection Certification", slaHours: 24, escalationRole: "RMO" },
  { id: "RL-010", code: "RMO", name: "Resident Medical Officer", level: "Field", authority: "Hospital Operational Review and Sanitation Concurrence", slaHours: 48, escalationRole: "MS" },
  { id: "RL-011", code: "MS", name: "Medical Superintendent", level: "Departmental", authority: "Hospital Directorate Technical & Operational Approval", slaHours: 48, escalationRole: "DEAN" },
  { id: "RL-012", code: "DEAN", name: "Dean / Director", level: "Executive", authority: "Institutional Executive Clearance & Treasury Payment Sanction", slaHours: 72, escalationRole: "CEO" },
  { id: "RL-013", code: "FA", name: "Financial Advisor / CAO", level: "Finance", authority: "Statutory Deductions (TDS, GST, Cess) and Pre-Audit Clearance", slaHours: 48, escalationRole: "DEAN" },
  { id: "RL-014", code: "CSO", name: "Chief Security Officer", level: "Transit Ops", authority: "Transit Station Safety, Attendance & Operational Certification", slaHours: 48, escalationRole: "GM_OPS" },
  { id: "RL-015", code: "GM_OPS", name: "General Manager (Operations)", level: "Transit Ops", authority: "80% Milestone Operational Clearance & E-Office Endorsement", slaHours: 48, escalationRole: "AGM_FIN" },
  { id: "RL-016", code: "AGM_FIN", name: "AGM Finance (Metro)", level: "Finance", authority: "Corporate Finance Scrutiny & Retention Verification", slaHours: 48, escalationRole: "DIR_FIN" },
  { id: "RL-017", code: "CASHIER", name: "Cash Section & Treasury Officer", level: "Treasury", authority: "Cheque Writing, RTGS Scroll Generation & Bank Remittance", slaHours: 24, escalationRole: "DCF" },
  { id: "RL-018", code: "VIGILANCE", name: "Vigilance & Labour Officer", level: "Compliance", authority: "Biometric Attendance, Form V Muster, EPF/ESI Verification", slaHours: 48, escalationRole: "EE" },
];

export const DEFAULT_PERSONS = [
  { id: "PS-001", employeeId: "EMP-BBMP-1042", name: "Dr. Priya Sharma", roleCode: "AEE", roleName: "Assistant Executive Engineer", department: "BBMP Field Sub-Division", unitCode: "UN-001", clientCode: "BBMP", email: "priya.sharma@bbmp.gov.in", phone: "+91 98450 11223", status: "ACTIVE" },
  { id: "PS-002", employeeId: "EMP-BBMP-1088", name: "K. Venkatesh", roleCode: "AE", roleName: "Assistant Engineer", department: "Ward 42 Engineering", unitCode: "UN-001", clientCode: "BBMP", email: "k.venkatesh@bbmp.gov.in", phone: "+91 98450 22334", status: "ACTIVE" },
  { id: "PS-003", employeeId: "EMP-BBMP-0402", name: "Rajesh Kumar", roleCode: "EE", roleName: "Executive Engineer", department: "Divisional Directorate", unitCode: "UN-001", clientCode: "BBMP", email: "rajesh.kumar@bbmp.gov.in", phone: "+91 98450 33445", status: "ACTIVE" },
  { id: "PS-004", employeeId: "EMP-BBMP-0911", name: "S. Natarajan", roleCode: "VIGILANCE", roleName: "Labour Officer", department: "Labour Welfare Wing", unitCode: "UN-001", clientCode: "BBMP", email: "s.natarajan@bbmp.gov.in", phone: "+91 98450 44556", status: "ACTIVE" },
  { id: "PS-005", employeeId: "EMP-BBMP-1205", name: "M. Ramesh", roleCode: "TAPAL", roleName: "Tapal Clerk", department: "Inward Registry", unitCode: "UN-001", clientCode: "BBMP", email: "m.ramesh@bbmp.gov.in", phone: "+91 98450 55667", status: "ACTIVE" },
  { id: "PS-006", employeeId: "EMP-BMRC-0018", name: "R. Chandrashekhar, KAS", roleCode: "GM_OPS", roleName: "General Manager (Operations)", department: "Metro Operations Wing", unitCode: "UN-006", clientCode: "BMRCL", email: "r.chandra@bmrc.co.in", phone: "+91 94480 12345", status: "ACTIVE" },
  { id: "PS-007", employeeId: "EMP-BMRC-0024", name: "Col. Jyothi", roleCode: "CSO", roleName: "Chief Security Officer", department: "Chief Security Directorate", unitCode: "UN-006", clientCode: "BMRCL", email: "col.jyothi@bmrc.co.in", phone: "+91 94480 23456", status: "ACTIVE" },
  { id: "PS-008", employeeId: "EMP-BMRC-0105", name: "Anil Mehta", roleCode: "AGM_FIN", roleName: "AGM Finance", department: "Finance Verification & Audit", unitCode: "UN-006", clientCode: "BMRCL", email: "anil.mehta@bmrc.co.in", phone: "+91 94480 34567", status: "ACTIVE" },
  { id: "PS-009", employeeId: "EMP-BOW-0042", name: "Deepa Hegde", roleCode: "CASEWORKER", roleName: "Case Worker", department: "Hospital Administration", unitCode: "UN-012", clientCode: "Bowring Hospital", email: "deepa.hegde@bowring.gov.in", phone: "+91 99001 88990", status: "ACTIVE" },
  { id: "PS-010", employeeId: "EMP-BMC-0005", name: "Dr. Savitha Patil", roleCode: "MS", roleName: "Medical Superintendent", department: "Victoria Hospital Directorate", unitCode: "UN-008", clientCode: "BMCRI", email: "dr.savitha@bmcri.org", phone: "+91 99002 99001", status: "ACTIVE" },
];

export const DEFAULT_SLAS = [
  { id: "SLA-001", code: "SLA-BBMP-CIVIL", clientCode: "BBMP", workflowType: "Civil Works & Double Bill", totalSlaDays: 28, criticalStageDays: 3, warningThresholdPercent: 75, breachThresholdPercent: 100, escalationPath: "EE → JC → Addl. Commr", calendarType: "BUSINESS_DAYS", status: "ACTIVE" },
  { id: "SLA-002", code: "SLA-BMRCL-80OPS", clientCode: "BMRCL", workflowType: "Metro Civil (80% Operational)", totalSlaDays: 14, criticalStageDays: 2, warningThresholdPercent: 75, breachThresholdPercent: 100, escalationPath: "ASCO → CSO → GM Ops → AGM Fin", calendarType: "BUSINESS_DAYS", status: "ACTIVE" },
  { id: "SLA-003", code: "SLA-BMRCL-20HR", clientCode: "BMRCL", workflowType: "Metro Statutory HR (20% Retention)", totalSlaDays: 18, criticalStageDays: 2, warningThresholdPercent: 75, breachThresholdPercent: 100, escalationPath: "HR Mgr → Accounts → AGM Fin", calendarType: "BUSINESS_DAYS", status: "ACTIVE" },
  { id: "SLA-004", code: "SLA-BMCRI-HOSP", clientCode: "BMCRI", workflowType: "Hospital Housekeeping & Security", totalSlaDays: 24, criticalStageDays: 2, warningThresholdPercent: 75, breachThresholdPercent: 100, escalationPath: "Matron → RMO → MS → Dean", calendarType: "CALENDAR_DAYS", status: "ACTIVE" },
  { id: "SLA-005", code: "SLA-KIADB-INFRA", clientCode: "KIADB", workflowType: "Industrial Area Works", totalSlaDays: 15, criticalStageDays: 2, warningThresholdPercent: 75, breachThresholdPercent: 100, escalationPath: "EE → Head Office → DC", calendarType: "BUSINESS_DAYS", status: "ACTIVE" },
  { id: "SLA-006", code: "SLA-KSMCL-MINES", clientCode: "KSMCL", workflowType: "Mining & Geology Works", totalSlaDays: 16, criticalStageDays: 3, warningThresholdPercent: 75, breachThresholdPercent: 100, escalationPath: "Mines Mgr → GM → MD", calendarType: "BUSINESS_DAYS", status: "ACTIVE" },
  { id: "SLA-007", code: "SLA-KPTCL-POWER", clientCode: "KPTCL", workflowType: "Power Substation Civil", totalSlaDays: 18, criticalStageDays: 3, warningThresholdPercent: 75, breachThresholdPercent: 100, escalationPath: "Admin → CE → MD", calendarType: "BUSINESS_DAYS", status: "ACTIVE" },
];

export const DEFAULT_DOCUMENTS = [
  { id: "DOC-001", code: "TAX-INVOICE", title: "Tax Invoice & Covering Letter", category: "Statutory Compliance", allowedExtensions: ["PDF", "JPG"], maxSizeBytes: 10485760, isRequiredDefault: true, description: "Official GST tax invoice with contractor letterhead, bank details, and PAN/GSTIN." },
  { id: "DOC-002", code: "WORK-ORDER", title: "Work Order Sanction Copy", category: "Administrative Sanction", allowedExtensions: ["PDF"], maxSizeBytes: 10485760, isRequiredDefault: true, description: "Official letter of acceptance and work order issued by competent authority." },
  { id: "DOC-003", code: "MB-BOOK", title: "Measurement Book (MB) Entry", category: "Technical & Measurement", allowedExtensions: ["PDF", "XLSX"], maxSizeBytes: 20971520, isRequiredDefault: true, description: "Recorded physical measurements in official serialized Measurement Book." },
  { id: "DOC-004", code: "CHECK-MEASURE", title: "25% Check-Measurement Note (KPWD Code)", category: "Technical & Measurement", allowedExtensions: ["PDF"], maxSizeBytes: 10485760, isRequiredDefault: true, description: "Endorsement by AEE certifying 25%+ physical check under KPWD Code Art. 219." },
  { id: "DOC-005", code: "GEOTAG-PHOTOS", title: "Geo-tagged Site Inspection Photos", category: "Technical & Measurement", allowedExtensions: ["JPG", "PNG", "PDF"], maxSizeBytes: 52428800, isRequiredDefault: true, description: "High-resolution photographs with embedded latitude, longitude, and timestamp." },
  { id: "DOC-006", code: "MUSTER-ROLL", title: "Form V Biometric Muster Roll & Attendance", category: "Statutory Compliance", allowedExtensions: ["PDF", "XLSX"], maxSizeBytes: 15728640, isRequiredDefault: true, description: "Monthly biometric attendance log and muster roll signed by facility in-charge." },
  { id: "DOC-007", code: "EPF-ESI-CHALLAN", title: "EPF & ESI Challan with Electronic Challan Return (ECR)", category: "Statutory Compliance", allowedExtensions: ["PDF"], maxSizeBytes: 10485760, isRequiredDefault: true, description: "Bank-paid EPF & ESI challans with detailed employee ECR schedule." },
  { id: "DOC-008", code: "LABOUR-CESS", title: "Labour Welfare Cess Assessment Note", category: "Statutory Compliance", allowedExtensions: ["PDF"], maxSizeBytes: 5242880, isRequiredDefault: false, description: "1% Building & Other Construction Workers (BOCW) welfare cess deduction certificate." },
  { id: "DOC-009", code: "QUALITY-CERT", title: "Third-Party Laboratory Quality Certificate", category: "Technical & Measurement", allowedExtensions: ["PDF"], maxSizeBytes: 10485760, isRequiredDefault: false, description: "Concrete compressive strength, soil compaction, or asphalt testing report." },
  { id: "DOC-010", code: "WARD-HYGIENE", title: "Ward Hygiene / Cleanliness Certificate", category: "Healthcare Technical", allowedExtensions: ["PDF"], maxSizeBytes: 5242880, isRequiredDefault: false, description: "Monthly ward cleanliness rating endorsed by Matron / Nursing Superintendent." },
  { id: "DOC-011", code: "TECH-SANCTION", title: "Technical Sanction & Rate Concordance Sheet", category: "Financial & Tax", allowedExtensions: ["PDF", "XLSX"], maxSizeBytes: 10485760, isRequiredDefault: true, description: "BoQ rate comparison against current Schedule of Rates (SR)." },
  { id: "DOC-012", code: "DC-BILL-ORDER", title: "DC Bill Voucher & Scrutiny Sheet", category: "Pre-Audit & Accounts", allowedExtensions: ["PDF"], maxSizeBytes: 10485760, isRequiredDefault: false, description: "Municipal DC Bill sanction order signed by DCF Bill Wing." },
  { id: "DOC-013", code: "FUND-RELEASE", title: "Budget Allocation & Fund Release Authorization", category: "Banking & Payment", allowedExtensions: ["PDF"], maxSizeBytes: 5242880, isRequiredDefault: false, description: "Treasury fund release token voucher authorizing disbursement." },
  { id: "DOC-014", code: "RTGS-ADVICE", title: "RTGS / Bank Remittance Advice", category: "Banking & Payment", allowedExtensions: ["PDF"], maxSizeBytes: 5242880, isRequiredDefault: false, description: "Treasury scroll and bank RTGS payment acknowledgment receipt." },
];

export const DEFAULT_ESCALATIONS = [
  { id: "ESC-001", code: "ESC-75-WARN", name: "SLA Warning at 75% Dwell Limit", triggerCondition: "75% of stage turnaround SLA elapsed without forward transition", sourceRole: "Current Assignee", targetRole: "Section Head / Supervisor", priority: "MEDIUM", action: "DASHBOARD_ALERT", gracePeriodHours: 12, description: "Triggers amber visual warning on Control Tower and dispatches automated reminder.", status: "ACTIVE" },
  { id: "ESC-002", code: "ESC-100-BREACH", name: "SLA Breach at 100% (Tier 1 Escalation)", triggerCondition: "Stage turnaround SLA exceeded 100%", sourceRole: "Current Assignee", targetRole: "Executive Engineer / Director", priority: "HIGH", action: "AUTO_REASSIGN_HOD", gracePeriodHours: 24, description: "Red flag raised, immediate notification sent to departmental directorate.", status: "ACTIVE" },
  { id: "ESC-003", code: "ESC-48H-CRITICAL", name: "Critical Overdue (>48h past SLA)", triggerCondition: "Bill unresolved 48 hours after SLA breach", sourceRole: "Executive Engineer", targetRole: "Joint Commissioner / CEO", priority: "CRITICAL", action: "MANAGEMENT_ESCALATION", gracePeriodHours: 0, description: "Direct escalation to Executive Management and inclusion in urgent morning intervention list.", status: "ACTIVE" },
  { id: "ESC-004", code: "ESC-AUDIT-OBJECTION", name: "Audit Objection & Rejection Loop", triggerCondition: "Bill returned/rejected by pre-audit or accounts due to document discrepancy", sourceRole: "Pre-Audit / Accounts", targetRole: "Case Worker / Vendor", priority: "HIGH", action: "EMAIL_DISPATCH", gracePeriodHours: 24, description: "Routes docket to Return Queue with mandatory itemized objection notice.", status: "ACTIVE" },
  { id: "ESC-005", code: "ESC-DOC-MISSING", name: "Mandatory Document Missing Gate", triggerCondition: "Stage completion attempted without all mandatory documents uploaded", sourceRole: "System Gate", targetRole: "Submitting Officer", priority: "HIGH", action: "BLOCK_TRANSITION", gracePeriodHours: 0, description: "Hard-stops forward stage transition until mandatory checklists and documents are satisfied.", status: "ACTIVE" },
  { id: "ESC-006", code: "ESC-SPLIT-RETENTION", name: "Transit 20% Retention Escrow Gate", triggerCondition: "BMRCL 80% operational bill approved", sourceRole: "Corporate Finance", targetRole: "HR Compliance Wing", priority: "MEDIUM", action: "SPLIT_DOCKET", gracePeriodHours: 0, description: "Automatically instantiates the parallel 20% statutory HR retention docket.", status: "ACTIVE" },
];

export const CANONICAL_STAGE_TEMPLATES = [
  { id: 1, name: "Docketing & Registry (Inward / Tapal)", objective: "Initial receipt, timestamping, barcode docket issuance, and basic completeness verification.", defaultRole: "TAPAL", defaultSlaDays: 1, actionType: "RECEIPT" },
  { id: 2, name: "First-Line Administrative Scrutiny", objective: "Verification of attendance registers, work order citation, EPF/ESI challans, and contractor credentials.", defaultRole: "CASEWORKER", defaultSlaDays: 2, actionType: "SCRUTINY" },
  { id: 3, name: "Field / Operational Certification", objective: "Physical inspection (AE MB measurement, Matron ward hygiene, ASCO transit verification, Mine manager pit check).", defaultRole: "AE", defaultSlaDays: 2, actionType: "CERTIFICATION" },
  { id: 4, name: "Middle-Tier Administrative / Technical Sanction", objective: "AEE check-measurement (mandatory 25%), RMO/MS review, or GM Operations concurrence.", defaultRole: "AEE", defaultSlaDays: 2, actionType: "SANCTION" },
  { id: 5, name: "Financial & Accounts Scrutiny", objective: "Scrutiny of rates against Schedule of Rates (SR), statutory deductions (TDS, GST, Labour Cess, Retention).", defaultRole: "ACCOUNTS", defaultSlaDays: 2, actionType: "AUDIT" },
  { id: 6, name: "Statutory Pre-Audit & Executive Concurrence", objective: "Pre-audit pass order by CAO/Internal Audit and executive sign-off from Commissioner, Dean, or MD.", defaultRole: "EE", defaultSlaDays: 2, actionType: "APPROVAL" },
  { id: 7, name: "Disbursement & Payment Closure", objective: "DC Bill / Treasury scroll generation, Cheque writing, or bank NEFT/RTGS release by Cash Section.", defaultRole: "CASHIER", defaultSlaDays: 1, actionType: "PAYMENT" },
];

// ============================================================
// WORKFLOW ENGINE STORE CLASS (Singleton with persistence)
// ============================================================

class WorkflowEngineStore {
  constructor() {
    this.clients = [];
    this.units = [];
    this.services = [];
    this.billingTypes = [];
    this.workflows = [];
    this.roles = [];
    this.persons = [];
    this.slas = [];
    this.documents = [];
    this.escalations = [];
    this.canonicalStages = CANONICAL_STAGE_TEMPLATES;
    this.loadStore();
  }

  loadStore() {
    try {
      if (fs.existsSync(storeFilePath)) {
        const raw = fs.readFileSync(storeFilePath, "utf8");
        const data = JSON.parse(raw);
        this.clients = data.clients || DEFAULT_CLIENTS;
        this.units = data.units || DEFAULT_UNITS;
        this.services = data.services || DEFAULT_SERVICES;
        this.billingTypes = data.billingTypes || DEFAULT_BILLING_TYPES;
        this.workflows = data.workflows && data.workflows.length > 0 ? data.workflows : this.seedWorkflowsFromBaseline();
        this.roles = data.roles || DEFAULT_ROLES;
        this.persons = data.persons || DEFAULT_PERSONS;
        this.slas = data.slas || DEFAULT_SLAS;
        this.documents = data.documents || DEFAULT_DOCUMENTS;
        this.escalations = data.escalations || DEFAULT_ESCALATIONS;
        return;
      }
    } catch (err) {
      console.warn("Could not load workflow engine store from disk, initializing defaults:", err.message);
    }

    // Default initialization
    this.clients = JSON.parse(JSON.stringify(DEFAULT_CLIENTS));
    this.units = JSON.parse(JSON.stringify(DEFAULT_UNITS));
    this.services = JSON.parse(JSON.stringify(DEFAULT_SERVICES));
    this.billingTypes = JSON.parse(JSON.stringify(DEFAULT_BILLING_TYPES));
    this.workflows = this.seedWorkflowsFromBaseline();
    this.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
    this.persons = JSON.parse(JSON.stringify(DEFAULT_PERSONS));
    this.slas = JSON.parse(JSON.stringify(DEFAULT_SLAS));
    this.documents = JSON.parse(JSON.stringify(DEFAULT_DOCUMENTS));
    this.escalations = JSON.parse(JSON.stringify(DEFAULT_ESCALATIONS));
    this.saveStore();
  }

  seedWorkflowsFromBaseline() {
    // Clone baseline 34 workflows and enrich each stage with standard role codes and mandatory docs
    return BASELINE_WORKFLOW_CATALOG.map((wf) => {
      const enrichedStages = (wf.stages || []).map((st) => ({
        step: st.step,
        name: st.name,
        role: st.role || "Assigned Officer",
        roleCode: this.inferRoleCode(st.role),
        dept: st.dept || "General Directorate",
        slaDays: st.slaDays || 2,
        mandatoryDocs: Array.isArray(st.mandatoryDocs) ? st.mandatoryDocs : ["Tax Invoice", "Work Order Copy"],
        escalationRole: st.escalationRole || "HOD",
        escalationRuleId: "ESC-001",
        actionType: this.inferActionType(st.name, st.step, (wf.stages || []).length),
        instructions: `Scrutinize and verify according to SOP standards for ${st.name}.`
      }));

      const totalSla = enrichedStages.reduce((acc, s) => acc + (s.slaDays || 2), 0);

      return {
        ...wf,
        status: "ACTIVE",
        totalSlaDays: totalSla,
        billingType: wf.billingType || (wf.category === "TRANSIT" ? "Split Milestone Billing (80% Ops / 20% Retention)" : (wf.client === "BBMP" ? "Double Bill Route (DC Bill + DCF Fund Allocation)" : "Monthly Running Account (RA) Bill")),
        updatedAt: new Date().toISOString()
      };
    });
  }

  inferRoleCode(roleStr) {
    if (!roleStr) return "OFFICER";
    const lower = roleStr.toLowerCase();
    if (lower.includes("tapal")) return "TAPAL";
    if (lower.includes("assistant executive") || lower.includes("aee")) return "AEE";
    if (lower.includes("assistant engineer") || lower.includes("ae")) return "AE";
    if (lower.includes("executive engineer") || lower.includes("ee")) return "EE";
    if (lower.includes("joint commissioner") || lower.includes("jc")) return "JC";
    if (lower.includes("commissioner")) return "COMMR";
    if (lower.includes("dcf") || lower.includes("finance")) return "DCF";
    if (lower.includes("case worker")) return "CASEWORKER";
    if (lower.includes("matron")) return "MATRON";
    if (lower.includes("resident medical") || lower.includes("rmo")) return "RMO";
    if (lower.includes("medical super") || lower.includes("ms")) return "MS";
    if (lower.includes("dean")) return "DEAN";
    if (lower.includes("cso")) return "CSO";
    if (lower.includes("gm ops") || lower.includes("general manager")) return "GM_OPS";
    if (lower.includes("cash") || lower.includes("treasury") || lower.includes("payment")) return "CASHIER";
    if (lower.includes("vigilance") || lower.includes("labour")) return "VIGILANCE";
    return "OFFICER";
  }

  inferActionType(stageName, step, total) {
    if (step === 1) return "RECEIPT";
    if (step === total) return "PAYMENT";
    const lower = (stageName || "").toLowerCase();
    if (lower.includes("measurement") || lower.includes("site") || lower.includes("photo") || lower.includes("cert")) return "CERTIFICATION";
    if (lower.includes("audit") || lower.includes("account") || lower.includes("scrutiny") || lower.includes("revenue")) return "SCRUTINY";
    if (lower.includes("sanction") || lower.includes("approval") || lower.includes("endorse")) return "APPROVAL";
    return "SCRUTINY";
  }

  saveStore() {
    try {
      const data = {
        savedAt: new Date().toISOString(),
        clients: this.clients,
        units: this.units,
        services: this.services,
        billingTypes: this.billingTypes,
        workflows: this.workflows,
        roles: this.roles,
        persons: this.persons,
        slas: this.slas,
        documents: this.documents,
        escalations: this.escalations
      };
      fs.writeFileSync(storeFilePath, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to save workflow engine store to disk:", err.message);
    }
  }

  // Master Accessors
  getAllMasters() {
    return {
      clients: this.clients,
      units: this.units,
      services: this.services,
      billingTypes: this.billingTypes,
      workflows: this.workflows,
      roles: this.roles,
      persons: this.persons,
      slas: this.slas,
      documents: this.documents,
      escalations: this.escalations,
      canonicalStages: this.canonicalStages,
      metrics: {
        totalClients: this.clients.length,
        totalUnits: this.units.length,
        totalServices: this.services.length,
        totalBillingTypes: this.billingTypes.length,
        totalWorkflows: this.workflows.length,
        totalRoles: this.roles.length,
        totalPersons: this.persons.length,
        totalSlas: this.slas.length,
        totalDocuments: this.documents.length,
        totalEscalations: this.escalations.length
      }
    };
  }

  // Workflows Management
  getWorkflows(filter = {}) {
    let list = this.workflows;
    if (filter.category && filter.category !== "ALL") {
      list = list.filter((w) => w.category === filter.category);
    }
    if (filter.search && filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      list = list.filter((w) =>
        (w.unit || "").toLowerCase().includes(q) ||
        (w.client || "").toLowerCase().includes(q) ||
        (w.serviceType || "").toLowerCase().includes(q) ||
        (w.id || "").toLowerCase().includes(q)
      );
    }
    return list;
  }

  getWorkflowById(id) {
    return this.workflows.find((w) => w.id === id) || null;
  }

  createWorkflow(payload) {
    const id = payload.id && payload.id.trim()
      ? payload.id.trim().toUpperCase()
      : `WF-${String(this.workflows.length + 1).padStart(2, "0")}-${(payload.client || "GEN").toUpperCase()}-${Date.now().toString().slice(-4)}`;

    if (this.workflows.some((w) => w.id === id)) {
      throw new Error(`Workflow with ID "${id}" already exists.`);
    }

    const stages = (payload.stages || []).map((s, idx) => ({
      step: idx + 1,
      name: s.name?.trim() || `Step ${idx + 1}`,
      role: s.role?.trim() || "Assigned Officer",
      roleCode: s.roleCode || this.inferRoleCode(s.role),
      personName: s.personName?.trim() || "",
      personId: s.personId || null,
      dept: s.dept?.trim() || "Operations",
      slaDays: Number(s.slaDays) || 2,
      mandatoryDocs: Array.isArray(s.mandatoryDocs) ? s.mandatoryDocs : [],
      escalationRole: s.escalationRole?.trim() || "HOD",
      escalationRuleId: s.escalationRuleId || "ESC-001",
      actionType: s.actionType || "SCRUTINY",
      instructions: s.instructions?.trim() || ""
    }));

    const totalSlaDays = stages.reduce((acc, s) => acc + s.slaDays, 0);

    const newWf = {
      id,
      index: this.workflows.length + 1,
      client: payload.client?.trim() || "General Client",
      unit: payload.unit?.trim() || "General Division",
      category: payload.category || "ENTERPRISE",
      serviceType: payload.serviceType?.trim() || "General Public Services",
      billingType: payload.billingType?.trim() || "Monthly Running Account (RA) Bill",
      billingCycle: payload.billingCycle || "Monthly",
      isPilot: Boolean(payload.isPilot),
      pilotRationale: payload.pilotRationale || null,
      description: payload.description?.trim() || `Configured workflow for ${payload.unit || payload.client}`,
      status: payload.status || "ACTIVE",
      totalSlaDays,
      stages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.workflows.push(newWf);
    this.saveStore();
    return newWf;
  }

  updateWorkflow(id, payload) {
    const index = this.workflows.findIndex((w) => w.id === id);
    if (index === -1) {
      throw new Error(`Workflow "${id}" not found.`);
    }

    const current = this.workflows[index];

    const stages = payload.stages
      ? payload.stages.map((s, idx) => ({
          step: idx + 1,
          name: s.name?.trim() || `Step ${idx + 1}`,
          role: s.role?.trim() || "Assigned Officer",
          roleCode: s.roleCode || this.inferRoleCode(s.role),
          personName: s.personName?.trim() || "",
          personId: s.personId || null,
          dept: s.dept?.trim() || "Operations",
          slaDays: Number(s.slaDays) || 2,
          mandatoryDocs: Array.isArray(s.mandatoryDocs) ? s.mandatoryDocs : [],
          escalationRole: s.escalationRole?.trim() || "HOD",
          escalationRuleId: s.escalationRuleId || "ESC-001",
          actionType: s.actionType || "SCRUTINY",
          instructions: s.instructions?.trim() || ""
        }))
      : current.stages;

    const totalSlaDays = stages.reduce((acc, s) => acc + s.slaDays, 0);

    const updated = {
      ...current,
      client: payload.client !== undefined ? payload.client.trim() : current.client,
      unit: payload.unit !== undefined ? payload.unit.trim() : current.unit,
      category: payload.category !== undefined ? payload.category : current.category,
      serviceType: payload.serviceType !== undefined ? payload.serviceType.trim() : current.serviceType,
      billingType: payload.billingType !== undefined ? payload.billingType.trim() : current.billingType,
      billingCycle: payload.billingCycle !== undefined ? payload.billingCycle : current.billingCycle,
      isPilot: payload.isPilot !== undefined ? Boolean(payload.isPilot) : current.isPilot,
      pilotRationale: payload.pilotRationale !== undefined ? payload.pilotRationale : current.pilotRationale,
      description: payload.description !== undefined ? payload.description.trim() : current.description,
      status: payload.status !== undefined ? payload.status : current.status,
      stages,
      totalSlaDays,
      updatedAt: new Date().toISOString()
    };

    this.workflows[index] = updated;
    this.saveStore();
    return updated;
  }

  deleteWorkflow(id) {
    const index = this.workflows.findIndex((w) => w.id === id);
    if (index === -1) {
      throw new Error(`Workflow "${id}" not found.`);
    }
    const [removed] = this.workflows.splice(index, 1);
    this.saveStore();
    return removed;
  }

  duplicateWorkflow(id) {
    const orig = this.getWorkflowById(id);
    if (!orig) {
      throw new Error(`Original workflow "${id}" not found.`);
    }

    const newId = `${orig.id}-COPY-${Date.now().toString().slice(-4)}`;
    const clonedStages = (orig.stages || []).map((s) => ({ ...s }));

    const cloned = {
      ...orig,
      id: newId,
      index: this.workflows.length + 1,
      unit: `${orig.unit} (Custom Clone)`,
      isPilot: false,
      pilotRationale: null,
      stages: clonedStages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.workflows.push(cloned);
    this.saveStore();
    return cloned;
  }

  resetWorkflowsToBaseline() {
    this.workflows = this.seedWorkflowsFromBaseline();
    this.saveStore();
    return this.workflows;
  }

  // Generic Master Entity CRUD: clients, units, services, billingTypes, roles, persons, slas, documents, escalations
  getMasterList(type) {
    const prop = this.resolveMasterProp(type);
    return this[prop] || [];
  }

  createMasterItem(type, item) {
    const prop = this.resolveMasterProp(type);
    const list = this[prop];
    const prefix = type.slice(0, 3).toUpperCase();
    const id = item.id?.trim() || `${prefix}-${Date.now().toString().slice(-6)}`;

    if (list.some((x) => x.id === id || (x.code && item.code && x.code === item.code))) {
      throw new Error(`An item with ID "${id}" or code "${item.code}" already exists in ${type}.`);
    }

    const newItem = { ...item, id, createdAt: new Date().toISOString() };
    list.push(newItem);
    this.saveStore();
    return newItem;
  }

  updateMasterItem(type, id, item) {
    const prop = this.resolveMasterProp(type);
    const list = this[prop];
    const index = list.findIndex((x) => x.id === id);
    if (index === -1) {
      throw new Error(`Item with ID "${id}" not found in ${type}.`);
    }
    const updated = { ...list[index], ...item, id, updatedAt: new Date().toISOString() };
    list[index] = updated;
    this.saveStore();
    return updated;
  }

  deleteMasterItem(type, id) {
    const prop = this.resolveMasterProp(type);
    const list = this[prop];
    const index = list.findIndex((x) => x.id === id);
    if (index === -1) {
      throw new Error(`Item with ID "${id}" not found in ${type}.`);
    }
    const [removed] = list.splice(index, 1);
    this.saveStore();
    return removed;
  }

  resolveMasterProp(type) {
    const mapping = {
      clients: "clients",
      client: "clients",
      units: "units",
      unit: "units",
      services: "services",
      service: "services",
      "billing-types": "billingTypes",
      billingTypes: "billingTypes",
      billingType: "billingTypes",
      roles: "roles",
      role: "roles",
      persons: "persons",
      person: "persons",
      slas: "slas",
      sla: "slas",
      documents: "documents",
      document: "documents",
      escalations: "escalations",
      escalation: "escalations"
    };
    const prop = mapping[type];
    if (!prop || !this[prop]) {
      throw new Error(`Unknown master entity type: "${type}".`);
    }
    return prop;
  }
}

export const workflowEngine = new WorkflowEngineStore();
