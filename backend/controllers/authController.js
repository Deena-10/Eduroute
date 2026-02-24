// backend/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../config/postgres");
const admin = require("firebase-admin");

const createToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing");
    }
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

exports.signup = async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
        const { rows: existing } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existing.length > 0) {
            return res.error("User already exists", "Signup failed", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const { rows: inserted } = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
            [name, email, hashedPassword]
        );

        const token = createToken(inserted[0].id);
        res.success({ token, user: { id: inserted[0].id, name, email } }, "Signup successful", 201);
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (rows.length === 0) {
            return res.error("Invalid email or password", "Login failed", 401);
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password || "");
        if (!isMatch) {
            return res.error("Invalid email or password", "Login failed", 401);
        }

        const token = createToken(user.id);
        res.success({ token, user: { id: user.id, name: user.name, email: user.email } }, "Login successful");
    } catch (error) {
        next(error);
    }
};

exports.googleSignin = async (req, res, next) => {
    const { token } = req.body;
    try {
        const decoded = await admin.auth().verifyIdToken(token);
        const { uid, email, name, picture } = decoded;

        let { rows: existing } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        let user;

        if (existing.length > 0) {
            user = existing[0];
            if (!user.firebase_uid) {
                await pool.query("UPDATE users SET firebase_uid = $1, profile_picture = $2 WHERE id = $3", [uid, picture, user.id]);
            }
        } else {
            const { rows: inserted } = await pool.query(
                "INSERT INTO users (name, email, firebase_uid, profile_picture) VALUES ($1, $2, $3, $4) RETURNING id",
                [name || "Google User", email, uid, picture]
            );
            user = { id: inserted[0].id, name, email };
        }

        const jwtToken = createToken(user.id);
        res.success({ token: jwtToken, user }, "Google sign-in successful");
    } catch (error) {
        next(error);
    }
};
