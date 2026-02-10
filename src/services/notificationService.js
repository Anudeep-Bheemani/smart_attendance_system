// Simulated Email Notification Service
// In production, this would connect to a backend API that sends actual emails

export const sendMonthEndReminderToStaff = (staffEmail, staffName) => {
  console.log(`
📧 EMAIL SENT TO STAFF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${staffEmail}
Subject: Monthly Attendance Entry Reminder

Dear ${staffName},

This is a reminder to complete the attendance entry for all your assigned students for this month.

Please log in to SmartAttd and submit the attendance records before the month ends.

Thank you,
SmartAttd System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
  
  return {
    success: true,
    message: `Reminder email sent to ${staffEmail}`
  };
};

export const sendAttendanceReportToStudent = (student, attendanceData) => {
  const avgAttendance = attendanceData.reduce((acc, curr) => 
    acc + (curr.attendedHours / curr.totalHours * 100), 0) / attendanceData.length;
  
  console.log(`
📧 EMAIL SENT TO STUDENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${student.email}
Subject: Monthly Attendance Report - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

Dear ${student.name},

Your attendance report for this month:

Overall Attendance: ${avgAttendance.toFixed(1)}%
Status: ${avgAttendance >= 75 ? '✅ Safe' : avgAttendance >= 65 ? '⚠️ Warning' : '❌ Critical'}

${attendanceData.map(record => 
  `${record.subject}: ${record.attendedHours}/${record.totalHours} (${(record.attendedHours/record.totalHours*100).toFixed(1)}%)`
).join('\n')}

${avgAttendance < 75 ? '\n⚠️ Your attendance is below 75%. Please improve your attendance to avoid academic issues.' : ''}

Login to SmartAttd for detailed analytics.

Best regards,
SmartAttd System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
  
  return {
    success: true,
    message: `Report sent to ${student.email}`
  };
};

export const sendAttendanceReportToParent = (student, parentEmail, attendanceData) => {
  const avgAttendance = attendanceData.reduce((acc, curr) => 
    acc + (curr.attendedHours / curr.totalHours * 100), 0) / attendanceData.length;
  
  console.log(`
📧 EMAIL SENT TO PARENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${parentEmail}
Subject: Your Child's Monthly Attendance Report - ${student.name}

Dear Parent/Guardian,

This is the monthly attendance report for your child ${student.name} (${student.rollNo}).

Overall Attendance: ${avgAttendance.toFixed(1)}%
Status: ${avgAttendance >= 75 ? '✅ Safe Zone' : avgAttendance >= 65 ? '⚠️ Warning Zone' : '❌ Critical - Immediate Attention Required'}

Subject-wise Breakdown:
${attendanceData.map(record => 
  `• ${record.subject}: ${record.attendedHours}/${record.totalHours} hours (${(record.attendedHours/record.totalHours*100).toFixed(1)}%)`
).join('\n')}

${avgAttendance < 75 ? `
⚠️ ATTENTION REQUIRED:
Your child's attendance is below the required 75% threshold. This may affect their academic eligibility.
Please ensure regular attendance to avoid any academic complications.
` : ''}

You can login to SmartAttd using your parent credentials to view detailed reports.

For any concerns, please contact the class teacher.

Best regards,
SmartAttd System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
  
  return {
    success: true,
    message: `Report sent to parent at ${parentEmail}`
  };
};

// Simulate sending notifications when attendance is saved
export const notifyAttendanceSaved = (students, attendanceData, staffList) => {
  const notifications = [];
  
  // Send to each student
  students.forEach(student => {
    const studentRecords = attendanceData.filter(r => r.studentId === student.id);
    if (studentRecords.length > 0) {
      sendAttendanceReportToStudent(student, studentRecords);
      notifications.push(`Student: ${student.email}`);
      
      // Send to parent if guardian email exists
      if (student.guardianName && student.phone) {
        const parentEmail = `parent.${student.rollNo.toLowerCase()}@college.edu`;
        sendAttendanceReportToParent(student, parentEmail, studentRecords);
        notifications.push(`Parent: ${parentEmail}`);
      }
    }
  });
  
  return {
    success: true,
    count: notifications.length,
    recipients: notifications
  };
};

// Schedule month-end reminders (simulated)
export const scheduleMonthEndReminders = (staffList) => {
  console.log(`
🔔 SCHEDULED REMINDERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Month-end reminders scheduled for ${staffList.length} staff members.
Reminders will be sent on the 28th of each month.

Staff to be notified:
${staffList.map(staff => `• ${staff.name} (${staff.email})`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
  
  return {
    success: true,
    scheduled: staffList.length
  };
};
