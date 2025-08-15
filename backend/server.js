// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// MySQL connection
const connection = require('./config/mysql'); // ensures DB connects

// Routes
const authRoutes = require('./routes/authRoutes');
const questionsRoute = require('./routes/questions');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Route mounting
app.use('/auth', authRoutes);
app.use('/questions', questionsRoute);
app.use('/chat', chatRoutes);
app.use('/user', userRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
