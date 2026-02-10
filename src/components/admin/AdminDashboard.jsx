import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart as RPieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Search, Filter, ArrowUpDown, Calendar, Users, Activity, Bell, Download } from 'lucide-react';
import RiskBadge from '../common/RiskBadge';
import { calculatePercentage } from '../../utils';
import { scheduleMonthEndReminders, sendMonthEndReminderToStaff, notifyAttendanceSaved } from '../../services/notificationService';
import { downloadExcel, downloadPDF } from '../../utils/downloadReport';

const AdminDashboard = ({ students, attendanceData, staffList }) => {
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'rollNo', direction: 'asc' });
  const [sortBy, setSortBy] = useState('roll');
  const [riskFilter, setRiskFilter] = useState('all');

  // Calculate student statistics
  const studentStats = useMemo(() => {
    return students.map(s => {
      const records = attendanceData.filter(r => {
        const monthMatch = selectedMonth === 'all' || r.month === selectedMonth;
        return r.studentId === s.id && monthMatch;
      });
      if (records.length === 0) return { ...s, percentage: 0, totalHours: 0, attendedHours: 0, trend: 0 };

      const tot = records.reduce((a, b) => a + b.totalHours, 0);
      const att = records.reduce((a, b) => a + b.attendedHours, 0);
      const percentage = parseFloat(calculatePercentage(att, tot));
      const trend = Math.random() > 0.5 ? 1 : -1; // Mock trend

      return { ...s, percentage, totalHours: tot, attendedHours: att, trend };
    });
  }, [students, attendanceData, selectedMonth]);

  // Calculate college-wide stats (unfiltered)
  const collegeStats = useMemo(() => {
    const totalStudents = studentStats.length;
    const safe = studentStats.filter(s => s.percentage >= 75).length;
    const warning = studentStats.filter(s => s.percentage >= 65 && s.percentage < 75).length;
    const critical = studentStats.filter(s => s.percentage < 65).length;
    const avgAttendance = totalStudents > 0 ? (studentStats.reduce((acc, s) => acc + s.percentage, 0) / totalStudents).toFixed(1) : 0;

    return { totalStudents, safe, warning, critical, avgAttendance };
  }, [studentStats]);

  // Apply filters
  const filteredStudents = useMemo(() => {
    let filtered = studentStats;

    if (selectedYear !== 'all') {
      filtered = filtered.filter(s => s.year === parseInt(selectedYear));
    }

    if (selectedBranch !== 'all') {
      filtered = filtered.filter(s => s.branch === selectedBranch);
    }

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter(s => {
        if (riskFilter === 'safe') return s.percentage >= 75;
        if (riskFilter === 'warning') return s.percentage >= 65 && s.percentage < 75;
        if (riskFilter === 'critical') return s.percentage < 65;
        return true;
      });
    }

    return filtered;
  }, [studentStats, selectedYear, selectedBranch, searchQuery, riskFilter]);

  // Sort students
  const sortedStudents = useMemo(() => {
    const sorted = [...filteredStudents];
    if (sortBy === 'rank') {
      sorted.sort((a, b) => b.percentage - a.percentage);
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'roll') {
      sorted.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
    }
    return sorted.map((s, idx) => ({ ...s, rank: idx + 1 }));
  }, [filteredStudents, sortBy]);

  // Use college-wide stats for cards and charts
  const { totalStudents, safe, warning, critical, avgAttendance } = collegeStats;

  // Calculate filtered average
  const filteredAvgAttendance = useMemo(() => {
    if (sortedStudents.length === 0) return '0.0';
    const sum = sortedStudents.reduce((acc, s) => acc + s.percentage, 0);
    return (sum / sortedStudents.length).toFixed(1);
  }, [sortedStudents]);

  // Chart data
  const pieData = [
    { name: 'Safe (≥75%)', value: safe, color: '#22c55e' },
    { name: 'Warning (65-75%)', value: warning, color: '#f97316' },
    { name: 'Critical (<65%)', value: critical, color: '#ef4444' },
  ];

  const monthlyTrend = [
    { month: 'Jan', attendance: 78 },
    { month: 'Feb', attendance: 82 },
    { month: 'Mar', attendance: 75 },
    { month: 'Apr', attendance: 88 },
    { month: 'May', attendance: 85 },
    { month: 'Jun', attendance: 80 },
  ];

  const branchData = [
    { name: 'CSE', safe: 40, warning: 8, critical: 2 },
    { name: 'ECE', safe: 35, warning: 10, critical: 5 },
    { name: 'EEE', safe: 28, warning: 7, critical: 3 },
    { name: 'MECH', safe: 45, warning: 5, critical: 2 },
  ];

  const recentAlerts = [
    { id: 1, type: 'critical', message: '5 students dropped below 65%', time: '2 hours ago' },
    { id: 2, type: 'warning', message: 'CSE 2nd Year average at 68%', time: '5 hours ago' },
    { id: 3, type: 'safe', message: 'Monthly report generated', time: '1 day ago' },
  ];

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDownloadExcel = () => {
    const data = sortedStudents.map(s => ({
      'Roll No': s.rollNo,
      'Name': s.name,
      'Branch': s.branch,
      'Year': s.year,
      'Attendance %': s.percentage + '%',
      'Total Hours': s.totalHours,
      'Attended Hours': s.attendedHours,
      'Status': s.percentage >= 75 ? 'Safe' : s.percentage >= 65 ? 'Warning' : 'Critical'
    }));
    downloadExcel(data, 'Student_Attendance_Report');
  };

  const handleDownloadPDF = () => {
    const data = sortedStudents.map(s => ({
      rollNo: s.rollNo,
      name: s.name,
      branch: s.branch,
      year: `Year ${s.year}`,
      percentage: s.percentage + '%',
      status: s.percentage >= 75 ? 'Safe' : s.percentage >= 65 ? 'Warning' : 'Critical'
    }));
    const columns = [
      { key: 'rollNo', label: 'Roll No' },
      { key: 'name', label: 'Name' },
      { key: 'branch', label: 'Branch' },
      { key: 'year', label: 'Year' },
      { key: 'percentage', label: 'Attendance %' },
      { key: 'status', label: 'Status' }
    ];
    downloadPDF(data, 'Student Attendance Report', columns);
  };

  const branches = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE'];
  const years = ['1', '2', '3', '4'];
  const months = [...new Set(attendanceData.map(r => r.month))].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
        <p className="text-sm text-blue-700 font-medium text-center">
          📊 Showing institution-wide statistics across all branches and years
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wide">Total Students</div>
              <div className="text-3xl font-bold text-slate-800 mt-2">{totalStudents}</div>
              <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> +5% from last month
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-green-700 text-xs font-bold uppercase tracking-wide">Safe Students</div>
              <div className="text-3xl font-bold text-green-800 mt-2">{safe}</div>
              <div className="text-xs text-green-600 mt-1">≥75% Attendance</div>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <CheckCircle size={24} className="text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-orange-700 text-xs font-bold uppercase tracking-wide">Warning Students</div>
              <div className="text-3xl font-bold text-orange-800 mt-2">{warning}</div>
              <div className="text-xs text-orange-600 mt-1">65-75% Attendance</div>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <AlertTriangle size={24} className="text-orange-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-red-700 text-xs font-bold uppercase tracking-wide">Critical Students</div>
              <div className="text-3xl font-bold text-red-800 mt-2">{critical}</div>
              <div className="text-xs text-red-600 mt-1">&lt;65% Attendance</div>
            </div>
            <div className="p-3 bg-red-200 rounded-lg">
              <XCircle size={24} className="text-red-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-blue-500" />
            Attendance Distribution
          </h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie data={pieData} innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </RPieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-2xl font-bold text-slate-800">{avgAttendance}%</span>
                <p className="text-xs text-slate-500">Average</p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-slate-600">Safe (≥75%)</span>
              </div>
              <span className="font-bold text-slate-800">{safe}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-slate-600">Warning (65-75%)</span>
              </div>
              <span className="font-bold text-slate-800">{warning}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-slate-600">Critical (&lt;65%)</span>
              </div>
              <span className="font-bold text-slate-800">{critical}</span>
            </div>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-blue-500" />
            Monthly Attendance Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={3} name="Avg Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Branch Performance Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 text-center">Branch-wise Performance Chart</h3>
        <div className="flex justify-center">
          <div className="w-full max-w-3xl h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="safe" stackId="a" fill="#22c55e" name="Safe" radius={[0, 0, 0, 0]} />
                <Bar dataKey="warning" stackId="a" fill="#f97316" name="Warning" radius={[0, 0, 0, 0]} />
                <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Branch Performance Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Branch-wise Performance Data</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Branch</th>
                <th className="px-4 py-2 text-center font-semibold text-green-700">Safe</th>
                <th className="px-4 py-2 text-center font-semibold text-orange-700">Warning</th>
                <th className="px-4 py-2 text-center font-semibold text-red-700">Critical</th>
                <th className="px-4 py-2 text-center font-semibold text-slate-700">Total</th>
                <th className="px-4 py-2 text-center font-semibold text-slate-700">Avg %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branchData.map(branch => {
                const total = branch.safe + branch.warning + branch.critical;
                const avgPercent = ((branch.safe * 85 + branch.warning * 70 + branch.critical * 55) / total).toFixed(1);
                return (
                  <tr key={branch.name} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{branch.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded font-bold">
                        {branch.safe}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-700 rounded font-bold">
                        {branch.warning}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 rounded font-bold">
                        {branch.critical}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">{total}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${avgPercent >= 75 ? 'text-green-600' : avgPercent >= 65 ? 'text-orange-600' : 'text-red-600'}`}>
                        {avgPercent}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Control Panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-slate-700 font-semibold mb-4">
          <Filter size={18} />
          <span>Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <select
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="all">All Months</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">All Years</option>
            {years.map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>

          <select
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="all">All Branches</option>
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <select
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="all">All Risk Levels</option>
            <option value="safe">Safe Only</option>
            <option value="warning">Warning Only</option>
            <option value="critical">Critical Only</option>
          </select>

          <select
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="roll">Sort by Roll No</option>
            <option value="name">Sort by Name</option>
            <option value="rank">Sort by Rank</option>
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t border-slate-100 gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-sm">
              Apply Filters
            </button>
            <button
              onClick={() => {
                setSelectedMonth('all');
                setSelectedYear('all');
                setSelectedBranch('all');
                setRiskFilter('all');
                setSortBy('roll');
                setSearchQuery('');
              }}
              className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors text-sm"
            >
              Clear All
            </button>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold text-sm">
            <Activity size={16} />
            <span>Avg: {filteredAvgAttendance}%</span>
          </div>
        </div>
      </div>

      {/* Student Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Student Attendance Health</h3>
            <p className="text-sm text-slate-500 mt-1">Showing {sortedStudents.length} students</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <Download size={16} />
              Excel
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <Download size={16} />
              PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-base text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
              <tr>
                {sortBy === 'rank' && <th className="px-6 py-4">Rank</th>}
                <th className="px-6 py-4">Roll No</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Attendance %</th>
                <th className="px-6 py-4 text-center">Risk Status</th>
                <th className="px-6 py-4 text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedStudents.map(student => {
                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    {sortBy === 'rank' && (
                      <td className="px-6 py-4">
                        <span className={`font-bold ${student.rank <= 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                          #{student.rank}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 font-mono text-slate-600">{student.rollNo}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{student.name}</div>
                      <div className="text-sm text-slate-500">{student.branch} • Year {student.year}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${student.percentage >= 75 ? 'bg-green-500' : student.percentage >= 65 ? 'bg-orange-500' : 'bg-red-500'}`}
                            style={{ width: `${student.percentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700 w-14">{student.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <RiskBadge percent={student.percentage} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {student.trend > 0 ? (
                        <TrendingUp size={20} className="text-green-600 mx-auto" />
                      ) : (
                        <TrendingDown size={20} className="text-red-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Alerts Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Bell size={18} className="text-blue-500" />
            Email Notifications
          </h3>
        </div>

        <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => {
                const result = notifyAttendanceSaved(students, attendanceData, []);
                console.log('\n📧 MONTHLY REPORTS SENT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log(`✅ ${students.length} students received attendance reports`);
                console.log(`✅ ${students.filter(s => s.guardianName).length} parents received attendance reports`);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                alert(`📧 Monthly Reports Sent Successfully!\n\n✅ Students: ${students.length} emails\n✅ Parents: ${students.filter(s => s.guardianName).length} emails\n\nTotal: ${result.count} emails sent\n\n💡 Check console for details`);
              }}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Bell size={16} />
              Send Student/Parent Reports
            </button>

            <button
              onClick={() => {
                (staffList || []).forEach(staff => {
                  sendMonthEndReminderToStaff(staff.email, staff.name);
                });
                console.log('\n📧 LECTURER REMINDERS SENT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log(`✅ ${(staffList || []).length} lecturers received attendance entry reminders`);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                alert(`📧 Lecturer Reminders Sent Successfully!\n\n✅ Lecturers: ${(staffList || []).length} emails\n\nReminder: Fill attendance sheets before month end\n\n💡 Check console for details`);
              }}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Bell size={16} />
              Send Lecturer Reminders
            </button>
          </div>
          {recentAlerts.map(alert => (
            <div key={alert.id} className={`p-3 rounded-lg border ${alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                alert.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                  'bg-green-50 border-green-200'
              }`}>
              <div className="flex items-start gap-2">
                {alert.type === 'critical' ? <XCircle size={16} className="text-red-600 mt-0.5" /> :
                  alert.type === 'warning' ? <AlertTriangle size={16} className="text-orange-600 mt-0.5" /> :
                    <CheckCircle size={16} className="text-green-600 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
