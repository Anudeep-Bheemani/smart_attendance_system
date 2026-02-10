import React from 'react';
import { calculatePercentage } from '../../utils';
import RiskBadge from '../common/RiskBadge';

const PredictionCard = ({ subject, attended, total }) => {
  const percentage = calculatePercentage(attended, total);
  
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-slate-800">{subject}</h4>
          <p className="text-sm text-slate-500">{attended}/{total} Hours</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-slate-800">{percentage}%</div>
          <RiskBadge percent={percentage} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${percentage >= 75 ? 'bg-green-500' : percentage >= 65 ? 'bg-orange-500' : 'bg-red-500'}`} 
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
