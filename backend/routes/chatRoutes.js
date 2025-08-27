// backend/routes/chatRoutes.js
const express = require('express');
const connection = require('../config/mysql');
const authMiddleware = require('../middleware/authMiddleware'); // ✅ Protect routes
const router = express.Router();

// Save a message (protected)
router.post('/', authMiddleware, (req, res) => {
  const { sender, message } = req.body;

  // ✅ userId comes from verified JWT instead of trusting req.body
  const userId = req.user.id;

  if (!sender || !message) {
    return res.status(400).json({ success: false, message: 'Sender and message are required' });
  }

  connection.query(
    'INSERT INTO messages (user_id, sender, message) VALUES (?, ?, ?)',
    [userId, sender, message],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err });

      res.json({ success: true, id: result.insertId });
    }
  );
});

// Get all messages for a user (protected)
router.get('/', authMiddleware, (req, res) => {
  const userId = req.user.id; // ✅ again, from token not param

  connection.query(
    'SELECT * FROM messages WHERE user_id = ? ORDER BY created_at ASC',
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, error: err });

      res.json({ success: true, messages: results });
    }
  );
});

module.exports = router;
