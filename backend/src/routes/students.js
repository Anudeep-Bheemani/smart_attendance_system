const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { sendVerificationEmail } = require('../services/emailService');

const router = express.Router();
const prisma = new PrismaClient();

const omitPassword = (s) => { const { password, ...rest } = s; return rest; };

// GET /api/students
router.get('/', authMiddleware, async (req, res) => {
  try {
    const students = await prisma.student.findMany({ orderBy: { rollNo: 'asc' } });
    res.json(students.map(omitPassword));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/students/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) return res.status(404).json({ error: 'Not found' });
    res.json(omitPassword(student));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/students/verify-token/:token - look up student by verification token
router.get('/verify-token/:token', async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { verificationToken: req.params.token } });
    if (!student) return res.status(404).json({ error: 'Invalid or expired link.' });
    if (student.verified) return res.status(400).json({ error: 'Account already verified. Please login.' });
    res.json({ name: student.name, email: student.email, rollNo: student.rollNo });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/students/verify - activate account with new password (supports token or email)
router.post('/verify', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    const hashed = await bcrypt.hash(newPassword, 10);
    const where = token ? { verificationToken: token } : { email };
    const student = await prisma.student.update({
      where,
      data: { password: hashed, verified: true, verificationToken: null }
    });
    res.json(omitPassword(student));
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Student not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/students
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, rollNo, email, phone, branch, year, dob, guardianName, guardianPhone } = req.body;
    const id = `S${Date.now()}`;
    const hashed = await bcrypt.hash('pass', 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const student = await prisma.student.create({
      data: { id, role: 'student', name, rollNo, email, phone, branch, year: parseInt(year), dob, guardianName, guardianPhone, password: hashed, verified: false, verificationToken }
    });
    // Send welcome email with real token link (non-blocking)
    sendVerificationEmail(student).catch(err => console.error('Verification email failed:', err.message));

    res.status(201).json(omitPassword(student));
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Roll number or email already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/students/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, rollNo, email, phone, branch, year, dob, guardianName, guardianPhone, photo } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (rollNo !== undefined) data.rollNo = rollNo;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (branch !== undefined) data.branch = branch;
    if (year !== undefined) data.year = parseInt(year);
    if (dob !== undefined) data.dob = dob;
    if (guardianName !== undefined) data.guardianName = guardianName;
    if (guardianPhone !== undefined) data.guardianPhone = guardianPhone;
    if (photo !== undefined) data.photo = photo;

    const student = await prisma.student.update({ where: { id: req.params.id }, data });
    res.json(omitPassword(student));
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/students/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.student.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
