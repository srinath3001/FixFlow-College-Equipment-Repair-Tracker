// FixFlow - Complaint API Service
// Functions for interacting with the /complaints backend endpoints.

import api from "./api.js";

export const complaintService = {
  // Fetch paginated, filtered complaints
  async getComplaints(params = {}) {
    const response = await api.get("/complaints", { params });
    return response; // Contains data (complaints array) and pagination metadata
  },

  // Fetch cursor-paginated complaints (demo endpoint)
  async getComplaintsCursor(params = {}) {
    const response = await api.get("/complaints/cursor", { params });
    return response;
  },

  // Fetch single complaint details
  async getComplaintById(id) {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  // Submit a new complaint
  async createComplaint(payload) {
    const response = await api.post("/complaints", payload);
    return response.data;
  },

  // Update complaint basic fields
  async updateComplaint(id, payload) {
    const response = await api.put(`/complaints/${id}`, payload);
    return response.data;
  },

  // Update complaint workflow status
  async updateStatus(id, { status, note, changedBy }) {
    const response = await api.patch(`/complaints/${id}/status`, {
      status,
      note,
      changedBy,
    });
    return response.data;
  },

  // Assign technician to complaint
  async assignTechnician(id, { technicianId, note, assignedBy }) {
    const response = await api.patch(`/complaints/${id}/assign`, {
      technicianId,
      note,
      assignedBy,
    });
    return response.data;
  },

  // Delete complaint
  async deleteComplaint(id) {
    const response = await api.delete(`/complaints/${id}`);
    return response;
  },
};

export default complaintService;
