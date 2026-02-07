// backend/server.js
// Load environment variables from the .env file as early as possible
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

// Import passport configuration
require("./config/passport");

// PostgreSQL connection
const connection = require("./config/postgres");

// Routes
const authRoutes = require("./routes/authRoutes");
const questionsRoute = require("./routes/questions");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");
const aiRoutes = require("./routes/aiRoutes");

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

// Session middleware
app.use(session({
    secret: process.env.JWT_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// ==========================
// ✅ Routes
// ==========================
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionsRoute);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);

// Simple welcome route for testing
app.get("/", (req, res) => {
  res.send("🚀 EduRoute AI Backend is running!");
});

// ==========================
// ✅ Start server
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
