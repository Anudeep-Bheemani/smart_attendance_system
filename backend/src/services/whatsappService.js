const https = require('https');

// ── CallMeBot sender ──────────────────────────────────────────────────────────
// Each recipient must opt-in once: WhatsApp "+34 644 16 08 17" → "I allow callmebot to send me messages"
// They receive a personal apiKey; we store it in DB and use it here.

const sendCallMeBot = (phone, apiKey, message) => {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apiKey}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        // CallMeBot returns 200 even on some errors, check body
        if (res.statusCode === 200) resolve(data);
        else reject(new Error(`CallMeBot HTTP ${res.statusCode}: ${data}`));
      });
    }).on('error', reject);
  });
};

const normalizePhone = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return '91' + digits;   // Indian 10-digit → add country code
  return digits;
};

const statusLabel = (pct) => {
  if (pct >= 75) return 'Safe ✅';
  if (pct >= 65) return 'Warning ⚠️';
  return 'Critical 🔴';
};

// ── Send attendance report to student ────────────────────────────────────────
const sendAttendanceWhatsApp = async (student, records, period) => {
  if (!student.callmebotKey || !student.phone) return { skipped: true };

  const phone = normalizePhone(student.phone);
  if (!phone) return { skipped: true };

  const totalHours = records.reduce((s, r) => s + r.totalHours, 0);
  const attendedHours = records.reduce((s, r) => s + r.attendedHours, 0);
  const pct = totalHours > 0 ? (attendedHours / totalHours) * 100 : 0;

  const subjectLines = records.map(r => {
    const p = r.totalHours > 0 ? ((r.attendedHours / r.totalHours) * 100).toFixed(1) : '0.0';
    return `  • ${r.subject}: ${r.attendedHours}/${r.totalHours} hrs (${p}%)`;
  }).join('\n');

  const warning = pct < 75
    ? '\n⚠️ Below 75%! Attend classes regularly to avoid penalties.'
    : '';

  const message =
`📊 *SmartAttd Attendance Report*
Period: ${period}

Hello ${student.name} (${student.rollNo}),

Overall: *${pct.toFixed(1)}%* — ${statusLabel(pct)}
Attended: ${attendedHours}/${totalHours} hrs
${subjectLines ? '\nSubject-wise:\n' + subjectLines : ''}${warning}

View full stats: ${process.env.APP_URL}`;

  await sendCallMeBot(phone, student.callmebotKey, message);
  return { sent: true };
};

// ── Send attendance report to parent ─────────────────────────────────────────
const sendAttendanceWhatsAppToParent = async (student, records, period) => {
  if (!student.parentCallmebotKey || !student.guardianPhone) return { skipped: true };

  const phone = normalizePhone(student.guardianPhone);
  if (!phone) return { skipped: true };

  const totalHours = records.reduce((s, r) => s + r.totalHours, 0);
  const attendedHours = records.reduce((s, r) => s + r.attendedHours, 0);
  const pct = totalHours > 0 ? (attendedHours / totalHours) * 100 : 0;

  const warning = pct < 75
    ? '\n⚠️ Below 75%! Please encourage your ward to attend regularly.'
    : '\n✅ Attendance is in good standing. Keep it up!';

  const message =
`📊 *SmartAttd — Ward's Attendance*
Period: ${period}

Dear ${student.guardianName || 'Parent'},

Your ward *${student.name}* (${student.rollNo})
${student.branch} — Year ${student.year}

Overall: *${pct.toFixed(1)}%* — ${statusLabel(pct)}
Attended: ${attendedHours}/${totalHours} hrs${warning}

View full stats: ${process.env.APP_URL}
(Login as Parent using ward's roll number)`;

  await sendCallMeBot(phone, student.parentCallmebotKey, message);
  return { sent: true };
};

module.exports = { sendAttendanceWhatsApp, sendAttendanceWhatsAppToParent };
