// setup-database-postgres.js - Create PostgreSQL database and tables
require('dotenv').config();
const { Client } = require('pg');

const dbName = process.env.DB_NAME || 'edurouteai';

async function setupDatabase() {
  const password = process.env.DB_PASS || process.env.DB_PASSWORD || '';

  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: String(password),
    database: 'postgres',
  });

  try {
    await adminClient.connect();
    const { rows } = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    if (rows.length === 0) {
      await adminClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created`);
    } else {
      console.log(`✅ Database "${dbName}" already exists`);
    }
  } finally {
    await adminClient.end();
  }

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: String(password),
    database: dbName,
  });

  try {
    await client.connect();

    await client.query(`
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
    console.log('✅ Users table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'bot')),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Messages table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        education_grade VARCHAR(100), education_department VARCHAR(100), education_year VARCHAR(50),
        interests JSONB DEFAULT '[]'::jsonb, skills_learned JSONB DEFAULT '[]'::jsonb, skills_to_learn JSONB DEFAULT '[]'::jsonb,
        planning_days INT DEFAULT 30, email VARCHAR(255), phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ User Profiles table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_roadmaps (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        roadmap_content TEXT, status VARCHAR(20) DEFAULT 'active',
        progress_percentage DECIMAL(5,2) DEFAULT 0.00, completed_tasks JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ User Roadmaps table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL, title VARCHAR(255) NOT NULL, message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Notifications table created');

    console.log('🎉 PostgreSQL database setup completed!');
  } catch (error) {
    console.error('❌ Setup error:', error);
  } finally {
    await client.end();
  }
}

setupDatabase();
