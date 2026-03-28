import React, { useState } from 'react';
import { Save, RotateCcw, Calendar, Info } from 'lucide-react';

const ALL_MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const MONTH_INDEX = Object.fromEntries(ALL_MONTHS.map((m, i) => [m, i]));

const SemConfigManager = ({ semConfig, onUpdateSemConfig }) => {
  const [config, setConfig] = useState(() => JSON.parse(JSON.stringify(semConfig)));
  const [saving, setSaving] = useState(false);

  const toggleMonth = (year, sem, month) => {
    setConfig(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const months = next[year][sem];
      const idx = months.indexOf(month);
      if (idx >= 0) {
        next[year][sem] = months.filter(m => m !== month);
      } else {
        next[year][sem] = [...months, month].sort((a, b) => MONTH_INDEX[a] - MONTH_INDEX[b]);
      }
      return next;
    });
  };

  const handleReset = () => {
    setConfig(JSON.parse(JSON.stringify(semConfig)));
  };

  const handleSave = async () => {
    // Validate: no month can belong to both sems for same year
    for (const year of ['1','2','3','4']) {
      const overlap = config[year]['1'].filter(m => config[year]['2'].includes(m));
      if (overlap.length > 0) {
        alert(`Year ${year}: "${overlap.join(', ')}" cannot belong to both Sem 1 and Sem 2`);
        return;
      }
      if (config[year]['1'].length === 0) {
        alert(`Year ${year}: Sem 1 must have at least one month`);
        return;
      }
      if (config[year]['2'].length === 0) {
        alert(`Year ${year}: Sem 2 must have at least one month`);
        return;
      }
    }
    setSaving(true);
    try {
      await onUpdateSemConfig(config);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(config) !== JSON.stringify(semConfig);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={24} className="text-blue-600" />
              Semester Configuration
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              Configure which months belong to each semester for every B.Tech year. Changes apply to all attendance views.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm transition-colors"
            >
              <RotateCcw size={15} /> Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Save size={15} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          <Info size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
          <span>
            Each month can only belong to one semester per year. Months not selected won't appear in attendance filters.
            Different years can have different semester schedules running simultaneously.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {['1','2','3','4'].map(year => (
          <div key={year} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
              <h3 className="font-bold text-slate-800 text-lg">Year {year}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sem 1: {config[year]['1'].length} months &nbsp;·&nbsp; Sem 2: {config[year]['2'].length} months
              </p>
            </div>
            <div className="p-6 space-y-5">
              {[['1','bg-blue-600','bg-blue-50','border-blue-400','text-blue-700'],
                ['2','bg-indigo-600','bg-indigo-50','border-indigo-400','text-indigo-700']
              ].map(([sem, activeBg, lightBg, activeBorder, activeText]) => (
                <div key={sem}>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white mb-3 ${activeBg}`}>
                    Semester {sem}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {ALL_MONTHS.map(month => {
                      const inThisSem = config[year][sem].includes(month);
                      const otherSem = sem === '1' ? '2' : '1';
                      const inOtherSem = config[year][otherSem].includes(month);
                      return (
                        <button
                          key={month}
                          onClick={() => !inOtherSem && toggleMonth(year, sem, month)}
                          disabled={inOtherSem}
                          title={inOtherSem ? `Already in Sem ${otherSem}` : ''}
                          className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all text-center
                            ${inThisSem
                              ? `${lightBg} ${activeBorder} ${activeText} border`
                              : inOtherSem
                                ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 cursor-pointer'
                            }`}
                        >
                          {month.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SemConfigManager;
