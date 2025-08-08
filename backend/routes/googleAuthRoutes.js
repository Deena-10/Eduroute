const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Redirect to Google for authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback
router.get('/google/callback', passport.authenticate('google', { session: false }), async (req, res) => {
    // User info is in req.user
    const user = req.user;
    // Issue JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    // Send token and user info to frontend (customize as needed)
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
});

module.exports = router;