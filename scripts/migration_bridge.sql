-- migration_bridge.sql
-- Run these steps manually to bridge existing data to the new schema without loss.

-- 1. Unify users table
ALTER TABLE users RENAME COLUMN "googleId" TO firebase_uid;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255);

-- 2. Convert roadmap content to JSONB if it's currently TEXT
ALTER TABLE user_roadmaps ALTER COLUMN roadmap_content TYPE JSONB USING roadmap_content::jsonb;

-- 3. Rename messages to chat_history if needed, or stick to chat_history
-- If chat_history doesn't exist yet but messages does:
-- ALTER TABLE messages RENAME TO chat_history;
-- ALTER TABLE chat_history RENAME COLUMN user_id TO firebase_uid_temp; -- This needs careful mapping if switching from ID to UID references

-- 4. Ensure JSONB defaults
ALTER TABLE users ALTER COLUMN interests SET DEFAULT '[]'::jsonb;
ALTER TABLE users ALTER COLUMN strengths SET DEFAULT '[]'::jsonb;

-- 5. Add Profile fields to user_profiles if missing
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
