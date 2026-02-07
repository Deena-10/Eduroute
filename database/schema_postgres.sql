-- PostgreSQL Schema for Career Roadmap Application

-- Users table (matches existing structure)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    "googleId" VARCHAR(255) DEFAULT NULL,
    "profilePicture" VARCHAR(255) DEFAULT NULL,
    interests JSONB DEFAULT '[]'::jsonb,
    strengths JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table (for chat)
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'bot')),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    education_grade VARCHAR(100),
    education_department VARCHAR(100),
    education_year VARCHAR(50),
    interests JSONB DEFAULT '[]'::jsonb,
    skills_learned JSONB DEFAULT '[]'::jsonb,
    skills_to_learn JSONB DEFAULT '[]'::jsonb,
    planning_days INT DEFAULT 30,
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Roadmaps table
CREATE TABLE IF NOT EXISTS user_roadmaps (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    roadmap_content TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    completed_tasks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat History table (AI service)
CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    user_id INT,
    uid VARCHAR(100),
    sender VARCHAR(10) CHECK (sender IN ('user', 'ai')),
    question TEXT,
    answer TEXT,
    message TEXT,
    engine VARCHAR(50) DEFAULT 'gemini',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    roadmap_id INT NOT NULL REFERENCES user_roadmaps(id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    task_description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table (AI service)
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(200),
    title VARCHAR(255),
    domain VARCHAR(100),
    date VARCHAR(50),
    link VARCHAR(500),
    suggested_for_percentage DECIMAL(5,2)
);

-- Projects table (AI service)
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(200),
    title VARCHAR(255),
    domain VARCHAR(100),
    description TEXT,
    suggested_for_percentage DECIMAL(5,2)
);

-- Roadmap Progress table (AI service - uses uid)
CREATE TABLE IF NOT EXISTS roadmap_progress (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(100) NOT NULL,
    roadmap_step TEXT,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Career onboarding state (conversational flow: domain → proficiency → status)
CREATE TABLE IF NOT EXISTS career_onboarding_state (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(100) NOT NULL UNIQUE,
    step VARCHAR(30) NOT NULL DEFAULT 'domain' CHECK (step IN ('domain', 'proficiency', 'status', 'done')),
    domain VARCHAR(255),
    proficiency_level VARCHAR(30),
    current_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_career_onboarding_uid ON career_onboarding_state(uid);

-- Learning streak (consecutive days with at least one task completed)
CREATE TABLE IF NOT EXISTS user_learning_streak (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INT NOT NULL DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_learning_streak_user_id ON user_learning_streak(user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_roadmaps_updated_at BEFORE UPDATE ON user_roadmaps
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roadmaps_user_id ON user_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roadmaps_status ON user_roadmaps(status);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_uid ON chat_history(uid);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_roadmap_id ON user_progress(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_events_domain ON events(domain);
CREATE INDEX IF NOT EXISTS idx_projects_domain ON projects(domain);
