// FixFlow - Technician Controller
// Coordinates HTTP requests and responses for technician operations.

import * as technicianService from "./technician.service.js";

export async function listTechnicians(req, res, next) {
  try {
    const technicians = await technicianService.listTechnicians();
    return res.status(200).json({
      success: true,
      message: "Technicians retrieved successfully",
      data: technicians,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTechnicianById(req, res, next) {
  try {
    const { id } = req.params;
    const technician = await technicianService.getTechnicianById(id);
    return res.status(200).json({
      success: true,
      message: "Technician details retrieved successfully",
      data: technician,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTechnician(req, res, next) {
  try {
    const technician = await technicianService.createTechnician(req.body);
    return res.status(201).json({
      success: true,
      message: "Technician created successfully",
      data: technician,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTechnician(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await technicianService.updateTechnician(id, req.body);
    return res.status(200).json({
      success: true,
      message: "Technician updated successfully",
      data: updated,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTechnician(req, res, next) {
  try {
    const { id } = req.params;
    await technicianService.deleteTechnician(id);
    return res.status(200).json({
      success: true,
      message: "Technician deleted successfully",
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}
