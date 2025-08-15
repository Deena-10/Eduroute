// backend/routes/userRoutes.js
const express = require('express');
const connection = require('../config/mysql');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, (req, res) => {
  const userId = req.user.id;

  connection.query(
    'SELECT id, name, email, interests, strengths, profilePicture, created_at FROM users WHERE id = ?',
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error', error: err });
      if (results.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

      const user = results[0];
      // Parse JSON fields
      user.interests = JSON.parse(user.interests || '[]');
      user.strengths = JSON.parse(user.strengths || '[]');

      res.json({ success: true, user });
    }
  );
});

// Update profile
router.put('/profile', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { name, interests, strengths } = req.body;

  // Convert arrays to JSON strings
  const interestsJSON = JSON.stringify(interests || []);
  const strengthsJSON = JSON.stringify(strengths || []);

  connection.query(
    'UPDATE users SET name = ?, interests = ?, strengths = ? WHERE id = ?',
    [name, interestsJSON, strengthsJSON, userId],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error', error: err });

      // Return updated user
      connection.query(
        'SELECT id, name, email, interests, strengths, profilePicture, created_at FROM users WHERE id = ?',
        [userId],
        (err2, results) => {
          if (err2) return res.status(500).json({ success: false, message: 'Database error', error: err2 });

          const user = results[0];
          user.interests = JSON.parse(user.interests || '[]');
          user.strengths = JSON.parse(user.strengths || '[]');

          res.json({ success: true, message: 'Profile updated successfully', user });
        }
      );
    }
  );
});

module.exports = router;
