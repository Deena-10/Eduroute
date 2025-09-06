// backend/routes/authRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const connection = require("../config/mysql"); // MySQL connection
const admin = require("firebase-admin");
const router = express.Router();

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

// Helper: Create JWT using the secret from your .env file
const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

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

    connection.query(
      `SELECT * FROM users WHERE email = ?`,
      [email],
      async (err, results) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Database error", error: err });

        if (results.length > 0) {
          return res
            .status(400)
            .json({
              success: false,
              message: "User already exists with this email",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = `
        INSERT INTO users (name, email, password, interests, strengths)
        VALUES (?, ?, ?, '[]', '[]')
      `;

        connection.query(
          insertQuery,
          [name, email, hashedPassword],
          (err2, result) => {
            if (err2)
              return res
                .status(500)
                .json({
                  success: false,
                  message: "Error creating user",
                  error: err2,
                });

            const token = createToken(result.insertId);

            res.status(201).json({
              success: true,
              message: "User created successfully",
              token,
              user: {
                id: result.insertId,
                name,
                email,
                interests: [],
                strengths: [],
              },
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Signup error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during signup" });
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

    connection.query(
      `SELECT * FROM users WHERE email = ?`,
      [email],
      async (err, results) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Database error", error: err });

        if (results.length === 0) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid email or password" });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(
          password,
          user.password || ""
        );

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
            interests: JSON.parse(user.interests || "[]"),
            strengths: JSON.parse(user.strengths || "[]"),
          },
        });
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
});

// ==================
// GOOGLE OAUTH SIGNUP/LOGIN (secure with Firebase Admin)
// ==================
router.post("/google-signin", async (req, res) => {
  try {
    const { token } = req.body; // frontend must send idToken

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Google ID token is required" });
    }

    // Verify token with Firebase Admin
    const decoded = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decoded;

    connection.query(
      `SELECT * FROM users WHERE email = ?`,
      [email],
      (err, results) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Database error", error: err });

        if (results.length > 0) {
          const existingUser = results[0];

          if (!existingUser.googleId) {
            connection.query(`UPDATE users SET googleId = ? WHERE id = ?`, [
              uid,
              existingUser.id,
            ]);
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
              interests: JSON.parse(existingUser.interests || "[]"),
              strengths: JSON.parse(existingUser.strengths || "[]"),
              profilePicture: existingUser.profilePicture || null,
            },
          });
        }

        // New Google user
        const insertQuery = `
        INSERT INTO users (name, email, googleId, profilePicture, interests, strengths)
        VALUES (?, ?, ?, ?, '[]', '[]')
      `;

        connection.query(
          insertQuery,
          [name, email, uid, picture || null],
          (err2, result) => {
            if (err2)
              return res
                .status(500)
                .json({
                  success: false,
                  message: "Error creating Google user",
                  error: err2,
                });

            const jwtToken = createToken(result.insertId);

            res.status(201).json({
              success: true,
              message: "Google authentication successful",
              token: jwtToken,
              user: {
                id: result.insertId,
                name,
                email,
                interests: [],
                strengths: [],
                profilePicture: picture || null,
              },
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Google signin error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error during Google authentication",
      });
  }
});

module.exports = router;
