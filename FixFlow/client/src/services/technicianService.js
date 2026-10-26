// FixFlow - Technician API Service
// Functions for interacting with the /technicians endpoints.

import api from "./api.js";

export const technicianService = {
  async getTechnicians() {
    const response = await api.get("/technicians");
    return response.data;
  },

  async getTechnicianById(id) {
    const response = await api.get(`/technicians/${id}`);
    return response.data;
  },

  async createTechnician(payload) {
    const response = await api.post("/technicians", payload);
    return response.data;
  },

  async updateTechnician(id, payload) {
    const response = await api.put(`/technicians/${id}`, payload);
    return response.data;
  },

  async deleteTechnician(id) {
    const response = await api.delete(`/technicians/${id}`);
    return response;
  },
};

export default technicianService;
