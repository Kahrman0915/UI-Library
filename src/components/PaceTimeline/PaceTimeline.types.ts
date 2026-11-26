/**
 * Where the work stands against the clock. Derived, never passed in: `behind` when the share
 * of work done is below the share of working days used, otherwise `on-pace`.
 */
export type PaceTimelineStatus = 'on-pace' | 'behind';

export type PaceTimelineProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Required. Seeds `-time-label`, `-work-label` and `-days`. */
  id: string;
  /** First day of the period (a sprint, a release window). Time of day is ignored. */
  start: Date;
  /** Last day of the period, inclusive. */
  end: Date;
  /**
   * The day to mark as today. Default `new Date()`. Before `start` nothing is used yet; after
   * `end` the whole period is. Today counts as used — on day 4 of 10, time used is 40%.
   */
  today?: Date;
  /** Items finished. */
  completed: number;
  /** Items in the period. `0` reads as 0% done. */
  total: number;
  /**
   * Leave Saturdays and Sundays out of the strip and out of the time math. Default `true` —
   * a sprint is counted in working days, and a weekend cell would make Friday look like the
   * middle of the week.
   */
  skipWeekends?: boolean;
  /** The label under each day cell. Default narrow weekday + day number ("M 12"). */
  formatDay?: (date: Date) => string;
  /** BCP 47 locale for the default day labels and the cells' accessible names. */
  locale?: string;
  /** The word over today's cell. Default "Today". */
  todayLabel?: string;
  /** Label of the time bar. Default "Time used". */
  timeLabel?: React.ReactNode;
  /** Label of the work bar. Default "Work done · {completed} of {total}". */
  workLabel?: React.ReactNode;
  className?: string;
};
