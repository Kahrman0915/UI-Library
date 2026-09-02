import type { WeekDay } from '#/utils/date';

/** Cell size and type scale. Matches the library's form-control scale. */
export type CalendarSize = 'sm' | 'default' | 'lg';

export type { WeekDay };

/**
 * The month grid on its own — the surface a `DatePicker` opens, and a usable
 * component in its own right when the calendar is permanently on screen
 * (a booking page, a scheduling sidebar).
 *
 * **Single date only.** There is no range mode and no time-of-day: a range is
 * two `DatePicker`s today, which is what the forms this was built for actually
 * show. Adding a range would change `value` from a `Date` to a tuple, so it is
 * a deliberate future component rather than a prop.
 *
 * All date props are plain `Date`s and every comparison is day-granular, so a
 * `value` carrying a time component still selects the right cell.
 *
 * `onSelect` is Omitted from the div attributes because the native one is the
 * text-selection event and would collide with the callback below; `defaultValue`
 * because the native one is a string.
 */
export type CalendarProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onSelect' | 'defaultValue' | 'id'
> & {
  /**
   * Required. Seeds `{id}-caption` (the grid's `aria-labelledby`) and
   * `{id}-day-{iso}` on every cell.
   */
  id: string;
  /** Controlled selection. Pair with `onValueChange`; `null` means nothing picked. */
  value?: Date | null;
  /** Uncontrolled initial selection. Ignored when `value` is supplied. */
  defaultValue?: Date | null;
  /** Fires with the picked day at local midnight. Never called for a disabled day. */
  onValueChange?: (date: Date) => void;
  /** Controlled displayed month — any day inside it. Pair with `onMonthChange`. */
  month?: Date;
  /** Uncontrolled initial month. Defaults to the selected day's month, else today's. */
  defaultMonth?: Date;
  /** Fires with the 1st of the newly displayed month. */
  onMonthChange?: (month: Date) => void;
  /** Earliest selectable day, inclusive. Earlier days render as `aria-disabled`. */
  min?: Date;
  /** Latest selectable day, inclusive. */
  max?: Date;
  /**
   * Per-day veto, on top of `min` / `max` — weekends, blackout dates, a
   * fully-booked day. Called once per rendered cell, so keep it cheap and
   * stable (`useCallback`) if it closes over state.
   */
  isDateDisabled?: (date: Date) => boolean;
  /**
   * First column of the week: `0` Sunday (default) … `6` Saturday.
   *
   * Deliberately **not** inferred from the locale: `Intl.Locale#getWeekInfo` is
   * still missing in Firefox, so inferring it would silently differ per
   * browser. An app that needs Monday says so once.
   */
  weekStartsOn?: WeekDay;
  /** BCP-47 tag for the month caption, weekday names and cell labels. Defaults to the runtime locale. */
  locale?: string;
  /** Render the leading/trailing days of the neighbouring months. Default `true`. */
  showOutsideDays?: boolean;
  /** Default `default`. See {@link CalendarSize}. */
  size?: CalendarSize;
  /** Dims the whole calendar and blocks selection and navigation. */
  disabled?: boolean;
  /**
   * Move focus onto the grid after mount. `DatePicker` sets it when the panel
   * opens; a calendar sitting in the page should leave it off.
   */
  autoFocus?: boolean;
  /** Accessible name for the back arrow. Default `Previous month`. */
  previousMonthLabel?: string;
  /** Accessible name for the forward arrow. Default `Next month`. */
  nextMonthLabel?: string;
  className?: string;
};
