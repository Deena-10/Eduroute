// controllers/userController.js
const connection = require('../config/mysql'); // Make sure this exports a mysql2/promise pool
const { isArray } = Array;

// Utility to safely parse JSON
const safeParse = (str) => {
  try {
    return JSON.parse(str) || [];
  } catch {
    return [];
  }
};

// ==================
// Get User Profile
// ==================
exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [results] = await connection.execute(
      'SELECT id, name, email, interests, strengths, profilePicture FROM users WHERE id = ?',
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = results[0];
    user.interests = safeParse(user.interests);
    user.strengths = safeParse(user.strengths);

    res.json({ success: true, user });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ success: false, message: 'Database error', error: err.message });
  }
};

// ==================
// Update User Profile
// ==================
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  let { name, interests, strengths } = req.body;

  if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

  if (!isArray(interests)) interests = [];
  if (!isArray(strengths)) strengths = [];

  try {
    // Update user
    await connection.execute(
      `UPDATE users
       SET name = ?, interests = ?, strengths = ?
       WHERE id = ?`,
      [name, JSON.stringify(interests), JSON.stringify(strengths), userId]
    );

    // Fetch updated user
    const [results] = await connection.execute(
      'SELECT id, name, email, interests, strengths, profilePicture FROM users WHERE id = ?',
      [userId]
    );

    const user = results[0];
    user.interests = safeParse(user.interests);
    user.strengths = safeParse(user.strengths);

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ success: false, message: 'Database error', error: err.message });
  }
};
