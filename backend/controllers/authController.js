// backend/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { prisma } = require("../config/prisma");
const admin = require("../config/firebaseAdmin");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/postgres");

// Standard Response Wrapper
const sendResponse = (res, statusCode, success, message, data = undefined) => {
    const payload = { success, message };
    if (data !== undefined) payload.data = data;
    return res.status(statusCode).json(payload);
};


const createToken = (userId) => {
    // JWT secret must come from environment; never hardcode in source.
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

        const existing = await prisma.user.findUnique({
            where: { email: safeEmail }
        });

        if (existing) {
            return sendResponse(res, 409, false, "User already exists");
        }

        const hashedPassword = await bcrypt.hash(safePassword, 10);
        const uid = uuidv4();   // 🔥 generate uid

        const inserted = await prisma.user.create({
            data: {
                uid: uid,
                name: safeName,
                email: safeEmail,
                password: hashedPassword
            }
        });

        await pool.query(
            "INSERT INTO user_learning_streak (user_id, current_streak, last_activity_date, updated_at) VALUES ($1, 0, NULL, CURRENT_TIMESTAMP) ON CONFLICT (user_id) DO NOTHING",
            [inserted.id]
        );

        const token = createToken(inserted.id);

        return sendResponse(res, 201, true, "Signup successful", {
            token,
            user: { id: inserted.id, name: safeName, email: safeEmail }
        });

    } catch (error) {
        console.error("Signup error:", error);
        if (error?.code === "23505") {
            return sendResponse(res, 409, false, "User already exists");
        }
        if (error?.code) {
            return sendResponse(res, 503, false, "Database temporarily unavailable");
        }
        return sendResponse(res, 500, false, "Signup failed");
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

        const user = await prisma.user.findUnique({
            where: { email: safeEmail }
        });
        
        if (!user) {
            return sendResponse(res, 404, false, "User not found");
        }
        const isMatch = await bcrypt.compare(safePassword, user.password || "");
        if (!isMatch) {
            return sendResponse(res, 401, false, "Invalid password");
        }

        const token = createToken(user.id);
        return sendResponse(res, 200, true, "Login successful", {
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error("Login error:", error);
        if (error?.code) {
            return sendResponse(res, 503, false, "Database temporarily unavailable");
        }
        return sendResponse(res, 500, false, "Login failed");
    }
};


exports.googleSignin = async (req, res, next) => {
    const { token } = req.body;
    try {
        if (!token) {
            return sendResponse(res, 400, false, "token is required");
        }
        if (!process.env.JWT_SECRET) {
            return sendResponse(res, 503, false, "Auth service not configured. Set JWT_SECRET.");
        }
        if (!admin.apps?.length) {
            return sendResponse(res, 503, false, "Google sign-in is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY on the backend.");
        }
        const decoded = await admin.auth().verifyIdToken(token);
        const { uid, email, name, picture } = decoded;

        let row = await prisma.user.findUnique({
            where: { email: email }
        });
        let user;

        if (row) {
            if (!row.firebase_uid) {
                row = await prisma.user.update({
                    where: { id: row.id },
                    data: { firebase_uid: uid, profile_picture: picture }
                });
            }
            user = { id: row.id, name: row.name, email: row.email, profilePicture: row.profile_picture || picture };
        } else {
            const inserted = await prisma.user.create({
                data: {
                    name: name || "Google User",
                    email: email,
                    firebase_uid: uid,
                    profile_picture: picture
                }
            });
            await pool.query(
                "INSERT INTO user_learning_streak (user_id, current_streak, last_activity_date, updated_at) VALUES ($1, 0, NULL, CURRENT_TIMESTAMP) ON CONFLICT (user_id) DO NOTHING",
                [inserted.id]
            );
            user = { id: inserted.id, name: name || "Google User", email, profilePicture: picture };
        }

        const jwtToken = createToken(user.id);
        return sendResponse(res, 200, true, "Google sign-in successful", {
            token: jwtToken,
            user
        });
    } catch (error) {
        console.error("Google login error:", error);
        if (error?.code) {
            return sendResponse(res, 503, false, "Database temporarily unavailable");
        }
        return sendResponse(res, 500, false, "Google sign-in failed");
    }
};

