-- AlterTable: Change userId column type to String
-- This migration ensures userId can store OAuth IDs which are strings

-- First, drop the foreign key constraint if it exists
ALTER TABLE "Analysis" DROP CONSTRAINT IF EXISTS "Analysis_userId_fkey";

-- Change the column type to TEXT (PostgreSQL doesn't have VARCHAR without length, TEXT is better)
ALTER TABLE "Analysis" ALTER COLUMN "userId" TYPE TEXT USING "userId"::TEXT;

-- Recreate the foreign key constraint
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Ensure User.id is also TEXT (it should be already, but just in case)
-- This will only run if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'id' AND data_type != 'text'
  ) THEN
    ALTER TABLE "User" ALTER COLUMN "id" TYPE TEXT;
  END IF;
END $$;
