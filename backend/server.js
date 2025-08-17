// Load environment variables from the .env file as early as possible
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// MySQL connection
const connection = require('./config/mysql'); // Now it can access DB variables from .env

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

// Simple welcome route for testing
app.get('/', (req, res) => {
  res.send('EduRoute AI Backend is running!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
