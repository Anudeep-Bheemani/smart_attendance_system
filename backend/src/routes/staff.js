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
    if (assignedClass !== undefined) data.assignedClass = assignedClass;
    if (password) data.password = await bcrypt.hash(password, 10);

    const staff = await prisma.staff.update({ where: { id: req.params.id }, data });
    res.json(omitPassword(staff));
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
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
