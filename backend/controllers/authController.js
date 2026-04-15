// backend/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../config/postgres");
const admin = require("../config/firebaseAdmin");
const { v4: uuidv4 } = require("uuid");

// Standard Response Wrapper
const sendResponse = (res, statusCode, success, message, data = null) => {
    return res.status(statusCode).json({
        success,
        message,
        data,
        error: !success ? message : null
    });
};


const createToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing");
    }
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

exports.signup = async (req, res, next) => {
    const { name, email, password } = req.body;
    const safeName = String(name || "").trim();
    const safeEmail = String(email || "").trim().toLowerCase();
    const safePassword = String(password || "");

    try {
        if (!safeName || !safeEmail || !safePassword) {
            return sendResponse(res, 400, false, "name, email and password are required");
        }
        if (safePassword.length < 6) {
            return sendResponse(res, 400, false, "Password must be at least 6 characters");
        }
        if (!process.env.JWT_SECRET) {
            return sendResponse(res, 503, false, "Auth service not configured. Set JWT_SECRET.");
        }

        const { rows: existing } = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [safeEmail]
        );

        if (existing.length > 0) {
            return res.error("User already exists", "Signup failed", 400);
        }

        const hashedPassword = await bcrypt.hash(safePassword, 10);
        const uid = uuidv4();   // 🔥 generate uid

        const { rows: inserted } = await pool.query(
            "INSERT INTO users (uid, name, email, password) VALUES ($1, $2, $3, $4) RETURNING id",
            [uid, safeName, safeEmail, hashedPassword]
        );

        const token = createToken(inserted[0].id);

        return sendResponse(res, 201, true, "Signup successful", {
            token,
            user: { id: inserted[0].id, name: safeName, email: safeEmail }
        });

    } catch (error) {
        console.error("Signup error:", error);
        if (error?.code === "23505") {
            return sendResponse(res, 409, false, "User already exists");
        }
        return sendResponse(res, 500, false, error.message || "Signup failed");
    }
};


exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    const safeEmail = String(email || "").trim().toLowerCase();
    const safePassword = String(password || "");
    try {
        if (!safeEmail || !safePassword) {
            return sendResponse(res, 400, false, "email and password are required");
        }
        if (!process.env.JWT_SECRET) {
            return sendResponse(res, 503, false, "Auth service not configured. Set JWT_SECRET.");
        }

        const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [safeEmail]);
        if (rows.length === 0) {
            return res.error("Invalid email or password", "Login failed", 401);
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(safePassword, user.password || "");
        if (!isMatch) {
            return res.error("Invalid email or password", "Login failed", 401);
        }

        const token = createToken(user.id);
        return sendResponse(res, 200, true, "Login successful", {
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error("Login error:", error);
        return sendResponse(res, 500, false, error.message || "Login failed");
    }
};


exports.googleSignin = async (req, res, next) => {
    const { token } = req.body;
    try {
        if (!admin.apps?.length) {
            return sendResponse(res, 503, false, "Google sign-in is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY on the backend.");
        }
        const decoded = await admin.auth().verifyIdToken(token);
        const { uid, email, name, picture } = decoded;

        let { rows: existing } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        let user;

        if (existing.length > 0) {
            const row = existing[0];
            if (!row.firebase_uid) {
                await pool.query("UPDATE users SET firebase_uid = $1, profile_picture = $2 WHERE id = $3", [uid, picture, row.id]);
            }
            user = { id: row.id, name: row.name, email: row.email, profilePicture: row.profile_picture || picture };
        } else {
            const { rows: inserted } = await pool.query(
                "INSERT INTO users (name, email, firebase_uid, profile_picture) VALUES ($1, $2, $3, $4) RETURNING id",
                [name || "Google User", email, uid, picture]
            );
            user = { id: inserted[0].id, name: name || "Google User", email, profilePicture: picture };
        }

        const jwtToken = createToken(user.id);
        return sendResponse(res, 200, true, "Google sign-in successful", {
            token: jwtToken,
            user
        });
    } catch (error) {
        console.error("Google login error:", error);
        return sendResponse(res, 500, false, error.message || "Google sign-in failed");
    }
};

