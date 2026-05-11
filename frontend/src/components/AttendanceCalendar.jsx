import { useMemo, useState } from 'react';
import {
  format, subDays, startOfDay, eachDayOfInterval,
  getDay, startOfMonth, getDaysInMonth, addMonths
} from 'date-fns';

const STATUS_COLORS = {
  present:   { bg: 'bg-green-500',  label: 'Present'  },
  absent:    { bg: 'bg-red-500',    label: 'Absent'   },
  leave:     { bg: 'bg-blue-500',   label: 'On Leave' },
  'half-day':{ bg: 'bg-yellow-400', label: 'Half Day' },
  half_day:  { bg: 'bg-yellow-400', label: 'Half Day' },
  late:      { bg: 'bg-orange-400', label: 'Late'     },
  holiday:   { bg: 'bg-purple-500', label: 'Holiday'  },
  none:      { bg: 'bg-gray-200 dark:bg-gray-700', label: 'No Record' },
};

const CELL = 11;   // px — cell width & height
const GAP  = 2;    // px — gap between cells

const AttendanceCalendar = ({ attendance = [], leaves = [] }) => {
  const [tooltip, setTooltip] = useState(null);

  /* ── status map ── */
  const statusMap = useMemo(() => {
    const map = {};
    attendance.forEach(a => {
      const d = a.date?.split('T')[0];
      if (d) map[d] = a.status || 'present';
    });
    leaves.forEach(l => {
      if (l.status !== 'approved') return;
      try {
        const start = new Date(l.start_date);
        const end = new Date(l.end_date);
        if (isNaN(start) || isNaN(end) || start > end) return;
        eachDayOfInterval({ start, end })
          .forEach(day => { map[format(day, 'yyyy-MM-dd')] = 'leave'; });
      } catch { /* skip bad date ranges */ }
    });
    return map;
  }, [attendance, leaves]);

  const today     = startOfDay(new Date());
  const startDate = subDays(today, 364);   // ~1 year back

  /* ── build month blocks ──
     Each block = { label, columns }
     columns = array of 7-slot arrays (Sun-Sat), with null for padding
  */
  const monthBlocks = useMemo(() => {
    const blocks = [];

    // iterate month by month from the month containing startDate up to today's month
    let cursor = startOfMonth(startDate);
    const endMonth = startOfMonth(today);

    while (cursor <= endMonth) {
      const year  = cursor.getFullYear();
      const month = cursor.getMonth();
      const daysInMonth = getDaysInMonth(cursor);
      const firstDow    = getDay(cursor); // 0=Sun of the 1st

      // all day cells for this month: leading nulls + actual dates
      const slots = [
        ...Array(firstDow).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => {
          const d = new Date(year, month, i + 1);
          // only include days within our [startDate, today] window
          return d >= startDate && d <= today ? d : null;
        }),
      ];

      // chunk into columns of 7
      const columns = [];
      for (let i = 0; i < slots.length; i += 7) columns.push(slots.slice(i, i + 7));

      blocks.push({ label: format(cursor, 'MMM'), columns });
      cursor = addMonths(cursor, 1);
    }
    return blocks;
  }, [startDate, today]);

  /* ── stats ── */
  const presentDays = Object.values(statusMap).filter(s => s === 'present').length;
  const leaveDays   = Object.values(statusMap).filter(s => s === 'leave').length;

  const maxStreak = useMemo(() => {
    let max = 0, cur = 0;
    try {
      eachDayOfInterval({ start: startDate, end: today }).forEach(day => {
        if (statusMap[format(day, 'yyyy-MM-dd')] === 'present') { cur++; max = Math.max(max, cur); }
        else cur = 0;
      });
    } catch { /* ignore */ }
    return max;
  }, [statusMap, startDate, today]);

  return (
    <div className="card mt-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{presentDays}</span>
          <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm">days present in the past year</span>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Leave days: <span className="font-semibold text-blue-500">{leaveDays}</span>
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Max streak: <span className="font-semibold text-green-500">{maxStreak}</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 0 }}>

          {/* Month label row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            {monthBlocks.map(({ label, columns }) => {
              const w = columns.length * (CELL + GAP) - GAP;
              return (
                <div key={label} style={{ width: w, flexShrink: 0 }}>
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
              );
            })}
          </div>

          {/* Grid row */}
          <div style={{ display: 'flex', gap: 8 }}>
            {monthBlocks.map(({ label, columns }) => (
              <div key={label} style={{ display: 'flex', gap: GAP, flexShrink: 0 }}>
                {columns.map((col, ci) => (
                  <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                    {Array.from({ length: 7 }).map((_, di) => {
                      const day = col[di] ?? null;
                      if (!day) return <div key={di} style={{ width: CELL, height: CELL }} />;
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const status  = statusMap[dateStr] || 'none';
                      const cfg     = STATUS_COLORS[status] || STATUS_COLORS.none;
                      return (
                        <div
                          key={di}
                          className={`rounded-sm cursor-pointer transition-transform hover:scale-125 ${cfg.bg}`}
                          style={{ width: CELL, height: CELL }}
                          onMouseEnter={e => setTooltip({ dateStr, status, cfg, x: e.clientX, y: e.clientY })}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4">
        {Object.entries(STATUS_COLORS).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`rounded-sm flex-shrink-0 ${cfg.bg}`} style={{ width: CELL, height: CELL }} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 rounded-lg shadow-xl text-xs font-medium pointer-events-none bg-gray-900 text-white"
          style={{ left: tooltip.x + 14, top: tooltip.y - 44 }}
        >
          <div className="font-semibold">{format(new Date(tooltip.dateStr), 'MMM dd, yyyy')}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tooltip.cfg.bg}`} />
            {tooltip.cfg.label}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendar;
