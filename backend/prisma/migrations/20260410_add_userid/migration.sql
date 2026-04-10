-- Add userId column to Analysis table for user authentication
-- This migration safely adds the column if it doesn't exist

-- Add userId column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Analysis' AND column_name = 'userId'
  ) THEN
    ALTER TABLE "Analysis" ADD COLUMN "userId" TEXT;
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Analysis_userId_fkey'
  ) THEN
    ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add index if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'Analysis' AND indexname = 'Analysis_userId_idx'
  ) THEN
    CREATE INDEX "Analysis_userId_idx" ON "Analysis"("userId");
  END IF;
END $$;
