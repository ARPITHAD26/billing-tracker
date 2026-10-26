import express from "express";
import cors from "cors";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { analyzePdfDocument } from "./pdfAnalyzer.js";
import { WORKFLOW_CATEGORIES } from "../src/workflowMasterData.js";
import { workflowEngine } from "./workflowEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static(uploadsDir));

// Password hashing utility using built-in crypto
function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  try {
    const [salt, hash] = storedHash.split(":");
    const testHash = crypto.scryptSync(password, salt, 32).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(testHash, "hex"));
  } catch {
    return false;
  }
}

// In-memory demo users store
const users = [
  {
    id: "usr_billing_tower",
    username: "billing_tower",
    email: "billing_tower@billing.gov",
    passwordHash: hashPassword("#bill@2026"),
    name: "Billing Tower Admin",
    role: "System Administrator",
    department: "Billing Operations & Governance Directorate",
    badgeColor: "#2563eb"
  },
  {
    id: "usr_admin",
    username: "admin",
    email: "admin@billing.gov",
    passwordHash: hashPassword("#bill@2026"),
    name: "Rajesh Kumar",
    role: "System Administrator",
    department: "Executive & Systems Directorate",
    badgeColor: "#8b5cf6"
  },
  {
    id: "usr_officer",
    username: "officer",
    email: "officer@billing.gov",
    passwordHash: hashPassword("officer123"),
    name: "Dr. Priya Sharma",
    role: "Field Officer (AEE)",
    department: "BBMP Lakes & Water Bodies",
    badgeColor: "#3b82f6"
  },
  {
    id: "usr_finance",
    username: "finance",
    email: "finance@billing.gov",
    passwordHash: hashPassword("finance123"),
    name: "Anil Mehta",
    role: "Accounts & Finance Lead",
    department: "Finance Verification & Payments",
    badgeColor: "#10b981"
  }
];

// In-memory session store: token -> { userId, expiresAt, createdAt }
const sessions = new Map();

function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  sessions.set(token, { userId, expiresAt, createdAt: Date.now() });
  return token;
}

function getUserByToken(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  const user = users.find((u) => u.id === session.userId);
  if (!user) return null;
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

// Authentication middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }

  const token = authHeader.slice(7).trim();
  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: "Session expired or invalid token. Please log in again." });
  }

  req.user = user;
  req.token = token;
  next();
}

app.post("/api/auth/login", (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const query = String(identifier).trim().toLowerCase();
  const user = users.find(
    (u) => u.username.toLowerCase() === query || u.email.toLowerCase() === query
  );
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = createSession(user.id);
  const { passwordHash: _, ...safeUser } = user;
  res.json({ message: "Login successful", user: safeUser, token });
});


const workflows = {
  BBMP_LAKES: [
    "Tapal", "AE", "AEE", "EE", "Attendance Certification",
    "AEE", "JC", "Additional Revenue Commissioner", "DCF Fund",
    "EE", "DC Bill", "DCF Payments"
  ],
  STANDARD: [
    "Tapal", "AE", "AEE", "EE", "Attendance Certification",
    "AEE", "JC", "Accounts", "Finance Verification",
    "EE", "DC Bill", "DCF Payments"
  ]
};

// Tower Master In-Memory Store
const towers = new Map([
  [
    "TWR-101",
    {
      id: "TWR-101",
      code: "TWR-BLR-01",
      name: "Bellandur North Inflow Tower",
      ward: "Ward 42, Bellandur",
      zone: "Mahadevapura Zone",
      contractor: "Sri Sai Infratech Projects",
      budget: "₹ 75,00,000",
      budgetNum: 7500000,
      location: "Bellandur North Weir, Zone 4",
      status: "ACTIVE",
      description: "Primary inlet aeration tower and telemetry station monitoring water volume and desiltation.",
      createdAt: new Date(Date.now() - 3600000 * 24 * 60).toISOString()
    }
  ],
  [
    "TWR-102",
    {
      id: "TWR-102",
      code: "TWR-HBL-02",
      name: "Hebbal Lake Aeration Tower",
      ward: "Ward 18, Hebbal",
      zone: "Yelahanka Zone",
      contractor: "Karnataka Water Infrastructure Ltd",
      budget: "₹ 62,50,000",
      budgetNum: 6250000,
      location: "Hebbal Lake Basin, North Gate",
      status: "ACTIVE",
      description: "Secondary aeration tower and bund stabilization monitoring mast.",
      createdAt: new Date(Date.now() - 3600000 * 24 * 45).toISOString()
    }
  ],
  [
    "TWR-103",
    {
      id: "TWR-103",
      code: "TWR-KRM-03",
      name: "Koramangala Valley Drainage Tower",
      ward: "Ward 68, Koramangala",
      zone: "South Zone",
      contractor: "Apex Urban Engineering Corp",
      budget: "₹ 90,00,000",
      budgetNum: 9000000,
      location: "K&C Valley Culvert 3, Near ST Road",
      status: "ACTIVE",
      description: "Stormwater and weir outlet monitoring tower with automated discharge telemetry.",
      createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString()
    }
  ],
  [
    "TWR-104",
    {
      id: "TWR-104",
      code: "TWR-YLH-04",
      name: "Yelahanka Wetland Monitoring Tower",
      ward: "Ward 05, Yelahanka",
      zone: "Yelahanka Zone",
      contractor: "GreenTech Eco Solutions",
      budget: "₹ 45,00,000",
      budgetNum: 4500000,
      location: "Yelahanka Kere Eastern Bund",
      status: "ACTIVE",
      description: "Eco-wetland bird sanctuary and water purification monitoring tower.",
      createdAt: new Date(Date.now() - 3600000 * 24 * 20).toISOString()
    }
  ],
  [
    "TWR-105",
    {
      id: "TWR-105",
      code: "TWR-WTF-05",
      name: "Whitefield Sub-Basin Sluice Tower",
      ward: "Ward 84, Mahadevapura",
      zone: "East Zone",
      contractor: "Vanguard Infra Ventures",
      budget: "₹ 55,00,000",
      budgetNum: 5500000,
      location: "Varthur-Whitefield Canal Point 2",
      status: "MAINTENANCE",
      description: "Sluice gate control tower and silt deposition measurement center.",
      createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString()
    }
  ]
]);

// Helper to parse currency string into number
function parseCurrency(str) {
  if (!str) return 0;
  if (typeof str === "number") return str;
  const cleaned = str.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

// Helper to compute tax and invoice breakdown
function computeInvoiceBreakdown(grossAmount) {
  const gross = typeof grossAmount === "number" ? grossAmount : parseCurrency(grossAmount);
  const gstTds = Math.round(gross * 0.02); // 2% GST TDS
  const itTds = Math.round(gross * 0.02);  // 2% Income Tax TDS
  const laborCess = Math.round(gross * 0.01); // 1% Labor Welfare Cess
  const retention = Math.round(gross * 0.05); // 5% Contractor Security Deposit / Retention
  const totalDeductions = gstTds + itTds + laborCess + retention;
  const netPayable = gross - totalDeductions;
  return {
    gross,
    gstTds,
    itTds,
    laborCess,
    retention,
    totalDeductions,
    netPayable
  };
}

// Curated, site-specific high-resolution inspection photos for each BBMP site/tower
const SITE_INSPECTION_PHOTOS = {
  "TWR-101": [
    {
      id: "photo-blr-01",
      url: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80",
      title: "Inlet Channel Desilting & Excavation",
      caption: "Heavy amphibious excavator removing deep accumulated silt and aquatic weed bed along northern inlet channel chainage 0+150.",
      siteLocation: "Bellandur Lake North Weir (Ward 42)",
      stage: "Step 5 — Executive Engineer Scrutiny",
      geoTag: "12.9352° N, 77.6744° E",
      uploadedBy: "Dr. Priya Sharma (Field Officer (AEE))",
      uploadedAt: new Date(Date.now() - 3600000 * 28).toISOString()
    },
    {
      id: "photo-blr-02",
      url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
      title: "Northern Masonry Silt Weir Restoration",
      caption: "Reconstruction of stone masonry overflow crest, weir baffle wall, and hydraulic discharge apron.",
      siteLocation: "Bellandur North Weir, Zone 4",
      stage: "Step 4 — EE Verification",
      geoTag: "12.9368° N, 77.6755° E",
      uploadedBy: "Dr. Priya Sharma (Field Officer (AEE))",
      uploadedAt: new Date(Date.now() - 3600000 * 36).toISOString()
    },
    {
      id: "photo-blr-03",
      url: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=1200&q=80",
      title: "Western Bund Stone Pitching & Compaction",
      caption: "Granite boulder pitching along the western lake bund embankment slope to protect against scour and erosion.",
      siteLocation: "Bellandur Lake Western Bund",
      stage: "Step 3 — AEE Field Inspection",
      geoTag: "12.9341° N, 77.6710° E",
      uploadedBy: "Dr. Priya Sharma (Field Officer (AEE))",
      uploadedAt: new Date(Date.now() - 3600000 * 42).toISOString()
    },
    {
      id: "photo-blr-04",
      url: "https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=1200&q=80",
      title: "Trash Rack Screen & Intake Culvert Clearing",
      caption: "Inspection of heavy steel bar debris screen and concrete wing walls at stormwater intake culvert.",
      siteLocation: "Bellandur Lake Primary Inflow Point",
      stage: "Step 2 — Assistant Engineer Scrutiny",
      geoTag: "12.9380° N, 77.6772° E",
      uploadedBy: "Dr. Priya Sharma (Field Officer (AEE))",
      uploadedAt: new Date(Date.now() - 3600000 * 46).toISOString()
    }
  ],
  "TWR-102": [
    {
      id: "photo-hbl-01",
      url: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80",
      title: "Lake Surface Aeration Jet Spray Fountains",
      caption: "High-volume aeration spray fountains operating in north basin to super-oxygenate water and prevent algal bloom.",
      siteLocation: "Hebbal Lake Basin, North Gate (Ward 18)",
      stage: "Step 3 — Field Scrutiny",
      geoTag: "13.0458° N, 77.5912° E",
      uploadedBy: "Dr. Priya Sharma (Field Officer (AEE))",
      uploadedAt: new Date(Date.now() - 3600000 * 18).toISOString()
    },
    {
      id: "photo-hbl-02",
      url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
      title: "Compressor Sub-Station & Step-down Transformer",
      caption: "45 kW twin-screw rotary air compressor installation and LT electrical switchgear panel for aeration lines.",
      siteLocation: "Hebbal Lake North Substation Yard",
      stage: "Step 2 — Technical Scrutiny",
      geoTag: "13.0465° N, 77.5925° E",
      uploadedBy: "Dr. Priya Sharma (Field Officer (AEE))",
      uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: "photo-hbl-03",
      url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
      title: "Submerged HDPE Aeration Diffuser Grid",
      caption: "Anchoring of 160mm submerged high-density polyethylene micro-bubble diffuser pipes across 300m lake bed span.",
      siteLocation: "Hebbal Lake Deep Water Zone",
      stage: "Step 2 — Measurement Verification",
      geoTag: "13.0440° N, 77.5900° E",
      uploadedBy: "Dr. Priya Sharma (Field Officer (AEE))",
      uploadedAt: new Date(Date.now() - 3600000 * 30).toISOString()
    },
    {
      id: "photo-hbl-04",
      url: "https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=1200&q=80",
      title: "Optical DO Telemetry Sensor Mast",
      caption: "Solar-powered real-time water dissolved-oxygen telemetry sensor mast and SCADA transmitter.",
      siteLocation: "Hebbal Lake Eastern Bund Mast TWR-102",
      stage: "Step 1 — Docket Initiation",
      geoTag: "13.0470° N, 77.5930° E",
      uploadedBy: "Dr. Priya Sharma (Field Officer (AEE))",
      uploadedAt: new Date(Date.now() - 3600000 * 38).toISOString()
    }
  ],
  "TWR-103": [
    {
      id: "photo-krm-01",
      url: "https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=1200&q=80",
      title: "Stormwater Conduit Deep Channel Desilting",
      caption: "Heavy hydraulic crawler excavator extracting compacted sediment sludge from K&C Valley primary conduit.",
      siteLocation: "K&C Valley Culvert 3 (Ward 68, Koramangala)",
      stage: "Step 8 — Tax Invoice Preparation",
      geoTag: "12.9279° N, 77.6271° E",
      uploadedBy: "Dr. Priya Sharma (Field Officer (AEE))",
      uploadedAt: new Date(Date.now() - 3600000 * 14).toISOString()
    },
    {
      id: "photo-krm-02",
      url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
      title: "Reinforced Concrete Box Culvert Shoring",
      caption: "Structural reinforcement and formwork inspection of M30 concrete barrel culvert soffit and retaining walls.",
      siteLocation: "Koramangala Culvert 3 Junction",
      stage: "Step 7 — Joint Inspection Pass",
      geoTag: "12.9285° N, 77.6280° E",
      uploadedBy: "Rajesh Kumar (Executive Engineer)",
      uploadedAt: new Date(Date.now() - 3600000 * 20).toISOString()
    },
    {
      id: "photo-krm-03",
      url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80",
      title: "Canal Retaining Wall Foundation Sheet Piling",
      caption: "Sheet piling and deep footing excavation for 4.5m cantilever retaining wall to protect roadway embankment.",
      siteLocation: "K&C Valley Chainage 1+800",
      stage: "Step 5 — Executive Engineer Scrutiny",
      geoTag: "12.9265° N, 77.6255° E",
      uploadedBy: "Dr. Priya Sharma (Field Officer (AEE))",
      uploadedAt: new Date(Date.now() - 3600000 * 32).toISOString()
    },
    {
      id: "photo-krm-04",
      url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      title: "Sediment Silt Trap Chamber Cleared",
      caption: "Post-desilting verification of concrete sediment detention chamber before monsoon stormwater discharge.",
      siteLocation: "Koramangala Valley Silt Trap Point C",
      stage: "Step 4 — EE Verification",
      geoTag: "12.9290° N, 77.6292° E",
      uploadedBy: "Dr. Priya Sharma (Field Officer (AEE))",
      uploadedAt: new Date(Date.now() - 3600000 * 45).toISOString()
    }
  ],
  "TWR-104": [
    {
      id: "photo-ylh-01",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      title: "Constructed Wetland Bio-Filter Islands",
      caption: "Constructed bio-filtration wetland beds featuring Typha and Phragmites reeds actively purifying urban inflow.",
      siteLocation: "Yelahanka Kere Eastern Bund (Ward 05)",
      stage: "Step 12 — Statutory Audit & Reconciliation",
      geoTag: "13.1007° N, 77.5963° E",
      uploadedBy: "GreenTech Eco Solutions",
      uploadedAt: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
      id: "photo-ylh-02",
      url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
      title: "Ecology Security Bio-Fencing Boundary",
      caption: "Galvanized heavy chain-link perimeter fence integrated with dense green hedgerow along sanctuary buffer zone.",
      siteLocation: "Yelahanka Wetland Ecological Boundary",
      stage: "Step 11 — Completion Clearance",
      geoTag: "13.1015° N, 77.5980° E",
      uploadedBy: "Dr. Priya Sharma (Field Officer (AEE))",
      uploadedAt: new Date(Date.now() - 3600000 * 16).toISOString()
    },
    {
      id: "photo-ylh-03",
      url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
      title: "Solar Telemetry Tower Array Commissioning",
      caption: "Commissioning of standalone solar photovoltaic array and weather telemetry mast TWR-104.",
      siteLocation: "Yelahanka Kere Monitoring Mast Tower",
      stage: "Step 10 — Disbursal Pre-check",
      geoTag: "13.0995° N, 77.5950° E",
      uploadedBy: "Dr. Priya Sharma (Field Officer (AEE))",
      uploadedAt: new Date(Date.now() - 3600000 * 22).toISOString()
    },
    {
      id: "photo-ylh-04",
      url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
      title: "Riparian Native Shoreline Plantation",
      caption: "Riparian tree saplings and indigenous wetland bushes planted to stabilize bund and support bird roosting.",
      siteLocation: "Yelahanka Lake Island Sanctuary",
      stage: "Step 8 — Financial Scrutiny",
      geoTag: "13.1020° N, 77.5990° E",
      uploadedBy: "GreenTech Eco Solutions",
      uploadedAt: new Date(Date.now() - 3600000 * 35).toISOString()
    }
  ],
  "TWR-105": [
    {
      id: "photo-wtf-01",
      url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80",
      title: "Hydraulic Sluice Gate Spillway Structure",
      caption: "Structural steel vertical sluice gate mounted on reinforced concrete guide piers on Whitefield canal.",
      siteLocation: "Varthur-Whitefield Canal Point 2 (Ward 84)",
      stage: "Step 2 — Technical Scrutiny",
      geoTag: "12.9698° N, 77.7499° E",
      uploadedBy: "Dr. Priya Sharma (Field Officer (AEE))",
      uploadedAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: "photo-wtf-02",
      url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
      title: "Motorized Actuator Gearbox & Piston Ram",
      caption: "Testing 3-phase automated electric actuator and heavy-duty stainless steel lifting spindle mechanism.",
      siteLocation: "Whitefield Sluice Actuator House",
      stage: "Step 2 — Measurement Verification",
      geoTag: "12.9705° N, 77.7510° E",
      uploadedBy: "Vanguard Infra Ventures",
      uploadedAt: new Date(Date.now() - 3600000 * 10).toISOString()
    },
    {
      id: "photo-wtf-03",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      title: "Canal Headworks Spillway & Bypass Regulator",
      caption: "Hydraulic calibration over masonry crest weir upstream of automated regulating sluice gates.",
      siteLocation: "Whitefield Canal Regulator Intake",
      stage: "Step 1 — Docket Initiation",
      geoTag: "12.9685° N, 77.7485° E",
      uploadedBy: "Dr. Priya Sharma (Field Officer (AEE))",
      uploadedAt: new Date(Date.now() - 3600000 * 18).toISOString()
    },
    {
      id: "photo-wtf-04",
      url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
      title: "Ultrasonic Water Level Telemetry Console",
      caption: "PLC telemetry cabinet with ultrasonic level sensor transmitting water level data directly to control center.",
      siteLocation: "Tower TWR-105 Telemetry Enclosure",
      stage: "Step 1 — Docket Initiation",
      geoTag: "12.9710° N, 77.7520° E",
      uploadedBy: "Vanguard Infra Ventures",
      uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ],
  "TWR-106": [
    {
      id: "photo-weir-01",
      url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1200&q=80",
      title: "Completed Stepped Masonry Silt Weir",
      caption: "Completed RR masonry silt detention weir functioning with laminar overflow crest discharge.",
      siteLocation: "Bellandur North Weir, Zone 4 (Ward 42)",
      stage: "Step 12 — File Permanently Closed & Sealed",
      geoTag: "12.9360° N, 77.6750° E",
      uploadedBy: "Rajesh Kumar (System Administrator)",
      uploadedAt: new Date(Date.now() - 3600000 * 24 * 20).toISOString()
    },
    {
      id: "photo-weir-02",
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      title: "Heavy Granite Boulder Pitching & Gabions",
      caption: "Completed wire-mesh gabion stone revetment stabilizing downstream embankment against scour.",
      siteLocation: "Bellandur Silt Weir Embankment",
      stage: "Step 12 — Final Statutory Clearance",
      geoTag: "12.9350° N, 77.6740° E",
      uploadedBy: "Sri Sai Infratech Projects",
      uploadedAt: new Date(Date.now() - 3600000 * 24 * 22).toISOString()
    },
    {
      id: "photo-weir-03",
      url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80",
      title: "Finished Concrete Spillway Apron",
      caption: "Inspection of reinforced concrete apron slab and chute blocks dissipating kinetic energy.",
      siteLocation: "Bellandur Weir Discharge Apron",
      stage: "Step 12 — Final Audit Pass",
      geoTag: "12.9365° N, 77.6758° E",
      uploadedBy: "Rajesh Kumar (System Administrator)",
      uploadedAt: new Date(Date.now() - 3600000 * 24 * 25).toISOString()
    },
    {
      id: "photo-weir-04",
      url: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80",
      title: "Restored Lake Shoreline & Intake Channel",
      caption: "Final handover inspection showing sediment-free inflow channel and restored lake periphery.",
      siteLocation: "Bellandur Inflow Channel Zone 4",
      stage: "Step 12 — Final Completion Handover",
      geoTag: "12.9372° N, 77.6765° E",
      uploadedBy: "Rajesh Kumar (System Administrator)",
      uploadedAt: new Date(Date.now() - 3600000 * 24 * 28).toISOString()
    }
  ]
};

// Helper to get matching site inspection photos based on tower or project keywords
function getDefaultSitePhotosForTower(towerId, projectName = "", ward = "") {
  if (towerId && SITE_INSPECTION_PHOTOS[towerId]) {
    return JSON.parse(JSON.stringify(SITE_INSPECTION_PHOTOS[towerId]));
  }
  const lower = (projectName + " " + ward).toLowerCase();
  if (lower.includes("hebbal") || lower.includes("aerat")) {
    return JSON.parse(JSON.stringify(SITE_INSPECTION_PHOTOS["TWR-102"]));
  }
  if (lower.includes("koramangala") || lower.includes("culvert") || lower.includes("drain")) {
    return JSON.parse(JSON.stringify(SITE_INSPECTION_PHOTOS["TWR-103"]));
  }
  if (lower.includes("yelahanka") || lower.includes("wetland") || lower.includes("fenc")) {
    return JSON.parse(JSON.stringify(SITE_INSPECTION_PHOTOS["TWR-104"]));
  }
  if (lower.includes("whitefield") || lower.includes("sluice") || lower.includes("gate")) {
    return JSON.parse(JSON.stringify(SITE_INSPECTION_PHOTOS["TWR-105"]));
  }
  if (lower.includes("weir") || lower.includes("pitching") || lower.includes("phase 1")) {
    return JSON.parse(JSON.stringify(SITE_INSPECTION_PHOTOS["TWR-106"]));
  }
  return JSON.parse(JSON.stringify(SITE_INSPECTION_PHOTOS["TWR-101"]));
}

// Demo in-memory bills state covering the organization's 34 workflows:
// Reflecting Pilot 1 (BBMP Lakes North), Pilot 2 (BMRCL 80/20), KIADB, Victoria Hospital, KSMCL, KPTCL, Bowring
const bills = new Map([
  [
    "BILL-1001",
    {
      id: "BILL-1001",
      billNumber: "BBMP/LAKES/2026/091",
      client: "BBMP",
      unit: "BBMP Lakes North Zone",
      workflowId: "WF-01-BBMP-LAKES",
      isPilot: true,
      pilotName: "Pilot 1: Municipal Engineering & Double Bill (15 Stages)",
      towerId: "TWR-101",
      projectName: "Bellandur North Inflow Lake Desilting & Masonry Silt Weir",
      projectType: "BBMP_LAKES",
      workflowStatus: "UNDER_REVIEW",
      currentStep: 5,
      currentRole: "Vigilance & Labour Cell",
      currentPerson: "S. Natarajan (Labour Officer)",
      slaStatus: "WITHIN_SLA",
      daysInStage: 1,
      stageSlaDays: 2,
      workOrder: "WO/BBMP/2026/4102",
      contract: "CNT-2025-BBMP-LAK-088",
      billingPeriod: "01 Sep 2026 – 30 Sep 2026",
      billingType: "Double Bill Route (DC Bill + DCF Fund Allocation)",
      paymentStatus: "UNPAID",
      submissionDate: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
      expectedPaymentDate: new Date(Date.now() + 3600000 * 24 * 12).toISOString(),
      amount: "₹ 48,75,000",
      amountNum: 4875000,
      contractor: "Sri Sai Infratech Projects",
      ward: "Ward 42, Bellandur Lake Area",
      mbNumber: "MB-2026/042-A",
      description: "Desilting, bund strengthening, masonry weir restoration and inlet gate civil improvements.",
      photos: JSON.parse(JSON.stringify(SITE_INSPECTION_PHOTOS["TWR-101"])),
      photoUrls: SITE_INSPECTION_PHOTOS["TWR-101"].map((p) => p.url),
      documents: [
        {
          id: "doc-sample-1",
          name: "Ward42_Lake_Desilting_Measurement_Book.pdf",
          type: "pdf",
          size: 142850,
          uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          uploadedBy: "Dr. Priya Sharma (Field Officer (AEE))",
          url: "http://localhost:4000/uploads/demo-measurement-book.pdf"
        },
        {
          id: "doc-sample-2",
          name: "Detailed_Rate_Estimate_BoQ_FY2026.csv",
          type: "excel",
          size: 89400,
          uploadedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          uploadedBy: "Anil Mehta (Accounts & Finance Lead)",
          url: "http://localhost:4000/uploads/demo-estimate-boq.csv"
        }
      ],
      history: [
        {
          step: 1,
          startedAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
          dueAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
          action: "Docketed in Central Tapal Inward Registry (#TPL-2026-8910)",
          performedBy: "M. Ramesh (Tapal Clerk)"
        },
        {
          step: 2,
          startedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
          dueAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
          action: "AE Field Measurements & Geo-tagged photo documentation verified in MB Book #MB-2026/042-A",
          performedBy: "K. Venkatesh (Assistant Engineer)"
        },
        {
          step: 3,
          startedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
          dueAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
          action: "25% Statutory Check-Measurement executed and signed under KPWD Code Art. 219",
          performedBy: "Dr. Priya Sharma (Field Officer (AEE))"
        },
        {
          step: 4,
          startedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
          dueAt: new Date(Date.now() + 3600000 * 24 * 2).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
          action: "Divisional Scrutiny completed and budget head concordance validated",
          performedBy: "Rajesh Kumar (Executive Engineer)"
        },
        {
          step: 5,
          startedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
          dueAt: new Date(Date.now() + 3600000 * 24 * 1).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
          action: "Currently undergoing Biometric Attendance & Form V Labour Welfare Muster scrutiny",
          performedBy: "S. Natarajan (Labour Officer)"
        }
      ]
    }
  ],
  [
    "BILL-1002",
    {
      id: "BILL-1002",
      billNumber: "BMRCL/PW-80/2026/044",
      client: "BMRCL",
      unit: "BMRCL Project Wing 80%",
      workflowId: "WF-09-BMRCL-PROJECT",
      isPilot: true,
      pilotName: "Pilot 2: Transit Milestone (80% Operational Stream via CSO & GM Ops)",
      towerId: "TWR-102",
      projectName: "Reach 3-C Elevated Metro Viaduct & Pier Cap Structural Works",
      projectType: "STANDARD",
      workflowStatus: "UNDER_REVIEW",
      currentStep: 4,
      currentRole: "GM Operations & E-Office",
      currentPerson: "R. Chandrashekhar, KAS (GM Operations)",
      slaStatus: "APPROACHING_SLA",
      daysInStage: 2.5,
      stageSlaDays: 3,
      workOrder: "WO-BMRCL-772-R3C",
      contract: "CNT-BMRCL-2024-EP104",
      billingPeriod: "01 Aug 2026 – 31 Aug 2026 (Milestone 4)",
      billingType: "Split Milestone Billing (80% Ops / 20% Retention)",
      paymentStatus: "UNPAID",
      submissionDate: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      expectedPaymentDate: new Date(Date.now() + 3600000 * 24 * 5).toISOString(),
      amount: "₹ 1,25,00,000",
      amountNum: 12500000,
      contractor: "Karnataka Infrastructure & Metro Constr Ltd",
      ward: "Reach 3-C Peenya-Jalahalli Corridor",
      mbNumber: "MB-BMRCL-2026-991",
      description: "80% milestone bill for pier structural casting, bearing installation, and viaduct segments.",
      photos: JSON.parse(JSON.stringify(SITE_INSPECTION_PHOTOS["TWR-102"])),
      photoUrls: SITE_INSPECTION_PHOTOS["TWR-102"].map((p) => p.url),
      documents: [],
      history: [
        {
          step: 1,
          startedAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
          dueAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
          action: "Bill submitted officially to CSO Office docketing desk",
          performedBy: "Metro Safety Registrar"
        },
        {
          step: 2,
          startedAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
          dueAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
          action: "Safety & Site Inspection Clearance signed by Assistant Security/Civil Officer (ASCO)",
          performedBy: "M. G. Suresh (ASCO Reach 3)"
        },
        {
          step: 3,
          startedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
          dueAt: new Date(Date.now() - 3600000 * 24 * 2.5).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 2.5).toISOString(),
          action: "Chief Security Officer formal operational concurrence issued",
          performedBy: "Col. Sanjeev Varma (CSO BMRCL)"
        },
        {
          step: 4,
          startedAt: new Date(Date.now() - 3600000 * 24 * 2.5).toISOString(),
          dueAt: new Date(Date.now() + 3600000 * 12).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 2.5).toISOString(),
          action: "In E-Office queue for General Manager (Operations) sanction",
          performedBy: "R. Chandrashekhar, KAS (GM Operations)"
        }
      ]
    }
  ],
  [
    "BILL-1003",
    {
      id: "BILL-1003",
      billNumber: "BMRCL/PW-20/2026/045",
      client: "BMRCL",
      unit: "BMRCL Project Wing 20%",
      workflowId: "WF-09-BMRCL-PROJECT",
      isPilot: true,
      pilotName: "Pilot 2: Transit Milestone (20% Statutory HR Retention Stream)",
      towerId: "TWR-102",
      projectName: "Reach 3-C Viaduct Statutory Retention (20% Balance Release)",
      projectType: "STANDARD",
      workflowStatus: "UNDER_REVIEW",
      currentStep: 2,
      currentRole: "HR Manager & Statutory Cell",
      currentPerson: "Kavita Rao (Senior Manager HR)",
      slaStatus: "BREACHED_SLA",
      daysInStage: 5,
      stageSlaDays: 2,
      overdueDays: 3,
      flagReason: "Pending statutory EPF ECR scroll reconciliation for 142 subcontracted workers.",
      workOrder: "WO-BMRCL-772-RET",
      contract: "CNT-BMRCL-2024-EP104",
      billingPeriod: "Statutory Retention Period (20% Release)",
      billingType: "Statutory Retention & Security Deposit Release",
      paymentStatus: "OVERDUE",
      submissionDate: new Date(Date.now() - 3600000 * 24 * 9).toISOString(),
      expectedPaymentDate: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      amount: "₹ 31,25,000",
      amountNum: 3125000,
      contractor: "Karnataka Infrastructure & Metro Constr Ltd",
      ward: "Reach 3-C Peenya-Jalahalli Corridor",
      mbNumber: "MB-BMRCL-2026-991/RET",
      description: "20% statutory retention release conditional on EPF/ESI and minimum wage compliance certificates.",
      photos: JSON.parse(JSON.stringify(SITE_INSPECTION_PHOTOS["TWR-102"])),
      photoUrls: SITE_INSPECTION_PHOTOS["TWR-102"].map((p) => p.url),
      documents: [],
      history: [
        {
          step: 1,
          startedAt: new Date(Date.now() - 3600000 * 24 * 9).toISOString(),
          dueAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
          action: "20% Retention bill dossier received with initial statutory declarations",
          performedBy: "HR Compliance Officer"
        },
        {
          step: 2,
          startedAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
          dueAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
          action: "BREACHED SLA: HR Manager verification stalled. 142 labour EPF challans mismatch site muster.",
          performedBy: "Kavita Rao (Senior Manager HR)"
        }
      ]
    }
  ],
  [
    "BILL-1004",
    {
      id: "BILL-1004",
      billNumber: "KIADB/HARO/2026/019",
      client: "KIADB",
      unit: "KIADB Harohalli Industrial Area",
      workflowId: "WF-17-KIADB-HAROHALLI",
      towerId: "TWR-103",
      projectName: "Harohalli Phase 2 Industrial Effluent Pipeline & Road Resurfacing",
      projectType: "STANDARD",
      workflowStatus: "UNDER_REVIEW",
      currentStep: 6,
      currentRole: "Development Commissioner (DC)",
      currentPerson: "Dr. Manjunath Swamy, IAS (DC KIADB)",
      slaStatus: "APPROACHING_SLA",
      daysInStage: 2,
      stageSlaDays: 3,
      workOrder: "WO-KIADB-2025-081",
      contract: "CNT-KIADB-2025-HARO-019",
      billingPeriod: "01 Aug 2026 – 31 Aug 2026",
      billingType: "Monthly Running Account (RA) Bill",
      paymentStatus: "UNPAID",
      submissionDate: new Date(Date.now() - 3600000 * 24 * 11).toISOString(),
      expectedPaymentDate: new Date(Date.now() + 3600000 * 24 * 4).toISOString(),
      amount: "₹ 64,50,000",
      amountNum: 6450000,
      contractor: "Apex Urban Engineering Corp",
      ward: "Harohalli Industrial Area Sector 2",
      mbNumber: "MB-KIADB-2026-081",
      description: "HDPE effluent transmission pipeline, RCC storm drain culverts, and asphalt paving.",
      photos: JSON.parse(JSON.stringify(SITE_INSPECTION_PHOTOS["TWR-103"])),
      photoUrls: SITE_INSPECTION_PHOTOS["TWR-103"].map((p) => p.url),
      documents: [],
      history: [
        {
          step: 1,
          startedAt: new Date(Date.now() - 3600000 * 24 * 11).toISOString(),
          dueAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
          action: "Tapal inward registration at KIADB DO-EE1 Office",
          performedBy: "Inward Section"
        },
        {
          step: 5,
          startedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
          dueAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          action: "Head Office General Manager clearance issued",
          performedBy: "GM Industrial Areas"
        },
        {
          step: 6,
          startedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          dueAt: new Date(Date.now() + 3600000 * 24 * 1).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          action: "In queue for Development Commissioner executive sanction",
          performedBy: "Dr. Manjunath Swamy, IAS"
        }
      ]
    }
  ],
  [
    "BILL-1005",
    {
      id: "BILL-1005",
      billNumber: "BMCRI/VIC/2026/088",
      client: "BMCRI",
      unit: "Victoria Hospital Housekeeping & Security",
      workflowId: "WF-06-VICTORIA-HOSPITAL",
      towerId: "TWR-105",
      projectName: "Victoria Hospital Trauma & Emergency Wards Deep Sanitation",
      projectType: "STANDARD",
      workflowStatus: "UNDER_REVIEW",
      currentStep: 12,
      currentRole: "Chief Accounts Officer (CAO)",
      currentPerson: "G. Shivarudraiah (CAO BMCRI)",
      slaStatus: "BREACHED_SLA",
      daysInStage: 6,
      stageSlaDays: 3,
      overdueDays: 3,
      flagReason: "Rate parity dispute between vendor quote and Karnataka State Medical Supplies Corporation schedule.",
      workOrder: "WO-BMCRI-2026-VIC-09",
      contract: "CNT-BMCRI-2025-HOSP-012",
      billingPeriod: "01 Sep 2026 – 30 Sep 2026",
      billingType: "Monthly Running Account (RA) Bill",
      paymentStatus: "OVERDUE",
      submissionDate: new Date(Date.now() - 3600000 * 24 * 18).toISOString(),
      expectedPaymentDate: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
      amount: "₹ 38,90,000",
      amountNum: 3890000,
      contractor: "Vanguard Infra Ventures",
      ward: "Victoria Hospital Fort Campus",
      mbNumber: "MB-MED-2026-VIC-09",
      description: "ICU ward bio-sanitation, bio-medical waste segregation and 24x7 security personnel deployment.",
      photos: JSON.parse(JSON.stringify(SITE_INSPECTION_PHOTOS["TWR-105"])),
      photoUrls: SITE_INSPECTION_PHOTOS["TWR-105"].map((p) => p.url),
      documents: [],
      history: [
        {
          step: 1,
          startedAt: new Date(Date.now() - 3600000 * 24 * 18).toISOString(),
          dueAt: new Date(Date.now() - 3600000 * 24 * 17).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 17).toISOString(),
          action: "Hospital Tapal inward recorded",
          performedBy: "Registry Clerk"
        },
        {
          step: 4,
          startedAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
          dueAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
          action: "Nursing Matron Ward Cleanliness Certificate endorsed",
          performedBy: "Sister Stella (Matron)"
        },
        {
          step: 12,
          startedAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
          dueAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
          action: "BREACHED SLA: CAO audit calculation delayed over chemical disinfectant unit price parity",
          performedBy: "G. Shivarudraiah (CAO)"
        }
      ]
    }
  ],
  [
    "BILL-1006",
    {
      id: "BILL-1006",
      billNumber: "KSMCL/MINES/2026/012",
      client: "KSMCL",
      unit: "KSMCL Mineral Exploration & Mining Areas",
      workflowId: "WF-23-KSMCL",
      towerId: "TWR-101",
      projectName: "Sandur Subbarayanahalli Iron Ore Weighbridge & Perimeter Security",
      projectType: "STANDARD",
      workflowStatus: "PAID",
      currentStep: 9,
      currentRole: "Treasury & Disbursements",
      currentPerson: "SBI State Treasury Branch",
      slaStatus: "WITHIN_SLA",
      daysInStage: 0,
      stageSlaDays: 1,
      workOrder: "WO-KSMCL-2026-SANDUR-004",
      contract: "CNT-KSMCL-2024-MIN-007",
      billingPeriod: "01 Aug 2026 – 31 Aug 2026",
      billingType: "Monthly Running Account (RA) Bill",
      paymentStatus: "PAID",
      submissionDate: new Date(Date.now() - 3600000 * 24 * 22).toISOString(),
      expectedPaymentDate: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      amount: "₹ 84,20,000",
      amountNum: 8420000,
      contractor: "Sri Sai Infratech Projects",
      ward: "Sandur Mining Division",
      mbNumber: "MB-MINE-2026-004",
      description: "Armed security for ore weighbridges, perimeter solar fencing, and mineral transport check-posts.",
      invoiceData: {
        invoiceNo: "INV-2026-KSMCL-012",
        invoiceDate: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
        gross: 8420000,
        gstTds: 168400,
        itTds: 168400,
        laborCess: 84200,
        retention: 421000,
        totalDeductions: 842000,
        netPayable: 7578000
      },
      paymentData: {
        utrNumber: "SBIN2026101299831",
        paidDate: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        paymentMode: "RTGS Electronic Bank Transfer",
        bankName: "State Bank of India - Mining Corporate Account",
        amountPaid: 7578000,
        voucherId: "VCH-2026-KSMCL-0012"
      },
      photos: JSON.parse(JSON.stringify(SITE_INSPECTION_PHOTOS["TWR-106"])),
      photoUrls: SITE_INSPECTION_PHOTOS["TWR-106"].map((p) => p.url),
      documents: [],
      history: [
        {
          step: 9,
          startedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          dueAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          action: "Payment completed via RTGS #SBIN2026101299831. Amount: ₹ 75,78,000",
          performedBy: "Anil Mehta (Accounts & Finance Lead)"
        }
      ]
    }
  ],
  [
    "BILL-1007",
    {
      id: "BILL-1007",
      billNumber: "KPTCL/TL/2026/033",
      client: "KPTCL",
      unit: "KPTCL Transmission Sub-Stations Wing",
      workflowId: "WF-22-KPTCL",
      towerId: "TWR-104",
      projectName: "220kV Yelahanka-Hebbal Major Sub-station Perimeter Security",
      projectType: "STANDARD",
      workflowStatus: "UNDER_REVIEW",
      currentStep: 3,
      currentRole: "Administrative Officer",
      currentPerson: "M. B. Patil (Zonal AO)",
      slaStatus: "WITHIN_SLA",
      daysInStage: 1,
      stageSlaDays: 2,
      workOrder: "WO-KPTCL-2026-YEL-033",
      contract: "CNT-KPTCL-2025-SUB-041",
      billingPeriod: "01 Sep 2026 – 30 Sep 2026",
      billingType: "Monthly Running Account (RA) Bill",
      paymentStatus: "UNPAID",
      submissionDate: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
      expectedPaymentDate: new Date(Date.now() + 3600000 * 24 * 8).toISOString(),
      amount: "₹ 29,80,000",
      amountNum: 2980000,
      contractor: "GreenTech Eco Solutions",
      ward: "Yelahanka 220kV Substation",
      mbNumber: "MB-KPTCL-2026-033",
      description: "Sub-station yard perimeter security guards, shift muster, and thermal camera patrol.",
      photos: JSON.parse(JSON.stringify(SITE_INSPECTION_PHOTOS["TWR-104"])),
      photoUrls: SITE_INSPECTION_PHOTOS["TWR-104"].map((p) => p.url),
      documents: [],
      history: [
        {
          step: 1,
          startedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
          dueAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
          action: "Tapal inward completed at KPTCL Zonal Office",
          performedBy: "Zonal Inward Section"
        },
        {
          step: 3,
          startedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
          dueAt: new Date(Date.now() + 3600000 * 24 * 1).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
          action: "Administrative Officer scrutinizing shift guard muster rolls",
          performedBy: "M. B. Patil (Zonal AO)"
        }
      ]
    }
  ],
  [
    "BILL-1008",
    {
      id: "BILL-1008",
      billNumber: "BOWRING/HK/2026/015",
      client: "Bowring Hospital",
      unit: "Bowring & Lady Curzon Hospital and Gosha",
      workflowId: "WF-13-BOWRING-HOSPITAL",
      towerId: "TWR-105",
      projectName: "Bowring Hospital In-patient Wards Deep Sanitation & Hygiene Services",
      projectType: "STANDARD",
      workflowStatus: "REJECTED_EDIT",
      rejectionReason: "Discrepancy in biometric muster count (128 certified) vs EPF/ESI payment challan (114 listed). Revised challan and explanatory reconciliation statement required from vendor.",
      rejectedBy: "Anil Mehta (Accounts & Finance Lead)",
      rejectedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      currentStep: 7,
      currentRole: "Case Worker (Return Queue)",
      currentPerson: "Deepa Hegde (Case Worker)",
      slaStatus: "BREACHED_SLA",
      daysInStage: 2,
      stageSlaDays: 2,
      workOrder: "WO-BOWRING-2026-015",
      contract: "CNT-BOWRING-2025-SAN-003",
      billingPeriod: "01 Sep 2026 – 30 Sep 2026",
      billingType: "Monthly Running Account (RA) Bill",
      paymentStatus: "OVERDUE",
      submissionDate: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
      expectedPaymentDate: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      amount: "₹ 22,10,000",
      amountNum: 2210000,
      contractor: "Vanguard Infra Ventures",
      ward: "Bowring Hospital Shivajinagar Campus",
      mbNumber: "MB-MED-2026-BOW-15",
      description: "General and maternity wards housekeeping, OT disinfection and clinical linen laundry.",
      photos: JSON.parse(JSON.stringify(SITE_INSPECTION_PHOTOS["TWR-105"])),
      photoUrls: SITE_INSPECTION_PHOTOS["TWR-105"].map((p) => p.url),
      documents: [],
      history: [
        {
          step: 1,
          startedAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
          dueAt: new Date(Date.now() - 3600000 * 24 * 13).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 24 * 13).toISOString(),
          action: "Tapal inward recorded",
          performedBy: "Registry"
        },
        {
          step: 7,
          startedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
          dueAt: new Date(Date.now() + 3600000 * 24 * 1).toISOString(),
          savedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
          action: "RETURNED / REJECTED in Review: EPF/ESI shortfall for 14 staff. Routed to EDIT.",
          performedBy: "Anil Mehta (Accounts & Finance Lead)"
        }
      ]
    }
  ]
]);

function stagesFor(bill) {
  if (bill && bill.workflowId) {
    const wf = workflowEngine.getWorkflowById(bill.workflowId);
    if (wf && wf.stages && wf.stages.length > 0) return wf.stages.map((s) => s.name);
  }
  return workflows[bill.projectType] || workflows.STANDARD;
}

function getWorkflowForBill(bill) {
  if (bill && bill.workflowId) {
    return workflowEngine.getWorkflowById(bill.workflowId) || null;
  }
  return null;
}

// ============================================================
// 6. WORKFLOW TRACKING & CANONICAL 5-PHASE JOURNEY MAPPING
// Requirement:
// "Each bill shall display its complete journey:
//  Submission → Approval stages → Finance → Audit, where applicable → Payment
//  The system shall show:
//  Completed stages, Current stage, Pending stage, Date entered into stage,
//  Days pending, SLA, SLA status, Next stage"
// ============================================================

function getCanonicalPhase(stageName = "", step = 1, total = 12) {
  const s = (stageName || "").toLowerCase();
  if (
    step === 1 ||
    s.includes("tapal") ||
    s.includes("inward") ||
    s.includes("docket") ||
    s.includes("submission") ||
    s.includes("registry") ||
    s.includes("bill to cso")
  ) {
    return { id: "submission", label: "Submission", shortLabel: "Submission", icon: "📥", order: 1 };
  }
  if (
    step === total ||
    s.includes("payment") ||
    s.includes("disburse") ||
    s.includes("cheque") ||
    s.includes("rtgs") ||
    s.includes("remittance") ||
    s.includes("treasury payment") ||
    s.includes("fund release") ||
    s.includes("closure")
  ) {
    return { id: "payment", label: "Payment", shortLabel: "Payment", icon: "💳", order: 5 };
  }
  if (
    s.includes("audit") ||
    s.includes("pre-audit") ||
    s.includes("dc bill") ||
    s.includes("reconciliation") ||
    s.includes("scrutiny sheet") ||
    s.includes("audit cert") ||
    s.includes("audit approval")
  ) {
    return { id: "audit", label: "Audit, where applicable", shortLabel: "Audit", icon: "🛡️", order: 4 };
  }
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
    return { id: "finance", label: "Finance", shortLabel: "Finance", icon: "💰", order: 3 };
  }
  return { id: "approval", label: "Approval stages", shortLabel: "Approval stages", icon: "✍️", order: 2 };
}

function getWorkflowTrackingData(b) {
  if (!b) return null;
  const stages = stagesFor(b);
  const totalSteps = stages.length;
  const currentStep = Math.min(Math.max(b.currentStep || 1, 1), totalSteps);

  // 4. Date entered into stage
  let dateEnteredIntoStage = b.dateEnteredIntoStage;
  if (!dateEnteredIntoStage) {
    const curHist = (b.history || []).slice().reverse().find((h) => h.step === currentStep);
    if (curHist && (curHist.startedAt || curHist.savedAt)) {
      dateEnteredIntoStage = curHist.startedAt || curHist.savedAt;
    } else if (b.submissionDate) {
      const elapsedDays = Math.max(1, (currentStep - 1) * 2);
      const subMs = new Date(b.submissionDate).getTime();
      dateEnteredIntoStage = new Date(subMs + elapsedDays * 86400000).toISOString();
    } else {
      dateEnteredIntoStage = new Date().toISOString();
    }
  }

  // 5. Days pending
  let daysPending = b.daysInStage !== undefined ? b.daysInStage : b.daysPending;
  if (daysPending === undefined || daysPending === null) {
    const diffMs = Math.max(0, Date.now() - new Date(dateEnteredIntoStage).getTime());
    daysPending = Math.round((diffMs / 86400000) * 10) / 10;
  }
  daysPending = Number(daysPending) || 0;

  // 6. SLA
  const currentStageName = stages[currentStep - 1] || `Step ${currentStep}`;
  const stageSlaDays = Number(b.stageSlaDays) || 2;
  const slaText = `${stageSlaDays} Day${stageSlaDays > 1 ? "s" : ""} (${stageSlaDays * 24}h)`;

  // 7. SLA status
  let slaStatus = b.slaStatus;
  if (!slaStatus) {
    if (daysPending > stageSlaDays) slaStatus = "BREACHED_SLA";
    else if (daysPending >= stageSlaDays * 0.75) slaStatus = "APPROACHING_SLA";
    else slaStatus = "WITHIN_SLA";
  }

  const slaPercentageConsumed = Math.min(
    200,
    Math.round((daysPending / Math.max(1, stageSlaDays)) * 100)
  );

  // 1. Completed stages
  const completedStages = [];
  for (let i = 0; i < currentStep - 1; i++) {
    const stepNum = i + 1;
    const name = stages[i];
    const ph = getCanonicalPhase(name, stepNum, totalSteps);
    const hist = (b.history || []).find((h) => h.step === stepNum);
    completedStages.push({
      step: stepNum,
      name,
      phaseId: ph.id,
      phaseLabel: ph.label,
      phaseIcon: ph.icon,
      completedAt: hist?.savedAt || hist?.dueAt || null,
      authorizedBy: hist?.performedBy || "Verified Authority"
    });
  }

  // 2. Current stage
  const curPhase = getCanonicalPhase(currentStageName, currentStep, totalSteps);
  const currentStage = {
    step: currentStep,
    name: currentStageName,
    role: b.currentRole || "Assigned Officer",
    person: b.currentPerson || "Responsible Authority",
    phaseId: curPhase.id,
    phaseLabel: curPhase.label,
    phaseIcon: curPhase.icon,
    dateEntered: dateEnteredIntoStage,
    daysPending,
    slaDays: stageSlaDays,
    slaText,
    slaStatus,
    slaPercentageConsumed
  };

  // 3. Pending stage
  const pendingStage = {
    step: currentStep,
    name: currentStageName,
    role: b.currentRole || "Pending Review Authority",
    status: "AWAITING_CLEARANCE",
    phaseLabel: curPhase.label,
    remainingStagesCount: totalSteps - currentStep + 1
  };

  // 8. Next stage
  let nextStage = null;
  if (currentStep < totalSteps) {
    const nextStep = currentStep + 1;
    const nextName = stages[nextStep - 1];
    const nextPh = getCanonicalPhase(nextName, nextStep, totalSteps);
    nextStage = {
      step: nextStep,
      name: nextName,
      phaseId: nextPh.id,
      phaseLabel: nextPh.label,
      role: "Next Reviewing Authority",
      slaDays: 2,
      isFinal: nextStep === totalSteps
    };
  } else {
    nextStage = {
      step: totalSteps,
      name: "Disbursement & File Closure",
      phaseId: "payment",
      phaseLabel: "Payment",
      role: "Treasury Officer",
      slaDays: 1,
      isFinal: true
    };
  }

  // 5 Canonical Journey Phases summary:
  // Submission → Approval stages → Finance → Audit, where applicable → Payment
  const canonicalBuckets = [
    { id: "submission", label: "Submission", icon: "📥", stages: [] },
    { id: "approval", label: "Approval stages", icon: "✍️", stages: [] },
    { id: "finance", label: "Finance", icon: "💰", stages: [] },
    { id: "audit", label: "Audit, where applicable", icon: "🛡️", stages: [] },
    { id: "payment", label: "Payment", icon: "💳", stages: [] }
  ];

  stages.forEach((name, idx) => {
    const sNum = idx + 1;
    const ph = getCanonicalPhase(name, sNum, totalSteps);
    const target = canonicalBuckets.find((c) => c.id === ph.id) || canonicalBuckets[1];
    target.stages.push({
      step: sNum,
      name,
      completed: sNum < currentStep,
      active: sNum === currentStep,
      pending: sNum > currentStep
    });
  });

  const journeyPhases = canonicalBuckets.map((ph) => {
    const totalCount = ph.stages.length;
    if (totalCount === 0) {
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

  return {
    billId: b.id,
    billNumber: b.billNumber || b.id,
    projectName: b.projectName,
    client: b.client || "BBMP",
    unit: b.unit || b.ward || "Municipal Unit",
    totalStages: totalSteps,
    progressPercentage: Math.round(((currentStep - 1) / totalSteps) * 100),
    completedStages,
    completedStagesCount: completedStages.length,
    currentStage,
    pendingStage,
    pendingStagesCount: totalSteps - currentStep + 1,
    dateEnteredIntoStage,
    daysPending,
    sla: slaText,
    stageSlaDays,
    slaStatus,
    slaPercentageConsumed,
    nextStage,
    journeyPhases
  };
}

// ============================================================
// 5. BILL MASTER / TRANSACTION HELPER
// Enforces minimum proposed information:
// 1. Bill ID (Unique)
// 2. Bill number
// 3. Client
// 4. Unit
// 5. Work Order
// 6. Contract
// 7. Billing period
// 8. Billing type
// 9. Bill amount
// 10. Submission date
// 11. Expected payment date
// 12. Current stage
// 13. Current responsible person/role
// 14. Status
// 15. Payment status
// + 6. Complete Workflow Tracking Parameters
// ============================================================
function getBillMasterRecord(b) {
  if (!b) return null;
  const tower = towers.get(b.towerId);
  const stages = stagesFor(b);
  const currentStep = b.currentStep || 1;
  const currentStageName = stages[currentStep - 1] || `Step ${currentStep}`;
  const currentRole = b.currentRole || (stages[currentStep - 1] || "Officer");
  const currentPerson = b.currentPerson || "Assigned Officer";

  // Derive payment status if not explicitly set
  let paymentStatus = b.paymentStatus;
  if (!paymentStatus) {
    if (b.workflowStatus === "PAID" || b.workflowStatus === "CLOSED" || b.paymentData) {
      paymentStatus = "PAID";
    } else if (b.workflowStatus === "PAYMENT" || b.workflowStatus === "PAYMENT_PENDING") {
      paymentStatus = "PROCESSING";
    } else if (b.expectedPaymentDate && new Date(b.expectedPaymentDate).getTime() < Date.now()) {
      paymentStatus = "OVERDUE";
    } else {
      paymentStatus = "UNPAID";
    }
  }

  // Calculate 6. Workflow Tracking
  const workflowTracking = getWorkflowTrackingData(b);

  return {
    // === 15 MANDATORY PROPOSED INFORMATION FIELDS ===
    id: b.id, // 1. Bill ID (Unique)
    billNumber: b.billNumber || b.id, // 2. Bill number
    client: b.client || "BBMP", // 3. Client
    unit: b.unit || b.ward || "Municipal Unit", // 4. Unit
    workOrder: b.workOrder || b.workOrderNo || "WO/BBMP/2026/001", // 5. Work Order
    contract: b.contract || b.contractNo || "CNT-2025-GEN-001", // 6. Contract
    billingPeriod: b.billingPeriod || "Current RA Period", // 7. Billing period
    billingType: b.billingType || "Monthly Running Account (RA) Bill", // 8. Billing type
    amount: b.amount || "₹ 35,00,000", // 9. Bill amount
    amountNum: b.amountNum || parseCurrency(b.amount),
    submissionDate: b.submissionDate || new Date().toISOString(), // 10. Submission date
    expectedPaymentDate: b.expectedPaymentDate || null, // 11. Expected payment date
    currentStage: currentStageName, // 12. Current stage
    currentStageName,
    currentStep,
    totalSteps: stages.length,
    currentRole, // 13. Current responsible person/role
    currentPerson,
    responsiblePersonRole: `${currentPerson} (${currentRole})`,
    workflowStatus: b.workflowStatus || "UNDER_REVIEW", // 14. Status
    status: b.workflowStatus || "UNDER_REVIEW",
    paymentStatus, // 15. Payment status

    // === 6. WORKFLOW TRACKING MANDATED PARAMETERS ===
    completedStagesCount: workflowTracking.completedStagesCount,
    completedStages: workflowTracking.completedStages,
    dateEnteredIntoStage: workflowTracking.dateEnteredIntoStage,
    daysPending: workflowTracking.daysPending,
    stageSla: workflowTracking.sla,
    stageSlaDays: workflowTracking.stageSlaDays,
    slaStatus: workflowTracking.slaStatus,
    pendingStage: workflowTracking.pendingStage,
    pendingStageName: workflowTracking.pendingStage.name,
    pendingStagesCount: workflowTracking.pendingStagesCount,
    nextStage: workflowTracking.nextStage,
    nextStageName: workflowTracking.nextStage?.name || "Disbursed",
    canonicalPhase: workflowTracking.currentStage.phaseLabel,
    canonicalPhaseId: workflowTracking.currentStage.phaseId,
    journeyPhases: workflowTracking.journeyPhases,
    workflowTracking,

    // Contextual workflow metadata
    workflowId: b.workflowId || null,
    isPilot: Boolean(b.isPilot),
    pilotName: b.pilotName || null,
    towerId: b.towerId || null,
    towerCode: tower?.code || "TWR-GEN",
    towerName: tower?.name || "General Tower",
    projectName: b.projectName || b.id,
    projectType: b.projectType || "BBMP_LAKES",
    daysInStage: workflowTracking.daysPending,
    overdueDays: b.overdueDays || 0,
    flagReason: b.flagReason || null,
    contractor: b.contractor || "State Public Works Contractor",
    ward: b.ward || b.unit || "General Municipality",
    mbNumber: b.mbNumber || "",
    description: b.description || "",
    documentsCount: (b.documents || []).length,
    historyCount: (b.history || []).length,
    invoiceData: b.invoiceData || null,
    paymentData: b.paymentData || null,
    rejectionReason: b.rejectionReason || null,
    rejectedBy: b.rejectedBy || null,
    rejectedAt: b.rejectedAt || null,
    closedAt: b.closedAt || null,
    closedBy: b.closedBy || null
  };
}

// Auth logout and profile endpoints
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    sessions.delete(token);
  }
  res.json({ message: "Successfully logged out." });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Demo accounts endpoint so frontend can display available demo roles for easy testing
app.get("/api/auth/demo-users", (_req, res) => {
  const demoList = users.map((u) => ({
    username: u.username,
    email: u.email,
    name: u.name,
    role: u.role,
    department: u.department,
    badgeColor: u.badgeColor,
    samplePassword: (u.username === "billing_tower" || u.username === "admin") ? "#bill@2026" : `${u.username}123`
  }));
  res.json(demoList);
});

// Helper to scan disk and ensure all uploaded PDFs are analyzed
async function ensureBillDocumentsAnalyzed(bill) {
  if (!bill.documents) bill.documents = [];

  try {
    const files = fs.readdirSync(uploadsDir);
    for (const f of files) {
      if (f.toLowerCase().endsWith(".pdf")) {
        const filePath = path.join(uploadsDir, f);
        const existsInBill = bill.documents.find((d) => d.url && d.url.includes(f));
        if (!existsInBill) {
          try {
            const stats = fs.statSync(filePath);
            const buf = fs.readFileSync(filePath);
            const cleanName = f.replace(/^\d+_/, "");
            const analysis = await analyzePdfDocument(buf, cleanName, stats.size);
            bill.documents.push({
              id: `doc_${crypto.randomUUID()}`,
              name: cleanName,
              type: "pdf",
              extension: "PDF",
              size: stats.size,
              uploadedAt: stats.mtime.toISOString(),
              uploadedBy: "Administrative / Project Records",
              url: `http://localhost:4000/uploads/${f}`,
              pdfAnalysis: analysis
            });
          } catch (fileErr) {
            console.warn(`Could not read/analyze ${f}:`, fileErr.message);
          }
        }
      }
    }
  } catch (dirErr) {
    console.warn("Could not scan uploads dir:", dirErr.message);
  }

  // Ensure any existing PDF doc lacking pdfAnalysis is analyzed
  for (const doc of bill.documents) {
    if (doc.type === "pdf" && !doc.pdfAnalysis && doc.url) {
      try {
        const fileNameOnDisk = path.basename(doc.url);
        const diskPath = path.join(uploadsDir, fileNameOnDisk);
        if (fs.existsSync(diskPath)) {
          const buf = fs.readFileSync(diskPath);
          doc.pdfAnalysis = await analyzePdfDocument(buf, doc.name, doc.size || buf.length);
        }
      } catch (err) {
        console.warn(`Could not analyze existing doc ${doc.name}:`, err.message);
      }
    }
  }
}

// ========================================================
// PHASE I: CONFIGURABLE DIGITAL WORKFLOW ENGINE & MASTERS
// ========================================================

// 1. ALL MASTERS OVERVIEW (Clients, Units, Services, Billing Types, Bills/Transactions, Roles, Persons, SLAs, Docs, Escalations)
app.get("/api/masters/all", (_req, res) => {
  try {
    const data = workflowEngine.getAllMasters();
    data.bills = Array.from(bills.values()).map(getBillMasterRecord);
    if (!data.metrics) data.metrics = {};
    data.metrics.totalBills = data.bills.length;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch master repository: " + err.message });
  }
});

// 2. SPECIFIC MASTER LIST
app.get("/api/masters/:type", (req, res) => {
  try {
    if (req.params.type === "bills" || req.params.type === "bill-master") {
      return res.json(Array.from(bills.values()).map(getBillMasterRecord));
    }
    const list = workflowEngine.getMasterList(req.params.type);
    res.json(list);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. CREATE MASTER ITEM
app.post("/api/masters/:type", requireAuth, (req, res) => {
  try {
    if (req.params.type === "bills" || req.params.type === "bill-master") {
      const bData = req.body;
      const rawId = (bData.id || "").trim().toUpperCase();
      if (!rawId) {
        return res.status(400).json({ error: "Unique Bill ID is mandatory." });
      }
      const billId = rawId.startsWith("BILL-") ? rawId : `BILL-${rawId}`;
      if (bills.has(billId)) {
        return res.status(409).json({ error: `Every bill shall have a unique Bill ID. "${billId}" already exists.` });
      }

      const numAmount = parseCurrency(bData.amount) || bData.amountNum || 3500000;
      const formattedAmount = `₹ ${numAmount.toLocaleString("en-IN")}`;
      const now = new Date();

      const newBill = {
        id: billId,
        billNumber: bData.billNumber?.trim() || `INV/2026/${Math.floor(100 + Math.random() * 900)}`,
        client: bData.client?.trim() || "BBMP",
        unit: bData.unit?.trim() || "Municipal Unit",
        workOrder: bData.workOrder?.trim() || `WO/BBMP/2026/${Math.floor(1000 + Math.random() * 9000)}`,
        contract: bData.contract?.trim() || `CNT-2025-${Math.floor(100 + Math.random() * 900)}`,
        billingPeriod: bData.billingPeriod?.trim() || "Current RA Period",
        billingType: bData.billingType?.trim() || "Monthly Running Account (RA) Bill",
        amount: formattedAmount,
        amountNum: numAmount,
        submissionDate: bData.submissionDate ? new Date(bData.submissionDate).toISOString() : now.toISOString(),
        expectedPaymentDate: bData.expectedPaymentDate ? new Date(bData.expectedPaymentDate).toISOString() : new Date(now.getTime() + 21 * 86400000).toISOString(),
        currentStep: parseInt(bData.currentStep, 10) || 1,
        currentRole: bData.currentRole?.trim() || "Field Officer",
        currentPerson: bData.currentPerson?.trim() || "Assigned Officer",
        workflowStatus: bData.workflowStatus?.trim() || bData.status?.trim() || "UNDER_REVIEW",
        paymentStatus: bData.paymentStatus?.trim() || "UNPAID",
        projectName: bData.projectName?.trim() || `${bData.unit || "Municipal"} Infrastructure Works`,
        projectType: bData.projectType || "BBMP_LAKES",
        workflowId: bData.workflowId || "WF-01-BBMP-LAKES",
        towerId: bData.towerId || "TWR-101",
        ward: bData.ward || bData.unit || "Municipal Division",
        contractor: bData.contractor || "State Public Works Contractor",
        mbNumber: bData.mbNumber || `MB-2026/${Math.floor(100 + Math.random() * 900)}`,
        description: bData.description || `Bill Master registered: ${billId}`,
        daysInStage: 0.5,
        stageSlaDays: 2,
        slaStatus: "WITHIN_SLA",
        documents: [],
        photos: getDefaultSitePhotosForTower("TWR-101", bData.projectName || billId, bData.unit || "Site"),
        photoUrls: [],
        history: [
          {
            step: 1,
            startedAt: now.toISOString(),
            dueAt: new Date(now.getTime() + 2 * 86400000).toISOString(),
            savedAt: now.toISOString(),
            action: `Bill Master dossier initiated (#${billId})`,
            performedBy: `${req.user.name} (${req.user.role})`
          }
        ]
      };

      bills.set(billId, newBill);
      return res.status(201).json({
        message: `Bill Master record "${billId}" created successfully!`,
        item: getBillMasterRecord(newBill)
      });
    }

    const created = workflowEngine.createMasterItem(req.params.type, req.body);
    res.status(201).json({
      message: `Master item registered successfully in "${req.params.type}"!`,
      item: created
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. UPDATE MASTER ITEM
app.put("/api/masters/:type/:id", requireAuth, (req, res) => {
  try {
    if (req.params.type === "bills" || req.params.type === "bill-master") {
      const bill = bills.get(req.params.id);
      if (!bill) return res.status(404).json({ error: `Bill "${req.params.id}" not found.` });

      const updates = req.body;
      if (updates.billNumber) bill.billNumber = updates.billNumber.trim();
      if (updates.client) bill.client = updates.client.trim();
      if (updates.unit) bill.unit = updates.unit.trim();
      if (updates.workOrder) bill.workOrder = updates.workOrder.trim();
      if (updates.contract) bill.contract = updates.contract.trim();
      if (updates.billingPeriod) bill.billingPeriod = updates.billingPeriod.trim();
      if (updates.billingType) bill.billingType = updates.billingType.trim();
      if (updates.amount) {
        bill.amountNum = parseCurrency(updates.amount) || bill.amountNum;
        bill.amount = `₹ ${bill.amountNum.toLocaleString("en-IN")}`;
      }
      if (updates.submissionDate) bill.submissionDate = new Date(updates.submissionDate).toISOString();
      if (updates.expectedPaymentDate) bill.expectedPaymentDate = new Date(updates.expectedPaymentDate).toISOString();
      if (updates.currentRole) bill.currentRole = updates.currentRole.trim();
      if (updates.currentPerson) bill.currentPerson = updates.currentPerson.trim();
      if (updates.workflowStatus || updates.status) bill.workflowStatus = (updates.workflowStatus || updates.status).trim();
      if (updates.paymentStatus) bill.paymentStatus = updates.paymentStatus.trim();
      if (updates.currentStep) bill.currentStep = parseInt(updates.currentStep, 10);
      if (updates.projectName) bill.projectName = updates.projectName.trim();
      if (updates.description) bill.description = updates.description.trim();

      return res.json({
        message: `Bill Master "${req.params.id}" updated successfully!`,
        item: getBillMasterRecord(bill)
      });
    }

    const updated = workflowEngine.updateMasterItem(req.params.type, req.params.id, req.body);
    res.json({
      message: `Master item "${req.params.id}" updated successfully!`,
      item: updated
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. DELETE MASTER ITEM
app.delete("/api/masters/:type/:id", requireAuth, (req, res) => {
  try {
    if (req.params.type === "bills" || req.params.type === "bill-master") {
      const bill = bills.get(req.params.id);
      if (!bill) return res.status(404).json({ error: `Bill "${req.params.id}" not found.` });
      if (bills.size <= 1) {
        return res.status(400).json({ error: "Cannot delete the only active bill in the system." });
      }
      bills.delete(req.params.id);
      return res.json({
        message: `Bill "${req.params.id}" removed from Master repository.`,
        item: getBillMasterRecord(bill)
      });
    }

    const deleted = workflowEngine.deleteMasterItem(req.params.type, req.params.id);
    res.json({
      message: `Master item "${req.params.id}" removed successfully.`,
      item: deleted
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 6. WORKFLOW CATALOG (DYNAMIC FROM ENGINE)
app.get("/api/workflows", (req, res) => {
  const list = workflowEngine.getWorkflows(req.query);
  res.json({
    legacy: workflows,
    catalog: list,
    categories: WORKFLOW_CATEGORIES,
    total: workflowEngine.workflows.length
  });
});

app.get("/api/workflows/catalog", (req, res) => {
  const list = workflowEngine.getWorkflows(req.query);
  res.json(list);
});

app.get("/api/workflows/categories", (_req, res) => {
  res.json(WORKFLOW_CATEGORIES);
});

app.get("/api/workflows/:id", (req, res) => {
  const wf = workflowEngine.getWorkflowById(req.params.id);
  if (!wf) return res.status(404).json({ error: `Workflow "${req.params.id}" not found.` });
  res.json(wf);
});

// 7. CREATE WORKFLOW (Authorized Admin / Officer)
app.post("/api/workflows", requireAuth, (req, res) => {
  try {
    const created = workflowEngine.createWorkflow(req.body);
    res.status(201).json({
      message: `Workflow "${created.id}" created successfully in digital workflow engine!`,
      workflow: created
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 8. UPDATE WORKFLOW (Authorized Admin / Officer)
app.put("/api/workflows/:id", requireAuth, (req, res) => {
  try {
    const updated = workflowEngine.updateWorkflow(req.params.id, req.body);

    // Also update any active bills mapped to this workflow
    Array.from(bills.values()).forEach((b) => {
      if (b.workflowId === req.params.id) {
        b.stages = updated.stages.map((s) => s.name);
        b.totalSteps = updated.stages.length;
        if (b.currentStep > updated.stages.length) {
          b.currentStep = updated.stages.length;
        }
        const activeStage = updated.stages[b.currentStep - 1];
        if (activeStage) {
          b.currentRole = activeStage.role;
          b.stageSlaDays = activeStage.slaDays;
        }
      }
    });

    res.json({
      message: `Workflow "${updated.id}" updated successfully in digital workflow engine!`,
      workflow: updated
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 9. DELETE WORKFLOW
app.delete("/api/workflows/:id", requireAuth, (req, res) => {
  try {
    const deleted = workflowEngine.deleteWorkflow(req.params.id);
    res.json({
      message: `Workflow "${req.params.id}" archived successfully.`,
      workflow: deleted
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 10. CLONE / DUPLICATE WORKFLOW
app.post("/api/workflows/:id/duplicate", requireAuth, (req, res) => {
  try {
    const cloned = workflowEngine.duplicateWorkflow(req.params.id);
    res.status(201).json({
      message: `Workflow cloned successfully as "${cloned.id}"!`,
      workflow: cloned
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 11. RESET WORKFLOWS TO 34 BASELINE OFFICIAL PROCESSES
app.post("/api/workflows/reset-baseline", requireAuth, (_req, res) => {
  try {
    const reset = workflowEngine.resetWorkflowsToBaseline();
    res.json({
      message: "All 34 workflows reset to the official billing-process baseline document.",
      total: reset.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// CONTROL TOWER EXECUTIVE DASHBOARD METRICS
// (Implements Requirements in Section 3 & 8 of Executive Directive)
// ========================================================
app.get("/api/control-tower/summary", requireAuth, (_req, res) => {
  const allBills = Array.from(bills.values());
  const totalBills = allBills.length;
  const totalBillingValueNum = allBills.reduce(
    (acc, b) => acc + (b.amountNum || parseCurrency(b.amount)),
    0
  );
  const billsPaid = allBills.filter(
    (b) => b.workflowStatus === "PAID" || b.workflowStatus === "CLOSED"
  ).length;
  const billsInProcess = allBills.filter(
    (b) =>
      b.workflowStatus === "UNDER_REVIEW" ||
      b.workflowStatus === "SUBMITTED" ||
      b.workflowStatus === "INVOICE" ||
      b.workflowStatus === "PAYMENT"
  ).length;
  const billsReturned = allBills.filter(
    (b) => b.workflowStatus === "REJECTED_EDIT"
  ).length;
  const billsPending = billsInProcess + billsReturned;
  const billsOverdue = allBills.filter(
    (b) => b.slaStatus === "BREACHED_SLA"
  ).length;
  const billsApproachingSla = allBills.filter(
    (b) => b.slaStatus === "APPROACHING_SLA"
  ).length;
  const billsRequiringIntervention = allBills.filter(
    (b) =>
      b.slaStatus === "BREACHED_SLA" ||
      b.workflowStatus === "REJECTED_EDIT" ||
      b.slaStatus === "APPROACHING_SLA"
  ).length;

  // 1. Client-wise Performance Matrix
  const clientMap = {};
  for (const b of allBills) {
    const client = b.client || "Other";
    if (!clientMap[client]) {
      clientMap[client] = {
        client,
        billCount: 0,
        totalValue: 0,
        inProcessCount: 0,
        paidCount: 0,
        breachedCount: 0,
        avgDays: 0,
        totalDays: 0
      };
    }
    clientMap[client].billCount++;
    clientMap[client].totalValue += (b.amountNum || parseCurrency(b.amount));
    clientMap[client].totalDays += (b.daysInStage || 1);
    if (b.slaStatus === "BREACHED_SLA") clientMap[client].breachedCount++;
    if (b.workflowStatus === "PAID" || b.workflowStatus === "CLOSED") {
      clientMap[client].paidCount++;
    } else {
      clientMap[client].inProcessCount++;
    }
  }

  const clientPerformance = Object.values(clientMap).map((c) => ({
    ...c,
    formattedValue: `₹ ${c.totalValue.toLocaleString("en-IN")}`,
    avgDays: Math.round((c.totalDays / c.billCount) * 10) / 10,
    slaHealth: c.breachedCount === 0 ? "GREEN" : (c.breachedCount === 1 ? "AMBER" : "RED")
  }));

  // 2. Stage Bottlenecks
  const stageMap = {};
  for (const b of allBills) {
    if (b.workflowStatus === "UNDER_REVIEW" || b.workflowStatus === "REJECTED_EDIT") {
      const stageName = b.currentRole || `Step ${b.currentStep}`;
      if (!stageMap[stageName]) {
        stageMap[stageName] = {
          stage: stageName,
          count: 0,
          totalDwellDays: 0,
          breachedCount: 0,
          client: b.client
        };
      }
      stageMap[stageName].count++;
      stageMap[stageName].totalDwellDays += (b.daysInStage || 1);
      if (b.slaStatus === "BREACHED_SLA") stageMap[stageName].breachedCount++;
    }
  }

  const stageBottlenecks = Object.values(stageMap).sort((a, b) => b.totalDwellDays - a.totalDwellDays);

  // 3. Ageing-wise Distribution
  const aging = {
    under7Days: allBills.filter((b) => (b.daysInStage || 1) <= 7).length,
    days8To15: allBills.filter((b) => (b.daysInStage || 1) > 7 && (b.daysInStage || 1) <= 15).length,
    days16To30: allBills.filter((b) => (b.daysInStage || 1) > 15 && (b.daysInStage || 1) <= 30).length,
    over30Days: allBills.filter((b) => (b.daysInStage || 1) > 30).length
  };

  // 4. Action Required: Bills Requiring Management / Intervention Today
  const interventionQueue = allBills
    .filter(
      (b) =>
        b.slaStatus === "BREACHED_SLA" ||
        b.workflowStatus === "REJECTED_EDIT" ||
        b.slaStatus === "APPROACHING_SLA"
    )
    .map((b) => ({
      id: b.id,
      billNumber: b.billNumber || b.id,
      client: b.client || "Municipal",
      unit: b.unit || b.projectName,
      projectName: b.projectName,
      amount: b.amount,
      amountNum: b.amountNum || parseCurrency(b.amount),
      currentStep: b.currentStep,
      currentRole: b.currentRole || "Assigned Officer",
      currentPerson: b.currentPerson || "Section In-Charge",
      slaStatus: b.slaStatus,
      daysInStage: b.daysInStage || 1,
      stageSlaDays: b.stageSlaDays || 2,
      overdueDays: b.overdueDays || 0,
      flagReason: b.flagReason || b.rejectionReason || null,
      urgency:
        b.slaStatus === "BREACHED_SLA"
          ? "CRITICAL"
          : b.workflowStatus === "REJECTED_EDIT"
          ? "HIGH"
          : "MEDIUM",
      actionRequired:
        b.slaStatus === "BREACHED_SLA"
          ? `Overdue by ${b.overdueDays || 2} days. Immediate escalation to ${b.currentRole} HOD.`
          : b.workflowStatus === "REJECTED_EDIT"
          ? "Vendor resubmission needed on audit objections."
          : "Approaching SLA deadline in <24 hours. Send automated dispatch reminder."
    }));

  res.json({
    metrics: {
      totalBills,
      totalBillingValue: `₹ ${totalBillingValueNum.toLocaleString("en-IN")}`,
      totalBillingValueNum,
      billsInProcess,
      billsPaid,
      billsPending,
      billsOverdue,
      billsApproachingSla,
      billsReturned,
      billsRequiringIntervention
    },
    clientPerformance,
    stageBottlenecks,
    aging,
    interventionQueue,
    pilotUnits: [
      {
        id: "PILOT-1",
        name: "BBMP Lakes North Zone",
        client: "BBMP",
        sector: "Civic & Municipal Infrastructure",
        stagesCount: 15,
        activeBillId: "BILL-1001",
        status: "HEALTHY",
        slaCompliance: "100%",
        note: "Testing 15-tier civil engineering check-measurements and DC Bill/DCF Fund double-route."
      },
      {
        id: "PILOT-2",
        name: "BMRCL Project Wing (80/20)",
        client: "BMRCL",
        sector: "Mass Rapid Transit Infrastructure",
        stagesCount: 8,
        activeBillId: "BILL-1002 / BILL-1003",
        status: "ATTENTION_REQUIRED",
        slaCompliance: "50%",
        note: "Testing split milestone: 80% operational milestone via CSO/GM Ops, and 20% statutory HR retention."
      }
    ]
  });
});

// Mock HRMS Integration Store
const hrmsMockContracts = [
  {
    contractId: "HRMS-CON-2026-BBMP-01",
    workOrderNumber: "WO/BBMP/LAKES/2026/042",
    client: "BBMP",
    unit: "BBMP Lakes North Zone",
    service: "Desilting & Inflow Silt Weir Maintenance",
    sanctionedAmount: 5000000,
    validFrom: "2026-04-01",
    validTo: "2027-03-31",
    contractor: "Sri Sai Infratech Projects",
    status: "ACTIVE"
  },
  {
    contractId: "HRMS-CON-2026-BMRCL-02",
    workOrderNumber: "BMRCL/R3C/VIADUCT/2025/11",
    client: "BMRCL",
    unit: "BMRCL Project Wing",
    service: "Elevated Viaduct Pier Structural Works",
    sanctionedAmount: 15000000,
    validFrom: "2025-10-01",
    validTo: "2027-06-30",
    contractor: "Karnataka Infrastructure & Metro Constr Ltd",
    status: "ACTIVE"
  },
  {
    contractId: "HRMS-CON-2026-KIADB-03",
    workOrderNumber: "KIADB/HARO/CIVIL/2026/08",
    client: "KIADB",
    unit: "KIADB Harohalli Industrial Area",
    service: "Effluent Pipeline Transmission Network",
    sanctionedAmount: 7500000,
    validFrom: "2026-01-15",
    validTo: "2026-12-31",
    contractor: "Apex Urban Engineering Corp",
    status: "ACTIVE"
  }
];

const hrmsSyncLogs = [];

app.get("/api/hrms/contracts", requireAuth, (_req, res) => res.json(hrmsMockContracts));
app.get("/api/hrms/sync-logs", requireAuth, (_req, res) => res.json(hrmsSyncLogs));

app.post("/api/hrms/sync-contract", requireAuth, (req, res) => {
  const { workOrderNumber, client, unit, service, sanctionedAmount, contractor } = req.body;
  if (!workOrderNumber || !client) {
    return res.status(400).json({ error: "Work Order Number and Client are required." });
  }

  const newContract = {
    contractId: `HRMS-CON-${Date.now()}`,
    workOrderNumber: workOrderNumber.trim(),
    client: client.trim(),
    unit: unit?.trim() || "Headquarters Unit",
    service: service?.trim() || "General Engineering & Facility Services",
    sanctionedAmount: parseCurrency(sanctionedAmount) || 5000000,
    validFrom: new Date().toISOString().split("T")[0],
    validTo: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
    contractor: contractor?.trim() || "Authorized Contractor",
    status: "ACTIVE"
  };

  hrmsMockContracts.unshift(newContract);
  hrmsSyncLogs.unshift({
    timestamp: new Date().toISOString(),
    event: "INBOUND_WORK_ORDER_SYNC",
    source: "HRMS Enterprise Core",
    workOrder: newContract.workOrderNumber,
    client: newContract.client,
    performedBy: `${req.user.name} (${req.user.role})`
  });

  res.status(201).json({
    message: `Contract "${newContract.workOrderNumber}" successfully synchronized from HRMS!`,
    contract: newContract
  });
});

app.post("/api/hrms/test-webhook", requireAuth, (req, res) => {
  const { billId } = req.body;
  const bill = bills.get(billId) || Array.from(bills.values())[0];
  const payload = {
    webhookEvent: "BILL_STAGE_TRANSITION",
    billId: bill.id,
    billNumber: bill.billNumber || bill.id,
    client: bill.client,
    unit: bill.unit,
    currentStep: bill.currentStep,
    currentRole: bill.currentRole,
    workflowStatus: bill.workflowStatus,
    amount: bill.amount,
    timestamp: new Date().toISOString()
  };

  hrmsSyncLogs.unshift({
    timestamp: new Date().toISOString(),
    event: "OUTBOUND_STAGE_WEBHOOK",
    target: "HRMS Integration Bus (https://hrms.corp/api/v1/billing-events)",
    billNumber: payload.billNumber,
    status: "DISPATCHED_HTTP_200",
    payload
  });

  res.json({
    message: `Webhook successfully dispatched to HRMS bus for ${payload.billNumber}`,
    payload
  });
});

// ========================================================
// TOWER MASTER ENDPOINTS
// ========================================================
app.get("/api/towers", requireAuth, (_req, res) => {
  const list = Array.from(towers.values()).map((t) => {
    // Calculate aggregate bills for this tower
    const towerBills = Array.from(bills.values()).filter((b) => b.towerId === t.id);
    const totalBilledNum = towerBills.reduce((acc, b) => acc + (b.amountNum || parseCurrency(b.amount)), 0);
    const paidBills = towerBills.filter((b) => b.workflowStatus === "PAID" || b.workflowStatus === "CLOSED");
    const totalPaidNum = paidBills.reduce((acc, b) => acc + (b.paymentData?.amountPaid || b.amountNum || parseCurrency(b.amount)), 0);
    
    return {
      ...t,
      billCount: towerBills.length,
      totalBilled: `₹ ${totalBilledNum.toLocaleString("en-IN")}`,
      totalBilledNum,
      totalPaid: `₹ ${totalPaidNum.toLocaleString("en-IN")}`,
      totalPaidNum,
      activeBills: towerBills.filter((b) => b.workflowStatus !== "CLOSED").length
    };
  });
  res.json(list);
});

app.post("/api/towers", requireAuth, (req, res) => {
  const { code, name, ward, zone, contractor, budget, location, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Tower Name is required." });
  }

  const nextNum = towers.size + 101;
  const towerId = `TWR-${nextNum}`;
  const towerCode = code?.trim() || `TWR-GEN-${nextNum}`;
  const budgetNum = parseCurrency(budget) || 5000000;

  const newTower = {
    id: towerId,
    code: towerCode,
    name: name.trim(),
    ward: ward?.trim() || "BBMP Central Ward",
    zone: zone?.trim() || "Central Zone",
    contractor: contractor?.trim() || "BBMP Registered Vendor",
    budget: budget?.trim() || `₹ ${budgetNum.toLocaleString("en-IN")}`,
    budgetNum,
    location: location?.trim() || "BBMP Municipal Ward Sector",
    status: "ACTIVE",
    description: description?.trim() || "Infrastructure & Drainage Tower",
    createdAt: new Date().toISOString()
  };

  towers.set(towerId, newTower);
  res.status(201).json({
    message: `Tower "${newTower.name}" registered successfully!`,
    tower: newTower
  });
});

// ========================================================
// BILLS & WORKFLOW ENDPOINTS
// ========================================================

// List all bills summary with full workflow metadata & Section 5 attributes
app.get("/api/bills", requireAuth, (_req, res) => {
  const list = Array.from(bills.values()).map(getBillMasterRecord);
  res.json(list);
});

// CREATE BILLING (Form to initiate a new billing for a Tower)
app.post("/api/bills", requireAuth, (req, res) => {
  const {
    id,
    towerId,
    workflowId,
    client,
    unit,
    projectName,
    projectType = "BBMP_LAKES",
    amount = "₹ 35,00,000",
    contractor = "",
    ward = "",
    mbNumber = "",
    description = "",
    submitImmediately = false,
    photoUrls
  } = req.body;

  if (!projectName || !projectName.trim()) {
    return res.status(400).json({ error: "Project name is required" });
  }

  let billId = (id || "").trim().toUpperCase();
  if (!billId) {
    let nextNum = 1002;
    while (bills.has(`BILL-${nextNum}`)) {
      nextNum++;
    }
    billId = `BILL-${nextNum}`;
  } else if (!billId.startsWith("BILL-")) {
    billId = `BILL-${billId}`;
  }

  if (bills.has(billId)) {
    return res.status(409).json({ error: `Bill ID "${billId}" already exists.` });
  }

  const matchedWf = workflowId ? workflowEngine.getWorkflowById(workflowId) : null;
  const validProjectType = matchedWf ? matchedWf.id : (workflows[projectType] ? projectType : "BBMP_LAKES");
  const stages = matchedWf ? matchedWf.stages.map((s) => s.name) : (workflows[validProjectType] || workflows.BBMP_LAKES);
  const numAmount = parseCurrency(amount) || 3500000;
  const formattedAmount = `₹ ${numAmount.toLocaleString("en-IN")}`;

  // Find tower if provided
  const matchedTower = towerId ? towers.get(towerId) : null;
  const resolvedTowerId = matchedTower ? matchedTower.id : "TWR-101";

  const defaultSitePhotos = getDefaultSitePhotosForTower(resolvedTowerId, projectName, ward);
  const resolvedPhotos = Array.isArray(photoUrls) && photoUrls.length > 0
    ? photoUrls.map((u, i) => ({
        id: `p-${billId}-${i + 1}`,
        url: typeof u === "string" ? u : u.url,
        title: (typeof u === "object" && u.title) || `Site Photo ${i + 1}`,
        caption: (typeof u === "object" && u.caption) || `Inspection documentation for ${projectName.trim()}`,
        siteLocation: (typeof u === "object" && u.siteLocation) || ward.trim() || matchedTower?.ward || "Site Location",
        stage: (typeof u === "object" && u.stage) || "Step 1 — Docket Initiation",
        uploadedBy: `${req.user.name} (${req.user.role})`,
        uploadedAt: new Date().toISOString(),
        geoTag: (typeof u === "object" && u.geoTag) || "12.9716° N, 77.5946° E"
      }))
    : defaultSitePhotos;

  const now = new Date();
  const due = new Date(now.getTime() + 2 * 86400000);

  // Workflow status: if submitImmediately then "UNDER_REVIEW", else "DRAFT" or "SUBMITTED"
  const initialWorkflowStatus = submitImmediately ? "UNDER_REVIEW" : "SUBMITTED";
  const initialStep = submitImmediately ? 2 : 1;
  const activeStage = matchedWf && matchedWf.stages ? matchedWf.stages[initialStep - 1] : null;

  const newBill = {
    id: billId,
    billNumber: req.body.billNumber?.trim() || `INV/2026/${Math.floor(100 + Math.random() * 900)}`,
    client: client?.trim() || matchedWf?.client || "BBMP",
    unit: unit?.trim() || matchedWf?.unit || matchedTower?.ward || "Municipal Division",
    workOrder: req.body.workOrder?.trim() || req.body.workOrderNo?.trim() || `WO/${(client || "BBMP").toUpperCase()}/2026/${Math.floor(1000 + Math.random() * 9000)}`,
    contract: req.body.contract?.trim() || req.body.contractNo?.trim() || `CNT-2025-${(client || "GEN").toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    billingPeriod: req.body.billingPeriod?.trim() || "Current RA Period",
    billingType: req.body.billingType?.trim() || (matchedWf ? `${matchedWf.category} Billing` : "Monthly Running Account (RA) Bill"),
    towerId: resolvedTowerId,
    workflowId: matchedWf ? matchedWf.id : null,
    projectName: projectName.trim(),
    projectType: validProjectType,
    workflowStatus: initialWorkflowStatus,
    paymentStatus: req.body.paymentStatus?.trim() || "UNPAID",
    currentStep: initialStep,
    totalSteps: stages.length,
    currentRole: activeStage?.role || (stages[initialStep - 1] || "Officer"),
    currentPerson: activeStage?.personName || "Assigned Officer",
    stageSlaDays: activeStage?.slaDays || 2,
    daysInStage: 0.5,
    slaStatus: "WITHIN_SLA",
    submissionDate: req.body.submissionDate ? new Date(req.body.submissionDate).toISOString() : now.toISOString(),
    expectedPaymentDate: req.body.expectedPaymentDate ? new Date(req.body.expectedPaymentDate).toISOString() : new Date(now.getTime() + (matchedWf?.totalSlaDays || 18) * 86400000).toISOString(),
    amount: formattedAmount,
    amountNum: numAmount,
    contractor: contractor.trim() || matchedTower?.contractor || "State Public Works Contractor",
    ward: ward.trim() || matchedTower?.ward || "Municipal Division",
    mbNumber: mbNumber.trim() || `MB-2026/${Math.floor(100 + Math.random() * 900)}`,
    description: description.trim() || `Billing initiated for ${matchedWf ? matchedWf.serviceType : `Tower ${matchedTower?.code || resolvedTowerId}`}`,
    photos: resolvedPhotos,
    photoUrls: resolvedPhotos.map((p) => p.url),
    documents: [],
    history: [
      {
        step: 1,
        startedAt: now.toISOString(),
        dueAt: due.toISOString(),
        savedAt: now.toISOString(),
        action: `Billing docket initiated under Workflow ${matchedWf?.id || resolvedTowerId} (${matchedWf?.serviceType || "Standard Civil"})`,
        performedBy: `${req.user.name} (${req.user.role})`
      }
    ]
  };

  if (submitImmediately) {
    newBill.history.push({
      step: 2,
      startedAt: now.toISOString(),
      dueAt: due.toISOString(),
      savedAt: now.toISOString(),
      action: "Submitted immediately into Departmental Review Queue",
      performedBy: `${req.user.name} (${req.user.role})`
    });
  }

  bills.set(billId, newBill);

  res.status(201).json({
    message: `Bill "${billId}" created successfully!`,
    bill: { ...newBill, stages }
  });
});

// SUBMIT BILLING (Advances bill from DRAFT / SUBMITTED to UNDER_REVIEW)
app.post("/api/bills/:id/submit", requireAuth, (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  const now = new Date();
  bill.workflowStatus = "UNDER_REVIEW";
  bill.currentStep = Math.max(bill.currentStep, 2);

  bill.history.push({
    step: bill.currentStep,
    startedAt: now.toISOString(),
    dueAt: new Date(now.getTime() + 2 * 86400000).toISOString(),
    savedAt: now.toISOString(),
    action: `Billing dossier officially SUBMITTED for departmental technical & financial review`,
    performedBy: `${req.user.name} (${req.user.role})`
  });

  res.json({
    message: `Bill "${bill.id}" has been submitted for review!`,
    bill: { ...bill, stages: stagesFor(bill) }
  });
});

// REVIEW DECISION (Approve -> INVOICE, or Reject -> EDIT)
app.post("/api/bills/:id/review", requireAuth, (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  const { decision, remarks } = req.body;
  const now = new Date();
  const stages = stagesFor(bill);

  if (decision === "approve") {
    // Approve branch: Transitions to INVOICE
    bill.workflowStatus = "INVOICE";
    bill.rejectionReason = null;
    bill.currentStep = Math.max(bill.currentStep, 7); // Move to Invoice stage

    const breakdown = computeInvoiceBreakdown(bill.amountNum || bill.amount);
    bill.invoiceData = {
      invoiceNo: `INV-2026-BBMP-${Math.floor(100 + Math.random() * 900)}`,
      invoiceDate: now.toISOString(),
      ...breakdown,
      approvedBy: `${req.user.name} (${req.user.role})`,
      approvalRemarks: remarks || "Approved for invoicing and pre-audit pass order."
    };

    bill.history.push({
      step: bill.currentStep,
      startedAt: now.toISOString(),
      dueAt: new Date(now.getTime() + 2 * 86400000).toISOString(),
      savedAt: now.toISOString(),
      action: `APPROVED in Review. Generated Tax Invoice #${bill.invoiceData.invoiceNo}. Remarks: ${remarks || "None"}`,
      performedBy: `${req.user.name} (${req.user.role})`
    });

    return res.json({
      message: `Bill "${bill.id}" APPROVED! Generated Tax Invoice #${bill.invoiceData.invoiceNo}.`,
      bill: { ...bill, stages }
    });
  } else if (decision === "reject") {
    // Reject branch: Transitions to EDIT
    if (!remarks || !remarks.trim()) {
      return res.status(400).json({ error: "A clear rejection reason is required when rejecting a bill." });
    }

    bill.workflowStatus = "REJECTED_EDIT";
    bill.rejectionReason = remarks.trim();
    bill.rejectedBy = `${req.user.name} (${req.user.role})`;
    bill.rejectedAt = now.toISOString();

    bill.history.push({
      step: bill.currentStep,
      startedAt: now.toISOString(),
      dueAt: new Date(now.getTime() + 86400000).toISOString(),
      savedAt: now.toISOString(),
      action: `REJECTED in Review by ${req.user.name}. Reason: ${remarks.trim()}. Routed to EDIT for revision.`,
      performedBy: `${req.user.name} (${req.user.role})`
    });

    return res.json({
      message: `Bill "${bill.id}" REJECTED and routed to EDIT for revision.`,
      bill: { ...bill, stages }
    });
  } else {
    return res.status(400).json({ error: "Invalid review decision. Must be 'approve' or 'reject'." });
  }
});

// EDIT BILLING (Save edits during REJECTED_EDIT or DRAFT)
app.put("/api/bills/:id/edit", requireAuth, (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  const {
    projectName,
    amount,
    contractor,
    ward,
    mbNumber,
    description,
    billNumber,
    client,
    unit,
    workOrder,
    contract,
    billingPeriod,
    billingType,
    paymentStatus,
    submissionDate,
    expectedPaymentDate,
    currentRole,
    currentPerson
  } = req.body;

  if (projectName && projectName.trim()) bill.projectName = projectName.trim();
  if (contractor && contractor.trim()) bill.contractor = contractor.trim();
  if (ward && ward.trim()) bill.ward = ward.trim();
  if (mbNumber && mbNumber.trim()) bill.mbNumber = mbNumber.trim();
  if (description && description.trim()) bill.description = description.trim();
  if (billNumber && billNumber.trim()) bill.billNumber = billNumber.trim();
  if (client && client.trim()) bill.client = client.trim();
  if (unit && unit.trim()) bill.unit = unit.trim();
  if (workOrder && workOrder.trim()) bill.workOrder = workOrder.trim();
  if (contract && contract.trim()) bill.contract = contract.trim();
  if (billingPeriod && billingPeriod.trim()) bill.billingPeriod = billingPeriod.trim();
  if (billingType && billingType.trim()) bill.billingType = billingType.trim();
  if (paymentStatus && paymentStatus.trim()) bill.paymentStatus = paymentStatus.trim();
  if (submissionDate) bill.submissionDate = new Date(submissionDate).toISOString();
  if (expectedPaymentDate) bill.expectedPaymentDate = new Date(expectedPaymentDate).toISOString();
  if (currentRole && currentRole.trim()) bill.currentRole = currentRole.trim();
  if (currentPerson && currentPerson.trim()) bill.currentPerson = currentPerson.trim();

  if (amount) {
    const num = parseCurrency(amount);
    bill.amountNum = num;
    bill.amount = `₹ ${num.toLocaleString("en-IN")}`;
  }

  const now = new Date();
  bill.history.push({
    step: bill.currentStep,
    startedAt: now.toISOString(),
    dueAt: new Date(now.getTime() + 86400000).toISOString(),
    savedAt: now.toISOString(),
    action: `Bill details modified during EDIT stage by ${req.user.name}`,
    performedBy: `${req.user.name} (${req.user.role})`
  });

  res.json({
    message: `Bill "${bill.id}" updated successfully.`,
    bill: { ...bill, stages: stagesFor(bill) }
  });
});

// RESUBMIT BILLING (From EDIT back to UNDER_REVIEW)
app.post("/api/bills/:id/resubmit", requireAuth, (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  const { revisionNote } = req.body;
  const now = new Date();

  bill.workflowStatus = "UNDER_REVIEW";
  const priorReason = bill.rejectionReason;
  bill.rejectionReason = null; // Cleared active rejection
  bill.lastRevisionNote = revisionNote || "Rectified objections and updated verification sheets.";

  bill.history.push({
    step: bill.currentStep,
    startedAt: now.toISOString(),
    dueAt: new Date(now.getTime() + 2 * 86400000).toISOString(),
    savedAt: now.toISOString(),
    action: `RESUBMITTED for Review after corrections. Rectification: ${bill.lastRevisionNote} (Previous rejection: ${priorReason || "N/A"})`,
    performedBy: `${req.user.name} (${req.user.role})`
  });

  res.json({
    message: `Bill "${bill.id}" successfully resubmitted for review!`,
    bill: { ...bill, stages: stagesFor(bill) }
  });
});

// PROCEED FROM INVOICE TO PAYMENT
app.post("/api/bills/:id/proceed-to-payment", requireAuth, (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  const now = new Date();
  bill.workflowStatus = "PAYMENT";
  bill.currentStep = Math.max(bill.currentStep, 10);

  bill.history.push({
    step: bill.currentStep,
    startedAt: now.toISOString(),
    dueAt: new Date(now.getTime() + 2 * 86400000).toISOString(),
    savedAt: now.toISOString(),
    action: `Tax Invoice approved. Transmitted to Central Treasury for Electronic Fund Transfer (PAYMENT stage).`,
    performedBy: `${req.user.name} (${req.user.role})`
  });

  res.json({
    message: `Bill "${bill.id}" advanced to PAYMENT stage!`,
    bill: { ...bill, stages: stagesFor(bill) }
  });
});

// RECORD PAYMENT (Moves from PAYMENT to PAID)
app.post("/api/bills/:id/record-payment", requireAuth, (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  const { utrNumber, paymentMode, bankName, amountPaid, remarks } = req.body;
  if (!utrNumber || !utrNumber.trim()) {
    return res.status(400).json({ error: "Bank UTR / Transaction Reference Number is required." });
  }

  const now = new Date();
  bill.workflowStatus = "PAID";
  bill.paymentStatus = "PAID";
  bill.currentStep = Math.max(bill.currentStep, 12);

  const netPayable = bill.invoiceData?.netPayable || bill.amountNum || parseCurrency(bill.amount);
  bill.paymentData = {
    utrNumber: utrNumber.trim(),
    paymentMode: paymentMode?.trim() || "RTGS Electronic Clearing",
    bankName: bankName?.trim() || "State Bank of India - BBMP Treasury Branch",
    amountPaid: amountPaid ? parseCurrency(amountPaid) : netPayable,
    paidDate: now.toISOString(),
    voucherId: `VCH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    remarks: remarks?.trim() || "Disbursement cleared via Treasury."
  };

  bill.history.push({
    step: bill.currentStep,
    startedAt: now.toISOString(),
    dueAt: new Date(now.getTime() + 86400000).toISOString(),
    savedAt: now.toISOString(),
    action: `PAYMENT CLEARED. UTR #${bill.paymentData.utrNumber}, Net Disbursed: ₹ ${bill.paymentData.amountPaid.toLocaleString("en-IN")}. Status: PAID`,
    performedBy: `${req.user.name} (${req.user.role})`
  });

  res.json({
    message: `Payment confirmed for Bill "${bill.id}"! Status updated to PAID.`,
    bill: { ...bill, stages: stagesFor(bill) }
  });
});

// CLOSE BILLING (Moves from PAID to CLOSED)
app.post("/api/bills/:id/close-bill", requireAuth, (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  const now = new Date();
  bill.workflowStatus = "CLOSED";
  bill.closedAt = now.toISOString();
  bill.closedBy = `${req.user.name} (${req.user.role})`;

  bill.history.push({
    step: bill.currentStep,
    startedAt: now.toISOString(),
    dueAt: now.toISOString(),
    savedAt: now.toISOString(),
    action: `BILL CLOSED & ARCHIVED. Digital seal and audit verification permanently finalized.`,
    performedBy: bill.closedBy
  });

  res.json({
    message: `Bill "${bill.id}" successfully CLOSED & ARCHIVED!`,
    bill: { ...bill, stages: stagesFor(bill) }
  });
});

// REPORTS API (Comprehensive aggregated analytics and reports across all workflow stages)
app.get("/api/reports", requireAuth, (_req, res) => {
  const allBills = Array.from(bills.values()).map((b) => {
    const tower = towers.get(b.towerId);
    const gross = b.amountNum || parseCurrency(b.amount);
    const net = b.invoiceData?.netPayable || b.paymentData?.amountPaid || gross;
    return {
      id: b.id,
      towerId: b.towerId || "TWR-101",
      towerCode: tower?.code || "TWR-GEN",
      towerName: tower?.name || "General Tower",
      ward: b.ward,
      projectName: b.projectName,
      contractor: b.contractor,
      workflowStatus: b.workflowStatus || "UNDER_REVIEW",
      currentStep: b.currentStep,
      grossAmount: gross,
      netAmount: net,
      formattedGross: `₹ ${gross.toLocaleString("en-IN")}`,
      formattedNet: `₹ ${net.toLocaleString("en-IN")}`,
      invoiceNo: b.invoiceData?.invoiceNo || "-",
      utrNumber: b.paymentData?.utrNumber || "-",
      client: b.client || "BBMP",
      unit: b.unit || b.ward || "Municipal Unit",
      amount: b.amount || `₹ ${gross.toLocaleString("en-IN")}`,
      amountNum: gross,
      slaStatus: b.slaStatus || "WITHIN_SLA",
      daysInStage: b.daysInStage || 1,
      stageSlaDays: b.stageSlaDays || 2,
      currentRole: b.currentRole || "Assigned Officer",
      paymentDate: b.paymentData?.paymentDate || b.paymentDate || null,
      expectedPaymentDate: b.expectedPaymentDate || null,
      rejectionReason: b.rejectionReason || null,
      rejectedBy: b.rejectedBy || null,
      historyCount: (b.history || []).length,
      lastUpdated: b.history?.[b.history.length - 1]?.savedAt || new Date().toISOString()
    };
  });

  // Calculate workflow funnel counts
  const stageCounts = {
    DRAFT: allBills.filter((b) => b.workflowStatus === "DRAFT").length,
    SUBMITTED: allBills.filter((b) => b.workflowStatus === "SUBMITTED").length,
    UNDER_REVIEW: allBills.filter((b) => b.workflowStatus === "UNDER_REVIEW").length,
    REJECTED_EDIT: allBills.filter((b) => b.workflowStatus === "REJECTED_EDIT").length,
    INVOICE: allBills.filter((b) => b.workflowStatus === "INVOICE").length,
    PAYMENT: allBills.filter((b) => b.workflowStatus === "PAYMENT").length,
    PAID: allBills.filter((b) => b.workflowStatus === "PAID").length,
    CLOSED: allBills.filter((b) => b.workflowStatus === "CLOSED").length,
    TOTAL: allBills.length
  };

  // Financial sums
  const totalGrossBilled = allBills.reduce((acc, b) => acc + b.grossAmount, 0);
  const totalPaid = allBills
    .filter((b) => b.workflowStatus === "PAID" || b.workflowStatus === "CLOSED")
    .reduce((acc, b) => acc + b.netAmount, 0);
  const totalInReview = allBills
    .filter((b) => b.workflowStatus === "UNDER_REVIEW")
    .reduce((acc, b) => acc + b.grossAmount, 0);
  const totalInvoiced = allBills
    .filter((b) => b.workflowStatus === "INVOICE" || b.workflowStatus === "PAYMENT")
    .reduce((acc, b) => acc + b.netAmount, 0);

  // Rejection rate calculation
  const totalReviewed = stageCounts.UNDER_REVIEW + stageCounts.REJECTED_EDIT + stageCounts.INVOICE + stageCounts.PAYMENT + stageCounts.PAID + stageCounts.CLOSED;
  const rejectionRate = totalReviewed > 0 ? Math.round((stageCounts.REJECTED_EDIT / totalReviewed) * 100) : 0;

  res.json({
    summary: {
      totalGrossBilled: `₹ ${totalGrossBilled.toLocaleString("en-IN")}`,
      totalGrossBilledNum: totalGrossBilled,
      totalPaid: `₹ ${totalPaid.toLocaleString("en-IN")}`,
      totalPaidNum: totalPaid,
      totalInReview: `₹ ${totalInReview.toLocaleString("en-IN")}`,
      totalInvoiced: `₹ ${totalInvoiced.toLocaleString("en-IN")}`,
      rejectionRate: `${rejectionRate}%`,
      stageCounts
    },
    towersCount: towers.size,
    bills: allBills
  });
});

app.get("/api/bills/:id", requireAuth, async (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });
  if (!bill.documents) bill.documents = [];

  // Ensure bill.photos is populated with site-specific inspection photos
  if (!bill.photos || !Array.isArray(bill.photos) || bill.photos.length === 0) {
    if (bill.photoUrls && bill.photoUrls.length > 0) {
      bill.photos = bill.photoUrls.map((p, i) => ({
        id: `photo-${bill.id}-${i + 1}`,
        url: typeof p === "string" ? p : p.url,
        title: (typeof p === "object" && p.title) || `Site Photo ${i + 1}`,
        caption: (typeof p === "object" && p.caption) || `Inspection documentation for ${bill.projectName}`,
        siteLocation: (typeof p === "object" && p.siteLocation) || bill.ward || bill.projectName,
        stage: (typeof p === "object" && p.stage) || `Step ${bill.currentStep}`,
        uploadedBy: (typeof p === "object" && p.uploadedBy) || "Field Inspection Team",
        uploadedAt: (typeof p === "object" && p.uploadedAt) || new Date().toISOString(),
        geoTag: (typeof p === "object" && p.geoTag) || "12.9716° N, 77.5946° E"
      }));
    } else {
      bill.photos = getDefaultSitePhotosForTower(bill.towerId, bill.projectName, bill.ward);
      bill.photoUrls = bill.photos.map((p) => p.url);
    }
  }

  await ensureBillDocumentsAnalyzed(bill);
  const stages = stagesFor(bill);
  const workflow = getWorkflowForBill(bill);
  const workflowTracking = getWorkflowTrackingData(bill);
  res.json({
    ...bill,
    stages,
    workflowDetails: workflow,
    totalSteps: stages.length,
    currentStageName: stages[bill.currentStep - 1] || `Step ${bill.currentStep}`,
    workflowTracking,
    dateEnteredIntoStage: workflowTracking.dateEnteredIntoStage,
    daysPending: workflowTracking.daysPending,
    daysInStage: workflowTracking.daysPending,
    stageSlaDays: workflowTracking.stageSlaDays,
    slaStatus: workflowTracking.slaStatus,
    completedStagesCount: workflowTracking.completedStagesCount,
    pendingStageName: workflowTracking.pendingStage.name,
    nextStageName: workflowTracking.nextStage?.name || "Disbursed",
    canonicalPhase: workflowTracking.currentStage.phaseLabel,
    canonicalPhaseId: workflowTracking.currentStage.phaseId,
    journeyPhases: workflowTracking.journeyPhases
  });
});

// Explicit 6. Workflow Tracking Endpoint
app.get("/api/bills/:id/workflow-tracking", requireAuth, (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });
  const tracking = getWorkflowTrackingData(bill);
  res.json(tracking);
});

app.get("/api/proposal/deliverables", (_req, res) => {
  res.json({
    reference: "BCT-IT-PHASE1-PROPOSAL-2026-v1.0",
    sponsor: "CEO",
    productOwner: "Col. Jyothi",
    technicalLead: "Raghavendra",
    deliverablesCount: 11,
    status: "UNDER_REVIEW",
    summary: "Complete Phase-I Technical Architecture and 34-Workflow Master proposal for independent Billing Control Tower development."
  });
});

// ATTACH / UPLOAD NEW SITE INSPECTION PHOTO SPECIFIC TO THIS SITE
app.post("/api/bills/:id/photos", requireAuth, (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  const {
    url,
    photoData,
    title,
    caption,
    stage,
    siteLocation,
    geoTag
  } = req.body;

  const photoUrl = (url && url.trim()) || photoData;
  if (!photoUrl) {
    return res.status(400).json({ error: "Photo image file or valid image URL is required." });
  }

  if (!bill.photos || !Array.isArray(bill.photos)) {
    bill.photos = getDefaultSitePhotosForTower(bill.towerId, bill.projectName, bill.ward);
  }

  const newPhotoId = `photo-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const newPhoto = {
    id: newPhotoId,
    url: photoUrl,
    title: (title && title.trim()) || `Site Photo ${bill.photos.length + 1}`,
    caption: (caption && caption.trim()) || `Field inspection photographic evidence for ${bill.projectName}`,
    siteLocation: (siteLocation && siteLocation.trim()) || bill.ward || bill.projectName,
    stage: (stage && stage.trim()) || `Step ${bill.currentStep}`,
    geoTag: (geoTag && geoTag.trim()) || "12.9716° N, 77.5946° E",
    uploadedBy: `${req.user.name} (${req.user.role})`,
    uploadedAt: new Date().toISOString()
  };

  bill.photos.push(newPhoto);
  bill.photoUrls = bill.photos.map((p) => p.url);

  bill.history.push({
    step: bill.currentStep,
    startedAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    savedAt: new Date().toISOString(),
    action: `[Site Inspection Photo Attached] ${newPhoto.title} (${newPhoto.siteLocation})`,
    performedBy: `${req.user.name} (${req.user.role})`
  });

  res.status(201).json({
    message: `Site inspection photo "${newPhoto.title}" attached successfully!`,
    photo: newPhoto,
    photos: bill.photos,
    photoUrls: bill.photoUrls,
    bill: { ...bill, stages: stagesFor(bill) }
  });
});

// DELETE SITE INSPECTION PHOTO
app.delete("/api/bills/:id/photos/:photoId", requireAuth, (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  if (!bill.photos || bill.photos.length === 0) {
    return res.status(404).json({ error: "No photos found on this bill." });
  }

  const pIdx = bill.photos.findIndex((p) => p.id === req.params.photoId || p.url === req.params.photoId);
  if (pIdx === -1) {
    return res.status(404).json({ error: "Photo not found." });
  }

  if (bill.photos.length <= 1) {
    return res.status(400).json({ error: "Cannot delete the last remaining site photo. A bill must maintain at least one inspection record photo." });
  }

  const removed = bill.photos.splice(pIdx, 1)[0];
  bill.photoUrls = bill.photos.map((p) => p.url);

  bill.history.push({
    step: bill.currentStep,
    startedAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    savedAt: new Date().toISOString(),
    action: `[Site Inspection Photo Removed] ${removed.title || "Inspection photo"}`,
    performedBy: `${req.user.name} (${req.user.role})`
  });

  res.json({
    message: `Photo "${removed.title}" deleted successfully.`,
    photos: bill.photos,
    photoUrls: bill.photoUrls,
    bill: { ...bill, stages: stagesFor(bill) }
  });
});

app.post("/api/bills/:id/transition", requireAuth, (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  const requested = Number(req.body.step);
  const stages = stagesFor(bill);

  if (!Number.isInteger(requested) || requested < 1 || requested > stages.length) {
    return res.status(400).json({ error: "Invalid workflow step" });
  }

  if (requested < bill.currentStep) {
    return res.status(409).json({
      error: `Forward-only rule: bill is already at Step ${bill.currentStep}.`
    });
  }

  if (requested === bill.currentStep) {
    return res.json({ ...bill, stages, message: "No transition required." });
  }

  const now = new Date();
  const due = new Date(now.getTime() + 2 * 86400000);
  bill.currentStep = requested;
  bill.dateEnteredIntoStage = now.toISOString();
  bill.daysInStage = 0;
  bill.daysPending = 0;
  bill.slaStatus = "WITHIN_SLA";
  bill.history.push({
    step: requested,
    startedAt: now.toISOString(),
    dueAt: due.toISOString(),
    savedAt: now.toISOString(),
    action: `Approved & Transitioned to Step ${requested}`,
    performedBy: `${req.user.name} (${req.user.role})`
  });

  const workflowTracking = getWorkflowTrackingData(bill);

  res.json({
    ...bill,
    stages,
    workflowTracking,
    dateEnteredIntoStage: bill.dateEnteredIntoStage,
    daysPending: 0,
    daysInStage: 0,
    stageSlaDays: workflowTracking.stageSlaDays,
    slaStatus: "WITHIN_SLA",
    transitionId: crypto.randomUUID(),
    message: `Moved to Step ${requested}: ${stages[requested - 1]} by ${req.user.name}`
  });
});

app.post("/api/bills/:id/reset", requireAuth, (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  const stages = stagesFor(bill);
  bill.currentStep = 1;
  bill.history = [{
    step: 1,
    startedAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    savedAt: new Date().toISOString(),
    action: "Workflow reset to Step 1: " + stages[0],
    performedBy: `${req.user.name} (${req.user.role})`
  }];

  res.json({
    ...bill,
    stages,
    message: "Workflow reset to Step 1: " + stages[0]
  });
});

app.get("/api/bills/:id/audit", requireAuth, (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });
  res.json(bill.history);
});

// Manually log inspection or verification note in audit trail
app.post("/api/bills/:id/audit-entry", requireAuth, (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  const { note, step, actionType = "Physical Field Verification" } = req.body;
  if (!note || !note.trim()) {
    return res.status(400).json({ error: "Inspection note text is required." });
  }

  const targetStep = Number(step) || bill.currentStep;
  const now = new Date();
  const due = new Date(now.getTime() + 2 * 86400000);

  const entry = {
    step: targetStep,
    startedAt: now.toISOString(),
    dueAt: due.toISOString(),
    savedAt: now.toISOString(),
    action: `[${actionType}] ${note.trim()}`,
    performedBy: `${req.user.name} (${req.user.role})`
  };

  bill.history.push(entry);

  res.status(201).json({
    message: "Inspection note recorded in audit log.",
    entry,
    history: bill.history
  });
});

// Manually add a Document / Invoice / Measurement record
app.post("/api/bills/:id/documents/manual", requireAuth, (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });
  if (!bill.documents) bill.documents = [];

  const {
    name,
    category = "Invoice / Bill",
    refNumber = "",
    amount = "",
    step,
    issuingAuthority = "",
    date = new Date().toISOString(),
    remarks = "",
    items = []
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Document or Record Title is required." });
  }

  const uniqueDocId = `man_${crypto.randomUUID()}`;
  const newManualDoc = {
    id: uniqueDocId,
    name: name.trim(),
    type: "manual",
    category: category,
    refNumber: refNumber.trim() || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    amount: amount.trim(),
    associatedStep: Number(step) || bill.currentStep,
    issuingAuthority: issuingAuthority.trim() || req.user.name,
    recordDate: date,
    remarks: remarks.trim(),
    items: Array.isArray(items) ? items : [],
    size: 1024 * (1 + (items.length || 1)),
    uploadedAt: new Date().toISOString(),
    uploadedBy: `${req.user.name} (${req.user.role})`,
    isManual: true
  };

  bill.documents.push(newManualDoc);

  // Record in audit log
  const auditDetails = `Manually added record [${category}]: ${name.trim()} (Ref: ${newManualDoc.refNumber}${newManualDoc.amount ? `, Amount: ${newManualDoc.amount}` : ""})`;
  bill.history.push({
    step: bill.currentStep,
    startedAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    savedAt: new Date().toISOString(),
    action: auditDetails,
    performedBy: `${req.user.name} (${req.user.role})`
  });

  res.status(201).json({
    message: `Record "${name}" added manually.`,
    document: newManualDoc,
    documents: bill.documents
  });
});

// Document Upload endpoint for PDF and Excel
app.post("/api/bills/:id/documents", requireAuth, async (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });
  if (!bill.documents) bill.documents = [];

  const { fileName, fileData, fileSize } = req.body;
  if (!fileName || !fileData) {
    return res.status(400).json({ error: "File name and file content are required." });
  }

  const ext = path.extname(fileName).toLowerCase();
  let docType = "unknown";
  if (ext === ".pdf") {
    docType = "pdf";
  } else if ([".xlsx", ".xls", ".csv"].includes(ext)) {
    docType = "excel";
  } else {
    return res.status(400).json({
      error: "Unsupported file type. Please upload a PDF (.pdf) or Excel (.xlsx, .xls, .csv) document."
    });
  }

  // Extract base64 buffer
  let base64Clean = fileData;
  if (fileData.includes(";base64,")) {
    base64Clean = fileData.split(";base64,")[1];
  }

  const fileBuffer = Buffer.from(base64Clean, "base64");
  const uniqueDocId = `doc_${crypto.randomUUID()}`;
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageFileName = `${Date.now()}_${sanitizedName}`;
  const diskPath = path.join(uploadsDir, storageFileName);

  try {
    fs.writeFileSync(diskPath, fileBuffer);
  } catch (err) {
    return res.status(500).json({ error: "Failed to save file to server storage: " + err.message });
  }

  // Automatically perform comprehensive PDF Document Intelligence if PDF
  let pdfAnalysis = null;
  if (docType === "pdf") {
    try {
      pdfAnalysis = await analyzePdfDocument(fileBuffer, fileName, fileSize || fileBuffer.length);
    } catch (parseErr) {
      console.warn("Failed to analyze uploaded PDF:", parseErr);
    }
  }

  const newDoc = {
    id: uniqueDocId,
    name: fileName,
    type: docType,
    extension: ext.replace(".", "").toUpperCase(),
    size: fileSize || fileBuffer.length,
    uploadedAt: new Date().toISOString(),
    uploadedBy: `${req.user.name} (${req.user.role})`,
    url: `http://localhost:4000/uploads/${storageFileName}`,
    pdfAnalysis
  };

  bill.documents.push(newDoc);

  // Record attachment in bill audit log
  const auditDetails = pdfAnalysis
    ? `Uploaded & Extracted PDF (${pdfAnalysis.totalPages} pages, ${pdfAnalysis.stats.totalWords} words, ${pdfAnalysis.tables.length} tables): ${fileName}`
    : `Uploaded ${docType.toUpperCase()} document: ${fileName}`;

  bill.history.push({
    step: bill.currentStep,
    startedAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    savedAt: new Date().toISOString(),
    action: auditDetails,
    performedBy: `${req.user.name} (${req.user.role})`
  });

  res.json({
    message: `${fileName} uploaded and analyzed successfully.`,
    document: newDoc,
    documents: bill.documents
  });
});

// Deep PDF details inspection endpoint
app.get("/api/bills/:id/documents/:docId/analysis", requireAuth, async (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });
  if (!bill.documents) bill.documents = [];

  const doc = bill.documents.find((d) => d.id === req.params.docId);
  if (!doc) return res.status(404).json({ error: "Document not found" });

  if (doc.pdfAnalysis) {
    return res.json({ success: true, document: doc, analysis: doc.pdfAnalysis });
  }

  if (doc.type === "pdf" && doc.url) {
    try {
      const fileNameOnDisk = path.basename(doc.url);
      const diskPath = path.join(uploadsDir, fileNameOnDisk);
      if (fs.existsSync(diskPath)) {
        const buf = fs.readFileSync(diskPath);
        doc.pdfAnalysis = await analyzePdfDocument(buf, doc.name, doc.size || buf.length);
        return res.json({ success: true, document: doc, analysis: doc.pdfAnalysis });
      }
    } catch (e) {
      return res.status(500).json({ error: "Failed to analyze PDF document: " + e.message });
    }
  }

  return res.status(400).json({ error: "Document is not a readable PDF file" });
});

// Document Delete endpoint
app.delete("/api/bills/:id/documents/:docId", requireAuth, (req, res) => {
  const bill = bills.get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });
  if (!bill.documents) bill.documents = [];

  const index = bill.documents.findIndex((d) => d.id === req.params.docId);
  if (index === -1) {
    return res.status(404).json({ error: "Document not found" });
  }

  const [removedDoc] = bill.documents.splice(index, 1);

  // Optional: remove file from disk
  try {
    const fileNameOnDisk = path.basename(removedDoc.url);
    const diskPath = path.join(uploadsDir, fileNameOnDisk);
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }
  } catch {
    // Ignore file removal error
  }

  bill.history.push({
    step: bill.currentStep,
    startedAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    savedAt: new Date().toISOString(),
    action: `Removed document: ${removedDoc.name}`,
    performedBy: `${req.user.name} (${req.user.role})`
  });

  res.json({
    message: `${removedDoc.name} deleted successfully.`,
    documents: bill.documents
  });
});

// ============================================================
// BILLING CONTROL TOWER & WORKFLOW ENGINE ENDPOINTS
// ============================================================

// 1. Management Visibility Dashboard Summary (Section 8)
app.get("/api/control-tower/summary", (req, res) => {
  const allBills = Array.from(bills.values());
  const totalBills = allBills.length;
  let totalBillingValue = 0;
  let inProcessCount = 0;
  let paidCount = 0;
  let breachedCount = 0;
  let approachingCount = 0;
  let returnedCount = 0;

  const urgentInterventionQueue = [];
  const clientBreakdown = {};
  const stageBottlenecks = {};

  allBills.forEach((b) => {
    const val = typeof b.amountNum === "number" ? b.amountNum : parseCurrency(b.amount);
    totalBillingValue += val;

    if (b.workflowStatus === "PAID" || b.currentStep >= 12) {
      paidCount++;
    } else {
      inProcessCount++;
    }

    if (b.slaStatus === "BREACHED_SLA") {
      breachedCount++;
      urgentInterventionQueue.push({
        id: b.id,
        billNumber: b.billNumber,
        client: b.client,
        unit: b.unit,
        amount: b.amount,
        currentRole: b.currentRole,
        currentPerson: b.currentPerson,
        daysInStage: b.daysInStage,
        stageSlaDays: b.stageSlaDays,
        slaBreachDays: Math.max(0, b.daysInStage - b.stageSlaDays),
        urgency: "CRITICAL",
        reason: `Exceeded stage SLA by ${Math.max(0, b.daysInStage - b.stageSlaDays)} days at ${b.currentRole}`,
        actionRequired: "Executive escalation to concerned Directorate"
      });
    } else if (b.slaStatus === "APPROACHING_SLA") {
      approachingCount++;
      urgentInterventionQueue.push({
        id: b.id,
        billNumber: b.billNumber,
        client: b.client,
        unit: b.unit,
        amount: b.amount,
        currentRole: b.currentRole,
        currentPerson: b.currentPerson,
        daysInStage: b.daysInStage,
        stageSlaDays: b.stageSlaDays,
        urgency: "HIGH",
        reason: `Due within 24 hours at ${b.currentRole}`,
        actionRequired: "Automated alert issued to desk officer"
      });
    }

    if (b.workflowStatus === "RETURNED" || b.status === "RETURNED") {
      returnedCount++;
      urgentInterventionQueue.push({
        id: b.id,
        billNumber: b.billNumber,
        client: b.client,
        unit: b.unit,
        amount: b.amount,
        currentRole: b.currentRole,
        currentPerson: b.currentPerson,
        urgency: "HIGH",
        reason: "Returned for MB measurement discrepancy",
        actionRequired: "Resubmission pending from Unit Field Officer"
      });
    }

    // Client Breakdown
    clientBreakdown[b.client] = (clientBreakdown[b.client] || 0) + val;

    // Bottlenecks
    const roleKey = b.currentRole || "Pending Review";
    stageBottlenecks[roleKey] = (stageBottlenecks[roleKey] || 0) + 1;
  });

  // Aging distribution
  const aging = {
    under15: allBills.filter(b => (b.daysInStage || 1) <= 15).length,
    between16and30: allBills.filter(b => (b.daysInStage || 1) > 15 && (b.daysInStage || 1) <= 30).length,
    between31and45: allBills.filter(b => (b.daysInStage || 1) > 30 && (b.daysInStage || 1) <= 45).length,
    over45: allBills.filter(b => (b.daysInStage || 1) > 45).length
  };

  // Pilot units specific metrics
  const pilot1Bills = allBills.filter(b => b.unit?.toLowerCase().includes("bbmp"));
  const pilot2Bills = allBills.filter(b => b.unit?.toLowerCase().includes("bmrcl"));

  res.json({
    kpis: {
      totalBills,
      totalBillingValue,
      totalBillingValueFormatted: `₹ ${(totalBillingValue / 100000).toFixed(2)} Lakhs`,
      billsInProcess: inProcessCount,
      billsPaid: paidCount,
      billsPending: inProcessCount,
      billsOverdue: breachedCount,
      billsApproachingSla: approachingCount,
      billsReturned: returnedCount,
      billsRequiringIntervention: urgentInterventionQueue.length
    },
    urgentInterventionQueue,
    clientBreakdown,
    stageBottlenecks,
    aging,
    pilots: {
      pilot1: {
        id: "PILOT-01",
        name: "BBMP Lakes North Zone",
        type: "Municipal Civil Works & Double Bill (15 Stages)",
        totalBills: pilot1Bills.length,
        inProcess: pilot1Bills.filter(b => b.workflowStatus !== "PAID").length,
        slaCompliance: "92.4%",
        activeStage: "Vigilance & Labour Cell"
      },
      pilot2: {
        id: "PILOT-02",
        name: "BMRCL Project Wing (Phase 2)",
        type: "Transit Infrastructure Split Milestone (80/20 Route)",
        totalBills: pilot2Bills.length,
        inProcess: pilot2Bills.filter(b => b.workflowStatus !== "PAID").length,
        slaCompliance: "98.1%",
        activeStage: "CSO / General Manager (Ops)"
      }
    }
  });
});

// 2. Full 34-Workflow Catalog (Section 4 & 12.1)
app.get("/api/workflows/catalog", (req, res) => {
  res.json({
    totalWorkflows: WORKFLOW_CATALOG.length,
    categories: WORKFLOW_CATEGORIES,
    workflows: WORKFLOW_CATALOG
  });
});

app.get("/api/workflows/categories", (req, res) => {
  res.json(WORKFLOW_CATEGORIES);
});

// 3. Section 12 Proposal Deliverables Inspection
app.get("/api/proposal/deliverables", (req, res) => {
  res.json({
    status: "READY_FOR_EXECUTIVE_REVIEW",
    projectGovernance: {
      projectSponsor: "CEO",
      businessOwner: "Col. Jyothi",
      technicalLead: "Raghavendra",
      developmentTeam: "IT Core Team",
      processValidation: "Finance/Accounts & Operations Representatives"
    },
    deliverablesList: [
      { id: 1, title: "Workflow Master derived from billing-process document", status: "COMPLETED", count: "34 Workflows Digitized" },
      { id: 2, title: "Identification of common & client-specific workflow stages", status: "COMPLETED", detail: "7 Canonical Stages + 5 Unique Client Routes" },
      { id: 3, title: "Proposed Database Structure (PostgreSQL/TimescaleDB)", status: "COMPLETED", detail: "10 Third-Normal-Form Tables with JSONB Config" },
      { id: 4, title: "Proposed Application Architecture", status: "COMPLETED", detail: "Hexagonal Decoupled Architecture (Engine + REST + UI)" },
      { id: 5, title: "Screen & Module List", status: "COMPLETED", detail: "6 Enterprise Cockpit Screens" },
      { id: 6, title: "User-Role RACI Matrix", status: "COMPLETED", detail: "Defined across 8 Key Organizational Personas" },
      { id: 7, title: "API Architecture for Future HRMS Integration", status: "COMPLETED", detail: "OpenAPI 3.1 Dual-Channel REST Webhook Protocol" },
      { id: 8, title: "Proposed Phase-I Development Timeline", status: "COMPLETED", detail: "8 Weeks to Go-Live" },
      { id: 9, title: "Resource Requirement", status: "COMPLETED", detail: "1 Lead + 2 Full-Stack + 1 QA + 0.5 DevOps" },
      { id: 10, title: "Two Proposed Pilot Units with Justification", status: "COMPLETED", detail: "BBMP Lakes North Zone & BMRCL Project Wing" },
      { id: 11, title: "Information Required from Finance/Accounts to Finalise", status: "COMPLETED", detail: "Action Questionnaire Formulated" }
    ]
  });
});

// Serve built frontend in production
const distDir = path.join(__dirname, "../dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api") && !req.path.startsWith("/uploads")) {
      res.sendFile(path.join(distDir, "index.html"));
    }
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Billing Tower API running at http://localhost:${PORT}`);
  if (fs.existsSync(distDir)) {
    console.log(`Frontend served at http://localhost:${PORT}`);
  }
});

// Keep the event loop alive
setInterval(() => {}, 1000 * 60 * 60);