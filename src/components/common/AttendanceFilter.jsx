import React, { useState, useEffect, useRef } from 'react';

const ALL_MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const DEFAULT_SEM_MONTHS = {
  1: ['July','August','September','October','November','December'],
  2: ['January','February','March','April','May','June']
};

export const getSemMonths = (semConfig, year, sem) => {
  if (!year || year === 'all') {
    return [...new Set(['1','2','3','4'].flatMap(y =>
      semConfig?.[y]?.[String(sem)] || DEFAULT_SEM_MONTHS[sem] || []
    ))];
  }
  return semConfig?.[String(year)]?.[String(sem)] || DEFAULT_SEM_MONTHS[sem] || [];
};

export const getDefaultSem = (semConfig, year) => {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const sem1 = getSemMonths(semConfig, year || '1', 1);
  return sem1.includes(currentMonth) ? '1' : '2';
};

const detectSem = (semConfig, year, month) => {
  const sem1 = getSemMonths(semConfig, year, 1);
  return sem1.includes(month) ? 1 : 2;
};

const MODES = [
  { id: 'whole',  label: 'Whole Sem',    icon: '◉' },
  { id: 'single', label: 'Single Month', icon: '◎' },
  { id: 'range',  label: 'Month Range',  icon: '⇔' },
];

const AttendanceFilter = ({ semConfig, year, defaultSem, onChange }) => {
  const initSem  = defaultSem || getDefaultSem(semConfig, year);
  const initMths = getSemMonths(semConfig, year, parseInt(initSem));

  const [sem,         setSem]         = useState(initSem);
  const [mode,        setMode]        = useState('whole');
  const [singleMonth, setSingleMonth] = useState(
    new Date().toLocaleString('default', { month: 'long' })
  );
  const [fromMonth, setFromMonth] = useState(initMths[0] || ALL_MONTHS[0]);
  const [toMonth,   setToMonth]   = useState(initMths[initMths.length - 1] || ALL_MONTHS[11]);
  // 'from' = next click sets fromMonth, 'to' = next click sets toMonth
  const [rangeStep, setRangeStep] = useState('from');

  const semMonths = getSemMonths(semConfig, year, parseInt(sem));
  const autoSem   = detectSem(semConfig, year, singleMonth);

  const handleSemChange = (newSem) => {
    const mths = getSemMonths(semConfig, year, parseInt(newSem));
    setSem(newSem);
    setFromMonth(mths[0] || ALL_MONTHS[0]);
    setToMonth(mths[mths.length - 1] || ALL_MONTHS[11]);
  };

  const handleRangeClick = (month) => {
    if (rangeStep === 'from') {
      setFromMonth(month);
      // If new from is after current to, collapse to single month
      if (ALL_MONTHS.indexOf(month) > ALL_MONTHS.indexOf(toMonth)) setToMonth(month);
      setRangeStep('to');
    } else {
      if (ALL_MONTHS.indexOf(month) < ALL_MONTHS.indexOf(fromMonth)) {
        // Clicked before from — treat as new from, keep old from as to
        setToMonth(fromMonth);
        setFromMonth(month);
      } else {
        setToMonth(month);
      }
      setRangeStep('from');
    }
  };

  const effectiveSem =
    mode === 'single' ? autoSem :
    mode === 'range'  ? null :
    parseInt(sem);

  const activeMonths =
    mode === 'whole'  ? semMonths :
    mode === 'single' ? [singleMonth] :
    (() => {
      const fi = ALL_MONTHS.indexOf(fromMonth);
      const ti = ALL_MONTHS.indexOf(toMonth);
      return fi >= 0 && ti >= 0 ? ALL_MONTHS.slice(fi, ti + 1) : ALL_MONTHS;
    })();

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  useEffect(() => {
    onChangeRef.current({ semester: effectiveSem, activeMonths });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sem, mode, singleMonth, fromMonth, toMonth]);

  // Month chip helpers for single/range modes
  const getChipStyle = (month) => {
    if (mode === 'single') {
      return month === singleMonth
        ? 'bg-indigo-600 text-white shadow-md scale-105'
        : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-105';
    }
    if (mode === 'range') {
      const mi = ALL_MONTHS.indexOf(month);
      const fi = ALL_MONTHS.indexOf(fromMonth);
      const ti = ALL_MONTHS.indexOf(toMonth);
      if (month === fromMonth) return 'bg-blue-600 text-white shadow-md scale-105 ring-2 ring-blue-300';
      if (month === toMonth)   return 'bg-blue-600 text-white shadow-md scale-105 ring-2 ring-blue-300';
      if (mi > fi && mi < ti)  return 'bg-blue-100 text-blue-700 font-semibold';
      return 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:scale-105';
    }
    return '';
  };

  const MonthGrid = ({ onClickMonth }) => (
    <div className="grid grid-cols-4 gap-2 mt-3">
      {ALL_MONTHS.map((m, i) => (
        <button
          key={m}
          onClick={() => onClickMonth(m)}
          className={`py-2 rounded-lg text-xs font-bold transition-all duration-150 ${getChipStyle(m)}`}
        >
          {ABBR[i]}
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

      {/* ── Mode Tabs ── */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-4">
        {MODES.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              mode === id
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>{icon}</span> {label}
          </button>
        ))}
      </div>

      {/* ── Whole Sem ── */}
      {mode === 'whole' && (
        <div>
          <div className="flex gap-3 mb-3">
            {['1','2'].map(s => {
              const mths = getSemMonths(semConfig, year, parseInt(s));
              const active = sem === s;
              return (
                <button
                  key={s}
                  onClick={() => handleSemChange(s)}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    active
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40'
                  }`}
                >
                  <div className={`text-sm font-bold mb-0.5 ${active ? 'text-blue-700' : 'text-slate-700'}`}>
                    Semester {s}
                  </div>
                  <div className={`text-xs ${active ? 'text-blue-500' : 'text-slate-400'}`}>
                    {mths[0]?.slice(0,3)} – {mths[mths.length-1]?.slice(0,3)} · {mths.length} months
                  </div>
                </button>
              );
            })}
          </div>
          {/* Included months as chips */}
          <div className="flex flex-wrap gap-1.5">
            {semMonths.map((m, i) => (
              <span key={m} className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {m.slice(0,3)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Single Month ── */}
      {mode === 'single' && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-500 font-medium">Click a month to select</span>
            <span className="ml-auto text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
              Sem {autoSem} (auto-detected)
            </span>
          </div>
          <MonthGrid onClickMonth={setSingleMonth} />
        </div>
      )}

      {/* ── Month Range ── */}
      {mode === 'range' && (
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
              rangeStep === 'from' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {rangeStep === 'from' ? '① Pick Start' : '✓ Start: ' + fromMonth.slice(0,3)}
            </div>
            <div className="text-slate-300 text-sm">→</div>
            <div className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
              rangeStep === 'to' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {rangeStep === 'to' ? '② Pick End' : '✓ End: ' + toMonth.slice(0,3)}
            </div>
            <span className="ml-auto text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
              {fromMonth.slice(0,3)} → {toMonth.slice(0,3)} · {activeMonths.length} month{activeMonths.length !== 1 ? 's' : ''}
            </span>
          </div>
          <MonthGrid onClickMonth={handleRangeClick} />
        </div>
      )}
    </div>
  );
};

export default AttendanceFilter;
