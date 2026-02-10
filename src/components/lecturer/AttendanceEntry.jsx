import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, Save, Loader2, Eye, X, Filter, Activity, AlertTriangle, Search } from 'lucide-react';
import { SUBJECTS, INITIAL_BRANCHES } from '../../constants';
import { calculatePercentage, predictHours } from '../../utils';
import RiskBadge from '../common/RiskBadge';

const AttendanceEntry = ({ students, attendanceData, updateAttendance, branches, subjects: subjectsFromProps }) => {
  const [selectedYear, setSelectedYear] = useState("1");
  const [selectedBranch, setSelectedBranch] = useState("CSE");
  const [selectedMonth, setSelectedMonth] = useState("October");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2024");
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [subjectTotalHours, setSubjectTotalHours] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [attendanceFilter, setAttendanceFilter] = useState('all');

  const branchOptions = branches || INITIAL_BRANCHES;
  const subjects = subjectsFromProps?.[selectedBranch]?.[selectedYear] || SUBJECTS[selectedBranch]?.[selectedYear] || [];

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const classStudents = students.filter(s => s.branch === selectedBranch && s.year === parseInt(selectedYear));

  let filteredStudents = classStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate stats before filtering by attendance
  const stats = classStudents.reduce((acc, student) => {
    const records = subjects.map(sub =>
      attendanceData.find(r => r.studentId === student.id && r.subject === sub) ||
      { totalHours: subjectTotalHours[sub] || 40, attendedHours: 0 }
    );
    const totalAttended = records.reduce((sum, r) => sum + r.attendedHours, 0);
    const totalHours = records.reduce((sum, r) => sum + r.totalHours, 0);
    const percent = calculatePercentage(totalAttended, totalHours);

    if (percent >= 75) acc.safe++;
    else if (percent >= 65) acc.warning++;
    else acc.critical++;
    return acc;
  }, { safe: 0, warning: 0, critical: 0 });

  // Filter by attendance status
  if (attendanceFilter !== 'all') {
    filteredStudents = filteredStudents.filter(student => {
      const records = subjects.map(sub =>
        attendanceData.find(r => r.studentId === student.id && r.subject === sub) ||
        { totalHours: subjectTotalHours[sub] || 40, attendedHours: 0 }
      );
      const totalAttended = records.reduce((sum, r) => sum + r.attendedHours, 0);
      const totalHours = records.reduce((sum, r) => sum + r.totalHours, 0);
      const percent = calculatePercentage(totalAttended, totalHours);

      if (attendanceFilter === 'safe') return percent >= 75;
      if (attendanceFilter === 'warning') return percent >= 65 && percent < 75;
      if (attendanceFilter === 'critical') return percent < 65;
      return true;
    });
  }

  useEffect(() => {
    if (filteredStudents.length > 0) {
      const hours = {};
      subjects.forEach(sub => {
        const record = attendanceData.find(r => r.studentId === filteredStudents[0].id && r.subject === sub);
        hours[sub] = record?.totalHours || 40;
      });
      setSubjectTotalHours(hours);
    }
  }, [selectedYear, selectedBranch, attendanceData]);

  const handleAttendanceChange = (studentId, subject, field, value) => {
    const numValue = parseInt(value) || 0;
    const maxHours = subjectTotalHours[subject] || 40;
    if (numValue > maxHours) {
      alert(`Cannot exceed ${maxHours} hours for ${subject}`);
      return;
    }
    updateAttendance(studentId, subject, field, numValue, selectedMonth);
  };

  const handleSubjectTotalChange = (subject, value) => {
    const newVal = parseInt(value) || 0;
    setSubjectTotalHours(prev => ({ ...prev, [subject]: newVal }));

    filteredStudents.forEach(student => {
      updateAttendance(student.id, subject, 'totalHours', newVal, selectedMonth);
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert(`Attendance saved for ${selectedMonth} ${selectedAcademicYear}`);
    }, 1000);
  };

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 md:gap-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shrink-0">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Attendance Entry</h1>
              <p className="text-sm text-slate-600">{selectedMonth} {selectedAcademicYear} • {selectedBranch} Year {selectedYear}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-60"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Attendance
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-5">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Month</label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Academic Year</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              placeholder="2024"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Class Year</label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Branch</label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              {branchOptions.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Name or Roll..."
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setAttendanceFilter('all')}
            className={`p-4 rounded-lg cursor-pointer transition-all ${attendanceFilter === 'all'
              ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300'
              : 'bg-slate-50 border border-slate-200 hover:shadow-md'
              }`}
          >
            <div className={`text-2xl font-bold ${attendanceFilter === 'all' ? 'text-white' : 'text-slate-800'}`}>{classStudents.length}</div>
            <div className={`text-xs font-semibold uppercase tracking-wide mt-1 ${attendanceFilter === 'all' ? 'text-white/90' : 'text-slate-600'}`}>Total Students</div>
          </div>
          <div
            onClick={() => setAttendanceFilter('safe')}
            className={`p-4 rounded-lg cursor-pointer transition-all ${attendanceFilter === 'safe'
              ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-300'
              : 'bg-green-50 border border-green-200 hover:shadow-md'
              }`}
          >
            <div className={`text-2xl font-bold ${attendanceFilter === 'safe' ? 'text-white' : 'text-green-700'}`}>{stats.safe}</div>
            <div className={`text-xs font-semibold uppercase tracking-wide mt-1 ${attendanceFilter === 'safe' ? 'text-white/90' : 'text-green-700'}`}>Safe (≥75%)</div>
          </div>
          <div
            onClick={() => setAttendanceFilter('warning')}
            className={`p-4 rounded-lg cursor-pointer transition-all ${attendanceFilter === 'warning'
              ? 'bg-orange-600 text-white shadow-lg ring-2 ring-orange-300'
              : 'bg-orange-50 border border-orange-200 hover:shadow-md'
              }`}
          >
            <div className={`text-2xl font-bold ${attendanceFilter === 'warning' ? 'text-white' : 'text-orange-700'}`}>{stats.warning}</div>
            <div className={`text-xs font-semibold uppercase tracking-wide mt-1 ${attendanceFilter === 'warning' ? 'text-white/90' : 'text-orange-700'}`}>Warning (65-75%)</div>
          </div>
          <div
            onClick={() => setAttendanceFilter('critical')}
            className={`p-4 rounded-lg cursor-pointer transition-all ${attendanceFilter === 'critical'
              ? 'bg-red-600 text-white shadow-lg ring-2 ring-red-300'
              : 'bg-red-50 border border-red-200 hover:shadow-md'
              }`}
          >
            <div className={`text-2xl font-bold ${attendanceFilter === 'critical' ? 'text-white' : 'text-red-700'}`}>{stats.critical}</div>
            <div className={`text-xs font-semibold uppercase tracking-wide mt-1 ${attendanceFilter === 'critical' ? 'text-white/90' : 'text-red-700'}`}>Critical (Below 65%)</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold text-sm uppercase tracking-wide sticky left-0 bg-slate-800">Student</th>
                  {subjects.map(sub => (
                    <th key={sub} className="px-4 py-4 text-center font-semibold text-sm">{sub}</th>
                  ))}
                  <th className="px-5 py-4 text-center font-semibold text-sm uppercase tracking-wide">Overall</th>
                  <th className="px-4 py-4"></th>
                </tr>
                <tr>
                  <th className="px-5 py-3 text-left text-sm opacity-75 font-medium sticky left-0 bg-slate-800">Total Hours</th>
                  {subjects.map(sub => (
                    <th key={sub} className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="1"
                        className="w-16 px-2 py-1.5 bg-white/20 border border-white/30 rounded-lg text-sm font-semibold text-center focus:outline-none focus:ring-1 focus:ring-white/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={subjectTotalHours[sub] || 40}
                        onChange={(e) => handleSubjectTotalChange(sub, e.target.value)}
                      />
                    </th>
                  ))}
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const records = subjects.map(sub =>
                    attendanceData.find(r => r.studentId === student.id && r.subject === sub && r.month === selectedMonth) ||
                    { totalHours: subjectTotalHours[sub] || 40, attendedHours: 0, month: selectedMonth }
                  );
                  const totalAttended = records.reduce((sum, r) => sum + r.attendedHours, 0);
                  const totalHours = records.reduce((sum, r) => sum + r.totalHours, 0);
                  const percent = calculatePercentage(totalAttended, totalHours);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 sticky left-0 bg-white hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-sm">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{student.name}</div>
                            <div className="text-xs text-slate-500 font-medium">{student.rollNo}</div>
                          </div>
                        </div>
                      </td>
                      {subjects.map((sub, idx) => (
                        <td key={sub} className="px-3 py-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max={subjectTotalHours[sub] || 40}
                            className="w-20 px-2 py-2.5 border-2 border-slate-300 rounded-lg text-center font-semibold text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all hover:border-slate-400"
                            value={records[idx].attendedHours === 0 ? '' : records[idx].attendedHours}
                            placeholder="0"
                            onChange={(e) => handleAttendanceChange(student.id, sub, 'attendedHours', e.target.value)}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                handleAttendanceChange(student.id, sub, 'attendedHours', '0');
                              }
                            }}
                          />
                        </td>
                      ))}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <RiskBadge percent={percent} />
                          <span className="font-bold text-slate-800">{percent}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <Filter size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-lg font-semibold text-slate-400">No students found</p>
          </div>
        )}
      </div>

      {/* Side Panel */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedStudent(null)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-sm bg-white shadow-2xl border-l border-slate-200 p-6 h-full overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-800">Student Details</h3>
              <button onClick={() => setSelectedStudent(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3 shadow-lg">
                {selectedStudent.name.charAt(0)}
              </div>
              <h4 className="font-bold text-lg text-slate-900">{selectedStudent.name}</h4>
              <p className="text-sm text-slate-600 font-medium">{selectedStudent.rollNo}</p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Branch & Year</label>
                <p className="font-semibold text-slate-800 mt-1">
                  {selectedStudent.branch} • Year {selectedStudent.year}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Contact</label>
                <p className="font-semibold text-slate-800 mt-1">{selectedStudent.phone}</p>
                <p className="text-sm text-slate-600">{selectedStudent.email}</p>
              </div>

              <div className="bg-blue-600 text-white p-5 rounded-lg shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={18} />
                  <h5 className="font-bold uppercase tracking-wide text-sm">Performance</h5>
                </div>
                {(() => {
                  const studentRecords = attendanceData.filter(r => r.studentId === selectedStudent.id);
                  const totalC = studentRecords.reduce((acc, curr) => acc + curr.totalHours, 0);
                  const totalA = studentRecords.reduce((acc, curr) => acc + curr.attendedHours, 0);
                  const overallP = calculatePercentage(totalA, totalC);
                  const n75 = predictHours(totalA, totalC, 0.75);

                  return (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-5xl font-bold">{overallP}%</div>
                        <div className="text-sm font-medium opacity-90 mt-1">Overall Attendance</div>
                      </div>

                      {overallP < 75 && (
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                            <div className="text-sm font-medium">
                              Needs <span className="font-bold text-lg">{n75}</span> more hours to reach 75%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceEntry;
