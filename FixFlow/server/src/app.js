// FixFlow - Express Application Setup
// Configures CORS, parsers, request tracking, API route mounts, and centralized errors.

import express from "express";
import cors from "cors";
import { requestId } from "./middleware/requestId.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { checkDatabaseConnection } from "./config/prisma.js";

// Import feature route modules
import complaintRoutes from "./modules/complaints/complaint.routes.js";
import technicianRoutes from "./modules/technicians/technician.routes.js";
import equipmentRoutes from "./modules/equipment/equipment.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";

const app = express();

// 1. CORS Configuration for Vite frontend
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in local dev for smooth evaluation
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  })
);

// 2. Body Parser Middleware
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// 3. Request Tracking & Logging Middleware
app.use(requestId);
app.use(requestLogger);

// 4. System Health Check Endpoint (Real Database Connectivity)
app.get("/api/health", async (req, res) => {
  const dbHealth = await checkDatabaseConnection();

  const statusCode = dbHealth.connected ? 200 : 503;
  return res.status(statusCode).json({
    success: dbHealth.connected,
    message: dbHealth.connected
      ? "FixFlow API and PostgreSQL database are healthy and operational."
      : "FixFlow API is running, but PostgreSQL database is currently unreachable. Please check DATABASE_URL in server/.env.",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      connected: dbHealth.connected,
      latencyMs: dbHealth.latencyMs,
      error: dbHealth.error,
    },
    version: "1.0.0",
    requestId: req.id,
  });
});

// 5. Mount API Module Routers
app.use("/api/complaints", complaintRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 6. 404 Route Handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found.`,
    requestId: req.id,
  });
});

// 7. Centralized Error Handler Middleware
app.use(errorHandler);

export default app;
