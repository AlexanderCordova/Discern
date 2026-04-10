-- Remove foreign key constraint on Analysis.userId
-- This allows analyses to be saved with OAuth user IDs without requiring User records in database

-- Drop the foreign key constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Analysis_userId_fkey'
  ) THEN
    ALTER TABLE "Analysis" DROP CONSTRAINT "Analysis_userId_fkey";
    RAISE NOTICE 'Foreign key constraint dropped';
  ELSE
    RAISE NOTICE 'Foreign key constraint does not exist';
  END IF;
END $$;
