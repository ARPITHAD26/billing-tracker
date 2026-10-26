# 🏗️ Billing Tower

> **Enterprise Billing Control Tower** — A comprehensive billing management, workflow tracking, and governance platform for BBMP Lakes, BMRCL, and allied government departments.

Built with **React 19 + Vite + Express 5**.

---

## ✨ Features

- **Secure Authentication** — Session-based login with 24-hour token expiry, password hashing (scrypt), and protected APIs
- **Role-Based Access Control** — Field Officers, System Administrators, Finance Leads with distinct permissions
- **Dynamic Multi-Stage Workflows** — Configurable approval stages by project type (BBMP Lakes, BMRCL, Standard)
- **Forward-Only Governance** — Enforced progression rules prevent skipping or reversing stages
- **Immutable Audit Trail** — Full history of step changes, timestamps, and authorizing officers
- **Invoice & Payment Tracking** — GST TDS, IT TDS, Labour Cess, Retention deductions computed automatically
- **Site Photo Gallery** — Geo-tagged inspection photos with carousel navigation
- **PDF Inspector** — Upload and analyze billing documents with AI-assisted extraction
- **HRMS Integration** — Biometric attendance and labour compliance verification
- **SLA Notifications** — Real-time alerts for breached and approaching SLA deadlines
- **Reports & Analytics** — Charts and export capabilities for billing trends
- **Master Management** — Tower registry, workflow templates, and contractor data
- **Responsive Dark UI** — Premium glassmorphism design system

---

## 🔑 Demo Accounts

| Role | Username | Password |
|:--|:--|:--|
| Billing Tower Admin | `billing_tower` | `#bill@2026` |
| System Administrator | `admin` | `#bill@2026` |
| Field Officer (AEE) | `officer` | `officer123` |
| Finance Lead | `finance` | `finance123` |

---

## 🚀 Quick Start (Development)

**Requirements:** Node.js 18+

```bash
# Install dependencies
npm install

# Run frontend + backend together
npm run dev
```

- **Frontend:** http://localhost:5173
- **API:** http://localhost:4000

---

## 🏭 Production Deployment

```bash
# 1. Build the React frontend
npm run build

# 2. Start the Express server (serves both API + built frontend)
npm start
```

The server reads `PORT` from environment variables (default: `4000`).  
After building, the full app is served from `http://localhost:4000`.

### Environment Variables

| Variable | Default | Description |
|:--|:--|:--|
| `PORT` | `4000` | Port for the Express server |

### Deployment Platforms

Deploy to any Node.js host:
- **Render** — connect repo, set build command `npm run build`, start command `npm start`
- **Railway** — auto-detects Node.js, set start command `npm start`
- **Heroku** — uses `npm start` automatically
- **VPS/VM** — run `npm run build && npm start` behind nginx

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Auth | Body |
|:--|:--|:--|:--|
| POST | `/api/auth/login` | ❌ | `{ identifier, password }` |
| POST | `/api/auth/logout` | ✅ Bearer | — |
| GET | `/api/auth/me` | ✅ Bearer | — |
| GET | `/api/auth/demo-users` | ❌ | — |

### Bills & Workflows
| Method | Endpoint | Auth |
|:--|:--|:--|
| GET | `/api/bills` | ✅ Bearer |
| GET | `/api/bills/:id` | ✅ Bearer |
| POST | `/api/bills` | ✅ Bearer |
| PUT | `/api/bills/:id` | ✅ Bearer |
| POST | `/api/bills/:id/transition` | ✅ Bearer |
| GET | `/api/bills/:id/audit` | ✅ Bearer |
| GET | `/api/workflows` | ❌ |
| GET | `/api/towers` | ✅ Bearer |

---

## 🗂️ Project Structure

```
billing-tower/
├── server/
│   ├── index.js              # Express API server
│   ├── pdfAnalyzer.js        # PDF document analysis
│   ├── workflowEngine.js     # Workflow state machine
│   └── data/                 # Persistent data store
├── src/
│   ├── main.jsx              # App entry point & routing
│   ├── Login.jsx             # Authentication UI
│   ├── DashboardView.jsx     # Main dashboard
│   ├── ControlTowerDashboard.jsx
│   ├── WorkflowTrackerJourney.jsx
│   ├── TowerMasterView.jsx
│   ├── ReportsView.jsx
│   ├── SlaNotificationsView.jsx
│   ├── MasterManagementView.jsx
│   ├── styles.css            # Global design system
│   └── ...                   # Feature modals & components
├── index.html
├── vite.config.js
└── package.json
```

---

## ⚠️ Production Notes

> The demo server uses **in-memory storage** for sessions and data. For enterprise deployment:
> - Replace with **PostgreSQL** for persistent billing data
> - Use **Redis** for session management
> - Configure **JWT** with RS256 for stateless auth
> - Enable **HTTPS** via reverse proxy (nginx/caddy)
> - Set up **file storage** (S3/GCS) instead of local uploads

---

## 📋 License

Private — BBMP Billing Operations & Governance Directorate
