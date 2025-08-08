// Step 5: Integrate into server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(session({
  secret: '80e3ddbfcf0dbbf552c9fd8b874e3f54de2d03a7886275f7acf4dfebeea2c14d850a79091b56b63d6f7931a5cf266de007f79a6b6effed37a544b61f46934ab9',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/auth', googleAuthRoutes);

mongoose.connect(process.env.MONGO_URI)

  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

app.listen(5000, () => console.log('Server running on port 5000'));