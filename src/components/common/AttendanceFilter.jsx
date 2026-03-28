import React, { useState, useEffect, useRef } from 'react';

const ALL_MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

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

// Returns which semester a given month belongs to for a given year (1 or 2)
const detectSem = (semConfig, year, month) => {
  const sem1 = getSemMonths(semConfig, year, 1);
  return sem1.includes(month) ? 1 : 2;
};

// AttendanceFilter — 3-mode filter: Whole Sem / Single Month / Month Range
// Single Month shows ALL 12 months and auto-detects the semester.
// Whole Sem and Month Range use the Sem 1/Sem 2 selector.
const AttendanceFilter = ({ semConfig, year, defaultSem, onChange }) => {
  const initSem  = defaultSem || getDefaultSem(semConfig, year);
  const initMths = getSemMonths(semConfig, year, parseInt(initSem));

  const [sem,         setSem]         = useState(initSem);
  const [mode,        setMode]        = useState('whole');
  const [singleMonth, setSingleMonth] = useState(
    new Date().toLocaleString('default', { month: 'long' })  // default to current month
  );
  const [fromMonth,   setFromMonth]   = useState(initMths[0] || '');
  const [toMonth,     setToMonth]     = useState(initMths[initMths.length - 1] || '');

  const semMonths = getSemMonths(semConfig, year, parseInt(sem));

  // Semester auto-detected for single month mode
  const autoSem = detectSem(semConfig, year, singleMonth);

  // When sem buttons change (whole/range modes), reset range months
  const handleSemChange = (newSem) => {
    const mths = getSemMonths(semConfig, year, parseInt(newSem));
    setSem(newSem);
    setFromMonth(mths[0] || '');
    setToMonth(mths[mths.length - 1] || '');
  };

  // Effective semester: auto-detected in single mode, manual in whole/range
  const effectiveSem = mode === 'single' ? autoSem : parseInt(sem);

  const activeMonths =
    mode === 'whole'
      ? semMonths
      : mode === 'single'
        ? [singleMonth]
        : (() => {
            const fi = semMonths.indexOf(fromMonth);
            const ti = semMonths.indexOf(toMonth);
            return fi >= 0 && ti >= 0 ? semMonths.slice(fi, ti + 1) : semMonths;
          })();

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  useEffect(() => {
    onChangeRef.current({ semester: effectiveSem, activeMonths });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sem, mode, singleMonth, fromMonth, toMonth]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">

        {/* ── Sem selector — hidden in Single Month (auto-detected) ── */}
        {mode !== 'single' && (
          <>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sem:</span>
            {['1','2'].map(s => (
              <button
                key={s}
                onClick={() => handleSemChange(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  sem === s
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                Sem {s}
              </button>
            ))}
            <div className="h-5 w-px bg-slate-200 mx-1" />
          </>
        )}

        {/* ── View mode ── */}
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">View:</span>
        {[
          ['whole',  'Whole Sem'],
          ['single', 'Single Month'],
          ['range',  'Month Range'],
        ].map(([m, label]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              mode === m
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            {label}
          </button>
        ))}

        {/* ── Single Month — all 12 months, auto-detects sem ── */}
        {mode === 'single' && (
          <>
            <select
              value={singleMonth}
              onChange={e => setSingleMonth(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-700"
            >
              {ALL_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              Sem {autoSem} (auto)
            </span>
          </>
        )}

        {/* ── Month Range — within selected sem ── */}
        {mode === 'range' && (
          <>
            <span className="text-xs font-semibold text-slate-500">From</span>
            <select
              value={fromMonth}
              onChange={e => {
                const val = e.target.value;
                setFromMonth(val);
                if (semMonths.indexOf(val) > semMonths.indexOf(toMonth)) setToMonth(val);
              }}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-700"
            >
              {semMonths.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span className="text-xs font-semibold text-slate-500">To</span>
            <select
              value={toMonth}
              onChange={e => {
                const val = e.target.value;
                setToMonth(val);
                if (semMonths.indexOf(val) < semMonths.indexOf(fromMonth)) setFromMonth(val);
              }}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-700"
            >
              {semMonths.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </>
        )}

        {/* ── Summary badge ── */}
        <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          {mode === 'whole'
            ? `Sem ${sem} — All ${semMonths.length} months`
            : mode === 'single'
              ? singleMonth
              : `${fromMonth} → ${toMonth}`}
        </span>
      </div>
    </div>
  );
};

export default AttendanceFilter;
