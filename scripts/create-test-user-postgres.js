// create-test-user-postgres.js - Create a test user in PostgreSQL
require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASS || process.env.DB_PASSWORD || ''),
  database: process.env.DB_NAME || 'edurouteai',
});

async function createTestUser() {
  try {
    const name = process.env.TEST_USER_NAME || 'Test User';
    const email = process.env.TEST_USER_EMAIL || 'test@example.com';
    const password = process.env.TEST_USER_PASSWORD || `Temp-${Math.random().toString(36).slice(2, 10)}`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows: existing } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existing.length > 0) {
      console.log('✅ Test user already exists:', existing[0]);
      return;
    }

    const { rows: inserted } = await pool.query(
      'INSERT INTO users (name, email, password, interests, strengths) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, email, hashedPassword, '[]', '[]']
    );

    console.log('✅ Test user created successfully!');
    console.log('User ID:', inserted[0].id);
    console.log('Email:', email);
    console.log('Password:', password);
    if (!process.env.TEST_USER_PASSWORD) {
      console.log('ℹ️ TEST_USER_PASSWORD not set; generated temporary password used.');
    }
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await pool.end();
  }
}

createTestUser();
