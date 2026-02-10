import React from 'react';
import { CheckCircle, TrendingUp, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { calculatePercentage, predictHours } from '../../utils';

const OverallPredictionPanel = ({ totalAttended, totalConducted }) => {
  const percentage = calculatePercentage(totalAttended, totalConducted);
  const needed65 = predictHours(totalAttended, totalConducted, 0.65);
  const needed75 = predictHours(totalAttended, totalConducted, 0.75);

  if (percentage >= 75) {
    return (
      <div className="bg-emerald-600 text-white p-6 rounded-xl shadow-lg border-l-4 border-emerald-400 relative overflow-hidden mb-8">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div>
             <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                <CheckCircle className="text-emerald-200" /> 
                You are in the Safe Zone!
             </h3>
             <p className="text-emerald-100 text-sm">
                Your attendance is above 75%. Keep up the good work to maintain your eligibility.
             </p>
           </div>
           <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg flex items-center gap-3 border border-emerald-500/30">
              <ShieldCheck size={24} className="text-emerald-200" />
              <div>
                <p className="text-xs font-bold text-emerald-200 uppercase">Current Status</p>
                <p className="font-bold text-white">Eligible</p>
              </div>
           </div>
        </div>
        <ShieldCheck size={120} className="absolute right-[-20px] bottom-[-20px] text-emerald-500 opacity-20 rotate-12" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500 relative overflow-hidden mb-8">
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
           <TrendingUp className="text-blue-400" /> 
           Action Plan
        </h3>
        <div className="flex flex-col sm:flex-row gap-6">
          {needed75 > 0 && (
             <div className="bg-slate-700/50 p-4 rounded-lg flex-1 border border-slate-600">
                <div className="text-slate-400 text-sm mb-1 uppercase tracking-wide font-bold">Target: 75% Safe Zone</div>
                <div className="flex items-center gap-2">
                   <ArrowUpRight className="text-blue-400" />
                   <div className="text-lg">
                      Attend <strong className="text-blue-300 text-2xl">{needed75}</strong> more hours combined
                   </div>
                </div>
             </div>
          )}
          {needed65 > 0 && percentage < 65 && (
             <div className="bg-slate-700/50 p-4 rounded-lg flex-1 border border-slate-600">
                <div className="text-slate-400 text-sm mb-1 uppercase tracking-wide font-bold">Target: 65% Condonation</div>
                <div className="flex items-center gap-2">
                   <ArrowUpRight className="text-orange-400" />
                   <div className="text-lg">
                      Attend <strong className="text-orange-300 text-2xl">{needed65}</strong> more hours combined
                   </div>
                </div>
             </div>
          )}
        </div>
        <p className="mt-4 text-sm text-slate-400 italic">
          * This prediction calculates the number of future attendance hours required across all subjects combined to increase your overall percentage.
        </p>
      </div>
    </div>
  );
};

export default OverallPredictionPanel;
