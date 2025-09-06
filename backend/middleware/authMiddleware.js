// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const connection = require('../config/mysql');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log('Auth middleware - JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'Missing');
  console.log('Auth middleware - Authorization header:', authHeader ? 'Present' : 'Missing');

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  console.log('Auth middleware - Token:', token ? token.substring(0, 20) + '...' : 'Missing');

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production');
    
    console.log('Auth middleware - Decoded token:', decoded);
    
    // Get user from database
    connection.query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [decoded.id],
      (err, results) => {
        if (err) {
          console.error('Auth middleware - Database error:', err);
          return res.status(500).json({ message: "Database error" });
        }
        
        console.log('Auth middleware - Database results:', results);
        
        if (results.length === 0) {
          console.log('Auth middleware - User not found for ID:', decoded.id);
          return res.status(401).json({ message: "User not found" });
        }
        
        req.user = results[0];
        console.log('Auth middleware - User authenticated:', req.user);
        next();
      }
    );
  } catch (err) {
    console.error("JWT auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
