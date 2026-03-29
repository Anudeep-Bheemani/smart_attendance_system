const https = require('https');

// ── Green API sender ──────────────────────────────────────────────────────────
// Docs: https://green-api.com/en/docs/api/sending/SendMessage/
// Set env vars on Render: GREEN_API_INSTANCE_ID, GREEN_API_TOKEN

const sendGreenAPI = (phone, message) => {
  return new Promise((resolve, reject) => {
    const instanceId = process.env.GREEN_API_INSTANCE_ID;
    const token = process.env.GREEN_API_TOKEN;
    if (!instanceId || !token) return reject(new Error('GREEN_API_INSTANCE_ID or GREEN_API_TOKEN not set'));

    const chatId = `${phone}@c.us`;
    const body = JSON.stringify({ chatId, message });

    const options = {
      hostname: 'api.green-api.com',
      path: `/waInstance${instanceId}/sendMessage/${token}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) resolve(JSON.parse(data));
        else reject(new Error(`Green API HTTP ${res.statusCode}: ${data}`));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

const normalizePhone = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return '91' + digits;
  return digits;
};

const statusLabel = (pct) => {
  if (pct >= 75) return 'Safe ✅';
  if (pct >= 65) return 'Warning ⚠️';
  return 'Critical 🔴';
};

// ── Send attendance report to student ────────────────────────────────────────
const sendAttendanceWhatsApp = async (student, records, period) => {
  if (!student.phone) return { skipped: true };
  const phone = normalizePhone(student.phone);
  if (!phone) return { skipped: true };

  const totalHours = records.reduce((s, r) => s + r.totalHours, 0);
  const attendedHours = records.reduce((s, r) => s + r.attendedHours, 0);
  const pct = totalHours > 0 ? (attendedHours / totalHours) * 100 : 0;

  const subjectLines = records.map(r => {
    const p = r.totalHours > 0 ? ((r.attendedHours / r.totalHours) * 100).toFixed(1) : '0.0';
    return `  • ${r.subject}: ${r.attendedHours}/${r.totalHours} hrs (${p}%)`;
  }).join('\n');

  const warning = pct < 75 ? '\n⚠️ Below 75%! Attend regularly to avoid penalties.' : '';

  const message =
`📊 *SmartAttd Attendance Report*
Period: ${period}

Hello ${student.name} (${student.rollNo}),

Overall: *${pct.toFixed(1)}%* — ${statusLabel(pct)}
Attended: ${attendedHours}/${totalHours} hrs
${subjectLines ? '\nSubject-wise:\n' + subjectLines : ''}${warning}

View full stats: ${process.env.APP_URL}`;

  await sendGreenAPI(phone, message);
  return { sent: true };
};

// ── Send attendance report to parent ─────────────────────────────────────────
const sendAttendanceWhatsAppToParent = async (student, records, period) => {
  if (!student.guardianPhone) return { skipped: true };
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

  await sendGreenAPI(phone, message);
  return { sent: true };
};

module.exports = { sendAttendanceWhatsApp, sendAttendanceWhatsAppToParent };
