// backend/server.js
// Load environment variables from the .env file as early as possible
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { responseHelper, errorHandler } = require("./middleware/apiResponse");

const app = express();

// ==========================
// ✅ Middleware
// ==========================

// CORS setup (allow React frontend)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Handle preflight requests globally
app.options("*", cors());

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

// Health endpoint for Docker/K8s readiness checks
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, status: "ok" });
});

// Simple welcome route for testing
app.get("/", (req, res) => {
  res.send("🚀 EduRoute AI Backend is running!");
});

// Global Error Handler (MUST BE LAST)
app.use(errorHandler);

// ==========================
// ✅ Start server
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
