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

// Created tables on startup logic removed. Use Prisma migrations for schema management.
module.exports = pool;
