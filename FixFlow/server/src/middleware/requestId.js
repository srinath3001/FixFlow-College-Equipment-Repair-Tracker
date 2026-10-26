// FixFlow - Request ID Middleware
// Attaches a unique request ID to each incoming HTTP request for traceability.

import crypto from "crypto";

export function requestId(req, res, next) {
  // Use incoming X-Request-Id header if provided, otherwise generate a secure random UUID
  const id = req.headers["x-request-id"] || crypto.randomUUID();
  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
}
