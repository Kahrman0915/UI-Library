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
  /** `line` alone, or `area` — the line over a soft fill to the baseline. */
  variant?: 'line' | 'area';
  tone?: SparklineTone;
  /** Height in px. Width always fills the container. Default 32. */
  height?: number;
  /** Mark the last value with a dot — where the trend is now. Default true. */
  showEnd?: boolean;
  /** Formats values in the data table twin. */
  valueFormatter?: (value: number) => string;
  className?: string;
};
