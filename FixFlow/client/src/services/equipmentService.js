// FixFlow - Equipment API Service
// Functions for interacting with the /equipment endpoints.

import api from "./api.js";

export const equipmentService = {
  async getEquipment(category = null) {
    const params = category && category !== "ALL" ? { category } : {};
    const response = await api.get("/equipment", { params });
    return response.data;
  },

  async getEquipmentById(id) {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },

  async createEquipment(payload) {
    const response = await api.post("/equipment", payload);
    return response.data;
  },

  async updateEquipment(id, payload) {
    const response = await api.put(`/equipment/${id}`, payload);
    return response.data;
  },

  async deleteEquipment(id) {
    const response = await api.delete(`/equipment/${id}`);
    return response;
  },
};

export default equipmentService;
