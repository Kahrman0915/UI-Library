import type { HTMLAttributes } from 'react';

/** What the line's color says. `default` is the chart ramp; the others carry meaning, so use them only when they do. */
export type SparklineTone = 'default' | 'success' | 'error' | 'muted';

export type SparklineProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Required. Seeds `-table` for the data twin. */
  id: string;
  /**
   * The accessible name — what the numbers ARE ("Views, last 12 weeks"). A
   * sparkline has no visible title, so this is the only thing that tells a
   * screen-reader user what they are hearing.
   */
  label: string;
  /** The values, oldest first. `null` is a gap, not a zero. */
  data: (number | null)[];
  /** One label per value, for the data table twin. Defaults to 1, 2, 3… */
  categories?: string[];
  /**
   * `line` alone, `area` — the line over a soft fill to the baseline — or `bar`, one bar per
   * value from zero. Use `bar` for counts per period (items due per day), where each value
   * stands on its own; a line implies the values in between exist.
   */
  variant?: 'line' | 'area' | 'bar';
  /**
   * `bar` only: the index of the bar drawn at full strength; the rest are dimmed. Default the
   * last value — "today" or "this week". Pass `null` to draw every bar at full strength.
   */
  highlight?: number | null;
  tone?: SparklineTone;
  /** Height in px. Width always fills the container. Default 32. */
  height?: number;
  /** Mark the last value with a dot — where the trend is now. Default true. Ignored for `bar`, which uses `highlight`. */
  showEnd?: boolean;
  /** Formats values in the data table twin. */
  valueFormatter?: (value: number) => string;
  className?: string;
};
