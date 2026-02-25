-- Add professional_goal to career_onboarding_state for one-time mandatory input.
-- Run from repo root: npx prisma db push  (or apply this SQL if your Postgres supports it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'career_onboarding_state' AND column_name = 'professional_goal'
  ) THEN
    ALTER TABLE career_onboarding_state ADD COLUMN professional_goal VARCHAR(100);
  END IF;
END $$;
