// backend/server.js
require("dotenv").config();
const pool = require("./config/postgres");
const { connectPrismaWithRetry, logPrismaDbSummary } = require("./config/prisma");
const authRoutes = require("./routes/authRoutes");
const questionsRoute = require("./routes/questions");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");
const aiRoutes = require("./routes/aiRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const adminRoutes = require("./routes/adminRoutes");

const express = require("express");
const cors = require("cors");
const { responseHelper, errorHandler } = require("./middleware/apiResponse");

const app = express();

// ==========================
// ✅ Middleware
// ==========================

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

// Add origins from environment variables (comma-separated support)
if (process.env.FRONTEND_URL) {
  const envUrls = process.env.FRONTEND_URL.split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean);
  envUrls.forEach((url) => {
    if (!allowedOrigins.includes(url)) allowedOrigins.push(url);
  });
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      origin.endsWith(".onrender.com");

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`🛑 CORS Blocked: Origin ${origin} is not in the allowed list.`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"],
  optionsSuccessStatus: 200, // Legacy support
};

// Apply CORS globally
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options("*", cors(corsOptions));

// Parse JSON request bodies
app.use(express.json());

// Standardized API response helper
app.use(responseHelper);

// ==========================
// ✅ Routes
// ==========================
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionsRoute);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/admin", adminRoutes);

// Health endpoint for Docker/K8s readiness checks
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// VAPID public key for PWA push (no auth required)
app.get("/api/vapid-public", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VAPID key fetched",
    data: { publicKey: process.env.VAPID_PUBLIC_KEY || null },
  });
});

// Simple welcome route for testing
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EduRoute AI Backend is running",
  });
});

// Global Error Handler (MUST BE LAST)
app.use(errorHandler);

// ==========================
// ✅ Start server
// ==========================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  const aiUrl = process.env.AI_SERVICE_URL;
  console.log(
    aiUrl
      ? `✅ AI_SERVICE_URL set (${String(aiUrl).replace(/\/$/, "")})`
      : "⚠️ AI_SERVICE_URL not set — using http://localhost:5001 (set this on Render to your Python service URL)"
  );
  // Log connection settings safely and run startup DB checks without crashing the app.
  if (typeof pool.logDbConfigSummary === "function") pool.logDbConfigSummary();
  logPrismaDbSummary();
  Promise.allSettled([
    typeof pool.checkPostgresConnection === "function" ? pool.checkPostgresConnection() : Promise.resolve(false),
    connectPrismaWithRetry({ maxRetries: 5, minDelayMs: 2000, maxDelayMs: 3000 }),
  ]).then((results) => {
    const pgOk = results[0]?.status === "fulfilled" && results[0]?.value === true;
    const prismaOk = results[1]?.status === "fulfilled" && results[1]?.value === true;
    if (!pgOk || !prismaOk) {
      console.warn("⚠️ DB check failed on startup. Service stays up and will retry on incoming requests.");
    }
  });
});
// Allow long-running AI roadmap generation (proxies and default Node timeouts are often 60s or less).
server.setTimeout(Number(process.env.REQUEST_TIMEOUT_MS) || 180000);
server.headersTimeout = Number(process.env.REQUEST_TIMEOUT_MS) || 180000;

// Keep process alive on transient async errors; log loudly for Render diagnostics.
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught exception:", error);
});
