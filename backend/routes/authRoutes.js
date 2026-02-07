// backend/routes/authRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../config/postgres");
const admin = require("firebase-admin");
const router = express.Router();

// PostgreSQL JSONB returns parsed objects - don't double-parse
const parseJsonField = (val, fallback = []) => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val) || fallback;
  } catch {
    return fallback;
  }
};

// Firebase Admin setup (for Google auth)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    console.log("✅ Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error(
      "❌ Firebase Admin SDK initialization failed:",
      error.message
    );
  }
}

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

router.get("/test", (req, res) => {
  res.json({ success: true, message: "Backend is running", timestamp: new Date().toISOString() });
});

// ==================
// EMAIL + PASSWORD SIGNUP
// ==================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const { rows: existing } = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User already exists with this email",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows: inserted } = await pool.query(
      `INSERT INTO users (name, email, password, interests, strengths)
       VALUES ($1, $2, $3, '[]', '[]') RETURNING id`,
      [name, email, hashedPassword]
    );

    const token = createToken(inserted[0].id);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: inserted[0].id,
        name,
        email,
        interests: [],
        strengths: [],
      },
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Server error during signup" });
  }
});

// ==================
// EMAIL + PASSWORD LOGIN
// ==================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password || "");

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = createToken(user.id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        interests: parseJsonField(user.interests),
        strengths: parseJsonField(user.strengths),
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// ==================
// GOOGLE OAUTH SIGNUP/LOGIN
// ==================
router.post("/google-signin", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Google ID token is required" });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decoded;

    const { rows: existing } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (existing.length > 0) {
      const existingUser = existing[0];
      if (!existingUser.googleId) {
        await pool.query('UPDATE users SET "googleId" = $1 WHERE id = $2', [uid, existingUser.id]);
      }
      const jwtToken = createToken(existingUser.id);
      return res.json({
        success: true,
        message: "Google authentication successful",
        token: jwtToken,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          interests: parseJsonField(existingUser.interests),
          strengths: parseJsonField(existingUser.strengths),
          profilePicture: existingUser.profilePicture || null,
        },
      });
    }

    const { rows: inserted } = await pool.query(
      `INSERT INTO users (name, email, "googleId", "profilePicture", interests, strengths)
       VALUES ($1, $2, $3, $4, '[]', '[]') RETURNING id`,
      [name, email, uid, picture || null]
    );

    const jwtToken = createToken(inserted[0].id);

    res.status(201).json({
      success: true,
      message: "Google authentication successful",
      token: jwtToken,
      user: {
        id: inserted[0].id,
        name,
        email,
        interests: [],
        strengths: [],
        profilePicture: picture || null,
      },
    });
  } catch (err) {
    console.error("Google signin error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during Google authentication",
    });
  }
});

module.exports = router;
