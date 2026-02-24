// backend/controllers/chatController.js
const pool = require("../config/postgres");

exports.getMessages = async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM messages WHERE user_id = $1 ORDER BY created_at ASC",
            [req.user.id]
        );
        res.success(rows, "Messages fetched successfully");
    } catch (error) {
        next(error);
    }
};

exports.saveMessage = async (req, res, next) => {
    const { sender, message } = req.body;
    try {
        const { rows } = await pool.query(
            "INSERT INTO messages (user_id, sender, message) VALUES ($1, $2, $3) RETURNING id",
            [req.user.id, sender, message]
        );
        res.success({ id: rows[0].id }, "Message saved successfully", 201);
    } catch (error) {
        next(error);
    }
};

exports.clearHistory = async (req, res, next) => {
    try {
        await pool.query("DELETE FROM messages WHERE user_id = $1", [req.user.id]);
        res.success(null, "Chat history cleared");
    } catch (error) {
        next(error);
    }
};
