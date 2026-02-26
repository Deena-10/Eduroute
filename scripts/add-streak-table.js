// Run this if streak shows 0 and you've completed tasks - creates missing user_learning_streak table
// Run: cd backend && npm run add-streak-table
const path = require('path');
const backendDir = path.join(__dirname, '..', 'backend');
try {
  require(path.join(backendDir, 'node_modules/dotenv')).config({ path: path.join(backendDir, '.env') });
} catch (_) {}
const { Client } = require(path.join(backendDir, 'node_modules/pg'));

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
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_scores (
        user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        total_correct INT NOT NULL DEFAULT 0,
        total_questions INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('user_scores table created or already exists');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        achievement_type VARCHAR(50) NOT NULL,
        achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_achievements_unique ON user_achievements(user_id, achievement_type)`).catch(() => {});
    console.log('user_achievements table created or already exists');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_activity_log (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL,
        title VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id)`).catch(() => {});
    console.log('user_activity_log table created or already exists');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

addStreakTable();
