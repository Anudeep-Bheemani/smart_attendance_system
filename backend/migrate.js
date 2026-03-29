// Runs safe schema migrations before server start.
// Adds any missing columns that prisma db push may have missed.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  try {
    // Add verified column to Staff if missing
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "verified" BOOLEAN NOT NULL DEFAULT false;
    `);
    // Add verificationToken column to Staff if missing
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "verificationToken" TEXT;
    `);
    // Add unique constraint on verificationToken if not already there
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'Staff_verificationToken_key'
        ) THEN
          ALTER TABLE "Staff" ADD CONSTRAINT "Staff_verificationToken_key" UNIQUE ("verificationToken");
        END IF;
      END $$;
    `);

    // Add parentEmail column to Student if missing
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "parentEmail" TEXT;
    `);

    console.log('✅ Migration complete.');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
