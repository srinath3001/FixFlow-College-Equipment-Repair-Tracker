// FixFlow - Dashboard Routes
// Endpoints for dashboard aggregations and real-time summaries.

import { Router } from "express";
import * as dashboardController from "./dashboard.controller.js";

const router = Router();

router.get("/stats", dashboardController.getDashboardStats);
router.get("/charts", dashboardController.getDashboardCharts);
router.get("/recent", dashboardController.getRecentComplaints);
router.get("/activity", dashboardController.getRecentActivity);

export default router;
