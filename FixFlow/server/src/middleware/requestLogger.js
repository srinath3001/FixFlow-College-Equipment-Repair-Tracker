// FixFlow - Request Logger Middleware
// Logs HTTP method, URL, status code, duration, and request ID.

export function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Listen to response finish event to capture final status code
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;
    const reqId = req.id || "-";

    // Format log output cleanly
    console.log(
      `[${timestamp}] [${method}] ${url} - Status: ${status} (${duration}ms) [reqId: ${reqId}]`
    );
  });

  next();
}
