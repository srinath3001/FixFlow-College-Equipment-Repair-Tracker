// FixFlow - Dashboard & Health API Service
// Functions for retrieving dashboard metrics, charts, and backend connectivity health.

import api from "./api.js";

export const dashboardService = {
  async getStats() {
    const response = await api.get("/dashboard/stats");
    return response.data;
  },

  async getCharts() {
    const response = await api.get("/dashboard/charts");
    return response.data;
  },

  async getRecentComplaints(limit = 6) {
    const response = await api.get("/dashboard/recent", { params: { limit } });
    return response.data;
  },

  async getRecentActivity(limit = 10) {
    const response = await api.get("/dashboard/activity", { params: { limit } });
    return response.data;
  },

  async getHealth() {
    const response = await api.get("/health");
    return response;
  },
};

export default dashboardService;
