const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const {
  sendAttendanceReportToStudent,
  sendAttendanceReportToParent,
  sendStaffReminderEmail,
  sendExcuseLetterEmail,
} = require('../services/emailService');
const { sendAttendanceWhatsApp, sendAttendanceWhatsAppToParent } = require('../services/whatsappService');

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

// POST /api/notifications/send-whatsapp
// Body: { branch, year, semester, month } — same as send-attendance but WhatsApp only
router.post('/send-whatsapp', authMiddleware, async (req, res) => {
  try {
    const { branch, year, semester, month } = req.body;

    const studentWhere = {};
    if (branch && branch !== 'all') studentWhere.branch = branch;
    if (year && year !== 'all') studentWhere.year = parseInt(year);

    const students = await prisma.student.findMany({ where: studentWhere });
    const eligible = students.filter(s => s.phone || s.guardianPhone);

    if (eligible.length === 0) {
      return res.json({ success: true, sent: 0, message: 'No students found with a phone number on file.' });
    }

    const attFilter = { studentId: { in: students.map(s => s.id) } };
    const semNum = parseInt(semester);
    if (semester && semester !== 'all' && semester !== 'null' && !isNaN(semNum)) attFilter.semester = semNum;
    if (month && month !== 'all') attFilter.month = month;

    const allRecords = await prisma.attendance.findMany({ where: attFilter });

    let period = '';
    if (month && month !== 'all') {
      period = (semester && semester !== 'all' && semester !== 'null') ? `${month} · Sem ${semester}` : month;
    } else {
      period = (semester && semester !== 'all' && semester !== 'null') ? `Semester ${semester}` : 'Full Year';
    }

    let sent = 0;
    const errors = [];

    for (const student of eligible) {
      const records = allRecords.filter(r => r.studentId === student.id);
      try {
        if (student.phone) {
          await sendAttendanceWhatsApp(student, records, period);
          sent++;
          await new Promise(r => setTimeout(r, 400));
        }
        if (student.guardianPhone) {
          await sendAttendanceWhatsAppToParent(student, records, period);
          sent++;
          await new Promise(r => setTimeout(r, 400));
        }
      } catch (err) {
        errors.push({ student: student.name, error: err.message });
      }
    }

    res.json({
      success: true,
      sent,
      total: eligible.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Sent ${sent} WhatsApp message(s) to ${eligible.length} eligible student(s)/parent(s).`,
    });
  } catch (err) {
    console.error('Send WhatsApp error:', err);
    res.status(500).json({ error: 'Failed to send WhatsApp messages', details: err.message });
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

// POST /api/notifications/send-letter
// Body: { recipientType: 'incharge' | 'admin', letterText }
// Authenticated student sends their excuse letter to their class incharge or admin
router.post('/send-letter', authMiddleware, async (req, res) => {
  try {
    const { recipientType, letterText } = req.body;
    if (!letterText) return res.status(400).json({ error: 'Letter text is required.' });

    // Get the student from the token
    const student = await prisma.student.findUnique({ where: { id: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    let toEmail, toName;

    if (recipientType === 'incharge') {
      // Find staff assigned to this student's class (branch-year)
      const assignedClass = `${student.branch}-${student.year}`;
      const staff = await prisma.staff.findFirst({ where: { assignedClass } });
      if (!staff) return res.status(404).json({ error: `No class in-charge found for ${assignedClass}.` });
      toEmail = staff.email;
      toName = staff.name;
    } else {
      // Send to admin
      const admin = await prisma.admin.findFirst();
      if (!admin) return res.status(404).json({ error: 'No admin found.' });
      toEmail = admin.email;
      toName = admin.name;
    }

    await sendExcuseLetterEmail(toEmail, toName, student, letterText);

    res.json({ success: true, message: `Letter sent to ${toName} (${toEmail}).`, to: toName });
  } catch (err) {
    console.error('Send letter error:', err);
    res.status(500).json({ error: 'Failed to send letter.', details: err.message });
  }
});

module.exports = router;
