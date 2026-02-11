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
import { INITIAL_STUDENTS, INITIAL_STAFF, INITIAL_ADMIN, INITIAL_BRANCHES, SUBJECTS } from './constants';
import { generateMockAttendance } from './utils';
import { FileText, Settings, Sparkles } from 'lucide-react';

const MainApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });
  const [staffList, setStaffList] = useState(() => {
    const saved = localStorage.getItem('staffList');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });
  const [branches, setBranches] = useState(() => {
    const saved = localStorage.getItem('branches');
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('subjects');
    return saved ? JSON.parse(saved) : SUBJECTS;
  });
  const [attendanceData, setAttendanceData] = useState(() => {
    const saved = localStorage.getItem('attendanceData');
    if (saved) return JSON.parse(saved);
    const savedStudents = localStorage.getItem('students');
    const savedSubjects = localStorage.getItem('subjects');
    const studentsToUse = savedStudents ? JSON.parse(savedStudents) : INITIAL_STUDENTS;
    const subjectsToUse = savedSubjects ? JSON.parse(savedSubjects) : SUBJECTS;
    const initial = generateMockAttendance(studentsToUse, subjectsToUse);
    localStorage.setItem('attendanceData', JSON.stringify(initial));
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('staffList', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('branches', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
  }, [attendanceData]);

  const handleLogin = (role, credentials) => {
    let user = null;
    
    if (role === 'student' || role === 'parent') {
      const student = students.find(s => s.rollNo === credentials.id || s.email === credentials.id);
      if (student && student.password === credentials.password) {
         user = role === 'parent' 
           ? { ...student, id: 'P-'+student.id, role: 'parent', name: `Parent of ${student.name}`, childId: student.id } 
           : student;
      }
    } else if (role === 'lecturer') {
      user = staffList.find(s => s.email === credentials.id && s.password === credentials.password);
    } else if (role === 'admin') {
      user = INITIAL_ADMIN.find(a => a.email === credentials.id && a.password === credentials.password);
    }

    if (user) {
      setCurrentUser(user);
      setActiveView('dashboard');
    } else {
      alert("Invalid credentials. Try the demo accounts.");
    }
  };

  const handleVerifyStudent = (email, newPassword) => {
    setStudents(prev => prev.map(s => {
      if (s.email === email) {
        return { ...s, password: newPassword, verified: true };
      }
      return s;
    }));
  };

  const handleUpdateAttendance = (studentId, subject, field, value, month = 'October') => {
    setAttendanceData(prev => {
      const existingIndex = prev.findIndex(r => r.studentId === studentId && r.subject === subject && r.month === month);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], [field]: value };
        return updated;
      } else {
        const student = students.find(s => s.id === studentId);
        const newRecord = {
          id: Math.random().toString(36).substr(2, 9),
          studentId,
          studentName: student?.name || '',
          rollNo: student?.rollNo || '',
          subject,
          month: month,
          totalHours: field === 'totalHours' ? value : 40,
          attendedHours: field === 'attendedHours' ? value : 0
        };
        return [...prev, newRecord];
      }
    });
  };

  const handleUpdateProfile = (updatedStudent) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    if (currentUser.id === updatedStudent.id) {
       setCurrentUser(updatedStudent);
    }
    alert("Profile updated successfully!");
  };

  const handleUpdateLecturerProfile = (updatedLecturer) => {
    setStaffList(prev => prev.map(s => s.id === updatedLecturer.id ? updatedLecturer : s));
    if (currentUser.id === updatedLecturer.id) {
       setCurrentUser(updatedLecturer);
    }
    alert("Profile updated successfully!");
  };

  const renderContent = () => {
    if (!currentUser) return <LandingPage onLogin={handleLogin} onVerify={handleVerifyStudent} students={students} />;

    switch (currentUser.role) {
      case 'admin':
        if (activeView === 'student-management') return <AdminStudentManagement students={students} setStudents={setStudents} branches={branches} />;
        if (activeView === 'staff-management') return <AdminStaffManager staffList={staffList} setStaffList={setStaffList} branches={branches} />;
        if (activeView === 'branch-management') return <AdminBranchManager branches={branches} setBranches={setBranches} />;
        if (activeView === 'subject-management') return <SubjectManager subjects={subjects} setSubjects={setSubjects} branches={branches} />;
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
        return <AdminDashboard students={students} attendanceData={attendanceData} staffList={staffList} />;
      
      case 'lecturer':
        if (activeView === 'entry') return <AttendanceEntry students={students} attendanceData={attendanceData} updateAttendance={handleUpdateAttendance} branches={branches} subjects={subjects} staffList={staffList} />;
        if (activeView === 'manage-records') return <LecturerRecordManager students={students} setStudents={setStudents} branches={branches} setBranches={setBranches} />;
        if (activeView === 'subject-management') return <SubjectManager subjects={subjects} setSubjects={setSubjects} branches={branches} />;
        if (activeView === 'settings') return <LecturerSettings user={currentUser} onUpdateProfile={handleUpdateLecturerProfile} branches={branches} />;
        return <LecturerDashboard key={`${attendanceData.length}-${JSON.stringify(attendanceData.map(r => r.month))}`} user={currentUser} students={students} attendanceData={attendanceData} />;

      case 'student':
        if (activeView === 'classmates') return <ClassAttendanceView currentUser={currentUser} allStudents={students} attendanceData={attendanceData} />;
        if (activeView === 'profile') return <StudentProfile student={currentUser} />;
        return <StudentDashboard key={attendanceData.length} student={currentUser} attendanceData={attendanceData} onUpdateProfile={handleUpdateProfile} isReadOnly={false} />;

      case 'parent':
        const child = students.find(s => s.id === currentUser.childId);
        return <StudentDashboard key={attendanceData.length} student={child} attendanceData={attendanceData} isReadOnly={true} />;
      
      default:
        return <div>Unknown Role</div>;
    }
  };

  if (!currentUser) return <LandingPage onLogin={handleLogin} onVerify={handleVerifyStudent} darkMode={darkMode} setDarkMode={setDarkMode} students={students} />;

  return (
    <AppShell 
      user={currentUser} 
      onLogout={() => setCurrentUser(null)} 
      activeView={activeView}
      setActiveView={setActiveView}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    >
      {renderContent()}
    </AppShell>
  );
};

export default MainApp;
