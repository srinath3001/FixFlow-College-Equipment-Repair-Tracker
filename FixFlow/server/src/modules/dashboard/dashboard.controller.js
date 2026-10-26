// FixFlow - Dashboard Controller
// Handles endpoints for stats, charts, recent complaints, and activity feeds.

import * as dashboardService from "./dashboard.service.js";

export async function getDashboardStats(req, res, next) {
  try {
    const stats = await dashboardService.getDashboardStats();
    return res.status(200).json({
      success: true,
      message: "Dashboard statistics calculated successfully",
      data: stats,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardCharts(req, res, next) {
  try {
    const charts = await dashboardService.getDashboardCharts();
    return res.status(200).json({
      success: true,
      message: "Chart data retrieved successfully",
      data: charts,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecentComplaints(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 6;
    const complaints = await dashboardService.getRecentComplaints(limit);
    return res.status(200).json({
      success: true,
      message: "Recent complaints retrieved successfully",
      data: complaints,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecentActivity(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const activity = await dashboardService.getRecentActivity(limit);
    return res.status(200).json({
      success: true,
      message: "Recent activity retrieved successfully",
      data: activity,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}
