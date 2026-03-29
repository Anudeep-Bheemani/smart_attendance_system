const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { sendStaffVerificationEmail } = require('../services/emailService');

const router = express.Router();
const prisma = new PrismaClient();

const omitPassword = (s) => {
  const { password, verificationToken, ...rest } = s;
  return rest;
};

// GET /api/staff
router.get('/', authMiddleware, async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({ orderBy: { name: 'asc' } });
    res.json(staff.map(omitPassword));
  } catch (err) {
    console.error('GET /staff error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/staff/verify-token/:token  — public, resolves token to staff info
router.get('/verify-token/:token', async (req, res) => {
  try {
    const staff = await prisma.staff.findFirst({ where: { verificationToken: req.params.token } });
    if (!staff) return res.status(404).json({ error: 'Invalid or expired link.' });
    res.json(omitPassword(staff));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/staff/verify  — public, sets password and marks verified
router.post('/verify', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and password required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const staff = await prisma.staff.findFirst({ where: { verificationToken: token } });
    if (!staff) return res.status(404).json({ error: 'Invalid or expired link.' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.staff.update({
      where: { id: staff.id },
      data: { password: hashed, verified: true, verificationToken: null }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/staff  — admin creates staff; no password accepted; sends verification email
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, subjects, branch, academicYear, assignedClass } = req.body;
    const id = `L${Date.now()}`;
    const tempHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const resolvedClass = assignedClass || (branch && academicYear ? `${branch}-${academicYear}` : null);

    const staff = await prisma.staff.create({
      data: {
        id, role: 'lecturer', name, email,
        password: tempHash,
        subjects: subjects || [],
        branch: branch || null,
        academicYear: academicYear || null,
        assignedClass: resolvedClass,
        verified: false,
        verificationToken,
      }
    });

    sendStaffVerificationEmail(staff).catch(err =>
      console.error('Staff verification email failed:', err.message)
    );

    res.status(201).json(omitPassword(staff));
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/staff/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email, subjects, branch, academicYear, assignedClass } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (subjects !== undefined) data.subjects = subjects;
    if (branch !== undefined) data.branch = branch;
    if (academicYear !== undefined) data.academicYear = academicYear;

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
