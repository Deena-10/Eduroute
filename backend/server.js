// backend/server.js
require("dotenv").config();
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

// CORS: allow both localhost and ngrok (so switching between them works)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];
if (process.env.FRONTEND_URL) {
  const url = process.env.FRONTEND_URL.replace(/\/$/, "");
  if (!allowedOrigins.includes(url)) allowedOrigins.push(url);
}
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) return cb(null, true);
      cb(null, false);
    },
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
app.use("/api/events", eventsRoutes);
app.use("/api/admin", adminRoutes);

// Health endpoint for Docker/K8s readiness checks
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, status: "ok" });
});

// VAPID public key for PWA push (no auth required)
app.get("/api/vapid-public", (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || null });
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
