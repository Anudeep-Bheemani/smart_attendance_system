import React, { useState, useEffect } from 'react';
import AppShell from './components/common/AppShell';
import LandingPage from './components/common/LandingPage';
import StudentDashboard from './components/student/StudentDashboard';
import ClassAttendanceView from './components/student/ClassAttendanceView';
import StudentProfile from './components/student/StudentProfile';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminStaffManager from './components/admin/AdminStaffManager';
import AdminStudentManagement from './components/admin/AdminStudentManagement';
import AdminBranchManager from './components/admin/AdminBranchManager';
import LecturerDashboard from './components/lecturer/LecturerDashboard';
import AttendanceEntry from './components/lecturer/AttendanceEntry';
import LecturerRecordManager from './components/lecturer/LecturerRecordManager';
import LecturerSettings from './components/lecturer/LecturerSettings';
import SubjectManager from './components/common/SubjectManager';
import SemConfigManager from './components/common/SemConfigManager';
import { api } from './api';
import { FileText, Settings, Sparkles, Loader2 } from 'lucide-react';

const MainApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState(() => localStorage.getItem('activeView') || 'dashboard');

  const handleSetActiveView = (view) => {
    localStorage.setItem('activeView', view);
    setActiveView(view);
  };
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifyToken, setVerifyToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('verify') || null;
  });
  const [staffVerifyToken, setStaffVerifyToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('staff-verify') || null;
  });

  const [students, setStudents] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState({});
  const [attendanceData, setAttendanceData] = useState([]);
  const [adminContact, setAdminContact] = useState(null);

  const DEFAULT_SEM_CONFIG = {
    "1": { "1": ["July","August","September","October","November","December"], "2": ["January","February","March","April","May","June"] },
    "2": { "1": ["July","August","September","October","November","December"], "2": ["January","February","March","April","May","June"] },
    "3": { "1": ["July","August","September","October","November","December"], "2": ["January","February","March","April","May","June"] },
    "4": { "1": ["July","August","September","October","November","December"], "2": ["January","February","March","April","May","June"] }
  };
  const [semConfig, setSemConfig] = useState(DEFAULT_SEM_CONFIG);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe()
        .then(user => {
          setCurrentUser(user);
          return loadAllData();
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const loadAllData = async () => {
    try {
      const [s, st, b, sub, att, sc, ac] = await Promise.all([
        api.getStudents(),
        api.getStaff(),
        api.getBranches(),
        api.getSubjects(),
        api.getAttendance(),
        api.getSemConfig(),
        api.getAdminContact().catch(() => null)
      ]);
      setStudents(s);
      setStaffList(st);
      setBranches(b);
      setAdminContact(ac);
      setSubjects(sub);
      setAttendanceData(att);
      setSemConfig(sc);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSemConfig = async (newConfig) => {
    try {
      const updated = await api.updateSemConfig(newConfig);
      setSemConfig(updated);
      alert('Semester configuration saved successfully!');
    } catch (err) {
      alert(err.message || 'Failed to save semester configuration');
      throw err;
    }
  };

  // ── Auth ────────────────────────────────────────────────────────────────
  const handleLogin = async (role, credentials) => {
    try {
      const { token, user } = await api.login(role, credentials.id, credentials.password);
      localStorage.setItem('token', token);
      setCurrentUser(user);
      setActiveView('dashboard');
      await loadAllData();
    } catch (err) {
      alert('Invalid credentials. Try the demo accounts.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeView');
    setActiveView('dashboard');
    setCurrentUser(null);
    setStudents([]);
    setStaffList([]);
    setBranches([]);
    setSubjects({});
    setAttendanceData([]);
  };

  const handleVerifyStudent = async (email, newPassword) => {
    try {
      await api.verifyStudent(email, newPassword);
    } catch (err) {
      alert('Verification failed. Please try again.');
    }
  };

  // ── Students ────────────────────────────────────────────────────────────
  const handleAddStudent = async (studentData) => {
    try {
      const created = await api.createStudent(studentData);
      setStudents(prev => [...prev, created]);
      return created;
    } catch (err) {
      alert(err.message || 'Failed to add student');
      throw err;
    }
  };

  const handleUpdateStudent = async (id, studentData) => {
    try {
      const updated = await api.updateStudent(id, studentData);
      setStudents(prev => prev.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err) {
      alert(err.message || 'Failed to update student');
      throw err;
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
      await api.deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete student');
      throw err;
    }
  };

  const handleUpdateProfile = async (updatedStudent) => {
    try {
      const updated = await api.updateStudent(updatedStudent.id, updatedStudent);
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
      if (currentUser.id === updated.id) setCurrentUser(updated);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  // ── Staff ───────────────────────────────────────────────────────────────
  const handleAddStaff = async (staffData) => {
    try {
      const created = await api.createStaff(staffData);
      setStaffList(prev => [...prev, created]);
      return created;
    } catch (err) {
      alert(err.message || 'Failed to add staff');
      throw err;
    }
  };

  const handleUpdateStaff = async (id, staffData) => {
    try {
      const updated = await api.updateStaff(id, staffData);
      setStaffList(prev => prev.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err) {
      alert(err.message || 'Failed to update staff');
      throw err;
    }
  };

  const handleDeleteStaff = async (id) => {
    try {
      await api.deleteStaff(id);
      setStaffList(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete staff');
      throw err;
    }
  };

  const handleUpdateLecturerProfile = async (updatedLecturer) => {
    try {
      const updated = await api.updateStaff(updatedLecturer.id, updatedLecturer);
      setStaffList(prev => prev.map(s => s.id === updated.id ? updated : s));
      if (currentUser.id === updated.id) setCurrentUser(updated);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  // ── Branches ────────────────────────────────────────────────────────────
  const handleAddBranch = async (name) => {
    try {
      const created = await api.createBranch(name);
      setBranches(prev => [...prev, created]);
      return created;
    } catch (err) {
      alert(err.message || 'Failed to add branch');
      throw err;
    }
  };

  const handleDeleteBranch = async (name) => {
    try {
      await api.deleteBranch(name);
      setBranches(prev => prev.filter(b => b !== name));
    } catch (err) {
      alert(err.message || 'Failed to delete branch');
      throw err;
    }
  };

  // ── Subjects ────────────────────────────────────────────────────────────
  const handleUpdateSubjects = async (newSubjects) => {
    try {
      const updated = await api.updateSubjects(newSubjects);
      setSubjects(updated);
      return updated;
    } catch (err) {
      alert('Failed to update subjects');
      throw err;
    }
  };

  // ── Attendance ──────────────────────────────────────────────────────────
  const handleUpdateAttendance = async (studentId, subject, field, value, month = 'October', semester = 1) => {
    try {
      const student = students.find(s => s.id === studentId);
      const record = await api.upsertAttendance({
        studentId,
        subject,
        month,
        semester,
        field,
        value,
        studentName: student?.name || '',
        rollNo: student?.rollNo || ''
      });
      setAttendanceData(prev => {
        const idx = prev.findIndex(r => r.studentId === studentId && r.subject === subject && r.month === month);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = record;
          return updated;
        }
        return [...prev, record];
      });
    } catch (err) {
      console.error('Failed to update attendance:', err);
    }
  };

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 size={48} className="animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-xl font-semibold">Loading SmartAttd...</p>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <LandingPage
        onLogin={handleLogin}
        onVerify={handleVerifyStudent}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        verifyToken={verifyToken}
        staffVerifyToken={staffVerifyToken}
        onTokenUsed={() => {
          setVerifyToken(null);
          setStaffVerifyToken(null);
          window.history.replaceState({}, '', window.location.pathname);
        }}
      />
    );
  }

  const renderContent = () => {
    switch (currentUser.role) {
      case 'admin':
        if (activeView === 'student-management')
          return (
            <AdminStudentManagement
              students={students}
              branches={branches}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          );
        if (activeView === 'staff-management')
          return (
            <AdminStaffManager
              staffList={staffList}
              branches={branches.map(b => typeof b === 'string' ? b : b.name)}
              onAddStaff={handleAddStaff}
              onUpdateStaff={handleUpdateStaff}
              onDeleteStaff={handleDeleteStaff}
            />
          );
        if (activeView === 'branch-management')
          return (
            <AdminBranchManager
              branches={branches}
              onAddBranch={handleAddBranch}
              onDeleteBranch={handleDeleteBranch}
            />
          );
        if (activeView === 'subject-management')
          return (
            <SubjectManager
              subjects={subjects}
              onUpdateSubjects={handleUpdateSubjects}
              branches={branches}
            />
          );
        if (activeView === 'sem-config')
          return (
            <SemConfigManager
              semConfig={semConfig}
              onUpdateSemConfig={handleUpdateSemConfig}
            />
          );
        if (activeView === 'reports') return (
          <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="text-center max-w-2xl">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                  <FileText size={64} className="text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-black text-slate-800 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Reports Module</h2>
              <p className="text-xl text-slate-600 mb-8">Advanced analytics and comprehensive reporting tools are on the way!</p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold shadow-lg">
                <Sparkles size={20} className="animate-pulse" />
                Coming Soon
              </div>
            </div>
          </div>
        );
        if (activeView === 'settings') return (
          <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-purple-50">
            <div className="text-center max-w-2xl">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Settings size={64} className="text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-black text-slate-800 mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Settings Panel</h2>
              <p className="text-xl text-slate-600 mb-8">Customization options and preferences will be available soon!</p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold shadow-lg">
                <Sparkles size={20} className="animate-pulse" />
                Coming Soon
              </div>
            </div>
          </div>
        );
        return <AdminDashboard students={students} attendanceData={attendanceData} staffList={staffList} semConfig={semConfig} branches={branches} />;

      case 'lecturer':
        if (activeView === 'entry')
          return (
            <AttendanceEntry
              user={currentUser}
              students={students}
              attendanceData={attendanceData}
              updateAttendance={handleUpdateAttendance}
              branches={branches}
              subjects={subjects}
              staffList={staffList}
              semConfig={semConfig}
            />
          );
        if (activeView === 'manage-records')
          return (
            <LecturerRecordManager
              user={currentUser}
              students={students}
              branches={branches}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onAddBranch={handleAddBranch}
              onDeleteBranch={handleDeleteBranch}
            />
          );
        if (activeView === 'subject-management')
          return (
            <SubjectManager
              subjects={subjects}
              onUpdateSubjects={handleUpdateSubjects}
              branches={branches}
            />
          );
        if (activeView === 'sem-config')
          return (
            <SemConfigManager
              semConfig={semConfig}
              onUpdateSemConfig={handleUpdateSemConfig}
            />
          );
        if (activeView === 'settings')
          return (
            <LecturerSettings
              user={currentUser}
              onUpdateProfile={handleUpdateLecturerProfile}
              branches={branches}
            />
          );
        return (
          <LecturerDashboard
            key={`${attendanceData.length}-${JSON.stringify(attendanceData.map(r => r.month))}`}
            user={currentUser}
            students={students}
            attendanceData={attendanceData}
            semConfig={semConfig}
          />
        );

      case 'student':
        if (activeView === 'classmates')
          return <ClassAttendanceView currentUser={currentUser} allStudents={students} attendanceData={attendanceData} semConfig={semConfig} />;
        if (activeView === 'profile')
          return <StudentProfile student={currentUser} />;
        return (
          <StudentDashboard
            key={attendanceData.length}
            student={currentUser}
            attendanceData={attendanceData}
            onUpdateProfile={handleUpdateProfile}
            isReadOnly={false}
            semConfig={semConfig}
            staffList={staffList}
            adminContact={adminContact}
          />
        );

      case 'parent': {
        const child = students.find(s => s.id === currentUser.childId);
        return (
          <StudentDashboard
            key={attendanceData.length}
            student={child}
            attendanceData={attendanceData}
            isReadOnly={true}
            semConfig={semConfig}
            staffList={staffList}
            adminContact={adminContact}
          />
        );
      }

      default:
        return <div>Unknown Role</div>;
    }
  };

  return (
    <AppShell
      user={currentUser}
      onLogout={handleLogout}
      activeView={activeView}
      setActiveView={handleSetActiveView}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    >
      {renderContent()}
    </AppShell>
  );
};

export default MainApp;
