// FixFlow - Centralized Error Handler Middleware
// Handles Prisma errors, validation errors, custom app errors, and unexpected exceptions.

export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

export function errorHandler(err, req, res, next) {
  const reqId = req.id || "unknown-request";

  // Log detailed error on server console for debugging (never exposed to client)
  console.error(`❌ [Error in req ${reqId}]:`, err.name, err.message);
  if (err.stack && process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  // 1. Prisma Unique Constraint Violation (e.g. duplicate email or reference)
  if (err.code === "P2002") {
    const fields = err.meta?.target ? ` (${err.meta.target.join(", ")})` : "";
    return res.status(409).json({
      success: false,
      message: `A record with this unique value already exists${fields}.`,
      requestId: reqId,
    });
  }

  // 2. Prisma Record Not Found for update/delete
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "The requested record was not found.",
      requestId: reqId,
    });
  }

  // 3. Prisma Foreign Key Constraint Failure
  if (err.code === "P2003") {
    return res.status(400).json({
      success: false,
      message: "Invalid relation reference: related record does not exist.",
      requestId: reqId,
    });
  }

  // 4. Custom AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
      requestId: reqId,
    });
  }

  // 5. Fallback for unexpected internal errors (no raw SQL or stack traces exposed)
  const isDev = process.env.NODE_ENV === "development";
  return res.status(500).json({
    success: false,
    message: isDev ? err.message : "An unexpected server error occurred. Please try again later.",
    requestId: reqId,
  });
}
