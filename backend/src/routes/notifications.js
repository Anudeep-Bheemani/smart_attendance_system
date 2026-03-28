const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { sendAttendanceReportToStudent, sendAttendanceReportToParent } = require('../services/emailService');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/notifications/send-attendance
// Body: { branch, year, semester (optional), month (optional) }
router.post('/send-attendance', authMiddleware, async (req, res) => {
  try {
    const { branch, year, semester, month } = req.body;

    // Fetch students for this class
    const students = await prisma.student.findMany({
      where: { branch, year: parseInt(year) }
    });

    if (students.length === 0) {
      return res.json({ success: true, sent: 0, message: 'No students found for this class.' });
    }

    // Build attendance filter
    const attFilter = {
      studentId: { in: students.map(s => s.id) }
    };
    if (semester && semester !== 'all') attFilter.semester = parseInt(semester);
    if (month && month !== 'all') attFilter.month = month;

    const allRecords = await prisma.attendance.findMany({ where: attFilter });

    // Build period label
    let period = '';
    if (month && month !== 'all') {
      period = semester && semester !== 'all' ? `${month} · Sem ${semester}` : month;
    } else {
      period = semester && semester !== 'all' ? `Semester ${semester}` : 'Full Year';
    }

    let sent = 0;
    const errors = [];

    for (const student of students) {
      const records = allRecords.filter(r => r.studentId === student.id);
      try {
        await sendAttendanceReportToStudent(student, records, period);
        sent++;
        if (student.parentEmail) {
          await new Promise(r => setTimeout(r, 200));
          await sendAttendanceReportToParent(student, records, period);
        }
        // Small delay to avoid Gmail rate limit
        await new Promise(r => setTimeout(r, 300));
      } catch (err) {
        errors.push({ student: student.name, error: err.message });
      }
    }

    res.json({
      success: true,
      sent,
      total: students.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Sent ${sent} of ${students.length} emails successfully.`
    });
  } catch (err) {
    console.error('Send attendance error:', err);
    res.status(500).json({ error: 'Failed to send emails', details: err.message });
  }
});

module.exports = router;
