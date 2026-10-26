// FixFlow - Equipment Controller
// Coordinates HTTP requests and responses for equipment assets.

import * as equipmentService from "./equipment.service.js";

export async function listEquipment(req, res, next) {
  try {
    const { category } = req.query;
    const items = await equipmentService.listEquipment({ category });
    return res.status(200).json({
      success: true,
      message: "Equipment list retrieved successfully",
      data: items,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEquipmentById(req, res, next) {
  try {
    const { id } = req.params;
    const item = await equipmentService.getEquipmentById(id);
    return res.status(200).json({
      success: true,
      message: "Equipment details retrieved successfully",
      data: item,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function createEquipment(req, res, next) {
  try {
    const item = await equipmentService.createEquipment(req.body);
    return res.status(201).json({
      success: true,
      message: "Equipment asset registered successfully",
      data: item,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEquipment(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await equipmentService.updateEquipment(id, req.body);
    return res.status(200).json({
      success: true,
      message: "Equipment asset updated successfully",
      data: updated,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteEquipment(req, res, next) {
  try {
    const { id } = req.params;
    await equipmentService.deleteEquipment(id);
    return res.status(200).json({
      success: true,
      message: "Equipment asset deleted successfully",
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}
