/**
 * Calendar-grade date helpers, built on the native `Date` and `Intl`.
 *
 * **There is no date library and there will not be one** — hard rule 1 allows
 * `lucide-react` and nothing else, so `date-fns` / `dayjs` / `luxon` are all
 * out. Everything `Calendar` and `DatePicker` need is here, and every function
 * is deliberately small enough to read.
 *
 * Four traps this module exists to close, all of which produce a calendar that
 * looks right until it doesn't:
 *
 * 1. **Never do date arithmetic in milliseconds.** `+ 86_400_000` is wrong on
 *    the two days a year a local timezone changes offset — the "next day" lands
 *    23 or 25 hours later and the grid repeats or skips a date. Every shift
 *    here goes through the `new Date(y, m, d + n)` constructor, which
 *    normalises in *local* time and is therefore DST-safe.
 * 2. **Month arithmetic overflows.** `new Date(2026, 0, 31)` plus one month is
 *    `new Date(2026, 1, 31)` — which JS normalises to **3 March**. `addMonths`
 *    clamps the day to the target month's length first, so 31 Jan + 1 month is
 *    28 Feb, which is what every calendar UI means by it.
 * 3. **`toISOString()` is UTC and moves the day.** For anyone west of
 *    Greenwich, local midnight serialises as the *previous* date. `toISODate`
 *    reads the local fields instead.
 * 4. **`new Date('2026-09-02')` parses as UTC**, so it can render as 1
 *    September. `fromISODate` splits the string and uses the local constructor.
 *
 * Comparisons are day-granular throughout: two `Date`s an hour apart are the
 * same calendar day, and `compareDays` is the only ordering primitive used.
 */

/** Days in a month. `month` may be out of `0…11` — JS normalises the year. */
export const daysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

/** Local midnight of `date`'s calendar day. Strips any time component. */
export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** The 1st of `date`'s month, at local midnight. */
export const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

/** The last day of `date`'s month, at local midnight. */
export const endOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

/**
 * `date` shifted by `amount` days. DST-safe — the constructor normalises in
 * local time, so a 23-hour day still advances the date by exactly one.
 */
export const addDays = (date: Date, amount: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

/**
 * `date` shifted by `amount` months, **clamping the day to the target month**.
 * 31 Jan + 1 month is 28 Feb, not 3 Mar. Without the clamp the grid's
 * PageDown skips February entirely from a 31st.
 */
export const addMonths = (date: Date, amount: number): Date => {
  const year = date.getFullYear();
  const month = date.getMonth() + amount;
  return new Date(year, month, Math.min(date.getDate(), daysInMonth(year, month)));
};

/** `date` shifted by `amount` years, with the same clamp (29 Feb → 28 Feb). */
export const addYears = (date: Date, amount: number): Date =>
  addMonths(date, amount * 12);

/**
 * Day-granular ordering: `-1` / `0` / `1`. Compares year, then month, then
 * date — never timestamps, so a time component can't flip the result.
 */
export const compareDays = (a: Date, b: Date): number => {
  if (a.getFullYear() !== b.getFullYear())
    return a.getFullYear() < b.getFullYear() ? -1 : 1;
  if (a.getMonth() !== b.getMonth()) return a.getMonth() < b.getMonth() ? -1 : 1;
  if (a.getDate() !== b.getDate()) return a.getDate() < b.getDate() ? -1 : 1;
  return 0;
};

/** Same calendar day, ignoring any time component. */
export const isSameDay = (a: Date, b: Date): boolean => compareDays(a, b) === 0;

/** Same calendar month of the same year. */
export const isSameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** True when `date` falls inside `[min, max]` — either bound may be omitted. */
export const isWithinRange = (date: Date, min?: Date, max?: Date): boolean => {
  if (min && compareDays(date, min) < 0) return false;
  if (max && compareDays(date, max) > 0) return false;
  return true;
};

/** `date` pulled inside `[min, max]`. Returns `date` when already inside. */
export const clampDate = (date: Date, min?: Date, max?: Date): Date => {
  if (min && compareDays(date, min) < 0) return startOfDay(min);
  if (max && compareDays(date, max) > 0) return startOfDay(max);
  return date;
};

const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * `YYYY-MM-DD` from the **local** calendar fields.
 *
 * Deliberately not `toISOString().slice(0, 10)` — that converts to UTC first,
 * so local midnight in any negative-offset timezone serialises as the day
 * before. This is what a hidden form input posts.
 */
export const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/**
 * Parses `YYYY-MM-DD` as a **local** date, or returns `null`.
 *
 * `new Date('2026-09-02')` is specified to parse as UTC midnight, which renders
 * as 1 September anywhere west of Greenwich. Splitting the string and using the
 * local constructor is the only way to round-trip `toISODate`.
 */
export const fromISODate = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  // Rejects 2026-02-31, which the constructor would silently roll to 3 March.
  return date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
    ? date
    : null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Intl formatting
//
// `Intl.DateTimeFormat` construction is the expensive part (option resolution
// + locale data lookup), not `.format()`. A 42-cell grid that built one per
// cell measurably janked the month transition, so formatters are cached by
// locale + options. The cache is module-level and unbounded, which is fine: the
// key space is (locales in the app) × (the five option shapes below).
// ─────────────────────────────────────────────────────────────────────────────

const formatterCache = new Map<string, Intl.DateTimeFormat>();

const getFormatter = (
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat => {
  const key = `${locale ?? ''}|${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
};

/** `September 2026` — the calendar's month caption. */
export const formatMonthCaption = (date: Date, locale?: string): string =>
  getFormatter(locale, { month: 'long', year: 'numeric' }).format(date);

/** `Wednesday, September 2, 2026` — a day cell's accessible name. */
export const formatFullDate = (date: Date, locale?: string): string =>
  getFormatter(locale, { dateStyle: 'full' }).format(date);

/** `Sep 2, 2026` — the default DatePicker field display. */
export const formatMediumDate = (date: Date, locale?: string): string =>
  getFormatter(locale, { dateStyle: 'medium' }).format(date);

/** First day of the week: `0` Sunday … `6` Saturday. */
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** A column heading: the short form shown, the long form announced. */
export type WeekdayLabel = { short: string; long: string };

// A known Sunday, used only as a seed for weekday names. Any Sunday works; this
// one is inside the Gregorian era for every calendar Intl might localise into.
const REFERENCE_SUNDAY = new Date(2024, 0, 7);

/**
 * The seven column headings, rotated so index 0 is `weekStartsOn`.
 *
 * `short` is the visible two-or-three letter form, `long` the full name used as
 * the header's `aria-label` — "Su" alone is not a word a screen reader can say.
 */
export const getWeekdayLabels = (
  weekStartsOn: WeekDay,
  locale?: string,
): WeekdayLabel[] => {
  const short = getFormatter(locale, { weekday: 'short' });
  const long = getFormatter(locale, { weekday: 'long' });
  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(REFERENCE_SUNDAY, (weekStartsOn + index) % 7);
    return { short: short.format(day), long: long.format(day) };
  });
};

/**
 * The month's grid: **always six rows of seven**, leading and trailing days
 * borrowed from the neighbouring months.
 *
 * Six rows rather than the four-to-six a month actually needs, because a grid
 * that changes height moves every control under it as the user pages through
 * the year — and inside a floating panel it also re-anchors the surface.
 */
export const buildMonthGrid = (month: Date, weekStartsOn: WeekDay): Date[][] => {
  const first = startOfMonth(month);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const gridStart = addDays(first, -offset);
  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(gridStart, week * 7 + day)),
  );
};
