import React from 'react';
import { getRiskStatus } from '../../utils';

const RiskBadge = ({ percent }) => {
  const status = getRiskStatus(percent);
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
      <status.icon size={12} strokeWidth={3} />
      {status.label}
    </span>
  );
};

export default RiskBadge;
