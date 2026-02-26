// Run this if streak shows 0 and you've completed tasks - creates missing user_learning_streak table
// Run from project root: cd backend && node scripts/add-streak-table.js
require('dotenv').config();
const { Client } = require('pg');

async function addStreakTable() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edurouteai',
  });

  try {
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_learning_streak (
        user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        current_streak INT NOT NULL DEFAULT 0,
        last_activity_date DATE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('user_learning_streak table created or already exists');
    await client.query(`
      ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS streak_snapshots JSONB DEFAULT '[]'::jsonb
    `).catch(() => {});
    console.log('streak_snapshots column added to user_profiles (if missing)');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

addStreakTable();
