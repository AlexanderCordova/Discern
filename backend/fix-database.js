/**
 * Pre-migration script to fix database state
 * This runs before Prisma migrations to ensure the database is ready
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database state...');

    // Step 1: Add userId column if it doesn't exist
    console.log('📝 Adding userId column if needed...');
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'Analysis' AND column_name = 'userId'
        ) THEN
          ALTER TABLE "Analysis" ADD COLUMN "userId" TEXT;
          CREATE INDEX "Analysis_userId_idx" ON "Analysis"("userId");
          RAISE NOTICE 'userId column added successfully';
        ELSE
          RAISE NOTICE 'userId column already exists';
        END IF;
      END $$;
    `);

    // Step 2: Clean up any failed migration records
    console.log('🧹 Cleaning up failed migrations...');
    await prisma.$executeRawUnsafe(`
      DELETE FROM "_prisma_migrations"
      WHERE migration_name = '20260410_update_userid_to_string'
      AND finished_at IS NULL;
    `);

    console.log('✅ Database fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
    // Don't fail - let migrations handle it
    process.exit(0);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabase();
