import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, X, Loader2, PieChart, BarChart2, Users, Filter, MoreHorizontal, Bell, Download, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Legend, Sector } from 'recharts';
import { callGemini } from '../../services/gemini';
import { notifyAttendanceSaved } from '../../services/notificationService';
import RiskBadge from '../common/RiskBadge';
import { downloadExcel, downloadPDF } from '../../utils/downloadReport';
import { predictHours } from '../../utils';

const StudentDetailsModal = ({ student, onClose }) => {
  if (!student) return null;

  const neededHours = predictHours(student.attendedHours, student.totalHours, 0.75);
  const isSafe = student.pct >= 75;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="relative h-24 bg-gradient-to-r from-blue-600 to-indigo-600">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-700">
                {student.studentName.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 px-6 pb-6">
          <h3 className="text-xl font-bold text-slate-800">{student.studentName}</h3>
          <p className="text-slate-500 font-medium">{student.rollNo}</p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Attendance</p>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-3xl font-black text-slate-800">{student.pct.toFixed(1)}%</span>
                  <span className="text-sm font-medium text-slate-500 mb-1.5">
                    ({student.attendedHours}/{student.totalHours} hrs)
                  </span>
                </div>
              </div>
              <RiskBadge percent={student.pct} />
            </div>

            {!isSafe && (
              <div className="flex gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800">
                <AlertTriangle className="shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-bold">Attention Needed</p>
                  <p className="text-sm mt-1 opacity-90">
                    Must attend <span className="font-black text-lg">{neededHours}</span> more hours to reach 75% attendance.
                  </p>
                </div>
              </div>
            )}

            {isSafe && (
              <div className="flex gap-3 p-4 bg-green-50 rounded-xl border border-green-100 text-green-800">
                <CheckCircle className="shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-bold">Good Standing</p>
                  <p className="text-sm mt-1 opacity-90">
                    Student is maintaining required attendance levels.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 font-medium uppercase">Branch</p>
                <p className="font-semibold text-slate-700">{student.branch || 'N/A'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 font-medium uppercase">Year</p>
                <p className="font-semibold text-slate-700">Year {student.year || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LecturerDashboard = ({ user, students, attendanceData }) => {
  const [aiReport, setAiReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [activePieIndex, setActivePieIndex] = useState(null);
  const [branchFilter, setBranchFilter] = useState(user.branch || 'CSE');
  const [yearFilter, setYearFilter] = useState(user.academicYear || '1');
  const [selectedBranch, setSelectedBranch] = useState(user.branch || 'CSE');
  const [selectedYear, setSelectedYear] = useState(user.academicYear || '1');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (user.branch) setSelectedBranch(user.branch);
    if (user.academicYear) setSelectedYear(user.academicYear);
  }, [user.branch, user.academicYear]);

  useEffect(() => {
    setBranchFilter(selectedBranch);
    setYearFilter(selectedYear);
  }, [selectedBranch, selectedYear]);

  const subject = user.subjects?.[0] || 'General';
  const assignedClass = user.assignedClass || `${user.branch || 'CSE'}-${user.academicYear?.charAt(0) || '1'}`;

  const allBranches = [...new Set(students.map(s => s.branch))].filter(Boolean).sort();
  const allYears = ['1', '2', '3', '4'];
  const availableMonths = [...new Set(attendanceData.map(r => r.month))].filter(Boolean);

  const currentClass = `${selectedBranch}-${selectedYear}`;
  const classStudents = students.filter(s => {
    if (branchFilter === 'all' && yearFilter === 'all') return true;
    if (branchFilter === 'all') return s.year === parseInt(selectedYear);
    if (yearFilter === 'all') return s.branch === selectedBranch;
    return s.branch === selectedBranch && s.year === parseInt(selectedYear);
  });

  const subjectRecords = attendanceData.filter(r => {
    const student = students.find(st => st.id === r.studentId);
    const monthMatch = selectedMonth === 'all' || r.month === selectedMonth;

    if (branchFilter === 'all' && yearFilter === 'all') return monthMatch;
    if (branchFilter === 'all') return student?.year === parseInt(selectedYear) && monthMatch;
    if (yearFilter === 'all') return student?.branch === selectedBranch && monthMatch;
    return student?.branch === selectedBranch && student?.year === parseInt(selectedYear) && monthMatch;
  });

  const totalStudents = classStudents.length;
  if (totalStudents === 0 && branchFilter !== 'all' && yearFilter !== 'all') return <div className="p-8 text-center text-slate-400">No students found in {currentClass}.</div>;

  const studentStats = classStudents.map(student => {
    const records = subjectRecords.filter(r => r.studentId === student.id);
    if (records.length === 0) return { id: student.id, studentName: student.name, rollNo: student.rollNo, pct: 0, totalHours: 0, attendedHours: 0 };

    const totalHours = records.reduce((sum, r) => sum + r.totalHours, 0);
    const attendedHours = records.reduce((sum, r) => sum + r.attendedHours, 0);
    const pct = totalHours > 0 ? (attendedHours / totalHours) * 100 : 0;

    return { id: student.id, studentName: student.name, rollNo: student.rollNo, pct, totalHours, attendedHours, branch: student.branch, year: student.year };
  });

  let safe = 0, warning = 0, critical = 0;
  let totalAttendedSum = 0;

  studentStats.forEach(s => {
    totalAttendedSum += s.pct;
    if (s.pct >= 75) safe++;
    else if (s.pct >= 65) warning++;
    else critical++;
  });

  const branches = [...new Set(students.map(s => s.branch))].filter(Boolean).sort();
  const years = ['1', '2', '3', '4'];

  const filteredStudents = studentStats.filter(s => {
    const student = students.find(st => st.id === s.id);

    const attendanceMatch = activeFilter === 'all' ||
      (activeFilter === 'safe' && s.pct >= 75) ||
      (activeFilter === 'warning' && s.pct >= 65 && s.pct < 75) ||
      (activeFilter === 'critical' && s.pct < 65);

    const branchMatch = branchFilter === 'all' || student?.branch === branchFilter;
    const yearMatch = yearFilter === 'all' || student?.year?.toString() === yearFilter;

    return attendanceMatch && branchMatch && yearMatch;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'rank') return b.pct - a.pct;
    if (sortBy === 'name') return a.studentName.localeCompare(b.studentName);
    if (sortBy === 'roll') return a.rollNo.localeCompare(b.rollNo);
    return 0;
  }).map((s, idx) => ({ ...s, rank: idx + 1 }));

  const avgAttendance = (totalAttendedSum / totalStudents).toFixed(1);

  const pieData = [
    { name: 'Safe', label: 'Safe (≥75%)', value: safe, color: '#22c55e', percentage: ((safe / totalStudents) * 100).toFixed(1) },
    { name: 'Warning', label: 'Warning (65-75%)', value: warning, color: '#f97316', percentage: ((warning / totalStudents) * 100).toFixed(1) },
    { name: 'Critical', label: 'Critical (<65%)', value: critical, color: '#ef4444', percentage: ((critical / totalStudents) * 100).toFixed(1) },
  ];

  const distributionData = [
    { range: '0-50%', count: studentStats.filter(s => s.pct < 50).length },
    { range: '50-65%', count: studentStats.filter(s => s.pct >= 50 && s.pct < 65).length },
    { range: '65-75%', count: studentStats.filter(s => s.pct >= 65 && s.pct < 75).length },
    { range: '75-100%', count: studentStats.filter(s => s.pct >= 75).length },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setShowReportModal(true);
    const prompt = `Generate a professional, short Monthly Attendance Report for the College Head of Department.
    Class: ${currentClass}
    Total Students: ${totalStudents}
    Class Average Attendance: ${avgAttendance}%
    Safe Zone Students: ${safe}
    Warning Zone Students: ${warning}
    Critical Zone Students (<65%): ${critical}

    Please summarize the class performance, highlight the critical risk situation, and suggest 2 specific actions for the lecturer to improve attendance. Format with clear headings.`;

    const report = await callGemini(prompt);
    setAiReport(report);
    setIsGenerating(false);
  };

  const handleDownloadExcel = () => {
    const data = sortedStudents.map(s => ({
      'Rank': s.rank,
      'Roll No': s.rollNo,
      'Name': s.studentName,
      'Total Hours': s.totalHours,
      'Attended Hours': s.attendedHours,
      'Attendance %': s.pct.toFixed(1) + '%',
      'Status': s.pct >= 75 ? 'Safe' : s.pct >= 65 ? 'Warning' : 'Critical'
    }));
    downloadExcel(data, `${currentClass}_Attendance_Report`);
  };

  const handleDownloadPDF = () => {
    const data = sortedStudents.map(s => ({
      rank: s.rank,
      rollNo: s.rollNo,
      name: s.studentName,
      totalHours: s.totalHours,
      attended: s.attendedHours,
      percentage: s.pct.toFixed(1) + '%',
      status: s.pct >= 75 ? 'Safe' : s.pct >= 65 ? 'Warning' : 'Critical'
    }));
    const columns = [
      { key: 'rank', label: 'Rank' },
      { key: 'rollNo', label: 'Roll No' },
      { key: 'name', label: 'Name' },
      { key: 'totalHours', label: 'Total' },
      { key: 'attended', label: 'Attended' },
      { key: 'percentage', label: '%' },
      { key: 'status', label: 'Status' }
    ];
    downloadPDF(data, `${currentClass} Attendance Report`, columns);
  };

  const MetricCard = ({ title, value, subtext, type, active }) => {
    let baseStyles = "p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md";
    let typeStyles = "";

    if (active) {
      if (type === 'all') typeStyles = "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-300 ring-offset-2";
      if (type === 'safe') typeStyles = "bg-green-500 border-green-500 text-white shadow-lg shadow-green-200 ring-2 ring-green-300 ring-offset-2";
      if (type === 'warning') typeStyles = "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200 ring-2 ring-orange-300 ring-offset-2";
      if (type === 'critical') typeStyles = "bg-red-500 border-red-500 text-white shadow-lg shadow-red-200 ring-2 ring-red-300 ring-offset-2";
    } else {
      if (type === 'all') typeStyles = "bg-white border-slate-200 hover:border-blue-300";
      if (type === 'safe') typeStyles = "bg-green-50 border-green-100 hover:border-green-300";
      if (type === 'warning') typeStyles = "bg-orange-50 border-orange-100 hover:border-orange-300";
      if (type === 'critical') typeStyles = "bg-red-50 border-red-100 hover:border-red-300";
    }

    return (
      <div
        onClick={() => setActiveFilter(type)}
        className={`${baseStyles} ${typeStyles}`}
      >
        <div className={`text-xs font-bold uppercase tracking-wider ${active ? 'text-white/80' : 'text-slate-500'}`}>{title}</div>
        <div className={`text-3xl font-black mt-2 ${active ? 'text-white' : 'text-slate-800'}`}>{value}</div>
        {subtext && <div className={`text-xs mt-1 ${active ? 'text-white/90' : 'text-slate-400'}`}>{subtext}</div>}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="mb-6">
        <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 rounded-3xl shadow-xl border border-blue-200/50 backdrop-blur-sm">
          <div className="px-4 py-4 md:px-8 md:py-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full xl:w-auto">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Users size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                  {currentClass}
                </h1>
                <p className="text-blue-600 text-sm font-medium mt-1">Class Overview & Analytics</p>
              </div>
              <div className="flex flex-wrap gap-2 md:ml-4 w-full md:w-auto">
                <select
                  className="px-3 py-2 border-2 border-blue-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none bg-white text-blue-700"
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setBranchFilter(e.target.value);
                  }}
                >
                  {allBranches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
                <select
                  className="px-3 py-2 border-2 border-blue-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none bg-white text-blue-700"
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setYearFilter(e.target.value);
                  }}
                >
                  {allYears.map(year => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
                <select
                  className="px-3 py-2 border-2 border-blue-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none bg-white text-blue-700"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="all">All Months</option>
                  {availableMonths.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 w-full xl:w-auto">
              <button
                onClick={() => {
                  const classStudentsWithRecords = students.filter(s =>
                    subjectRecords.some(r => r.studentId === s.id)
                  );
                  const result = notifyAttendanceSaved(classStudentsWithRecords, subjectRecords, []);
                  alert(`📧 Sent ${result.count} emails to students and parents!\n\nCheck console for email details.`);
                }}
                className="group relative flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl hover:shadow-2xl transition-all duration-300 font-bold text-sm shadow-lg hover:scale-105 active:scale-95"
              >
                <Bell size={18} />
                <span>Send Reports</span>
              </button>
              <button
                onClick={handleGenerateReport}
                className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-2xl transition-all duration-300 font-bold text-sm shadow-lg hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Sparkles size={18} className="relative z-10 animate-pulse" />
                <span className="relative z-10">AI Insight</span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
              </button>
              <div className="px-5 py-3 bg-white/60 backdrop-blur-md text-blue-700 rounded-2xl text-sm font-semibold border border-blue-200/50 flex items-center gap-2 shadow-md">
                <Calendar size={16} />
                Oct 2024
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-purple-50">
              <h3 className="text-lg font-bold text-purple-800 flex items-center gap-2">
                <Sparkles size={20} /> AI Insight Report
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-500 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 size={40} className="animate-spin mb-4 text-purple-500" />
                  <p>Analyzing class data...</p>
                </div>
              ) : (
                <div className="prose prose-purple max-w-none text-slate-700 whitespace-pre-line">
                  {aiReport}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          title="Total Students"
          value={totalStudents}
          subtext={`Avg: ${avgAttendance}%`}
          type="all"
          active={activeFilter === 'all'}
        />
        <MetricCard
          title="Safe Zone"
          value={safe}
          subtext="> 75%"
          type="safe"
          active={activeFilter === 'safe'}
        />
        <MetricCard
          title="Warning Zone"
          value={warning}
          subtext="65% - 75%"
          type="warning"
          active={activeFilter === 'warning'}
        />
        <MetricCard
          title="Critical Risk"
          value={critical}
          subtext="< 65%"
          type="critical"
          active={activeFilter === 'critical'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
            Attendance Distribution
            <PieChart size={18} className="text-slate-400" />
          </h3>
          <div className="h-72 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  activeIndex={activePieIndex}
                  activeShape={(props) => {
                    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                    return (
                      <g>
                        <Sector
                          cx={cx}
                          cy={cy}
                          innerRadius={innerRadius}
                          outerRadius={outerRadius + 10}
                          startAngle={startAngle}
                          endAngle={endAngle}
                          fill={fill}
                        />
                        <Sector
                          cx={cx}
                          cy={cy}
                          innerRadius={outerRadius + 12}
                          outerRadius={outerRadius + 15}
                          startAngle={startAngle}
                          endAngle={endAngle}
                          fill={fill}
                          opacity={0.3}
                        />
                      </g>
                    );
                  }}
                  onMouseEnter={(_, index) => setActivePieIndex(index)}
                  onMouseLeave={() => setActivePieIndex(null)}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="cursor-pointer transition-all duration-300"
                      style={{ filter: activePieIndex === index ? 'brightness(1.1)' : 'brightness(1)' }}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white px-4 py-3 rounded-lg shadow-xl border border-slate-200">
                          <p className="font-bold text-slate-800 mb-1">{data.label}</p>
                          <p className="text-2xl font-black" style={{ color: data.color }}>{data.value} students</p>
                          <p className="text-sm text-slate-500 mt-1">{data.percentage}% of class</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RPieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-4xl font-black text-slate-800">{avgAttendance}%</span>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">Class Average</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {pieData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group"
                onMouseEnter={() => setActivePieIndex(idx)}
                onMouseLeave={() => setActivePieIndex(null)}
              >
                <div className="w-3 h-3 rounded-full group-hover:scale-125 transition-transform" style={{ backgroundColor: item.color }}></div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-medium">{item.name}</p>
                  <p className="text-lg font-bold text-slate-800">{item.value}</p>
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center justify-between">
            Performance Brackets
            <BarChart2 size={18} className="text-slate-400" />
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="range" type="category" width={70} tick={{ fontSize: 12 }} />
                <RechartsTooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={32}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#f97316' : index === 2 ? '#eab308' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Users size={18} className="text-slate-500" />
            Student List
            <span className="text-xs font-normal text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full ml-2 hidden sm:inline-block">
              Showing {sortedStudents.length} Students
            </span>
          </h3>
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <select
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">All Months</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="all">All Branches</option>
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>Year {year}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="rank">Sort by Rank</option>
              <option value="roll">Sort by Roll No</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm">
              Go
            </button>
            <button
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <Download size={16} />
              Excel
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <Download size={16} />
              PDF
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 md:px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Filter by Status:</span>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-300'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('safe')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === 'safe'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-white text-green-700 hover:bg-green-50 border border-green-300'
              }`}
          >
            Safe ({safe})
          </button>
          <button
            onClick={() => setActiveFilter('warning')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === 'warning'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-white text-orange-700 hover:bg-orange-50 border border-orange-300'
              }`}
          >
            Warning ({warning})
          </button>
          <button
            onClick={() => setActiveFilter('critical')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === 'critical'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-white text-red-700 hover:bg-red-50 border border-red-300'
              }`}
          >
            Critical ({critical})
          </button>
        </div>

        <div className="overflow-x-auto">
          {filteredStudents.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  {sortBy === 'rank' && <th className="px-6 py-4 w-20">Rank</th>}
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4 text-center">Total Hours</th>
                  <th className="px-6 py-4 text-center">Attended</th>
                  <th className="px-6 py-4 text-center">Percentage</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStudents.map(s => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedStudent(s)}
                  >
                    {sortBy === 'rank' && (
                      <td className="px-6 py-4">
                        <span className={`font-bold ${s.rank <= 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                          #{s.rank}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-base text-slate-800">{s.studentName}</div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                          Year {s.year}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 font-mono">{s.rollNo}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-slate-700">{s.totalHours}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-blue-600">{s.attendedHours}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-lg text-slate-800">{s.pct.toFixed(1)}%</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {s.pct >= 75 ? (
                        <div className="group/badge inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 shadow-sm hover:shadow-md transition-all cursor-default">
                          <div className="p-1 bg-white rounded-full text-emerald-500 shadow-sm group-hover/badge:scale-110 transition-transform">
                            <CheckCircle size={12} strokeWidth={2.5} />
                          </div>
                          <div className="text-left">
                            <p className="text-[9px] uppercase tracking-wider font-bold text-emerald-400 leading-none mb-0.5">On Track</p>
                            <p className="text-xs font-bold text-emerald-700 leading-none">Safe</p>
                          </div>
                        </div>
                      ) : s.pct >= 65 ? (
                        <div className="group/badge inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 shadow-sm hover:shadow-md transition-all cursor-default">
                          <div className="p-1 bg-white rounded-full text-amber-500 shadow-sm group-hover/badge:scale-110 transition-transform">
                            <AlertTriangle size={12} strokeWidth={2.5} />
                          </div>
                          <div className="text-left">
                            <p className="text-[9px] uppercase tracking-wider font-bold text-amber-400 leading-none mb-0.5">Warning</p>
                            <p className="text-xs font-bold text-amber-700 leading-none">
                              Need {predictHours(s.attendedHours, s.totalHours, 0.75)} Hrs
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="group/badge inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-100 shadow-sm hover:shadow-md transition-all cursor-default">
                          <div className="p-1 bg-white rounded-full text-rose-500 shadow-sm group-hover/badge:scale-110 transition-transform">
                            <AlertOctagon size={12} strokeWidth={2.5} />
                          </div>
                          <div className="text-left">
                            <p className="text-[9px] uppercase tracking-wider font-bold text-rose-400 leading-none mb-0.5">Critical</p>
                            <p className="text-xs font-bold text-rose-700 leading-none">
                              Need {predictHours(s.attendedHours, s.totalHours, 0.75)} Hrs
                            </p>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Filter size={24} className="text-slate-300" />
              </div>
              <p className="font-medium">No students match the current filter.</p>
              <button
                onClick={() => {
                  setActiveFilter('all');
                  setBranchFilter('all');
                  setYearFilter('all');
                }}
                className="mt-2 text-blue-600 hover:underline text-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
      <StudentDetailsModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
};

export default LecturerDashboard;
