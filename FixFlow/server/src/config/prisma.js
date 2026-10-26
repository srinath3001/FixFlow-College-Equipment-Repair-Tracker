// FixFlow - Shared Prisma Client Configuration
// Provides a single PrismaClient instance with safe connection testing and graceful shutdown.

import { PrismaClient } from "@prisma/client";

// Global Prisma instance to prevent multiple connections during dev hot-reloads
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

/**
 * Real database connectivity check
 * Tests the PostgreSQL connection with a lightweight query.
 * @returns {Promise<{ connected: boolean, latencyMs?: number, error?: string }>}
 */
export async function checkDatabaseConnection() {
  const start = Date.now();
  try {
    // $queryRaw is a fast ping to verify PostgreSQL authentication and connection
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      latencyMs: Date.now() - start,
      error: null,
    };
  } catch (error) {
    return {
      connected: false,
      latencyMs: Date.now() - start,
      error: error.message || "Failed to connect to PostgreSQL database",
    };
  }
}

// Gracefully disconnect on process termination
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
