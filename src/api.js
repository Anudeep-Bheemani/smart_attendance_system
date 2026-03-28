const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  // Auth
  login: (role, id, password) =>
    fetch(`${API_URL}/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify({ role, id, password }) }).then(handleResponse),

  getMe: () =>
    fetch(`${API_URL}/auth/me`, { headers: headers() }).then(handleResponse),

  checkStudent: (rollNo, email) =>
    fetch(`${API_URL}/auth/check-student`, { method: 'POST', headers: headers(), body: JSON.stringify({ rollNo, email }) }).then(handleResponse),

  // Students
  getStudents: () =>
    fetch(`${API_URL}/students`, { headers: headers() }).then(handleResponse),

  createStudent: (data) =>
    fetch(`${API_URL}/students`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),

  updateStudent: (id, data) =>
    fetch(`${API_URL}/students/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),

  deleteStudent: (id) =>
    fetch(`${API_URL}/students/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse),

  verifyStudent: (email, newPassword) =>
    fetch(`${API_URL}/students/verify`, { method: 'POST', headers: headers(), body: JSON.stringify({ email, newPassword }) }).then(handleResponse),

  getStudentByToken: (token) =>
    fetch(`${API_URL}/students/verify-token/${token}`).then(handleResponse),

  verifyStudentByToken: (token, newPassword) =>
    fetch(`${API_URL}/students/verify`, { method: 'POST', headers: headers(), body: JSON.stringify({ token, newPassword }) }).then(handleResponse),

  // Staff
  getStaff: () =>
    fetch(`${API_URL}/staff`, { headers: headers() }).then(handleResponse),

  createStaff: (data) =>
    fetch(`${API_URL}/staff`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),

  updateStaff: (id, data) =>
    fetch(`${API_URL}/staff/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),

  deleteStaff: (id) =>
    fetch(`${API_URL}/staff/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse),

  changeStaffPassword: (currentPassword, newPassword) =>
    fetch(`${API_URL}/staff/change-password`, { method: 'POST', headers: headers(), body: JSON.stringify({ currentPassword, newPassword }) }).then(handleResponse),

  // Branches
  getBranches: () =>
    fetch(`${API_URL}/branches`, { headers: headers() }).then(handleResponse),

  createBranch: (name) =>
    fetch(`${API_URL}/branches`, { method: 'POST', headers: headers(), body: JSON.stringify({ name }) }).then(handleResponse),

  deleteBranch: (name) =>
    fetch(`${API_URL}/branches/${encodeURIComponent(name)}`, { method: 'DELETE', headers: headers() }).then(handleResponse),

  // Subjects
  getSubjects: () =>
    fetch(`${API_URL}/subjects`, { headers: headers() }).then(handleResponse),

  updateSubjects: (data) =>
    fetch(`${API_URL}/subjects`, { method: 'PUT', headers: headers(), body: JSON.stringify({ data }) }).then(handleResponse),

  // Attendance
  getAttendance: () =>
    fetch(`${API_URL}/attendance`, { headers: headers() }).then(handleResponse),

  // payload: { studentId, subject, month, semester, field, value, studentName, rollNo }
  upsertAttendance: (payload) =>
    fetch(`${API_URL}/attendance/upsert`, { method: 'POST', headers: headers(), body: JSON.stringify(payload) }).then(handleResponse),

  updateAttendance: (id, data) =>
    fetch(`${API_URL}/attendance/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),

  deleteAttendance: (id) =>
    fetch(`${API_URL}/attendance/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse),

  // Notifications
  sendAttendanceEmails: ({ branch, year, semester, month }) =>
    fetch(`${API_URL}/notifications/send-attendance`, { method: 'POST', headers: headers(), body: JSON.stringify({ branch, year, semester, month }) }).then(handleResponse),

  sendStaffEmails: () =>
    fetch(`${API_URL}/notifications/send-staff-reminder`, { method: 'POST', headers: headers() }).then(handleResponse),

  // Sem Config
  getSemConfig: () =>
    fetch(`${API_URL}/sem-config`).then(handleResponse),

  updateSemConfig: (data) =>
    fetch(`${API_URL}/sem-config`, { method: 'PUT', headers: headers(), body: JSON.stringify({ data }) }).then(handleResponse),
};
