import React from 'react';
import { TrendingUp, TrendingDown, Filter } from 'lucide-react';
import RiskBadge from './RiskBadge';

// Consistent color helpers
const avatarBg   = p => p >= 75 ? 'bg-emerald-500' : p >= 65 ? 'bg-amber-500' : 'bg-red-500';
const barGradient = p => p >= 75 ? 'from-emerald-400 to-emerald-500' : p >= 65 ? 'from-amber-400 to-amber-500' : 'from-red-400 to-red-500';
const pctColor   = p => p >= 75 ? 'text-emerald-600' : p >= 65 ? 'text-amber-600' : 'text-red-600';

const MEDALS = ['🥇', '🥈', '🥉'];

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

/**
 * rows: { id, name, rollNo, branch?, year?, percentage, totalHours?, attendedHours?, rank?, trend? }
 * showRank    — show rank column
 * showBranch  — show branch/year sub-line under name
 * showHours   — show total / attended columns
 * showTrend   — show trend arrow column
 * highlightId — row id to mark as "You"
 * onClearFilter — callback for empty state button
 */
const StudentTable = ({
  rows = [],
  showRank    = false,
  showBranch  = false,
  showHours   = false,
  showTrend   = false,
  highlightId = null,
  onClearFilter,
}) => {
  if (rows.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Filter size={22} className="text-slate-300" />
        </div>
        <p className="text-sm font-semibold text-slate-500">No students match this filter</p>
        {onClearFilter && (
          <button onClick={onClearFilter} className="mt-2 text-indigo-600 hover:underline text-xs font-medium">
            Clear filter
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* ── Header ── */}
          <thead>
            <tr className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white text-xs font-semibold uppercase tracking-wider">
              {showRank   && <th className="px-5 py-4 text-center w-16">Rank</th>}
              <th className="px-5 py-4 text-left">Student</th>
              {showHours  && <th className="px-5 py-4 text-center">Total</th>}
              {showHours  && <th className="px-5 py-4 text-center">Attended</th>}
              <th className="px-5 py-4 text-left min-w-[180px]">Attendance</th>
              <th className="px-5 py-4 text-center">Status</th>
              {showTrend  && <th className="px-5 py-4 text-center">Trend</th>}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {rows.map((s, i) => {
              const isMe = s.id === highlightId;
              const pct  = s.percentage ?? 0;
              return (
                <tr
                  key={s.id}
                  className={`border-b border-slate-100 transition-all duration-150 ${
                    isMe
                      ? 'bg-indigo-50 border-l-4 border-l-indigo-500'
                      : i % 2 === 0
                        ? 'bg-white hover:bg-slate-50/80'
                        : 'bg-slate-50/40 hover:bg-slate-100/60'
                  }`}
                >
                  {/* Rank */}
                  {showRank && (
                    <td className="px-5 py-4 text-center">
                      {s.rank <= 3
                        ? <span className="text-lg leading-none">{MEDALS[s.rank - 1]}</span>
                        : <span className="text-xs font-bold text-slate-400">#{s.rank}</span>
                      }
                    </td>
                  )}

                  {/* Name + avatar */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm ${avatarBg(pct)}`}>
                        {initials(s.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isMe ? 'text-indigo-700' : 'text-slate-800'}`}>{s.name}</span>
                          {isMe && (
                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">You</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {s.rollNo}
                          {showBranch && s.branch && ` · ${s.branch} Y${s.year}`}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Hours */}
                  {showHours && (
                    <td className="px-5 py-3.5 text-center">
                      <span className="font-medium text-slate-600">{s.totalHours ?? '—'}</span>
                    </td>
                  )}
                  {showHours && (
                    <td className="px-5 py-3.5 text-center">
                      <span className="font-medium text-blue-600">{s.attendedHours ?? '—'}</span>
                    </td>
                  )}

                  {/* Attendance bar + % */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${barGradient(pct)} transition-all duration-500`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold w-12 text-right tabular-nums ${pctColor(pct)}`}>
                        {pct}%
                      </span>
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex justify-center">
                      <RiskBadge percent={pct} />
                    </div>
                  </td>

                  {/* Trend */}
                  {showTrend && (
                    <td className="px-5 py-3.5 text-center">
                      {s.trend > 0
                        ? <TrendingUp size={17} className="text-emerald-500 mx-auto" />
                        : <TrendingDown size={17} className="text-red-500 mx-auto" />
                      }
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
