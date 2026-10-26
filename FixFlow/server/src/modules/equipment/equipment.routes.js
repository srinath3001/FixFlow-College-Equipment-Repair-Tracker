// FixFlow - Equipment Routes
// Endpoints and express-validator checks for equipment assets.

import { Router } from "express";
import { body, param } from "express-validator";
import * as equipmentController from "./equipment.controller.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

const createEquipmentValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Equipment name is required (e.g. Dell OptiPlex 7090)."),
  body("category")
    .isIn(["LAPTOP", "PROJECTOR", "PRINTER", "COMPUTER", "ROUTER", "OTHER"])
    .withMessage("Invalid equipment category."),
  body("assetLabel")
    .trim()
    .notEmpty()
    .withMessage("Asset label or serial tag is required (e.g. EQ-PC-204)."),
  body("building")
    .trim()
    .notEmpty()
    .withMessage("Building location is required."),
  body("room")
    .trim()
    .notEmpty()
    .withMessage("Room or lab number is required."),
  body("condition")
    .optional()
    .isIn(["EXCELLENT", "GOOD", "FAIR", "POOR", "UNDER_REPAIR"])
    .withMessage("Invalid equipment condition."),
];

const updateEquipmentValidation = [
  param("id").notEmpty().withMessage("Equipment ID is required."),
  body("condition")
    .optional()
    .isIn(["EXCELLENT", "GOOD", "FAIR", "POOR", "UNDER_REPAIR"])
    .withMessage("Invalid equipment condition."),
];

router.get("/", equipmentController.listEquipment);
router.get("/:id", equipmentController.getEquipmentById);
router.post("/", createEquipmentValidation, validateRequest, equipmentController.createEquipment);
router.put("/:id", updateEquipmentValidation, validateRequest, equipmentController.updateEquipment);
router.delete("/:id", equipmentController.deleteEquipment);

export default router;
