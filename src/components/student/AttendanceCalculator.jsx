import React, { useState } from 'react';
import { Calculator, PieChart, ShieldCheck, AlertTriangle, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { calculatePercentage } from '../../utils';

const AttendanceCalculator = ({ currentAttended, currentTotal }) => {
  const [futureHours, setFutureHours] = useState(5); 
  
  const currentPercent = parseFloat(calculatePercentage(currentAttended, currentTotal));
  
  const projectedAttended = currentAttended + futureHours;
  const projectedTotal = currentTotal + futureHours;
  const projectedPercent = ((projectedAttended / projectedTotal) * 100).toFixed(1);
  const percentChange = (projectedPercent - currentPercent).toFixed(1);

  const missedAttended = currentAttended;
  const missedTotal = currentTotal + futureHours;
  const missedPercent = ((missedAttended / missedTotal) * 100).toFixed(1);

  const buffer75 = Math.floor((currentAttended - 0.75 * currentTotal) / 0.75);
  const isSafe = currentPercent >= 75;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calculator size={20} className="text-blue-500" /> 
          "What-If" Calculator
        </h3>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
              <span>If I attend the next...</span>
              <span className="text-blue-600 font-bold">{futureHours} Hours</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="150" 
              value={futureHours} 
              onChange={(e) => setFutureHours(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1 Hr</span>
              <span>150 Hrs</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">New Percentage</p>
              <div className="text-3xl font-black text-slate-800 transition-all">
                {projectedPercent}%
              </div>
            </div>
            <div className="text-right">
               <div className={`text-sm font-bold flex items-center justify-end gap-1 ${percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                 {percentChange > 0 ? '+' : ''}{percentChange}% 
                 {percentChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
               </div>
               <p className="text-xs text-slate-400">Projection</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
         <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PieChart size={20} className="text-indigo-500" /> 
              Statistical Insights
            </h3>
            
            <div className="space-y-4">
               <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isSafe ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {isSafe ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Safety Buffer</p>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      {isSafe 
                        ? <span>You can miss <strong className="text-green-600">{buffer75} more hours</strong> before dropping below 75%.</span> 
                        : <span>You have <strong>0 hours</strong> buffer. Every missed class drops your percentage further away from the Safe Zone.</span>
                      }
                    </p>
                  </div>
               </div>

               <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Impact Analysis</p>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Missing the next <strong>{futureHours} hours</strong> would drop your attendance to <strong className="text-orange-600">{missedPercent}%</strong>.
                    </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AttendanceCalculator;
