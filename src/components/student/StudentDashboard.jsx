import React, { useState } from 'react';
import { Activity, CheckCircle, AlertTriangle, Sparkles, MessageSquare, X, Loader2, Download, Copy, Check, Send } from 'lucide-react';
import { calculatePercentage } from '../../utils';
import { callGemini } from '../../services/gemini';
import { api } from '../../api';
import PredictionCard from './PredictionCard';
import OverallPredictionPanel from './OverallPredictionPanel';
import AttendanceCalculator from './AttendanceCalculator';
import { downloadPDF } from '../../utils/downloadReport';
import AttendanceFilter, { getDefaultSem } from '../common/AttendanceFilter';

const StudentDashboard = ({ student, attendanceData, onUpdateProfile, isReadOnly, semConfig }) => {
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiMode, setAiMode] = useState('menu');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [letterReason, setLetterReason] = useState('');
  const [copied, setCopied] = useState(false);
  const [letterRecipient, setLetterRecipient] = useState('incharge');
  const [isSendingLetter, setIsSendingLetter] = useState(false);

  const initSem = getDefaultSem(semConfig, student?.year);
  const [attFilter, setAttFilter] = useState({ semester: parseInt(initSem), activeMonths: [] });

  const myRaw = attendanceData.filter(r => r.studentId === student.id);

  const myAttendance = myRaw.filter(r =>
    (attFilter.semester === null || r.semester === attFilter.semester) &&
    (attFilter.activeMonths.length === 0 || attFilter.activeMonths.includes(r.month))
  );
  
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
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const prompt = `You are writing a formal leave application letter for a college student. Output ONLY the letter — no commentary, no markdown, no asterisks, no extra lines before or after.

Use this exact structure (replace nothing, just fill the body):

${date}

To,
The Head of Department,
Department of ${student.branch}

Subject: Application for Leave of Absence

Respected Sir/Madam,

Write exactly 2-3 sentences here: politely state the reason for absence (${letterReason}), express sincere regret, and assure that all missed coursework will be promptly covered. Use warm, expressive, formal language.

I humbly seek your kind approval and assure you of my continued dedication to my academic responsibilities.

Thanking you,
Yours sincerely,

${student.name}
Roll No: ${student.rollNo}
${student.branch} Department
${student.email}${student.phone ? `\n${student.phone}` : ''}`;

    const res = await callGemini(prompt);
    setAiResult(res);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-8">
      {/* Attendance Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
        <div className="flex-1">
          <AttendanceFilter
            semConfig={semConfig}
            year={student?.year}
            defaultSem={initSem}
            onChange={setAttFilter}
          />
        </div>
        <button
          onClick={handleGeneratePDF}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm self-stretch sm:self-auto"
        >
          <Download size={16} />
          Download PDF
        </button>
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
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm whitespace-pre-wrap text-slate-700 leading-relaxed font-mono">
                          {aiResult}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(aiResult);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="flex-1 py-2 flex items-center justify-center gap-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors"
                          >
                            {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy Letter</>}
                          </button>
                          <button
                            onClick={() => { setAiMode('menu'); setAiResult(''); setCopied(false); }}
                            className="flex-1 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200"
                          >
                            Start Over
                          </button>
                        </div>

                        {/* Send Mail row */}
                        {aiMode === 'letter' && (
                          <div className="flex gap-2 pt-1">
                            <select
                              value={letterRecipient}
                              onChange={e => setLetterRecipient(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                              <option value="incharge">Class In-charge</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              disabled={isSendingLetter}
                              onClick={async () => {
                                setIsSendingLetter(true);
                                try {
                                  const res = await api.sendExcuseLetter({ recipientType: letterRecipient, letterText: aiResult });
                                  alert(`✅ Letter sent to ${res.to} successfully!`);
                                } catch (err) {
                                  alert(`❌ ${err.message || 'Failed to send letter.'}`);
                                } finally {
                                  setIsSendingLetter(false);
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                            >
                              {isSendingLetter ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                              Send Mail
                            </button>
                          </div>
                        )}

                        {/* WhatsApp button — coming soon */}
                        {aiMode === 'letter' && (
                          <button
                            disabled
                            title="Coming soon"
                            className="w-full py-2 flex items-center justify-center gap-2 bg-green-50 text-green-400 border border-green-200 rounded-lg font-medium text-sm cursor-not-allowed"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            Send on WhatsApp (Coming Soon)
                          </button>
                        )}
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
