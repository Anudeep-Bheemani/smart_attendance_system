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
  { id: 'whole',  label: 'Whole Sem'    },
  { id: 'single', label: 'Single Month' },
  { id: 'range',  label: 'Month Range'  },
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
    const mi = ALL_MONTHS.indexOf(month);
    if (rangeStep === 'from') {
      setFromMonth(month);
      if (mi > ALL_MONTHS.indexOf(toMonth)) setToMonth(month);
      setRangeStep('to');
    } else {
      if (mi < ALL_MONTHS.indexOf(fromMonth)) {
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

  /* ── Horizontal month strip ── */
  const MonthStrip = ({ onClickMonth }) => {
    const fi = ALL_MONTHS.indexOf(fromMonth);
    const ti = ALL_MONTHS.indexOf(toMonth);

    return (
      <div className="relative flex w-full bg-slate-100 rounded-2xl p-1.5 mt-4 overflow-hidden">
        {mode === 'range' && fi >= 0 && ti >= 0 && (
          <div
            className="absolute top-1.5 bottom-1.5 bg-indigo-100 rounded-xl pointer-events-none"
            style={{
              left:  `calc(${(fi / 12) * 100}% + 3px)`,
              width: `calc(${((ti - fi + 1) / 12) * 100}% - 6px)`,
              transition: 'left 0.2s ease, width 0.2s ease',
            }}
          />
        )}
        {ALL_MONTHS.map((m, i) => {
          const isSelected = mode === 'single' && m === singleMonth;
          const isEndpoint = mode === 'range' && (m === fromMonth || m === toMonth);
          const inRange    = mode === 'range' && i > fi && i < ti;
          return (
            <button
              key={m}
              onClick={() => onClickMonth(m)}
              title={m}
              className={`relative z-10 flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 select-none ${
                isSelected || isEndpoint
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : inRange
                    ? 'text-indigo-700'
                    : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {ABBR[i]}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5 shadow-sm">

      {/* ── Top row: mode tabs + sem dropdown ── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">

        {/* Mode tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {MODES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                mode === id
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sem dropdown — shown in Whole Sem and hidden in Single (auto) / Range (no sem filter) */}
        {mode === 'whole' && (
          <select
            value={sem}
            onChange={e => handleSemChange(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            {['1','2'].map(s => {
              const mths = getSemMonths(semConfig, year, parseInt(s));
              return (
                <option key={s} value={s}>
                  Semester {s} — {mths[0]?.slice(0,3)} to {mths[mths.length-1]?.slice(0,3)}
                </option>
              );
            })}
          </select>
        )}


        {/* Range step indicator */}
        {mode === 'range' && (
          <div className="flex items-center gap-2">
            <span className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              rangeStep === 'from' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {rangeStep === 'from' ? '① Pick start' : `Start: ${fromMonth.slice(0,3)}`}
            </span>
            <span className="text-slate-300 text-lg">→</span>
            <span className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              rangeStep === 'to' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {rangeStep === 'to' ? '② Pick end' : `End: ${toMonth.slice(0,3)}`}
            </span>
            <span className="ml-2 text-sm font-semibold text-slate-400">
              {activeMonths.length} month{activeMonths.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* ── Month strip ── */}
      {mode === 'whole' && (
        <div className="flex w-full bg-slate-100 rounded-2xl p-1.5 gap-1">
          {semMonths.map(m => (
            <div
              key={m}
              title={m}
              className="flex-1 py-2.5 rounded-xl text-center text-xs font-bold select-none bg-indigo-600 text-white shadow-sm"
            >
              {m.slice(0, 3)}
            </div>
          ))}
        </div>
      )}

      {mode === 'single' && (
        <MonthStrip onClickMonth={setSingleMonth} />
      )}

      {mode === 'range' && (
        <MonthStrip onClickMonth={handleRangeClick} />
      )}
    </div>
  );
};

export default AttendanceFilter;
