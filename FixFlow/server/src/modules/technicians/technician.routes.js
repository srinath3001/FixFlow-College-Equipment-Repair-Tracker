// FixFlow - Technician Routes
// Endpoints and express-validator checks for technicians.

import { Router } from "express";
import { body, param } from "express-validator";
import * as technicianController from "./technician.controller.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

const createTechnicianValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Technician name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters."),
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid technician email address is required.")
    .normalizeEmail(),
  body("specialization")
    .trim()
    .notEmpty()
    .withMessage("Specialization is required (e.g., Audio/Visual, Networking, PC Hardware)."),
  body("availability")
    .optional()
    .isBoolean()
    .withMessage("Availability must be a boolean (true or false)."),
];

const updateTechnicianValidation = [
  param("id").notEmpty().withMessage("Technician ID is required."),
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty."),
  body("email").optional().trim().isEmail().withMessage("Must be a valid email."),
  body("specialization").optional().trim().notEmpty().withMessage("Specialization cannot be empty."),
  body("availability").optional().isBoolean().withMessage("Availability must be boolean."),
];

router.get("/", technicianController.listTechnicians);
router.get("/:id", technicianController.getTechnicianById);
router.post("/", createTechnicianValidation, validateRequest, technicianController.createTechnician);
router.put("/:id", updateTechnicianValidation, validateRequest, technicianController.updateTechnician);
router.delete("/:id", technicianController.deleteTechnician);

export default router;
