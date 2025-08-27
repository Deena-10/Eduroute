// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const connection = require('../config/mysql');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    connection.query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [decoded.id],
      (err, results) => {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }
        
        if (results.length === 0) {
          return res.status(401).json({ message: "User not found" });
        }
        
        req.user = results[0];
        next();
      }
    );
  } catch (err) {
    console.error("JWT auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
