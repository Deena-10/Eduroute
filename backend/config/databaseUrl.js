// backend/config/databaseUrl.js
// Shared DATABASE_URL helpers for startup validation and safe logging.

const maskDatabaseUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.password) parsed.password = "****";
    return parsed.toString();
  } catch (_) {
    return "<invalid DATABASE_URL>";
  }
};

const validateSupabasePooledUrl = (rawUrl) => {
  const issues = [];
  if (!rawUrl || typeof rawUrl !== "string") {
    issues.push("DATABASE_URL is missing.");
    return issues;
  }

  const trimmed = rawUrl.trim();
  if (trimmed !== rawUrl) issues.push("DATABASE_URL has leading/trailing spaces.");
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    issues.push("DATABASE_URL contains wrapping quotes. Remove them in Render env vars.");
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch (_) {
    issues.push("DATABASE_URL is not a valid URL.");
    return issues;
  }

  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    issues.push("DATABASE_URL must start with postgres:// or postgresql://");
  }
  if (!parsed.hostname.includes(".pooler.supabase.com")) {
    issues.push("Use Supabase pooling host (*.pooler.supabase.com).");
  }
  if (parsed.port !== "6543") {
    issues.push("Use Supabase pooling port 6543.");
  }
  if (!parsed.username || !parsed.username.startsWith("postgres.")) {
    issues.push("Username should look like postgres.<project-ref>.");
  }
  if (!parsed.searchParams.get("pgbouncer")) {
    issues.push("Missing pgbouncer=true query param.");
  }
  if (!parsed.searchParams.get("connection_limit")) {
    issues.push("Missing connection_limit=1 query param.");
  }
  const sslMode = parsed.searchParams.get("sslmode");
  if (!sslMode || sslMode.toLowerCase() !== "require") {
    issues.push("Missing sslmode=require query param.");
  }
  return issues;
};

module.exports = { maskDatabaseUrl, validateSupabasePooledUrl };

