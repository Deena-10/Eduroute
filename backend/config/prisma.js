// backend/config/prisma.js
const { PrismaClient } = require("@prisma/client");
const { maskDatabaseUrl, validateSupabasePooledUrl } = require("./databaseUrl");

const databaseUrl = process.env.DATABASE_URL ? String(process.env.DATABASE_URL).trim() : "";
const globalForPrisma = global;

const prisma =
  globalForPrisma.__eduroutePrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__eduroutePrisma = prisma;
}

const testPrismaConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connected successfully (Prisma).");
    return true;
  } catch (err) {
    console.error("❌ PostgreSQL connection test failed (Prisma):", err.message);
    return false;
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry Prisma DB connectivity during startup to tolerate Supabase cold starts.
 * - Reuses the singleton Prisma client (no extra PrismaClient instances).
 * - Never throws; returns boolean so caller can decide behavior without crashing.
 */
const connectPrismaWithRetry = async (options = {}) => {
  const maxRetries = Number(options.maxRetries) || 5;
  const minDelayMs = Number(options.minDelayMs) || 2000;
  const maxDelayMs = Number(options.maxDelayMs) || 3000;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    const ok = await testPrismaConnection();
    if (ok) return true;

    if (attempt < maxRetries) {
      console.log(`⏳ Retrying DB connection (${attempt}/${maxRetries})...`);
      const jitter = Math.floor(Math.random() * Math.max(1, maxDelayMs - minDelayMs + 1));
      await sleep(minDelayMs + jitter);
    }
  }

  console.error(`❌ Failed to connect after retries (${maxRetries}/${maxRetries}).`);
  return false;
};

const logPrismaDbSummary = () => {
  if (!databaseUrl) {
    console.warn("⚠️ Prisma: DATABASE_URL is missing.");
    return;
  }
  console.log(`ℹ️ Prisma DATABASE_URL: ${maskDatabaseUrl(databaseUrl)}`);
  const issues = validateSupabasePooledUrl(databaseUrl);
  if (issues.length > 0) {
    console.warn("⚠️ Prisma DATABASE_URL validation warnings:");
    issues.forEach((issue) => console.warn(`   - ${issue}`));
  }
};

module.exports = { prisma, testPrismaConnection, connectPrismaWithRetry, logPrismaDbSummary };

