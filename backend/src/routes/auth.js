const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { role, id, password } = req.body;
    let user = null;

    if (role === 'student' || role === 'parent') {
      const student = await prisma.student.findFirst({
        where: { OR: [{ rollNo: id }, { email: id }] }
      });
      if (!student) return res.status(401).json({ error: 'Invalid credentials' });
      const valid = await bcrypt.compare(password, student.password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      const { password: _, ...safeStudent } = student;
      if (role === 'parent') {
        user = {
          ...safeStudent,
          id: `P-${student.id}`,
          role: 'parent',
          name: `Parent of ${student.name}`,
          childId: student.id
        };
      } else {
        user = safeStudent;
      }
    } else if (role === 'lecturer') {
      const staff = await prisma.staff.findFirst({ where: { email: id } });
      if (!staff) return res.status(401).json({ error: 'Invalid credentials' });
      const valid = await bcrypt.compare(password, staff.password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      const { password: _, ...safeStaff } = staff;
      user = safeStaff;
    } else if (role === 'admin') {
      const admin = await prisma.admin.findFirst({ where: { email: id } });
      if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      const { password: _, ...safeAdmin } = admin;
      user = safeAdmin;
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me - restore session from token
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { id, role } = req.user;

    if (role === 'parent') {
      const realId = id.replace('P-', '');
      const student = await prisma.student.findUnique({ where: { id: realId } });
      if (!student) return res.status(404).json({ error: 'Not found' });
      const { password: _, ...safe } = student;
      return res.json({
        ...safe,
        id,
        role: 'parent',
        name: `Parent of ${student.name}`,
        childId: student.id
      });
    }

    if (role === 'student') {
      const student = await prisma.student.findUnique({ where: { id } });
      if (!student) return res.status(404).json({ error: 'Not found' });
      const { password: _, ...safe } = student;
      return res.json(safe);
    }

    if (role === 'lecturer') {
      const staff = await prisma.staff.findUnique({ where: { id } });
      if (!staff) return res.status(404).json({ error: 'Not found' });
      const { password: _, ...safe } = staff;
      return res.json(safe);
    }

    if (role === 'admin') {
      const admin = await prisma.admin.findUnique({ where: { id } });
      if (!admin) return res.status(404).json({ error: 'Not found' });
      const { password: _, ...safe } = admin;
      return res.json(safe);
    }

    res.status(400).json({ error: 'Unknown role' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/check-student - verify student exists for account activation
router.post('/check-student', async (req, res) => {
  try {
    const { rollNo, email } = req.body;
    const student = await prisma.student.findFirst({ where: { rollNo, email } });
    if (!student) return res.json({ exists: false });
    res.json({ exists: true, verified: student.verified });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/admin-contact — returns admin name, email, phone (no password)
router.get('/admin-contact', authMiddleware, async (req, res) => {
  try {
    const admin = await prisma.admin.findFirst();
    if (!admin) return res.status(404).json({ error: 'No admin found' });
    const { password: _, ...safe } = admin;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
