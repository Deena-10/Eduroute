//backend\routes\chatRoutes.js
const express = require('express');
const connection = require('../config/mysql');
const router = express.Router();

// Save a message
router.post('/', (req, res) => {
  const { userId, sender, message } = req.body;

  if (!userId || !sender || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
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

// Get all messages for a user
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

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
