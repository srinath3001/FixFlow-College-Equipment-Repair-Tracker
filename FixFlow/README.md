# ⚡ FixFlow — College Equipment Repair Tracker
> **"Every fault tracked. Every repair moving."**

FixFlow is a full-stack campus maintenance management system built for engineering colleges. It replaces disorganized WhatsApp messages, phone calls, and physical paper logbooks with a centralized, transparent platform where students and faculty report equipment faults, administrators assign work orders, and campus technicians log diagnostic and repair progress in real time.

---

## 📑 Table of Contents
1. [Why FixFlow is Useful for a College](#1-why-fixflow-is-useful-for-a-college)
2. [Full Project Folder Structure](#2-full-project-folder-structure)
3. [Environment Variables Configuration](#3-environment-variables-configuration)
4. [Database Migrations & Seeding](#4-database-migrations--seeding)
5. [Running the Application](#5-running-the-application)
6. [Troubleshooting Common Issues](#6-troubleshooting-common-issues)

---

## 1. Why FixFlow is Useful for a College

In engineering institutions, laboratories and classrooms house hundreds of critical assets:
- **Projectors** in lecture halls that fail before morning lectures.
- **Computer workstations** in programming labs with power supply or motherboard faults.
- **High-volume printers** in the central library outputting blank pages or paper jams.
- **Wi-Fi access points & routers** in seminar halls losing gateway connections.
- **Faculty laptops** with failing batteries.

### The Problem FixFlow Solves:
* **No lost complaints:** WhatsApp messages get buried; paper registers get misplaced. FixFlow assigns every fault a unique tracking reference (e.g., `FIX-2026-1001`).
* **Clear ownership:** Administrators assign qualified technicians based on specialization (e.g. A/V specialist for projectors, networking engineer for routers).
* **Audit trail:** Every status change records who made the change, when it happened, and technical notes.
* **Accountability:** Prevents unresolved tickets from being closed prematurely.

---


## 2. Full Project Folder Structure

```text
Full Stack/
├── package.json                   # Root scripts (runs client + server via concurrently)
├── .gitignore                     # Ignores node_modules, .env secrets, dist builds
├── README.md                      # Comprehensive documentation
│
├── server/                        # Express Backend & Prisma ORM
│   ├── .env                       # Backend secrets (DATABASE_URL, PORT)
│   ├── .env.example               # Template for environment variables
│   ├── package.json               # Backend dependencies (Prisma 6.19.0, Express)
│   ├── prisma/
│   │   ├── schema.prisma          # Relational schema (Technician, Equipment, Complaint, StatusHistory)
│   │   ├── seed.js                # Database seed script with sample college data
│   │   ├── create-db.sql          # Helper SQL to create fixflow_db
│   │   └── migrations/            # Version-controlled migration history
│   │       └── 20261024000000_init/
│   │           └── migration.sql  # Initial DDL migration script
│   └── src/
│       ├── config/
│       │   └── prisma.js          # Shared Prisma client & real DB ping health check
│       ├── middleware/
│       │   ├── requestId.js       # Attaches UUID request ID to every HTTP request
│       │   ├── requestLogger.js   # Logs HTTP method, URL, status code, duration
│       │   ├── validateRequest.js # express-validator error formatting middleware
│       │   └── errorHandler.js    # Centralized error handler (Prisma P2002/P2025 errors)
│       ├── modules/
│       │   ├── complaints/        # Complaint routes, controller, and transaction service
│       │   ├── technicians/       # Technician routes, controller, workload service
│       │   ├── equipment/         # Equipment inventory routes, controller, service
│       │   └── dashboard/         # Aggregation stats, chart data, activity feed
│       ├── app.js                 # Express app configuration & middleware pipeline
│       └── server.js              # Server entry point with startup diagnostics
│
└── client/                        # React Frontend (Vite)
    ├── .env                       # Frontend config (VITE_API_URL=http://localhost:3001/api)
    ├── .env.example               # Template for frontend environment variables
    ├── index.html                 # HTML shell with Inter & Outfit typography
    ├── package.json               # Frontend dependencies (TanStack Query, Recharts, Lucide)
    ├── vite.config.js             # Vite configuration
    └── src/
        ├── app/
        │   ├── App.jsx            # QueryClientProvider & AppProvider root
        │   ├── router.jsx         # createBrowserRouter with React.lazy code splitting
        │   └── queryClient.js     # TanStack Query client & retry rules
        ├── context/
        │   └── AppContext.jsx     # Context API for demo roles, active tech, toasts
        ├── hooks/
        │   ├── useDebounce.js     # Custom debouncing hook for live search
        │   └── useComplaints.js   # TanStack Query hooks + optimistic updates
        ├── services/
        │   ├── api.js             # Central Axios instance with error interceptors
        │   ├── complaintService.js# Complaint REST endpoints
        │   ├── technicianService.js# Technician REST endpoints
        │   ├── equipmentService.js# Equipment catalog REST endpoints
        │   ├── dashboardService.js# Dashboard analytics & health ping
        │   └── queryKeys.js       # Centralized cache keys
        ├── components/
        │   ├── layout/
        │   │   ├── MainLayout.jsx # Shell layout with Suspense & ErrorBoundary
        │   │   ├── Sidebar.jsx    # Persistent sidebar & mobile drawer
        │   │   └── TopNavbar.jsx  # Top bar with real DB beacon & role dropdown
        │   ├── ui/
        │   │   ├── StatusBadge.jsx   # Status badge with pulsing dot animation
        │   │   └── PriorityBadge.jsx # Priority level indicator
        │   └── feedback/
        │       ├── ToastContainer.jsx# Animated floating toast alerts
        │       ├── ConfirmDialog.jsx # Modal confirmation for destructive operations
        │       ├── ErrorBoundary.jsx # React class Error Boundary recovery screen
        │       └── LoadingSkeleton.jsx# Animated loading skeleton placeholders
        ├── pages/
        │   ├── DashboardPage.jsx      # Metrics cards, Donut & Bar charts, activity feed
        │   ├── ReportComplaintPage.jsx# React Hook Form fault reporting
        │   ├── ComplaintsListPage.jsx # useReducer filter/sort, pagination, cursor demo
        │   ├── ComplaintDetailPage.jsx# Timeline history, workflow advance, assign modal
        │   ├── TechniciansPage.jsx    # Roster cards, workloads, add/edit modals
        │   ├── EquipmentPage.jsx      # Inventory by category, conditions, edit modals
        │   └── SettingsPage.jsx       # Health diagnostics, role matrix, workflow docs
        ├── styles/
        │   └── index.css          # Complete futuristic dark theme & CSS variables
        └── main.jsx               # Entry point mounting App to #root
```

---

## 3. Environment Variables Configuration

Two environment files are already configured with placeholder values:

### 1. Backend: `server/.env`
Open `server/.env` in your editor:
```env
PORT=3001
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/fixflow_db?schema=public"
CLIENT_URL="http://localhost:5173"
```
👉 **Replace `YOUR_PASSWORD` with your local PostgreSQL `postgres` user password.**

### 2. Frontend: `client/.env`
```env
VITE_API_URL=http://localhost:3001/api
```
*(No changes needed for local development).*

---

## 4. Database Migrations & Seeding

Before running migrations, ensure the database `fixflow_db` exists in PostgreSQL.

### Step 1: Create the Database in PostgreSQL
Open **Windows PowerShell** or **Command Prompt** and run:
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE fixflow_db;"
```
*(Or create the database `fixflow_db` using **pgAdmin**).*

### Step 2: Apply the Prisma 6.19.0 Migration
In Backend(server) Terminal:
```powershell
npm run prisma:migrate
```
*(This applies the initial migration to create all enum types, tables, constraints, and indexes in PostgreSQL).*

### Step 3: Seed Sample College Data
Run the seed script to populate realistic college equipment, technicians, and complaints with complete audit history:
In Backend(server) Terminal:
```powershell
npm run prisma:seed
```
Output:
```text
🌱 Starting FixFlow database seeding...
🧹 Cleaned old records.
✅ Seeded 4 technicians.
✅ Seeded 6 equipment assets.
✅ Seeded 6 complaints with complete status audit histories.
✨ Seeding completed successfully!
```

---

## 5. Running the Application

### Run Individually in Separate Terminals

**Terminal 1 (Backend):**
```powershell
cd FixFlow\server
npm install
npm start
```

**Terminal 2 (Frontend):**
```powershell
cd FixFlow\client
npm install
npm run dev
```

Now open **http://localhost:5173** in your browser.

This runs `concurrently`, launching:
* **Backend Server**: `http://localhost:3001`
* **Vite Frontend**: `http://localhost:5173`

---


## 6. Troubleshooting Common Issues

### Issue 1: `Authentication failed against database server for postgres`
* **Cause:** The password in `server/.env` does not match your local PostgreSQL password.
* **Fix:** Open `server/.env` and update `DATABASE_URL` with your actual password. Then restart the server.

### Issue 2: `database "fixflow_db" does not exist`
* **Cause:** PostgreSQL requires the database to be created before Prisma applies migrations.
* **Fix:** Run:
  ```powershell
  & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE fixflow_db;"
  ```
  Then run `npm run prisma:migrate`.

### Issue 3: `npm.ps1 cannot be loaded because running scripts is disabled`
* **Cause:** Windows PowerShell execution policy restricts `.ps1` files.
* **Fix:** Use `npm.cmd` instead of `npm`, or run:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```
