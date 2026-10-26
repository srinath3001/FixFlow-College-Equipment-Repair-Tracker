// FixFlow - Server Entry Point
// Loads environment variables and binds HTTP server to port.

import "dotenv/config";
import app from "./app.js";
import { checkDatabaseConnection } from "./config/prisma.js";

const PORT = parseInt(process.env.PORT, 10) || 3001;

const server = app.listen(PORT, async () => {
  console.log("==================================================");
  console.log(`🚀 FixFlow Backend running at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📋 API Prefix:   http://localhost:${PORT}/api`);
  console.log("==================================================");

  // Check PostgreSQL connection on startup
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.connected) {
    console.log(`✅ PostgreSQL Connected successfully (${dbStatus.latencyMs}ms).`);
  } else {
    console.warn(`⚠️  Database Warning: ${dbStatus.error}`);
    console.warn(`👉 Please set your PostgreSQL password in server/.env:`);
    console.warn(`   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/fixflow_db?schema=public"`);
    console.warn(`   Then run: npm run prisma:migrate`);
  }
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  console.log("\n🛑 Gracefully shutting down FixFlow server...");
  server.close(() => {
    console.log("🔒 HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
