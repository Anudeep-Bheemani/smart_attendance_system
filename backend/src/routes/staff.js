const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const omitPassword = (s) => { const { password, ...rest } = s; return rest; };

// GET /api/staff
router.get('/', authMiddleware, async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({ orderBy: { name: 'asc' } });
    res.json(staff.map(omitPassword));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/staff
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, password, subjects, branch, academicYear, assignedClass } = req.body;
    const id = `L${Date.now()}`;
    const hashed = await bcrypt.hash(password || 'pass', 10);
    const staff = await prisma.staff.create({
      data: {
        id, role: 'lecturer', name, email, password: hashed,
        subjects: subjects || [],
        branch: branch || null,
        academicYear: academicYear || null,
        assignedClass: assignedClass || null
      }
    });
    res.status(201).json(omitPassword(staff));
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/staff/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email, password, subjects, branch, academicYear, assignedClass } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (subjects !== undefined) data.subjects = subjects;
    if (branch !== undefined) data.branch = branch;
    if (academicYear !== undefined) data.academicYear = academicYear;
    if (password) data.password = await bcrypt.hash(password, 10);

    // Auto-compute assignedClass if branch or academicYear changed
    const existing = await prisma.staff.findUnique({ where: { id: req.params.id } });
    const finalBranch = branch !== undefined ? branch : existing?.branch;
    const finalYear = academicYear !== undefined ? academicYear : existing?.academicYear;
    if (finalBranch && finalYear) data.assignedClass = `${finalBranch}-${finalYear}`;
    else if (assignedClass !== undefined) data.assignedClass = assignedClass;

    const staff = await prisma.staff.update({ where: { id: req.params.id }, data });
    res.json(omitPassword(staff));
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/staff/change-password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const staff = await prisma.staff.findUnique({ where: { id: req.user.id } });
    if (!staff) return res.status(404).json({ error: 'Not found' });
    const valid = await bcrypt.compare(currentPassword, staff.password);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
    if (!newPassword || newPassword.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
    await prisma.staff.update({ where: { id: staff.id }, data: { password: await bcrypt.hash(newPassword, 10) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/staff/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.staff.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
