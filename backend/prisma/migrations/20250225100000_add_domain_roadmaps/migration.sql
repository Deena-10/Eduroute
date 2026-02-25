-- Create domain_roadmaps table for AI-generated roadmap content per domain
CREATE TABLE IF NOT EXISTS domain_roadmaps (
    id SERIAL PRIMARY KEY,
    domain VARCHAR(255) NOT NULL UNIQUE,
    roadmap_content JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add domain column to user_roadmaps if missing (links user roadmap to domain_roadmaps)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_roadmaps' AND column_name = 'domain'
  ) THEN
    ALTER TABLE user_roadmaps ADD COLUMN domain VARCHAR(255);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_domain_roadmaps_domain ON domain_roadmaps(domain);
