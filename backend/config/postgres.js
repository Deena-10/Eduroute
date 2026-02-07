// backend/config/postgres.js - PostgreSQL database connection using pg
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASS || process.env.DB_PASSWORD || ''),
  database: process.env.DB_NAME || 'edurouteai',
});

pool.query('SELECT 1')
  .then(() => console.log('✅ PostgreSQL Connected'))
  .catch((err) => {
    console.error('❌ PostgreSQL connection error:', err.message);
    process.exit(1);
  });

// Create tables on startup (PostgreSQL)
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        "googleId" VARCHAR(255) DEFAULT NULL,
        "profilePicture" VARCHAR(255) DEFAULT NULL,
        interests JSONB DEFAULT '[]'::jsonb,
        strengths JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'bot')),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        education_grade VARCHAR(100), education_department VARCHAR(100), education_year VARCHAR(50),
        interests JSONB DEFAULT '[]'::jsonb, skills_learned JSONB DEFAULT '[]'::jsonb, skills_to_learn JSONB DEFAULT '[]'::jsonb,
        planning_days INT DEFAULT 30, email VARCHAR(255), phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_roadmaps (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        roadmap_content TEXT, status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
        progress_percentage DECIMAL(5,2) DEFAULT 0.00, completed_tasks JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL, title VARCHAR(255) NOT NULL, message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS career_onboarding_state (
        id SERIAL PRIMARY KEY,
        uid VARCHAR(100) NOT NULL UNIQUE,
        step VARCHAR(30) NOT NULL DEFAULT 'domain',
        domain VARCHAR(255),
        proficiency_level VARCHAR(30),
        current_status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_learning_streak (
        user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        current_streak INT NOT NULL DEFAULT 0,
        last_activity_date DATE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (e) {
    // Tables may already exist
  }
})();

module.exports = pool;
