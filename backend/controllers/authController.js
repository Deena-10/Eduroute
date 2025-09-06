// backend\controllers\authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const util = require('util'); // Node.js built-in utility
const connection = require('../config/mysql');
const admin = require('../firebaseAdmin');

// Use util.promisify to convert callback-based query to a promise-based one
const query = util.promisify(connection.query).bind(connection);

// Utility to generate JWT
const generateToken = (userId, email) => {
    return jwt.sign(
        { id: userId, email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// ==================
// Email/Password Signup
// ==================
exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    try {
        // Check if user exists using the promise-based query
        const results = await query(`SELECT * FROM users WHERE email = ?`, [email]);

        if (results.length > 0) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into DB
        const insertQuery = `
            INSERT INTO users (name, email, password, interests, strengths)
            VALUES (?, ?, ?, '[]', '[]')
        `;
        const result = await query(insertQuery, [name, email, hashedPassword]);

        const token = generateToken(result.insertId, email);
        res.status(201).json({ 
            message: 'Signup successful', 
            token, 
            success: true,
            user: {
                id: result.insertId,
                name: name,
                email: email
            }
        });
    } catch (err) {
        // Handle specific MySQL duplicate entry error
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already registered' });
        }
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Error creating user', error: err.message });
    }
};

// ==================
// Email/Password Login
// ==================
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const results = await query(`SELECT * FROM users WHERE email = ?`, [email]);

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password || '');
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.email);
        res.status(200).json({ 
            message: 'Login successful', 
            token, 
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// ==================
// Google Sign-in with Firebase
// ==================
exports.googleAuth = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ message: 'Missing ID token' });
        }

        // Verify token with Firebase
        const decoded = await admin.auth().verifyIdToken(idToken);
        const { email, name, picture, uid } = decoded;

        const results = await query(`SELECT * FROM users WHERE email = ?`, [email]);
        
        if (results.length > 0) {
            const existingUser = results[0];
            if (!existingUser.googleId) {
                await query(`UPDATE users SET googleId = ? WHERE id = ?`, [uid, existingUser.id]);
            }
            const token = generateToken(existingUser.id, existingUser.email);
            return res.json({ message: 'Google sign-in successful', token, success: true });
        }

        // New Google user
        const insertQuery = `
            INSERT INTO users (name, email, googleId, profilePicture, interests, strengths)
            VALUES (?, ?, ?, ?, '[]', '[]')
        `;
        const result = await query(insertQuery, [name || email.split('@')[0], email, uid, picture || null]);

        const token = generateToken(result.insertId, email);
        res.status(201).json({ message: 'Google sign-in successful', token, success: true });
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(500).json({ message: 'Server error during Google authentication' });
    }
};
