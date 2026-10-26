// FixFlow - Complaint Routes
// Defines REST endpoints and express-validator input checks for complaints.

import { Router } from "express";
import { body, query, param } from "express-validator";
import * as complaintController from "./complaint.controller.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

// Validation rules for complaint creation
const createComplaintValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Complaint title is required.")
    .isLength({ min: 5, max: 150 })
    .withMessage("Title must be between 5 and 150 characters."),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Detailed description of the problem is required.")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters."),
  body("equipmentName")
    .trim()
    .notEmpty()
    .withMessage("Equipment name or asset label is required."),
  body("equipmentCategory")
    .isIn(["LAPTOP", "PROJECTOR", "PRINTER", "COMPUTER", "ROUTER", "OTHER"])
    .withMessage("Invalid equipment category selected."),
  body("building")
    .trim()
    .notEmpty()
    .withMessage("Building or block name is required."),
  body("room")
    .trim()
    .notEmpty()
    .withMessage("Room or laboratory number is required."),
  body("reporterName")
    .trim()
    .notEmpty()
    .withMessage("Reporter name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Reporter name must be between 2 and 100 characters."),
  body("reporterEmail")
    .trim()
    .isEmail()
    .withMessage("A valid college email address is required.")
    .normalizeEmail(),
  body("priority")
    .optional()
    .isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
    .withMessage("Invalid priority level."),
];

// Validation rules for status update
const updateStatusValidation = [
  param("id").notEmpty().withMessage("Complaint ID is required."),
  body("status")
    .isIn(["OPEN", "ASSIGNED", "IN_PROGRESS", "ON_HOLD", "RESOLVED", "CLOSED"])
    .withMessage("Invalid complaint status."),
  body("note")
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 1000 })
    .withMessage("Status note cannot exceed 1000 characters."),
];

// Validation rules for assigning technician
const assignTechnicianValidation = [
  param("id").notEmpty().withMessage("Complaint ID is required."),
  body("technicianId")
    .notEmpty()
    .withMessage("A technician must be selected for assignment."),
];

// Query parameter validation for listing
const listQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer."),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100."),
  query("status")
    .optional()
    .isIn(["ALL", "OPEN", "ASSIGNED", "IN_PROGRESS", "ON_HOLD", "RESOLVED", "CLOSED"])
    .withMessage("Invalid status filter."),
  query("priority")
    .optional()
    .isIn(["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"])
    .withMessage("Invalid priority filter."),
  query("category")
    .optional()
    .isIn(["ALL", "LAPTOP", "PROJECTOR", "PRINTER", "COMPUTER", "ROUTER", "OTHER"])
    .withMessage("Invalid category filter."),
  query("sort")
    .optional()
    .isIn(["newest", "oldest"])
    .withMessage("Sort must be either 'newest' or 'oldest'."),
];

// Endpoints
// Cursor pagination demo route (declared before :id parameter)
router.get("/cursor", complaintController.listComplaintsCursor);

// Standard listing with pagination and filters
router.get("/", listQueryValidation, validateRequest, complaintController.listComplaints);

// Get single complaint by ID or Reference
router.get("/:id", complaintController.getComplaintById);

// Create new complaint
router.post("/", createComplaintValidation, validateRequest, complaintController.createComplaint);

// Update permitted fields
router.put("/:id", complaintController.updateComplaint);

// Update status
router.patch("/:id/status", updateStatusValidation, validateRequest, complaintController.updateComplaintStatus);

// Assign technician
router.patch("/:id/assign", assignTechnicianValidation, validateRequest, complaintController.assignTechnician);

// Delete complaint
router.delete("/:id", complaintController.deleteComplaint);

export default router;
