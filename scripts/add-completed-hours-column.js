/**
 * One-time migration: add completed_hours to user_roadmaps for the 40-hour goal feature.
 * Run with: node scripts/add-completed-hours-column.js
 * (Requires DATABASE_URL in .env or set in environment)
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../backend/.env') });
const { Pool } = require('pg');

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(`
      ALTER TABLE user_roadmaps ADD COLUMN IF NOT EXISTS completed_hours DECIMAL(6,2) DEFAULT 0.00
    `);
    console.log('✅ completed_hours column added (or already exists)');
  } catch (e) {
    console.error('Migration failed:', e.message);
  } finally {
    await pool.end();
  }
}
run();
