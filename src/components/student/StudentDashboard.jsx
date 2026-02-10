import React, { useState } from 'react';
import { Activity, CheckCircle, AlertTriangle, Sparkles, MessageSquare, X, Loader2, Calendar, Download } from 'lucide-react';
import { calculatePercentage } from '../../utils';
import { callGemini } from '../../services/gemini';
import PredictionCard from './PredictionCard';
import OverallPredictionPanel from './OverallPredictionPanel';
import AttendanceCalculator from './AttendanceCalculator';
import { downloadPDF } from '../../utils/downloadReport';

const StudentDashboard = ({ student, attendanceData, onUpdateProfile, isReadOnly }) => {
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiMode, setAiMode] = useState('menu');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [letterReason, setLetterReason] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');

  const availableMonths = [...new Set(attendanceData.map(r => r.month))].filter(Boolean);
  
  const myAttendance = attendanceData.filter(r => {
    const monthMatch = selectedMonth === 'all' || r.month === selectedMonth;
    return r.studentId === student.id && monthMatch;
  });
  
  const totalConducted = myAttendance.reduce((acc, curr) => acc + curr.totalHours, 0);
  const totalAttended = myAttendance.reduce((acc, curr) => acc + curr.attendedHours, 0);
  const overallPercent = calculatePercentage(totalAttended, totalConducted);

  const handleGeneratePDF = () => {
    const uniqueSubjects = [...new Set(myAttendance.map(r => r.subject))];
    const subjectData = uniqueSubjects.map(subject => {
      const subjectRecords = myAttendance.filter(r => r.subject === subject);
      const total = subjectRecords.reduce((sum, r) => sum + r.totalHours, 0);
      const attended = subjectRecords.reduce((sum, r) => sum + r.attendedHours, 0);
      const percentage = calculatePercentage(attended, total);
      return {
        subject,
        total,
        attended,
        percentage: percentage + '%',
        status: parseFloat(percentage) >= 75 ? 'Safe' : parseFloat(percentage) >= 65 ? 'Warning' : 'Critical'
      };
    });

    const columns = [
      { key: 'subject', label: 'Subject' },
      { key: 'total', label: 'Total Hours' },
      { key: 'attended', label: 'Attended' },
      { key: 'percentage', label: 'Percentage' },
      { key: 'status', label: 'Status' }
    ];

    downloadPDF(subjectData, `${student.name} - Attendance Report`, columns);
  };

  const handleAiAction = async (mode) => {
    setAiMode(mode);
    if (mode === 'tips') {
      setIsGenerating(true);
      const prompt = `I am a college student with ${overallPercent}% attendance. Give me 3 short, actionable tips to improve my attendance and time management. Be encouraging and use emojis.`;
      const res = await callGemini(prompt);
      setAiResult(res);
      setIsGenerating(false);
    }
  };

  const generateLetter = async () => {
    setIsGenerating(true);
    const prompt = `Draft a formal excuse letter for a college student to the Head of Department.
    
    **Student Details (Use these to fill the letter header/footer):**
    - Name: ${student.name}
    - Roll Number: ${student.rollNo}
    - Department/Branch: ${student.branch}
    - Email: ${student.email}
    - Phone: ${student.phone}
    - Date: ${new Date().toLocaleDateString()}

    **Reason for Absence:**
    ${letterReason}

    **Instructions:**
    - Create a professional formal letter format.
    - Use the provided student details to fill the "From" section and signature. DO NOT use placeholders like "[Student Name]" or "[Phone Number]" since you have the actual data.
    - For the "To" section, address it to "The Head of Department, ${student.branch}".
    - Keep the tone polite, professional, and respectful.`;
    
    const res = await callGemini(prompt);
    setAiResult(res);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-8">
      {/* Month Filter - Prominent Position */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              <h3 className="font-semibold text-slate-700 text-sm">Filter by Month</h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-slate-700 hover:border-slate-400 transition-colors min-w-[160px]"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">All Months</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <button
              onClick={handleGeneratePDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <Download size={16} />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-blue-100 font-medium mb-1">Overall Attendance</h3>
            <div className="text-4xl font-bold">{overallPercent}%</div>
            <p className="text-sm text-blue-200 mt-2">{totalAttended} / {totalConducted} Hours</p>
          </div>
          <Activity className="absolute right-4 bottom-4 text-blue-500 opacity-50" size={80} />
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
          <h3 className="text-slate-500 font-medium text-sm mb-2 uppercase tracking-wide">Academic Health</h3>
          <div className="flex items-center gap-4">
             {overallPercent >= 75 ? (
               <CheckCircle className="text-green-500" size={40} />
             ) : (
               <AlertTriangle className={overallPercent >= 65 ? "text-orange-500" : "text-red-500"} size={40} />
             )}
             <div>
               <div className={`text-xl font-bold ${overallPercent >= 75 ? "text-green-600" : overallPercent >= 65 ? "text-orange-600" : "text-red-600"}`}>
                 {overallPercent >= 75 ? "Excellent Standing" : overallPercent >= 65 ? "Needs Improvement" : "Critical Risk"}
               </div>
               <p className="text-xs text-slate-400">Based on aggregate data</p>
             </div>
          </div>
        </div>

        <div 
          onClick={() => { setShowAiModal(true); setAiMode('menu'); setAiResult(''); }}
          className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
        >
           <div className="relative z-10 h-full flex flex-col justify-between">
             <div>
               <h3 className="text-purple-100 font-medium mb-1 flex items-center gap-2">
                 <Sparkles size={16} /> AI Smart Assistant
               </h3>
               <p className="text-sm text-purple-100/80 mt-2">
                 Draft excuse letters or get recovery tips instantly.
               </p>
             </div>
             <button className="bg-white/20 hover:bg-white/30 text-white text-sm font-bold py-2 px-4 rounded-lg mt-4 w-fit backdrop-blur-sm transition-colors">
               Open Assistant
             </button>
           </div>
           <MessageSquare className="absolute right-[-10px] bottom-[-10px] text-white opacity-20 rotate-12" size={100} />
        </div>
      </div>

      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
              <h3 className="text-lg font-bold text-indigo-800 flex items-center gap-2">
                <Sparkles size={18} /> Smart Assistant
              </h3>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {aiMode === 'menu' && (
                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => setAiMode('letter')}
                    className="p-4 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                  >
                    <div className="font-bold text-slate-800 group-hover:text-indigo-700 mb-1">📝 Draft Excuse Letter</div>
                    <div className="text-sm text-slate-500">Generate a formal letter for sick leave or personal reasons.</div>
                  </button>
                  <button 
                    onClick={() => handleAiAction('tips')}
                    className="p-4 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                  >
                    <div className="font-bold text-slate-800 group-hover:text-indigo-700 mb-1">🚀 Improvement Strategy</div>
                    <div className="text-sm text-slate-500">Get personalized tips to recover your attendance.</div>
                  </button>
                </div>
              )}

              {aiMode === 'letter' && !aiResult && (
                <div className="space-y-4">
                   <p className="text-sm text-slate-600">Why were you absent? (e.g., "High fever for 3 days", "Attending sister's wedding")</p>
                   <textarea 
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      rows="3"
                      placeholder="Enter reason..."
                      value={letterReason}
                      onChange={(e) => setLetterReason(e.target.value)}
                   />
                   <div className="flex gap-3">
                     <button 
                       onClick={() => setAiMode('menu')}
                       className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                     >
                       Back
                     </button>
                     <button 
                       onClick={generateLetter}
                       disabled={!letterReason || isGenerating}
                       className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2"
                     >
                       {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                       Generate
                     </button>
                   </div>
                </div>
              )}

              {(aiMode === 'tips' || (aiMode === 'letter' && aiResult)) && (
                 <div className="space-y-4">
                   {isGenerating ? (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                        <Loader2 size={32} className="animate-spin mb-3 text-indigo-500" />
                        <p>Thinking...</p>
                      </div>
                   ) : (
                      <>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm whitespace-pre-wrap text-slate-700 leading-relaxed">
                          {aiResult}
                        </div>
                        <button 
                          onClick={() => { setAiMode('menu'); setAiResult(''); }}
                          className="w-full py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200"
                        >
                          Start Over
                        </button>
                      </>
                   )}
                 </div>
              )}
            </div>
          </div>
        </div>
      )}

      <OverallPredictionPanel totalAttended={totalAttended} totalConducted={totalConducted} />
      <AttendanceCalculator currentAttended={totalAttended} currentTotal={totalConducted} />

      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Subject-wise Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(() => {
            const uniqueSubjects = [...new Set(myAttendance.map(r => r.subject))];
            return uniqueSubjects.map(subject => {
              const subjectRecords = myAttendance.filter(r => r.subject === subject);
              const total = subjectRecords.reduce((sum, r) => sum + r.totalHours, 0);
              const attended = subjectRecords.reduce((sum, r) => sum + r.attendedHours, 0);
              return (
                <PredictionCard 
                  key={subject}
                  subject={subject} 
                  total={total} 
                  attended={attended} 
                />
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
