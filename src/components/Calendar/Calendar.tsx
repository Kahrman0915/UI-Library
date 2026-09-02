import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDirection } from '#components/Direction/Direction.context';
import {
  addDays,
  addMonths,
  addYears,
  buildMonthGrid,
  compareDays,
  endOfMonth,
  formatFullDate,
  formatMonthCaption,
  getWeekdayLabels,
  isSameDay,
  isSameMonth,
  isWithinRange,
  startOfDay,
  startOfMonth,
  toISODate,
} from '#/utils/date';
import type { CalendarProps } from './Calendar.types';
import '../../styles/icon-button.scss';
import './Calendar.scss';

/**
 * Where the roving tabindex sits when the displayed month changes underneath
 * it: the selection if it lives in this month, otherwise today, otherwise the
 * 1st. It is deliberately NOT clamped into `min`/`max` — an out-of-range day
 * stays focusable (see the `aria-disabled` note below), so clamping would only
 * move the entry point without preventing anything.
 */
const defaultFocusFor = (month: Date, selected: Date | null, today: Date): Date => {
  if (selected && isSameMonth(selected, month)) return selected;
  if (isSameMonth(today, month)) return today;
  return startOfMonth(month);
};

const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      id,
      value: valueProp,
      defaultValue,
      onValueChange,
      month: monthProp,
      defaultMonth,
      onMonthChange,
      min,
      max,
      isDateDisabled,
      weekStartsOn = 0,
      locale,
      showOutsideDays = true,
      size = 'default',
      disabled = false,
      autoFocus = false,
      previousMonthLabel = 'Previous month',
      nextMonthLabel = 'Next month',
      className,
      ...rest
    },
    ref,
  ) => {
    const direction = useDirection();

    // Read once per render, and deliberately NOT memoised for the component's
    // lifetime: a calendar left open across midnight should move its "today"
    // ring on the next paint rather than keep marking yesterday.
    const today = startOfDay(new Date());

    // ── Selection ────────────────────────────────────────────────────────────
    const controlledValue = valueProp !== undefined;
    const [internalValue, setInternalValue] = useState<Date | null>(
      defaultValue ?? null,
    );
    const selected = controlledValue ? (valueProp ?? null) : internalValue;

    // ── Displayed month ──────────────────────────────────────────────────────
    const controlledMonth = monthProp !== undefined;
    const [internalMonth, setInternalMonth] = useState<Date>(() =>
      startOfMonth(defaultMonth ?? defaultValue ?? new Date()),
    );
    const month = useMemo(
      () => startOfMonth(controlledMonth ? (monthProp as Date) : internalMonth),
      [controlledMonth, monthProp, internalMonth],
    );

    const setMonth = useCallback(
      (next: Date) => {
        const first = startOfMonth(next);
        if (!controlledMonth) setInternalMonth(first);
        onMonthChange?.(first);
      },
      [controlledMonth, onMonthChange],
    );

    // ── Roving tabindex ──────────────────────────────────────────────────────
    // One day in the grid is tabbable; the arrows move it. Derived rather than
    // synced by an effect: when the month moves out from under the stored day
    // the fallback applies during the same render, so there is never a paint
    // with no tabbable cell in the grid.
    const [focusDate, setFocusDate] = useState<Date>(() =>
      defaultFocusFor(
        startOfMonth(defaultMonth ?? defaultValue ?? new Date()),
        defaultValue ?? null,
        startOfDay(new Date()),
      ),
    );
    const focusTarget = isSameMonth(focusDate, month)
      ? focusDate
      : defaultFocusFor(month, selected, today);
    const focusIso = toISODate(focusTarget);

    // Focus is only *moved* when an interaction asked for it. Without the flag,
    // a calendar sitting in a page would steal focus on every re-render.
    const shouldFocusRef = useRef(autoFocus);
    const gridRef = useRef<HTMLTableElement | null>(null);

    useEffect(() => {
      if (!shouldFocusRef.current) return;
      // Deferred a frame rather than called inline, and this is load-bearing.
      // A Calendar mounted inside DatePicker's panel is `visibility: hidden`
      // until the panel's own layout effect has measured and placed it — and
      // `focus()` on a hidden element is a **silent no-op**, so the grid opened
      // with focus still parked on the field and every arrow key went nowhere.
      // Select, Popover and HoverCard all focus in a rAF for the same reason.
      //
      // The flag is cleared inside the callback, not before it: a cancelled
      // frame (a second arrow key landing in the same frame, or a double
      // mount under StrictMode) must not consume the request.
      const frame = requestAnimationFrame(() => {
        shouldFocusRef.current = false;
        gridRef.current
          ?.querySelector<HTMLElement>(`[data-date="${focusIso}"]`)
          ?.focus();
      });
      return () => cancelAnimationFrame(frame);
    }, [focusIso]);

    // ── Availability ─────────────────────────────────────────────────────────
    const isDayDisabled = useCallback(
      (date: Date) =>
        disabled ||
        !isWithinRange(date, min, max) ||
        (isDateDisabled ? isDateDisabled(date) : false),
      [disabled, min, max, isDateDisabled],
    );

    const moveFocus = useCallback(
      (next: Date) => {
        shouldFocusRef.current = true;
        setFocusDate(next);
        if (!isSameMonth(next, month)) setMonth(next);
      },
      [month, setMonth],
    );

    const selectDay = useCallback(
      (date: Date) => {
        if (isDayDisabled(date)) return;
        const day = startOfDay(date);
        if (!controlledValue) setInternalValue(day);
        onValueChange?.(day);
        // Picking a leading/trailing day pages the grid to that day's month.
        // React reuses the cell nodes by position, so without re-asserting
        // focus the keyboard user would be left standing on a different date.
        if (!isSameMonth(day, month)) shouldFocusRef.current = true;
        setFocusDate(day);
        if (!isSameMonth(day, month)) setMonth(day);
      },
      [controlledValue, isDayDisabled, month, onValueChange, setMonth],
    );

    // ── Keyboard: the ARIA date-grid model ───────────────────────────────────
    const handleGridKeyDown = (event: React.KeyboardEvent<HTMLTableElement>) => {
      if (disabled) return;
      const current = focusTarget;
      // The offset of `current` within its own week row, which is what Home and
      // End need and what `weekStartsOn` shifts.
      const dayOfWeek = (current.getDay() - weekStartsOn + 7) % 7;
      // Left and right are *visual* directions, so they swap under `dir="rtl"`.
      // Everything else (up/down, page, home/end) is unaffected: rows still run
      // top to bottom and a week still starts at its own first column.
      const back = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
      const forward = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';

      let next: Date;
      switch (event.key) {
        case back:
          next = addDays(current, -1);
          break;
        case forward:
          next = addDays(current, 1);
          break;
        case 'ArrowUp':
          next = addDays(current, -7);
          break;
        case 'ArrowDown':
          next = addDays(current, 7);
          break;
        case 'Home':
          next = addDays(current, -dayOfWeek);
          break;
        case 'End':
          next = addDays(current, 6 - dayOfWeek);
          break;
        case 'PageUp':
          next = event.shiftKey ? addYears(current, -1) : addMonths(current, -1);
          break;
        case 'PageDown':
          next = event.shiftKey ? addYears(current, 1) : addMonths(current, 1);
          break;
        default:
          return;
      }
      // Only after a key we handle — Tab and Escape have to keep bubbling, and
      // Escape in particular is what closes the DatePicker panel around us.
      event.preventDefault();
      moveFocus(next);
    };

    // ── Month navigation ─────────────────────────────────────────────────────
    const previousMonth = addMonths(month, -1);
    const nextMonth = addMonths(month, 1);
    // A whole month is unreachable only when *every* day in it is out of range —
    // measured on that month's far edge, not on its 1st.
    const previousDisabled =
      disabled || (min ? compareDays(endOfMonth(previousMonth), min) < 0 : false);
    const nextDisabled =
      disabled || (max ? compareDays(startOfMonth(nextMonth), max) > 0 : false);

    const weekdays = useMemo(
      () => getWeekdayLabels(weekStartsOn, locale),
      [weekStartsOn, locale],
    );
    const weeks = useMemo(
      () => buildMonthGrid(month, weekStartsOn),
      [month, weekStartsOn],
    );

    const captionId = `${id}-caption`;

    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        className={`ui-calendar ui-calendar--sz-${size}${disabled ? ' ui-calendar--disabled' : ''}${className ? ' ' + className : ''}`}
      >
        <div className="ui-calendar__header">
          <button
            type="button"
            aria-label={previousMonthLabel}
            className="ui-icon-button ui-calendar__nav"
            disabled={previousDisabled}
            onClick={() => setMonth(previousMonth)}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          {/*
            Labels the grid AND announces the change. Paging the month replaces
            every cell without moving focus off the arrow, so a polite live
            region is the only thing that tells a screen-reader user where they
            now are.
          */}
          <div id={captionId} className="ui-calendar__caption" aria-live="polite">
            {formatMonthCaption(month, locale)}
          </div>
          <button
            type="button"
            aria-label={nextMonthLabel}
            className="ui-icon-button ui-calendar__nav"
            disabled={nextDisabled}
            onClick={() => setMonth(nextMonth)}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>

        <table
          ref={gridRef}
          role="grid"
          aria-labelledby={captionId}
          className="ui-calendar__grid"
          onKeyDown={handleGridKeyDown}
        >
          <thead>
            <tr className="ui-calendar__weekdays">
              {weekdays.map((weekday) => (
                <th
                  key={weekday.long}
                  scope="col"
                  // "Su" is not a word. The visible text stays short and the
                  // full name carries the accessible name.
                  aria-label={weekday.long}
                  className="ui-calendar__weekday"
                >
                  {weekday.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={toISODate(week[0])} className="ui-calendar__week">
                {week.map((day) => {
                  const iso = toISODate(day);
                  const outside = !isSameMonth(day, month);
                  const dayDisabled = isDayDisabled(day);
                  const isSelected = selected ? isSameDay(day, selected) : false;
                  const isToday = isSameDay(day, today);
                  const hidden = outside && !showOutsideDays;

                  return (
                    <td
                      key={iso}
                      role="gridcell"
                      aria-selected={isSelected}
                      className="ui-calendar__cell"
                    >
                      {hidden ? (
                        <span className="ui-calendar__day-placeholder" aria-hidden="true" />
                      ) : (
                        <button
                          type="button"
                          id={`${id}-day-${iso}`}
                          data-date={iso}
                          data-today={isToday ? '' : undefined}
                          data-selected={isSelected ? '' : undefined}
                          data-outside={outside ? '' : undefined}
                          data-disabled={dayDisabled ? '' : undefined}
                          // aria-disabled, NOT the `disabled` attribute: an
                          // unavailable day has to stay focusable or arrowing
                          // across a blacked-out week silently swallows the
                          // keypress and the grid appears frozen. The click
                          // guard in `selectDay` is what actually blocks it.
                          aria-disabled={dayDisabled || undefined}
                          aria-current={isToday ? 'date' : undefined}
                          aria-label={formatFullDate(day, locale)}
                          tabIndex={iso === focusIso ? 0 : -1}
                          className="ui-calendar__day"
                          onClick={() => selectDay(day)}
                        >
                          {day.getDate()}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);

Calendar.displayName = 'Calendar';

export default Calendar;
