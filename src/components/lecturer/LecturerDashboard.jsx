import React, { useState } from 'react';
import { Sparkles, X, Loader2, Users, Download, Bell, TrendingUp, AlertTriangle, CheckCircle, BookOpen, BarChart3, Filter, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell } from 'recharts';
import { callGemini } from '../../services/gemini';
import { api } from '../../api';
import RiskBadge from '../common/RiskBadge';
import { downloadExcel, downloadPDF } from '../../utils/downloadReport';
import AttendanceFilter, { getSemMonths } from '../common/AttendanceFilter';

const LecturerDashboard = ({ user, students, attendanceData, semConfig }) => {
  const [aiReport, setAiReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedBranch, setSelectedBranch] = useState(user.branch || 'CSE');
  const [selectedYear,   setSelectedYear]   = useState(String(user.academicYear || '1'));

  // Smart default semester — based on most recent attendance record for this class
  const initSem = (() => {
    const MONTH_ORDER = { January:1,February:2,March:3,April:4,May:5,June:6,July:7,August:8,September:9,October:10,November:11,December:12 };
    const initBranch = user.branch || '';
    const initYear   = parseInt(user.academicYear || '1');
    const recs = attendanceData.filter(r => {
      const s = students.find(st => st.id === r.studentId);
      return s?.branch === initBranch && s?.year === initYear;
    });
    if (!recs.length) { const m = new Date().getMonth()+1; return m >= 7 ? '1' : '2'; }
    const latest = recs.reduce((best, r) => (MONTH_ORDER[r.month]||0) > (MONTH_ORDER[best.month]||0) ? r : best);
    return String(latest.semester);
  })();

  const [attFilter, setAttFilter] = useState(() => ({
    semester: parseInt(initSem),
    activeMonths: getSemMonths(semConfig, String(user.academicYear || '1'), parseInt(initSem))
  }));

  const allBranches = [...new Set(students.map(s => s.branch))].filter(Boolean).sort();
  const currentClass = `${selectedBranch} — Year ${selectedYear}`;

  // Records for selected class + semester + active months
  const classRecords = attendanceData.filter(r => {
    const student = students.find(st => st.id === r.studentId);
    return student?.branch === selectedBranch
      && student?.year === parseInt(selectedYear)
      && (attFilter.semester === null || r.semester === attFilter.semester)
      && attFilter.activeMonths.includes(r.month);
  });

  const classStudents = students.filter(s => s.branch === selectedBranch && s.year === parseInt(selectedYear));

  const studentStats = classStudents.map(student => {
    const records = classRecords.filter(r => r.studentId === student.id);
    const totalHours = records.reduce((sum, r) => sum + r.totalHours, 0);
    const attendedHours = records.reduce((sum, r) => sum + r.attendedHours, 0);
    const pct = totalHours > 0 ? (attendedHours / totalHours) * 100 : 0;
    return { id: student.id, studentName: student.name, rollNo: student.rollNo, pct, totalHours, attendedHours };
  });

  const totalStudents = classStudents.length;
  let safe = 0, warning = 0, critical = 0, totalPctSum = 0;
  studentStats.forEach(s => {
    totalPctSum += s.pct;
    if (s.pct >= 75) safe++;
    else if (s.pct >= 65) warning++;
    else critical++;
  });
  const avgAttendance = totalStudents > 0 ? (totalPctSum / totalStudents).toFixed(1) : '0.0';

  const filteredStudents = studentStats.filter(s => {
    if (activeFilter === 'safe') return s.pct >= 75;
    if (activeFilter === 'warning') return s.pct >= 65 && s.pct < 75;
    if (activeFilter === 'critical') return s.pct < 65;
    return true;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'rank') return b.pct - a.pct;
    if (sortBy === 'roll') return a.rollNo.localeCompare(b.rollNo);
    return a.studentName.localeCompare(b.studentName);
  }).map((s, idx) => ({ ...s, rank: idx + 1 }));

  const pieData = [
    { name: 'Safe ≥75%', value: safe, color: '#10b981' },
    { name: 'Warning 65–75%', value: warning, color: '#f59e0b' },
    { name: 'Critical <65%', value: critical, color: '#ef4444' },
  ];

  const distributionData = [
    { range: '0–50%', count: studentStats.filter(s => s.pct < 50).length, fill: '#ef4444' },
    { range: '50–65%', count: studentStats.filter(s => s.pct >= 50 && s.pct < 65).length, fill: '#f97316' },
    { range: '65–75%', count: studentStats.filter(s => s.pct >= 65 && s.pct < 75).length, fill: '#f59e0b' },
    { range: '75–100%', count: studentStats.filter(s => s.pct >= 75).length, fill: '#10b981' },
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
      'Rank': s.rank, 'Roll No': s.rollNo, 'Name': s.studentName,
      'Total Hours': s.totalHours, 'Attended Hours': s.attendedHours,
      'Attendance %': s.pct.toFixed(1) + '%',
      'Status': s.pct >= 75 ? 'Safe' : s.pct >= 65 ? 'Warning' : 'Critical'
    }));
    downloadExcel(data, `${selectedBranch}_Y${selectedYear}_Attendance`);
  };

  const handleDownloadPDF = () => {
    const data = sortedStudents.map(s => ({
      rank: s.rank, rollNo: s.rollNo, name: s.studentName,
      totalHours: s.totalHours, attended: s.attendedHours,
      percentage: s.pct.toFixed(1) + '%',
      status: s.pct >= 75 ? 'Safe' : s.pct >= 65 ? 'Warning' : 'Critical'
    }));
    const columns = [
      { key: 'rank', label: 'Rank' }, { key: 'rollNo', label: 'Roll No' },
      { key: 'name', label: 'Name' }, { key: 'totalHours', label: 'Total' },
      { key: 'attended', label: 'Attended' }, { key: 'percentage', label: '%' },
      { key: 'status', label: 'Status' }
    ];
    downloadPDF(data, `${selectedBranch} Year ${selectedYear} Attendance Report`, columns);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <BookOpen size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Class Analytics</h1>
          </div>
          <p className="text-sm text-slate-500 pl-12">{currentClass} &nbsp;·&nbsp; {totalStudents} Students</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Class selectors — Branch + Year only; Sem is in AttendanceFilter below */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allBranches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['1','2','3','4'].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>

          {/* Action buttons */}
          <button
            disabled={isSendingEmails}
            onClick={async () => {
              setIsSendingEmails(true);
              try {
                const result = await api.sendAttendanceEmails({
                  branch: selectedBranch,
                  year: selectedYear,
                  semester: String(attFilter.semester),
                  month: attFilter.activeMonths.length === 1 ? attFilter.activeMonths[0] : 'all',
                });
                alert(`✅ ${result.message}`);
              } catch (err) {
                alert(`❌ Failed to send emails: ${err.message}`);
              } finally {
                setIsSendingEmails(false);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {isSendingEmails ? <Loader2 size={15} className="animate-spin" /> : <Bell size={15} />}
            {isSendingEmails ? 'Sending...' : 'Email Students & Parents'}
          </button>
          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Sparkles size={15} /> AI Report
          </button>
        </div>
      </div>

      {/* ── AI Report Modal ──────────────────────────────────────────────── */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Sparkles size={16} className="text-violet-600" />
                </div>
                <h3 className="font-bold text-slate-800">AI Attendance Insight</h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Loader2 size={36} className="animate-spin mb-3 text-violet-500" />
                  <p className="text-sm">Analyzing class data...</p>
                </div>
              ) : (
                <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{aiReport}</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="px-8 py-6 space-y-6">

        {/* ── Attendance Filter ────────────────────────────────────────────── */}
        <AttendanceFilter
          key={selectedYear}
          semConfig={semConfig}
          year={selectedYear}
          defaultSem={initSem}
          onChange={setAttFilter}
        />

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Students', value: totalStudents,
              sub: `Avg ${avgAttendance}%`, icon: Users,
              color: 'blue', filter: 'all'
            },
            {
              label: 'Safe Zone', value: safe,
              sub: '≥ 75% attendance', icon: CheckCircle,
              color: 'emerald', filter: 'safe'
            },
            {
              label: 'Warning Zone', value: warning,
              sub: '65% – 75%', icon: TrendingUp,
              color: 'amber', filter: 'warning'
            },
            {
              label: 'Critical Risk', value: critical,
              sub: '< 65% attendance', icon: AlertTriangle,
              color: 'red', filter: 'critical'
            },
          ].map(({ label, value, sub, icon: Icon, color, filter }) => {
            const isActive = activeFilter === filter;
            const colorMap = {
              blue:    { card: isActive ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200 hover:border-blue-300', icon: isActive ? 'bg-blue-500' : 'bg-blue-50', iconColor: isActive ? 'text-white' : 'text-blue-600', text: isActive ? 'text-white' : 'text-slate-800', sub: isActive ? 'text-blue-100' : 'text-slate-400' },
              emerald: { card: isActive ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-200 hover:border-emerald-300', icon: isActive ? 'bg-emerald-500' : 'bg-emerald-50', iconColor: isActive ? 'text-white' : 'text-emerald-600', text: isActive ? 'text-white' : 'text-slate-800', sub: isActive ? 'text-emerald-100' : 'text-slate-400' },
              amber:   { card: isActive ? 'bg-amber-500 border-amber-500' : 'bg-white border-slate-200 hover:border-amber-300', icon: isActive ? 'bg-amber-400' : 'bg-amber-50', iconColor: isActive ? 'text-white' : 'text-amber-600', text: isActive ? 'text-white' : 'text-slate-800', sub: isActive ? 'text-amber-100' : 'text-slate-400' },
              red:     { card: isActive ? 'bg-red-600 border-red-600' : 'bg-white border-slate-200 hover:border-red-300', icon: isActive ? 'bg-red-500' : 'bg-red-50', iconColor: isActive ? 'text-white' : 'text-red-600', text: isActive ? 'text-white' : 'text-slate-800', sub: isActive ? 'text-red-100' : 'text-slate-400' },
            };
            const c = colorMap[color];
            return (
              <div
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`${c.card} border rounded-xl p-5 cursor-pointer transition-all hover:shadow-md flex items-start gap-4`}
              >
                <div className={`${c.icon} rounded-lg p-2.5 flex-shrink-0`}>
                  <Icon size={20} className={c.iconColor} />
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${c.sub}`}>{label}</p>
                  <p className={`text-3xl font-black mt-1 ${c.text}`}>{value}</p>
                  <p className={`text-xs mt-0.5 ${c.sub}`}>{sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Charts Row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Pie chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Risk Distribution</h3>
              <span className="text-xs text-slate-400 font-medium">{totalStudents} students</span>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value, name) => [value + ' students', name]} />
                </RPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ background: d.color }}></span>
                    <span className="text-slate-600">{d.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Score Distribution</h3>
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <BarChart3 size={14} /> Attendance Bands
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} barSize={42}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} formatter={(v) => [v + ' students', 'Count']} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {distributionData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Student Table ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Table toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Users size={16} className="text-slate-400" />
                Student Records
              </h3>
              <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2.5 py-1 rounded-full">
                {sortedStudents.length} of {totalStudents}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-slate-200 bg-white text-slate-700 font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort: Name</option>
                <option value="rank">Sort: Rank</option>
                <option value="roll">Sort: Roll No</option>
              </select>

              {/* Downloads */}
              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Download size={14} /> Excel
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Download size={14} /> PDF
              </button>
            </div>
          </div>

          {/* Status filter tabs */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
            {[
              { key: 'all', label: `All (${totalStudents})`, activeClass: 'bg-blue-600 text-white border-blue-600' },
              { key: 'safe', label: `Safe (${safe})`, activeClass: 'bg-emerald-600 text-white border-emerald-600' },
              { key: 'warning', label: `Warning (${warning})`, activeClass: 'bg-amber-500 text-white border-amber-500' },
              { key: 'critical', label: `Critical (${critical})`, activeClass: 'bg-red-600 text-white border-red-600' },
            ].map(({ key, label, activeClass }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  activeFilter === key
                    ? activeClass
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {sortedStudents.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    {sortBy === 'rank' && <th className="px-6 py-3 w-16">Rank</th>}
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3 text-right">Total Hrs</th>
                    <th className="px-6 py-3 text-right">Attended</th>
                    <th className="px-6 py-3 text-right">Percentage</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 min-w-[140px]">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sortedStudents.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      {sortBy === 'rank' && (
                        <td className="px-6 py-4">
                          <span className={`text-sm font-bold ${s.rank <= 3 ? 'text-amber-500' : 'text-slate-300'}`}>
                            #{s.rank}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{s.studentName}</div>
                        <div className="text-xs text-slate-400 font-mono">{s.rollNo}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600">{s.totalHours}</td>
                      <td className="px-6 py-4 text-right font-medium text-blue-600">{s.attendedHours}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-base font-bold ${s.pct >= 75 ? 'text-emerald-600' : s.pct >= 65 ? 'text-amber-600' : 'text-red-600'}`}>
                          {s.pct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <RiskBadge percent={s.pct} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${s.pct >= 75 ? 'bg-emerald-500' : s.pct >= 65 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(s.pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Filter size={20} className="text-slate-300" />
                </div>
                <p className="text-sm font-medium">No students match this filter</p>
                <button
                  onClick={() => setActiveFilter('all')}
                  className="mt-2 text-blue-600 hover:underline text-xs"
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LecturerDashboard;
