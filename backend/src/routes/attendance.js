const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/attendance?studentId=&month=&semester=
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { studentId, month, semester } = req.query;
    const where = {};
    if (studentId) where.studentId = studentId;
    if (month) where.month = month;
    if (semester) where.semester = parseInt(semester);
    const records = await prisma.attendance.findMany({ where, orderBy: { createdAt: 'asc' } });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/attendance/upsert
router.post('/upsert', authMiddleware, async (req, res) => {
  try {
    const { studentId, subject, month, semester = 1, field, value, studentName, rollNo } = req.body;
    const semInt = parseInt(semester);

    const existing = await prisma.attendance.findFirst({
      where: { studentId, subject, month, semester: semInt }
    });

    if (existing) {
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: { [field]: value }
      });
      return res.json(updated);
    }

    const newRecord = await prisma.attendance.create({
      data: {
        studentId,
        studentName: studentName || '',
        rollNo: rollNo || '',
        subject,
        month,
        semester: semInt,
        totalHours: field === 'totalHours' ? value : 40,
        attendedHours: field === 'attendedHours' ? value : 0
      }
    });
    res.status(201).json(newRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/attendance/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { totalHours, attendedHours } = req.body;
    const data = {};
    if (totalHours !== undefined) data.totalHours = totalHours;
    if (attendedHours !== undefined) data.attendedHours = attendedHours;
    const record = await prisma.attendance.update({ where: { id: req.params.id }, data });
    res.json(record);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/attendance/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.attendance.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
