const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const statusColor = (pct) => {
  if (pct >= 75) return '#10b981';
  if (pct >= 65) return '#f59e0b';
  return '#ef4444';
};

const statusLabel = (pct) => {
  if (pct >= 75) return 'Safe';
  if (pct >= 65) return 'Warning';
  return 'Critical';
};

// ── Verification Email ────────────────────────────────────────────────────────

const sendVerificationEmail = async (student) => {
  const verifyUrl = `${process.env.APP_URL}?verify=${student.verificationToken}`;

  const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px 16px;">
    <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 36px 40px; text-align: center;">
        <div style="font-size: 28px; font-weight: 900; color: white; letter-spacing: -0.5px;">SmartAttd</div>
        <div style="color: #bfdbfe; font-size: 13px; margin-top: 4px;">Smart Attendance Management System</div>
      </div>

      <!-- Body -->
      <div style="padding: 40px;">
        <h2 style="color: #1e293b; font-size: 22px; font-weight: 700; margin: 0 0 8px;">Welcome, ${student.name}! 👋</h2>
        <p style="color: #64748b; font-size: 15px; margin: 0 0 24px;">Your student account has been created. Please set your password to activate your account and start tracking your attendance.</p>

        <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; padding: 6px 0;">Roll Number</td>
              <td style="color: #1e293b; font-size: 14px; font-weight: 700; padding: 6px 0;">${student.rollNo}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; padding: 6px 0;">Branch</td>
              <td style="color: #1e293b; font-size: 14px; font-weight: 700; padding: 6px 0;">${student.branch} — Year ${student.year}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; padding: 6px 0;">Login Email</td>
              <td style="color: #1e293b; font-size: 14px; font-weight: 700; padding: 6px 0;">${student.email}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 700; font-size: 15px; letter-spacing: 0.3px;">
            Set My Password →
          </a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 12px;">Click the button above — you'll be taken directly to the password setup page.</p>
          <p style="color: #cbd5e1; font-size: 11px; margin-top: 6px; word-break: break-all;">${verifyUrl}</p>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">If you didn't expect this email, please ignore it or contact your lecturer.</p>
        </div>
      </div>

    </div>
  </div>`;

  await transporter.sendMail({
    from: `"SmartAttd" <${process.env.GMAIL_USER}>`,
    to: student.email,
    subject: `Welcome to SmartAttd — Set Your Password, ${student.name}`,
    html,
  });
};

// ── Attendance Report Email (Student) ────────────────────────────────────────

const sendAttendanceReportToStudent = async (student, records, period) => {
  const totalHours = records.reduce((s, r) => s + r.totalHours, 0);
  const attendedHours = records.reduce((s, r) => s + r.attendedHours, 0);
  const pct = totalHours > 0 ? ((attendedHours / totalHours) * 100) : 0;
  const color = statusColor(pct);
  const label = statusLabel(pct);

  const subjectRows = records.map(r => {
    const subPct = r.totalHours > 0 ? ((r.attendedHours / r.totalHours) * 100).toFixed(1) : '0.0';
    return `
      <tr>
        <td style="padding: 10px 16px; color: #334155; font-size: 13px;">${r.subject}</td>
        <td style="padding: 10px 16px; text-align: center; color: #64748b; font-size: 13px;">${r.attendedHours}/${r.totalHours}</td>
        <td style="padding: 10px 16px; text-align: center;">
          <span style="background: ${statusColor(parseFloat(subPct))}20; color: ${statusColor(parseFloat(subPct))}; font-weight: 700; font-size: 13px; padding: 3px 10px; border-radius: 6px;">${subPct}%</span>
        </td>
      </tr>`;
  }).join('');

  const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px 16px;">
    <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 32px 40px;">
        <div style="font-size: 22px; font-weight: 900; color: white;">SmartAttd</div>
        <div style="color: #bfdbfe; font-size: 13px;">Attendance Report · ${period}</div>
      </div>

      <div style="padding: 36px 40px;">
        <p style="color: #64748b; font-size: 14px; margin: 0 0 6px;">Hello, <strong style="color: #1e293b;">${student.name}</strong></p>
        <p style="color: #64748b; font-size: 14px; margin: 0 0 28px;">Here is your attendance summary for <strong>${period}</strong>.</p>

        <!-- Overall badge -->
        <div style="background: ${color}15; border: 2px solid ${color}40; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 28px;">
          <div style="font-size: 48px; font-weight: 900; color: ${color};">${pct.toFixed(1)}%</div>
          <div style="font-size: 13px; font-weight: 700; color: ${color}; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">${label} Zone</div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 6px;">${attendedHours} of ${totalHours} hours attended</div>
        </div>

        ${records.length > 0 ? `
        <!-- Subject breakdown -->
        <h3 style="color: #1e293b; font-size: 15px; font-weight: 700; margin: 0 0 12px;">Subject-wise Breakdown</h3>
        <table style="width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Subject</th>
              <th style="padding: 10px 16px; text-align: center; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Hrs</th>
              <th style="padding: 10px 16px; text-align: center; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">%</th>
            </tr>
          </thead>
          <tbody style="divide-y: #f1f5f9;">
            ${subjectRows}
          </tbody>
        </table>` : '<p style="color: #94a3b8; font-size: 13px;">No records found for this period.</p>'}

        ${pct < 75 ? `
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin-top: 24px;">
          <p style="color: #92400e; font-size: 13px; margin: 0; font-weight: 600;">⚠️ Attendance Warning</p>
          <p style="color: #78350f; font-size: 13px; margin: 6px 0 0;">Your attendance is below 75%. Please attend classes regularly to avoid academic penalties.</p>
        </div>` : ''}

        <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">This is an automated message from SmartAttd. Please do not reply to this email.</p>
        </div>
      </div>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"SmartAttd" <${process.env.GMAIL_USER}>`,
    to: student.email,
    subject: `Attendance Report — ${student.name} · ${period}`,
    html,
  });
};

// ── Attendance Report Email (Parent) ─────────────────────────────────────────

const sendAttendanceReportToParent = async (student, records, period) => {
  if (!student.parentEmail) return;

  const totalHours = records.reduce((s, r) => s + r.totalHours, 0);
  const attendedHours = records.reduce((s, r) => s + r.attendedHours, 0);
  const pct = totalHours > 0 ? ((attendedHours / totalHours) * 100) : 0;
  const color = statusColor(pct);
  const label = statusLabel(pct);

  const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px 16px;">
    <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 32px 40px;">
        <div style="font-size: 22px; font-weight: 900; color: white;">SmartAttd</div>
        <div style="color: #bfdbfe; font-size: 13px;">Parent Attendance Notice · ${period}</div>
      </div>

      <div style="padding: 36px 40px;">
        <p style="color: #64748b; font-size: 14px; margin: 0 0 6px;">Dear <strong style="color: #1e293b;">${student.guardianName}</strong>,</p>
        <p style="color: #64748b; font-size: 14px; margin: 0 0 28px;">This is an update on your ward <strong style="color: #1e293b;">${student.name}</strong>'s attendance for <strong>${period}</strong>.</p>

        <div style="background: ${color}15; border: 2px solid ${color}40; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 13px; color: #64748b; margin-bottom: 6px;">${student.name} · ${student.rollNo} · ${student.branch} Year ${student.year}</div>
          <div style="font-size: 48px; font-weight: 900; color: ${color};">${pct.toFixed(1)}%</div>
          <div style="font-size: 13px; font-weight: 700; color: ${color}; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">${label} Zone</div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 6px;">${attendedHours} of ${totalHours} hours attended</div>
        </div>

        ${pct < 75 ? `
        <div style="background: #fee2e2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="color: #991b1b; font-size: 13px; margin: 0; font-weight: 700;">⚠️ Action Required</p>
          <p style="color: #7f1d1d; font-size: 13px; margin: 6px 0 0;">Your ward's attendance is below the required 75% threshold. Please encourage them to attend classes regularly.</p>
        </div>` : `
        <div style="background: #d1fae5; border-left: 4px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="color: #065f46; font-size: 13px; margin: 0;">✅ Your ward's attendance is in good standing. Keep it up!</p>
        </div>`}

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">This is an automated message from SmartAttd. Please do not reply to this email.</p>
        </div>
      </div>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"SmartAttd" <${process.env.GMAIL_USER}>`,
    to: student.parentEmail,
    subject: `Attendance Update for ${student.name} · ${period}`,
    html,
  });
};

// ── Staff Verification / Welcome Email ───────────────────────────────────────

const sendStaffVerificationEmail = async (staff) => {
  const verifyUrl = `${process.env.APP_URL}?staff-verify=${staff.verificationToken}`;
  const yearLabel = staff.academicYear ? `Year ${staff.academicYear}` : 'Not assigned';
  const classLabel = staff.assignedClass || (staff.branch ? `${staff.branch} - ${yearLabel}` : 'Not assigned');

  const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px 16px;">
    <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 36px 40px; text-align: center;">
        <div style="font-size: 28px; font-weight: 900; color: white; letter-spacing: -0.5px;">SmartAttd</div>
        <div style="color: #bfdbfe; font-size: 13px; margin-top: 4px;">Smart Attendance Management System</div>
      </div>

      <div style="padding: 40px;">
        <h2 style="color: #1e293b; font-size: 22px; font-weight: 700; margin: 0 0 8px;">Welcome, ${staff.name}! 👋</h2>
        <p style="color: #64748b; font-size: 15px; margin: 0 0 24px;">Your staff account has been created by the administrator. Please set your password to activate your account and start managing attendance.</p>

        <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">Login Email</td>
              <td style="color: #1e293b; font-size: 14px; font-weight: 700; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${staff.email}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">Branch</td>
              <td style="color: #1e293b; font-size: 14px; font-weight: 700; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${staff.branch || 'Not assigned'}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">Academic Year</td>
              <td style="color: #1e293b; font-size: 14px; font-weight: 700; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${yearLabel}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; padding: 8px 0;">Assigned Class</td>
              <td style="color: #1e293b; font-size: 14px; font-weight: 700; padding: 8px 0;">${classLabel}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 700; font-size: 15px; letter-spacing: 0.3px;">
            Set My Password →
          </a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 12px;">Click the button above to set your password and activate your account.</p>
          <p style="color: #cbd5e1; font-size: 11px; margin-top: 6px; word-break: break-all;">${verifyUrl}</p>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">If you didn't expect this email, please contact the administrator. Do not reply to this email.</p>
        </div>
      </div>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"SmartAttd" <${process.env.GMAIL_USER}>`,
    to: staff.email,
    subject: `Welcome to SmartAttd — Set Your Password, ${staff.name}`,
    html,
  });
};

// ── Staff Reminder Email ──────────────────────────────────────────────────────

const sendStaffReminderEmail = async (staff) => {
  const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px 16px;">
    <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 32px 40px;">
        <div style="font-size: 22px; font-weight: 900; color: white;">SmartAttd</div>
        <div style="color: #bfdbfe; font-size: 13px;">Admin Notification — Attendance Entry Reminder</div>
      </div>

      <div style="padding: 36px 40px;">
        <p style="color: #64748b; font-size: 15px; margin: 0 0 6px;">Dear <strong style="color: #1e293b;">${staff.name}</strong>,</p>
        <p style="color: #64748b; font-size: 14px; margin: 0 0 24px;">This is a reminder from the administration to please ensure all attendance records for your assigned classes are updated before the end of this month.</p>

        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="color: #92400e; font-size: 13px; margin: 0; font-weight: 700;">📋 Action Required</p>
          <p style="color: #78350f; font-size: 13px; margin: 6px 0 0;">Please log in to SmartAttd and verify that all subject attendance entries are complete and accurate.</p>
        </div>

        <div style="background: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; padding: 6px 0;">Staff Name</td>
              <td style="color: #1e293b; font-size: 14px; font-weight: 700; padding: 6px 0;">${staff.name}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; padding: 6px 0;">Department</td>
              <td style="color: #1e293b; font-size: 14px; font-weight: 700; padding: 6px 0;">${staff.branch || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">This is an automated message from SmartAttd Administration. Please do not reply to this email.</p>
        </div>
      </div>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"SmartAttd Admin" <${process.env.GMAIL_USER}>`,
    to: staff.email,
    subject: `Action Required: Please Update Attendance Records — SmartAttd`,
    html,
  });
};

// ── Excuse Letter Email ───────────────────────────────────────────────────────

const sendExcuseLetterEmail = async (toEmail, toName, student, letterText) => {
  const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px 16px;">
    <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 32px 40px;">
        <div style="font-size: 22px; font-weight: 900; color: white;">SmartAttd</div>
        <div style="color: #bfdbfe; font-size: 13px;">Student Leave Application</div>
      </div>

      <div style="padding: 36px 40px;">
        <p style="color: #64748b; font-size: 13px; margin: 0 0 4px;">Dear <strong style="color: #1e293b;">${toName}</strong>,</p>
        <p style="color: #64748b; font-size: 13px; margin: 0 0 24px;">You have received a leave application from <strong style="color: #1e293b;">${student.name}</strong> (Roll No: ${student.rollNo}, ${student.branch} — Year ${student.year}) via SmartAttd.</p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 24px; margin-bottom: 24px; white-space: pre-wrap; font-family: Georgia, serif; font-size: 14px; color: #1e293b; line-height: 1.8;">
${letterText}
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">This letter was submitted by the student through SmartAttd. Please do not reply to this email — contact the student directly.</p>
        </div>
      </div>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"SmartAttd" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    replyTo: student.email,
    subject: `Leave Application from ${student.name} (${student.rollNo}) — ${student.branch}`,
    html,
  });
};

module.exports = { sendVerificationEmail, sendAttendanceReportToStudent, sendAttendanceReportToParent, sendStaffReminderEmail, sendStaffVerificationEmail, sendExcuseLetterEmail };
