import React, { useState } from 'react';
import { Activity, Trophy, FileText, Download } from 'lucide-react';

import { calculatePercentage } from '../../utils';
import StudentTable from '../common/StudentTable';
import { downloadExcel, downloadPDF } from '../../utils/downloadReport';
import AttendanceFilter, { getDefaultSem } from '../common/AttendanceFilter';

export const ClassAttendanceView = ({ currentUser, allStudents, attendanceData, semConfig }) => {
  const [sortMode, setSortMode] = useState('roll');
  const [filterMode, setFilterMode] = useState('all');

  const initSem = getDefaultSem(semConfig, currentUser?.year);
  const [attFilter, setAttFilter] = useState({ semester: parseInt(initSem), activeMonths: [] });

  const classmates = allStudents.filter(s =>
    s.branch === currentUser.branch &&
    s.year === currentUser.year
  );

  const classmatesWithStats = classmates.map(student => {
    const records = attendanceData.filter(r =>
      r.studentId === student.id &&
      (attFilter.semester === null || r.semester === attFilter.semester) &&
      (attFilter.activeMonths.length === 0 || attFilter.activeMonths.includes(r.month))
    );
    const totalConducted = records.reduce((acc, curr) => acc + curr.totalHours, 0);
    const totalAttended = records.reduce((acc, curr) => acc + curr.attendedHours, 0);
    const percentage = parseFloat(calculatePercentage(totalAttended, totalConducted));
    
    return {
      ...student,
      percentage,
      totalAttended,
      totalConducted
    };
  });

  const rankedData = [...classmatesWithStats].sort((a, b) => b.percentage - a.percentage).map((student, index) => ({
    ...student,
    performanceRank: index + 1
  }));

  const filteredData = rankedData.filter(s => {
    if (filterMode === 'all') return true;
    if (filterMode === 'safe') return s.percentage >= 75;
    if (filterMode === 'warning') return s.percentage >= 65 && s.percentage < 75;
    if (filterMode === 'critical') return s.percentage < 65;
    return true;
  });

  const displayedStudents = [...filteredData].sort((a, b) => {
    if (sortMode === 'roll') {
      return a.rollNo.localeCompare(b.rollNo);
    }
    return 0;
  });

  const safe = classmatesWithStats.filter(s => s.percentage >= 75).length;
  const warning = classmatesWithStats.filter(s => s.percentage >= 65 && s.percentage < 75).length;
  const critical = classmatesWithStats.filter(s => s.percentage < 65).length;

  const handleDownloadExcel = () => {
    const data = displayedStudents.map(s => ({
      'Rank': s.performanceRank,
      'Roll No': s.rollNo,
      'Name': s.name,
      'Branch': s.branch,
      'Year': `Year ${s.year}`,
      'Attendance %': s.percentage + '%',
      'Status': s.percentage >= 75 ? 'Safe' : s.percentage >= 65 ? 'Warning' : 'Critical'
    }));
    downloadExcel(data, 'Class_Attendance_Report');
  };

  const handleDownloadPDF = () => {
    const data = displayedStudents.map(s => ({
      rank: s.performanceRank,
      rollNo: s.rollNo,
      name: s.name,
      percentage: s.percentage + '%',
      status: s.percentage >= 75 ? 'Safe' : s.percentage >= 65 ? 'Warning' : 'Critical'
    }));
    const columns = [
      { key: 'rank', label: 'Rank' },
      { key: 'rollNo', label: 'Roll No' },
      { key: 'name', label: 'Name' },
      { key: 'percentage', label: 'Attendance %' },
      { key: 'status', label: 'Status' }
    ];
    downloadPDF(data, 'Class Attendance Report', columns);
  };

  return (
    <div className="space-y-6">
      {/* Attendance Filter */}
      <AttendanceFilter
        semConfig={semConfig}
        year={currentUser?.year}
        defaultSem={initSem}
        onChange={setAttFilter}
      />

      {/* Filter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilterMode('all')}
          className={`p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
            filterMode === 'all' 
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg ring-2 ring-blue-300 ring-offset-2' 
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className={`text-xs font-bold uppercase tracking-wider ${filterMode === 'all' ? 'text-white/80' : 'text-slate-500'}`}>Total Students</div>
          <div className={`text-3xl font-black mt-2 ${filterMode === 'all' ? 'text-white' : 'text-slate-800'}`}>{classmates.length}</div>
          <div className={`text-xs mt-1 ${filterMode === 'all' ? 'text-white/90' : 'text-slate-400'}`}>All classmates</div>
        </div>

        <div 
          onClick={() => setFilterMode('safe')}
          className={`p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
            filterMode === 'safe' 
              ? 'bg-green-500 border-green-500 text-white shadow-lg ring-2 ring-green-300 ring-offset-2' 
              : 'bg-green-50 border-green-100 hover:border-green-300'
          }`}
        >
          <div className={`text-xs font-bold uppercase tracking-wider ${filterMode === 'safe' ? 'text-white/80' : 'text-slate-500'}`}>Safe Zone</div>
          <div className={`text-3xl font-black mt-2 ${filterMode === 'safe' ? 'text-white' : 'text-slate-800'}`}>{safe}</div>
          <div className={`text-xs mt-1 ${filterMode === 'safe' ? 'text-white/90' : 'text-slate-400'}`}>≥ 75%</div>
        </div>

        <div 
          onClick={() => setFilterMode('warning')}
          className={`p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
            filterMode === 'warning' 
              ? 'bg-orange-500 border-orange-500 text-white shadow-lg ring-2 ring-orange-300 ring-offset-2' 
              : 'bg-orange-50 border-orange-100 hover:border-orange-300'
          }`}
        >
          <div className={`text-xs font-bold uppercase tracking-wider ${filterMode === 'warning' ? 'text-white/80' : 'text-slate-500'}`}>Warning Zone</div>
          <div className={`text-3xl font-black mt-2 ${filterMode === 'warning' ? 'text-white' : 'text-slate-800'}`}>{warning}</div>
          <div className={`text-xs mt-1 ${filterMode === 'warning' ? 'text-white/90' : 'text-slate-400'}`}>65% - 75%</div>
        </div>

        <div 
          onClick={() => setFilterMode('critical')}
          className={`p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
            filterMode === 'critical' 
              ? 'bg-red-500 border-red-500 text-white shadow-lg ring-2 ring-red-300 ring-offset-2' 
              : 'bg-red-50 border-red-100 hover:border-red-300'
          }`}
        >
          <div className={`text-xs font-bold uppercase tracking-wider ${filterMode === 'critical' ? 'text-white/80' : 'text-slate-500'}`}>Critical Risk</div>
          <div className={`text-3xl font-black mt-2 ${filterMode === 'critical' ? 'text-white' : 'text-slate-800'}`}>{critical}</div>
          <div className={`text-xs mt-1 ${filterMode === 'critical' ? 'text-white/90' : 'text-slate-400'}`}>&lt; 65%</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Class Attendance Report</h2>
            <p className="text-slate-500">
               {currentUser.branch} • Year {currentUser.year} • {displayedStudents.length} of {classmates.length} Students
            </p>
         </div>
         
         <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
            >
              <option value="all">All Students</option>
              <option value="safe">Safe Zone (≥75%)</option>
              <option value="warning">Warning Zone (65-75%)</option>
              <option value="critical">Critical (&lt;65%)</option>
            </select>

            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button 
                onClick={() => setSortMode('rank')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  sortMode === 'rank' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Trophy size={14} /> Rank
              </button>
              <button 
                onClick={() => setSortMode('roll')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  sortMode === 'roll' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileText size={14} /> Roll No
              </button>
            </div>

            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm">
              Go
            </button>

            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg text-blue-700 font-medium text-sm">
                <Activity size={16} />
                <span>Avg: {(classmatesWithStats.reduce((acc, curr) => acc + curr.percentage, 0) / classmatesWithStats.length).toFixed(1)}%</span>
            </div>

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

      <StudentTable
        rows={displayedStudents.map(s => ({
          id: s.id, name: s.name, rollNo: s.rollNo,
          percentage: s.percentage,
          totalHours: s.totalConducted, attendedHours: s.totalAttended,
          rank: s.performanceRank,
        }))}
        showRank={sortMode === 'rank'}
        showHours
        highlightId={currentUser.id}
      />
    </div>
  );
};

export default ClassAttendanceView;
