/** Track thickness. */
export type ProgressSize = 'sm' | 'default' | 'lg';

/** Bar colour. `default` follows the active `data-theme`. */
export type ProgressVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

/**
 * How far along a task is.
 *
 * Two ways to use it: pass `label` / `showValue` and let it build its own header
 * row, or compose `ProgressLabel` / `ProgressValue` / `ProgressTrack` /
 * `ProgressIndicator` yourself for full control.
 */
export type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Current progress, between 0 and `max`. Ignored when `indeterminate`. */
  value?: number;
  /** The value representing 100%. Default `100`. */
  max?: number;
  /** Motion without a percentage, for work whose length you can't predict.
   *  Drops `aria-valuenow` so it isn't announced as a false number. */
  indeterminate?: boolean;
  /** Default `default`. See {@link ProgressSize}. */
  size?: ProgressSize;
  /** Default `default`. See {@link ProgressVariant}. */
  variant?: ProgressVariant;
  /** Shortcut — renders a `<ProgressLabel>` in the header row above the track. */
  label?: React.ReactNode;
  /** Shortcut — renders a `<ProgressValue>` in the header row above the track. */
  showValue?: boolean;
  /** Format the auto-rendered value. Default: `${percent}%`. */
  valueFormatter?: (percent: number, value: number, max: number) => React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

/** Heading above the track. Names the progressbar via `aria-labelledby`. */
export type ProgressLabelProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
  children?: React.ReactNode;
};

/** The readout beside the label — a percentage, or your own formatted string. */
export type ProgressValueProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
  children?: React.ReactNode;
};

/** The groove. Holds the `ProgressIndicator`. */
export type ProgressTrackProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

/** The filled bar. Widths come from the root, so it takes no value of its own. */
export type ProgressIndicatorProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};
