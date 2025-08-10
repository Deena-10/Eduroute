const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Make sure you have serviceAccountKey.json from Firebase console
// (Project Settings → Service accounts → Generate new private key)
const serviceAccount = require('../config/serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// Helper: Create JWT
const createToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ==================
// EMAIL + PASSWORD SIGNUP (Normal)
// ==================
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, password });
        await user.save();

        const token = createToken(user._id);
        res.status(201).json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================
// FIREBASE GOOGLE SIGNUP / LOGIN
// ==================
router.post('/google', async (req, res) => {
    try {
        const { idToken } = req.body;

        // Verify token with Firebase Admin
        const decoded = await admin.auth().verifyIdToken(idToken);

        const { name, email, uid, picture } = decoded;

        // Check if user already exists
        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name: name || "Unnamed User",
                email,
                googleId: uid,
                profilePicture: picture || null
            });
            await user.save();
        }

        const token = createToken(user._id);
        res.status(200).json({ token, user });

    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Invalid Firebase ID token' });
    }
});

module.exports = router;
