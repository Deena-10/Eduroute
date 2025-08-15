
//backend\middleware\authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    // Check for the Authorization header
    const authHeader = req.header('Authorization');

    // If no header, deny access
    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Ensure the header is in the correct 'Bearer <token>' format
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid token format.' });
    }

    // Extract the token from the header
    const token = authHeader.replace('Bearer ', '');

    try {
        // Verify the token using the secret key
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the decoded user payload to the request object for use in subsequent middleware or routes
        req.user = verified;
        // Pass control to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        // Handle specific JWT errors to provide clearer feedback
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token.' });
        }
        // For any other error, return a generic unauthorized message
        res.status(401).json({ message: 'Not authorized.' });
    }
};

module.exports = authMiddleware;
