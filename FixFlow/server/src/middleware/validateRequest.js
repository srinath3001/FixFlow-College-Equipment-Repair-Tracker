// FixFlow - Input Validation Middleware
// Checks express-validator results and returns standard 400 response on failure.

import { validationResult } from "express-validator";

export function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed: please check your input fields.",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
      requestId: req.id,
    });
  }

  next();
}
