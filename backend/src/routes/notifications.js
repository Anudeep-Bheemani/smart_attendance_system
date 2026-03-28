const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const {
  sendAttendanceReportToStudent,
  sendAttendanceReportToParent,
  sendStaffReminderEmail,
} = require('../services/emailService');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/notifications/send-attendance
// Body: { branch, year, semester (optional/'all'), month (optional/'all') }
// branch and year can be 'all' to send to every student
router.post('/send-attendance', authMiddleware, async (req, res) => {
  try {
    const { branch, year, semester, month } = req.body;

    // Build student filter
    const studentWhere = {};
    if (branch && branch !== 'all') studentWhere.branch = branch;
    if (year && year !== 'all') studentWhere.year = parseInt(year);

    const students = await prisma.student.findMany({ where: studentWhere });

    if (students.length === 0) {
      return res.json({ success: true, sent: 0, message: 'No students found.' });
    }

    // Build attendance filter
    const attFilter = { studentId: { in: students.map(s => s.id) } };
    // Only filter by semester if it's a real number (not null/"null"/"all")
    const semNum = parseInt(semester);
    if (semester && semester !== 'all' && semester !== 'null' && !isNaN(semNum)) {
      attFilter.semester = semNum;
    }
    if (month && month !== 'all') attFilter.month = month;

    const allRecords = await prisma.attendance.findMany({ where: attFilter });

    // Period label
    let period = '';
    if (month && month !== 'all') {
      period = (semester && semester !== 'all' && semester !== 'null')
        ? `${month} · Sem ${semester}`
        : month;
    } else {
      period = (semester && semester !== 'all' && semester !== 'null')
        ? `Semester ${semester}`
        : 'Full Year';
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
          sent++;
        }
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
      message: `Sent ${sent} email(s) to ${students.length} student(s) and their parents.`,
    });
  } catch (err) {
    console.error('Send attendance error:', err);
    res.status(500).json({ error: 'Failed to send emails', details: err.message });
  }
});

// POST /api/notifications/send-staff-reminder
// Sends attendance entry reminder to all staff (or specific staff by id list)
router.post('/send-staff-reminder', authMiddleware, async (req, res) => {
  try {
    const staffList = await prisma.staff.findMany();

    if (staffList.length === 0) {
      return res.json({ success: true, sent: 0, message: 'No staff found.' });
    }

    let sent = 0;
    const errors = [];

    for (const staff of staffList) {
      if (!staff.email) continue;
      try {
        await sendStaffReminderEmail(staff);
        sent++;
        await new Promise(r => setTimeout(r, 300));
      } catch (err) {
        errors.push({ staff: staff.name, error: err.message });
      }
    }

    res.json({
      success: true,
      sent,
      total: staffList.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Sent reminders to ${sent} of ${staffList.length} staff member(s).`,
    });
  } catch (err) {
    console.error('Send staff reminder error:', err);
    res.status(500).json({ error: 'Failed to send staff reminders', details: err.message });
  }
});

module.exports = router;
