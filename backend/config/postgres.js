// backend/config/postgres.js - PostgreSQL connection via pg client (non-fatal startup).
const { Pool } = require("pg");
const { maskDatabaseUrl, validateSupabasePooledUrl } = require("./databaseUrl");

const databaseUrl = process.env.DATABASE_URL ? String(process.env.DATABASE_URL).trim() : "";
const hasDatabaseUrl = Boolean(databaseUrl);
const normalizeDatabaseUrlForPg = (rawUrl) => {
  if (!rawUrl) return rawUrl;
  try {
    const parsed = new URL(rawUrl);
    // pg v8 + pg-connection-string currently treats sslmode=require as verify-full.
    // Add uselibpqcompat=true so require behaves like libpq semantics on managed DBs.
    if (parsed.searchParams.get("sslmode") === "require" && !parsed.searchParams.get("uselibpqcompat")) {
      parsed.searchParams.set("uselibpqcompat", "true");
    }
    return parsed.toString();
  } catch (_) {
    return rawUrl;
  }
};

const poolConfig = hasDatabaseUrl
  ? {
      connectionString: normalizeDatabaseUrlForPg(databaseUrl),
      // Supabase pooling requires TLS; rejectUnauthorized false is common for managed cert chains.
      ssl: { rejectUnauthorized: false },
      max: Number(process.env.DB_POOL_MAX) || 5,
      idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
      connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS) || 10000,
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432", 10),
      user: process.env.DB_USER || "postgres",
      password: String(process.env.DB_PASS || process.env.DB_PASSWORD || ""),
      database: process.env.DB_NAME || "edurouteai",
      max: Number(process.env.DB_POOL_MAX) || 5,
      idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
      connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS) || 10000,
    };

const pool = new Pool(poolConfig);

const dbDiagnostics = {
  hasDatabaseUrl,
  maskedDatabaseUrl: maskDatabaseUrl(databaseUrl),
  validationIssues: hasDatabaseUrl ? validateSupabasePooledUrl(databaseUrl) : [],
};

const getDbDiagnostics = () => dbDiagnostics;

const logDbConfigSummary = () => {
  if (!hasDatabaseUrl) {
    console.warn("⚠️ DATABASE_URL not set. Falling back to DB_HOST/DB_PORT/DB_USER/DB_NAME config.");
    return;
  }
  console.log(`ℹ️ DATABASE_URL: ${dbDiagnostics.maskedDatabaseUrl}`);
  if (dbDiagnostics.validationIssues.length > 0) {
    console.warn("⚠️ DATABASE_URL validation warnings:");
    dbDiagnostics.validationIssues.forEach((issue) => console.warn(`   - ${issue}`));
  } else {
    console.log("✅ DATABASE_URL format looks good for Supabase pooling.");
  }
};

const checkPostgresConnection = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ PostgreSQL connection test passed (pg).");
    return true;
  } catch (err) {
    console.error("❌ PostgreSQL connection test failed (pg):", err.message);
    return false;
  }
};

// Centralized query helper to improve diagnostics without crashing the process.
const rawQuery = pool.query.bind(pool);
pool.query = async (...args) => {
  try {
    return await rawQuery(...args);
  } catch (err) {
    const code = err?.code ? ` code=${err.code}` : "";
    console.error(`❌ PostgreSQL query failed${code}: ${err.message}`);
    throw err;
  }
};

module.exports = pool;
module.exports.pool = pool;
module.exports.checkPostgresConnection = checkPostgresConnection;
module.exports.logDbConfigSummary = logDbConfigSummary;
module.exports.getDbDiagnostics = getDbDiagnostics;
