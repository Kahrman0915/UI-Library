import { forwardRef, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { addDays, compareDays, formatFullDate, startOfDay } from '../../utils/date';
import type { PaceTimelineProps, PaceTimelineStatus } from './PaceTimeline.types';
import './PaceTimeline.scss';

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const narrowWeekday = new Map<string, Intl.DateTimeFormat>();
const defaultFormatDay = (locale?: string) => (date: Date) => {
  const key = locale ?? '';
  let fmt = narrowWeekday.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
    narrowWeekday.set(key, fmt);
  }
  return `${fmt.format(date)} ${date.getDate()}`;
};

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

const PaceTimeline = forwardRef<HTMLDivElement, PaceTimelineProps>(
  (
    {
      id,
      start,
      end,
      today: todayProp,
      completed,
      total,
      skipWeekends = true,
      formatDay,
      locale,
      todayLabel = 'Today',
      timeLabel = 'Time used',
      workLabel,
      className,
      ...rest
    },
    ref,
  ) => {
    // Days are walked with addDays (never milliseconds), so a DST change mid-sprint cannot
    // repeat or drop a cell.
    const days = useMemo(() => {
      const list: Date[] = [];
      for (let d = startOfDay(start); compareDays(d, end) <= 0; d = addDays(d, 1)) {
        if (!skipWeekends || !isWeekend(d)) list.push(d);
        if (list.length > 366) break;
      }
      return list;
    }, [start, end, skipWeekends]);

    const today = todayProp ?? new Date();
    const usedDays = days.filter((d) => compareDays(d, today) <= 0).length;
    const timeShare = days.length ? usedDays / days.length : 0;
    const workShare = total > 0 ? clamp01(completed / total) : 0;
    const timePct = Math.round(timeShare * 100);
    const workPct = Math.round(workShare * 100);
    const status: PaceTimelineStatus = workShare < timeShare ? 'behind' : 'on-pace';
    const label = formatDay ?? defaultFormatDay(locale);

    const style = {
      '--ui-pace-time': `${timeShare * 100}%`,
      '--ui-pace-work': `${workShare * 100}%`,
    } as CSSProperties;

    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        data-pace={status}
        style={{ ...rest.style, ...style }}
        className={`ui-pace-timeline ui-pace-timeline--${status}${className ? ' ' + className : ''}`}
      >
        <ol className="ui-pace-timeline__days" id={`${id}-days`}>
          {days.map((day, i) => {
            const cmp = compareDays(day, today);
            const state = cmp < 0 ? 'past' : cmp === 0 ? 'today' : 'future';
            // A cell that follows a skipped stretch (the weekend) opens a new week.
            const weekStart = i > 0 && compareDays(addDays(days[i - 1], 1), day) < 0;
            return (
              <li
                key={day.getTime()}
                aria-current={state === 'today' ? 'date' : undefined}
                aria-label={formatFullDate(day, locale)}
                className={`ui-pace-timeline__day ui-pace-timeline__day--${state}${weekStart ? ' ui-pace-timeline__day--week-start' : ''}`}
              >
                {state === 'today' && (
                  <span className="ui-pace-timeline__today" aria-hidden="true">
                    {todayLabel}
                  </span>
                )}
                <span className="ui-pace-timeline__cell" aria-hidden="true" />
                <span className="ui-pace-timeline__day-label" aria-hidden="true">
                  {label(day)}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="ui-pace-timeline__bars">
          <div
            className="ui-pace-timeline__bar ui-pace-timeline__bar--time"
            role="progressbar"
            aria-labelledby={`${id}-time-label`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={timePct}
          >
            <div className="ui-pace-timeline__bar-header">
              <span className="ui-pace-timeline__bar-label" id={`${id}-time-label`}>
                {timeLabel}
              </span>
              <span className="ui-pace-timeline__bar-value">{timePct}%</span>
            </div>
            <div className="ui-pace-timeline__track">
              <span className="ui-pace-timeline__fill" />
            </div>
          </div>

          <div
            className="ui-pace-timeline__bar ui-pace-timeline__bar--work"
            role="progressbar"
            aria-labelledby={`${id}-work-label`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={workPct}
          >
            <div className="ui-pace-timeline__bar-header">
              <span className="ui-pace-timeline__bar-label" id={`${id}-work-label`}>
                {workLabel ?? `Work done · ${completed} of ${total}`}
              </span>
              <span className="ui-pace-timeline__bar-value">{workPct}%</span>
            </div>
            <div className="ui-pace-timeline__track">
              <span className="ui-pace-timeline__fill" />
              {status === 'behind' && <span className="ui-pace-timeline__gap" aria-hidden="true" />}
            </div>
          </div>

          <span className="ui-pace-timeline__marker" aria-hidden="true" />
        </div>
      </div>
    );
  },
);

PaceTimeline.displayName = 'PaceTimeline';

export default PaceTimeline;
