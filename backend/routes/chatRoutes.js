// backend/routes/chatRoutes.js
const express = require('express');
const pool = require('../config/postgres');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  const { sender, message } = req.body;
  const userId = req.user.id;

  if (!sender || !message) {
    return res.status(400).json({ success: false, message: 'Sender and message are required' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO messages (user_id, sender, message) VALUES ($1, $2, $3) RETURNING id',
      [userId, sender, message]
    );
    res.json({ success: true, id: rows[0].id });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      'SELECT * FROM messages WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    res.json({ success: true, messages: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

router.delete('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    await pool.query('DELETE FROM messages WHERE user_id = $1', [userId]);
    res.json({ success: true, message: 'Chat history cleared successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

module.exports = router;
