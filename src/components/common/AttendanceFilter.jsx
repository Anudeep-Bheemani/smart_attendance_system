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

  /* ── Shared horizontal month strip ────────────────────────────── */
  const MonthStrip = ({ onClickMonth }) => {
    const fi = ALL_MONTHS.indexOf(fromMonth);
    const ti = ALL_MONTHS.indexOf(toMonth);

    return (
      <div className="relative flex w-full bg-slate-100 rounded-2xl p-1 mt-4 overflow-hidden">
        {/* Animated range band */}
        {mode === 'range' && fi >= 0 && ti >= 0 && (
          <div
            className="absolute top-1 bottom-1 bg-indigo-100 rounded-xl pointer-events-none"
            style={{
              left:  `calc(${(fi / 12) * 100}% + 2px)`,
              width: `calc(${((ti - fi + 1) / 12) * 100}% - 4px)`,
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
              className={`relative z-10 flex-1 py-2 rounded-xl text-[11px] font-bold transition-all duration-150 select-none ${
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
              const mths  = getSemMonths(semConfig, year, parseInt(s));
              const active = sem === s;
              return (
                <button
                  key={s}
                  onClick={() => handleSemChange(s)}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    active
                      ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40'
                  }`}
                >
                  <div className={`text-sm font-bold mb-0.5 ${active ? 'text-indigo-700' : 'text-slate-700'}`}>
                    Semester {s}
                  </div>
                  <div className={`text-xs ${active ? 'text-indigo-500' : 'text-slate-400'}`}>
                    {mths[0]?.slice(0,3)} – {mths[mths.length-1]?.slice(0,3)} · {mths.length} months
                  </div>
                </button>
              );
            })}
          </div>
          {/* Show all 12 months, highlight the ones in the selected sem */}
          <div className="relative flex w-full bg-slate-100 rounded-2xl p-1 overflow-hidden">
            {ALL_MONTHS.map((m, i) => {
              const inSem = semMonths.includes(m);
              return (
                <div
                  key={m}
                  title={m}
                  className={`flex-1 py-2 rounded-xl text-center text-[11px] font-bold select-none ${
                    inSem
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400'
                  }`}
                >
                  {ABBR[i]}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Single Month ── */}
      {mode === 'single' && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 font-medium">Tap a month</span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
              Sem {autoSem} (auto)
            </span>
          </div>
          <MonthStrip onClickMonth={setSingleMonth} />
        </div>
      )}

      {/* ── Month Range ── */}
      {mode === 'range' && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                rangeStep === 'from' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {rangeStep === 'from' ? '① Pick start' : `✓ ${fromMonth.slice(0,3)}`}
              </span>
              <span className="text-slate-300">→</span>
              <span className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                rangeStep === 'to' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {rangeStep === 'to' ? '② Pick end' : `✓ ${toMonth.slice(0,3)}`}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {activeMonths.length} month{activeMonths.length !== 1 ? 's' : ''}
            </span>
          </div>
          <MonthStrip onClickMonth={handleRangeClick} />
        </div>
      )}
    </div>
  );
};

export default AttendanceFilter;
