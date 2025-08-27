const express = require('express');
const connection = require('../config/mysql');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        connection.query(
            'SELECT id, name, email, interests, strengths, profilePicture FROM users WHERE id = ?',
            [userId],
            (err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                
                if (results.length === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }
                
                const user = results[0];
                // Parse JSON fields
                user.interests = JSON.parse(user.interests || '[]');
                user.strengths = JSON.parse(user.strengths || '[]');
                
                res.json(user);
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, interests, strengths } = req.body;
        
        const updateQuery = `
            UPDATE users 
            SET name = ?, interests = ?, strengths = ?
            WHERE id = ?
        `;
        
        connection.query(
            updateQuery,
            [
                name,
                JSON.stringify(interests || []),
                JSON.stringify(strengths || []),
                userId
            ],
            (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                
                // Get updated user data
                connection.query(
                    'SELECT id, name, email, interests, strengths, profilePicture FROM users WHERE id = ?',
                    [userId],
                    (err2, results) => {
                        if (err2) {
                            return res.status(500).json({ error: 'Database error' });
                        }
                        
                        const user = results[0];
                        user.interests = JSON.parse(user.interests || '[]');
                        user.strengths = JSON.parse(user.strengths || '[]');
                        
                        res.json(user);
                    }
                );
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
