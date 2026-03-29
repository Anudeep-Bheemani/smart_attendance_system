require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('./src/routes/auth');
const studentsRoutes = require('./src/routes/students');
const staffRoutes = require('./src/routes/staff');
const branchesRoutes = require('./src/routes/branches');
const subjectsRoutes = require('./src/routes/subjects');
const attendanceRoutes = require('./src/routes/attendance');
const notificationsRoutes = require('./src/routes/notifications');
const semConfigRoutes = require('./src/routes/semConfig');

const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ── Run schema migrations before starting ────────────────────────────────────
async function runMigrations() {
  const migrations = [
    `ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "verified" BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "verificationToken" TEXT`,
    `DO $$ BEGIN
       IF NOT EXISTS (
         SELECT 1 FROM pg_constraint WHERE conname = 'Staff_verificationToken_key'
       ) THEN
         ALTER TABLE "Staff" ADD CONSTRAINT "Staff_verificationToken_key" UNIQUE ("verificationToken");
       END IF;
     END $$`,
    `ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "parentEmail" TEXT`,
    `ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "phone" TEXT`,
    `ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "phone" TEXT`,
    `UPDATE "Admin" SET "phone" = '9398003595' WHERE "phone" IS NULL`,
    `ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "callmebotKey" TEXT`,
    `ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "parentCallmebotKey" TEXT`,
  ];

  for (const sql of migrations) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (err) {
      console.error('Migration step failed:', err.message);
    }
  }
  console.log('✅ Migrations done.');
}

// ── Start server after migrations ────────────────────────────────────────────
runMigrations().then(() => {
  app.use('/api/auth', authRoutes);
  app.use('/api/students', studentsRoutes);
  app.use('/api/staff', staffRoutes);
  app.use('/api/branches', branchesRoutes);
  app.use('/api/subjects', subjectsRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/sem-config', semConfigRoutes);

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
